<?php
class UsuariosModelo {
    private $conn;

    public function __construct($conexion) {
        $this->conn = $conexion;
        $this->conn->exec("SET NAMES 'utf8mb4'");
        $this->conn->exec("SET CHARACTER SET utf8mb4");
    }

    // 1. Leer todos los usuarios
    public function obtenerUsuarios() {
        try {
            $query = "SELECT 
                        u.CvUser, 
                        u.CvPerson AS CvPerso, 
                        u.Login, 
                        u.Password, 
                        u.FecIni, 
                        u.FecFin, 
                        u.EdoCta,
                        n.DsNombre AS Nombre,
                        ap.DsApellido AS ApePater,
                        am.DsApellido AS ApeMater
                      FROM musuarios u
                      LEFT JOIN mdtperson p ON u.CvPerson = p.CvPerson
                      LEFT JOIN cnombres n ON p.CvNombre = n.CvNombre
                      LEFT JOIN capellidos ap ON p.CvApePat = ap.CvApellido
                      LEFT JOIN capellidos am ON p.CvApelMat = am.CvApellido
                      ORDER BY u.CvUser ASC";
            
            $stmt = $this->conn->query($query);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return [[
                "CvUser" => "ERR", "CvPerso" => 0, "Nombre" => "Error SQL",
                "ApePater" => "", "ApeMater" => "", "Login" => "Ver en FecFin ->",
                "FecIni" => "", "FecFin" => $e->getMessage(), "EdoCta" => 0
            ]];
        }
    }

    // 2. Traer la lista de personas disponibles
    public function obtenerPersonasDisponibles() {
        try {
            $query = "SELECT 
                        p.CvPerson AS CvPerso, 
                        n.DsNombre AS Nombre, 
                        ap.DsApellido AS ApePater, 
                        am.DsApellido AS ApeMater 
                      FROM mdtperson p
                      LEFT JOIN cnombres n ON p.CvNombre = n.CvNombre
                      LEFT JOIN capellidos ap ON p.CvApePat = ap.CvApellido
                      LEFT JOIN capellidos am ON p.CvApelMat = am.CvApellido
                      WHERE p.CvPerson NOT IN (SELECT CvPerson FROM musuarios WHERE CvPerson IS NOT NULL)
                      ORDER BY n.DsNombre ASC";
            
            $stmt = $this->conn->query($query);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return [];
        }
    }

    // 3. Dar de Alta un nuevo Usuario (SISTEMA ACUMULATIVO DE ERRORES BD)
    public function registrarUsuario($cvPerso, $login, $password, $fecIni, $fecFin, $edoCta) {
        try {
            $erroresDB = [];

            // Validar si la persona ya tiene cuenta
            $checkPerson = "SELECT COUNT(*) FROM musuarios WHERE CvPerson = :cvPerso";
            $stmtPerson = $this->conn->prepare($checkPerson);
            $stmtPerson->execute([':cvPerso' => $cvPerso]);
            if ($stmtPerson->fetchColumn() > 0) {
                $erroresDB[] = "❌ Esta persona ya tiene una cuenta de seguridad asignada.";
            }

            // Validar si el Login está ocupado
            $checkLogin = "SELECT COUNT(*) FROM musuarios WHERE Login = :login";
            $stmtLogin = $this->conn->prepare($checkLogin);
            $stmtLogin->execute([':login' => $login]);
            if ($stmtLogin->fetchColumn() > 0) {
                $erroresDB[] = "❌ El Login ingresado ya está en uso por otro usuario.";
            }

            // Validar si el Password está ocupado
            $checkPass = "SELECT COUNT(*) FROM musuarios WHERE Password = :password";
            $stmtPass = $this->conn->prepare($checkPass);
            $stmtPass->execute([':password' => $password]);
            if ($stmtPass->fetchColumn() > 0) {
                $erroresDB[] = "❌ El Password ingresado ya se encuentra asignado a otra cuenta.";
            }

            // Si encontró duplicados, disparamos la alerta combinada
            if (count($erroresDB) > 0) {
                return ["status" => "error", "mensaje" => "⚠️ CONFLICTOS EN LA BASE DE DATOS:\n\n" . implode("\n\n", $erroresDB)];
            }

            $query = "INSERT INTO musuarios (CvPerson, Login, Password, FecIni, FecFin, EdoCta) 
                      VALUES (:cvPerso, :login, :password, :fecIni, :fecFin, :edoCta)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':cvPerso', $cvPerso, PDO::PARAM_INT);
            $stmt->bindParam(':login', $login);
            $stmt->bindParam(':password', $password);
            $stmt->bindParam(':fecIni', $fecIni);
            $stmt->bindParam(':fecFin', $fecFin);
            $stmt->bindParam(':edoCta', $edoCta, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                $nuevoId = $this->conn->lastInsertId();
                return ["status" => "success", "mensaje" => "Usuario registrado correctamente.", "cvUser" => $nuevoId];
            }
            return ["status" => "error", "mensaje" => "No se pudo insertar el registro."];
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => "Error BD: " . $e->getMessage()];
        }
    }

    // 4. Modificar un Usuario existente (SISTEMA ACUMULATIVO DE ERRORES BD)
    public function actualizarUsuario($cvUser, $login, $password, $fecIni, $fecFin, $edoCta) {
        try {
            $erroresDB = [];

            // Validar Login duplicado
            $checkLogin = "SELECT COUNT(*) FROM musuarios WHERE Login = :login AND CvUser != :cvUser";
            $stmtLogin = $this->conn->prepare($checkLogin);
            $stmtLogin->execute([':login' => $login, ':cvUser' => $cvUser]);
            if ($stmtLogin->fetchColumn() > 0) {
                $erroresDB[] = "❌ El Login ingresado ya está en uso por otro usuario.";
            }

            // Validar Password duplicado si lo cambiaron
            if (!empty($password)) {
                $checkPass = "SELECT COUNT(*) FROM musuarios WHERE Password = :password AND CvUser != :cvUser";
                $stmtPass = $this->conn->prepare($checkPass);
                $stmtPass->execute([':password' => $password, ':cvUser' => $cvUser]);
                if ($stmtPass->fetchColumn() > 0) {
                    $erroresDB[] = "❌ El Password ingresado ya se encuentra asignado a otra cuenta.";
                }
            }

            if (count($erroresDB) > 0) {
                return ["status" => "error", "mensaje" => "⚠️ CONFLICTOS EN LA BASE DE DATOS:\n\n" . implode("\n\n", $erroresDB)];
            }

            if (empty($password)) {
                $query = "UPDATE musuarios SET Login = :login, FecIni = :fecIni, FecFin = :fecFin, EdoCta = :edoCta WHERE CvUser = :cvUser";
                $stmt = $this->conn->prepare($query);
            } else {
                $query = "UPDATE musuarios SET Login = :login, Password = :password, FecIni = :fecIni, FecFin = :fecFin, EdoCta = :edoCta WHERE CvUser = :cvUser";
                $stmt = $this->conn->prepare($query);
                $stmt->bindParam(':password', $password);
            }

            $stmt->bindParam(':login', $login);
            $stmt->bindParam(':fecIni', $fecIni);
            $stmt->bindParam(':fecFin', $fecFin);
            $stmt->bindParam(':edoCta', $edoCta, PDO::PARAM_INT);
            $stmt->bindParam(':cvUser', $cvUser, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                return ["status" => "success", "mensaje" => "Usuario actualizado correctamente."];
            }
            return ["status" => "error", "mensaje" => "No hubo cambios o error al actualizar."];
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => "Error BD: " . $e->getMessage()];
        }
    }

    // 5. Eliminar un Usuario
    public function eliminarUsuario($cvUser) {
        try {
            $checkAccess = "SELECT COUNT(*) FROM maccesos WHERE CvUser = :cvUser";
            $stmtCheck = $this->conn->prepare($checkAccess);
            $stmtCheck->bindParam(':cvUser', $cvUser, PDO::PARAM_INT);
            $stmtCheck->execute();
            if ($stmtCheck->fetchColumn() > 0) {
                return ["status" => "error", "mensaje" => "El registro actual no puede ser eliminado, por contar con accesos asignados"];
            }

            $query = "DELETE FROM musuarios WHERE CvUser = :cvUser";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':cvUser', $cvUser, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                return ["status" => "success", "mensaje" => "Usuario eliminado permanentemente."];
            }
            return ["status" => "error", "mensaje" => "No se encontró el registro a eliminar."];
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => "Error BD: " . $e->getMessage()];
        }
    }

    // 6. Asignar privilegios a la tabla maccesos
    public function asignarAcceso($cvUser, $cvApp) {
        try {
            $check = "SELECT COUNT(*) FROM maccesos WHERE CvUser = :cvUser AND CvAplicacion = :cvApp";
            $stmtCheck = $this->conn->prepare($check);
            $stmtCheck->bindParam(':cvUser', $cvUser, PDO::PARAM_INT);
            $stmtCheck->bindParam(':cvApp', $cvApp, PDO::PARAM_STR);
            $stmtCheck->execute();
            if ($stmtCheck->fetchColumn() > 0) {
                return ["status" => "error", "mensaje" => "Este usuario ya tiene acceso a esta aplicación."];
            }

            $query = "INSERT INTO maccesos (CvUser, CvAplicacion) VALUES (:cvUser, :cvApp)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':cvUser', $cvUser, PDO::PARAM_INT);
            $stmt->bindParam(':cvApp', $cvApp, PDO::PARAM_STR);
            
            if ($stmt->execute()) {
                return ["status" => "success", "mensaje" => "Privilegio de acceso asignado correctamente."];
            }
            return ["status" => "error", "mensaje" => "No se pudo asignar el acceso."];
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => "Error BD maccesos: " . $e->getMessage()];
        }
    }

    // 7. Revocar todos los accesos de un usuario
    public function revocarAccesos($cvUser) {
        try {
            $query = "DELETE FROM maccesos WHERE CvUser = :cvUser";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':cvUser', $cvUser, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                return ["status" => "success", "mensaje" => "Todos los accesos fueron revocados. El usuario está libre para ser eliminado."];
            }
            return ["status" => "error", "mensaje" => "No se pudieron revocar los accesos."];
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => "Error BD: " . $e->getMessage()];
        }
    }

    // 8. Alta Rápida de Persona (CON ESCUDO ANTI-CLONES)
    public function registrarPersonaRapida($nombre, $apePaterno, $apeMaterno, $tipoPersona) {
        try {
            $this->conn->beginTransaction();

            $stmt = $this->conn->prepare("SELECT CvNombre FROM cnombres WHERE DsNombre = :nom LIMIT 1");
            $stmt->execute([':nom' => $nombre]);
            $cvNombre = $stmt->fetchColumn();
            if (!$cvNombre) {
                $stmt = $this->conn->prepare("INSERT INTO cnombres (DsNombre) VALUES (:nom)");
                $stmt->execute([':nom' => $nombre]);
                $cvNombre = $this->conn->lastInsertId();
            }

            $stmt = $this->conn->prepare("SELECT CvApellido FROM capellidos WHERE DsApellido = :ape LIMIT 1");
            $stmt->execute([':ape' => $apePaterno]);
            $cvApePat = $stmt->fetchColumn();
            if (!$cvApePat) {
                $stmt = $this->conn->prepare("INSERT INTO capellidos (DsApellido) VALUES (:ape)");
                $stmt->execute([':ape' => $apePaterno]);
                $cvApePat = $this->conn->lastInsertId();
            }

            $stmt = $this->conn->prepare("SELECT CvApellido FROM capellidos WHERE DsApellido = :ape LIMIT 1");
            $stmt->execute([':ape' => $apeMaterno]);
            $cvApeMat = $stmt->fetchColumn();
            if (!$cvApeMat) {
                $stmt = $this->conn->prepare("INSERT INTO capellidos (DsApellido) VALUES (:ape)");
                $stmt->execute([':ape' => $apeMaterno]);
                $cvApeMat = $this->conn->lastInsertId();
            }

            $stmtCheck = $this->conn->prepare("SELECT CvPerson FROM mdtperson WHERE CvNombre = :n AND CvApePat = :p AND CvApelMat = :m LIMIT 1");
            $stmtCheck->execute([':n' => $cvNombre, ':p' => $cvApePat, ':m' => $cvApeMat]);
            if ($stmtCheck->fetchColumn() > 0) {
                $this->conn->rollBack();
                return ["status" => "error", "mensaje" => "Esta persona ya se encuentra registrada en el sistema."];
            }

            $stmt = $this->conn->prepare("INSERT INTO mdtperson (CvNombre, CvApePat, CvApelMat, CvTpPerson) VALUES (:n, :p, :m, :t)");
            $stmt->execute([':n' => $cvNombre, ':p' => $cvApePat, ':m' => $cvApeMat, ':t' => $tipoPersona]);

            $this->conn->commit();
            return ["status" => "success", "mensaje" => "Persona agregada correctamente a la Base de Datos."];
        } catch (PDOException $e) {
            $this->conn->rollBack();
            return ["status" => "error", "mensaje" => "Error al registrar persona: " . $e->getMessage()];
        }
    }
}
?>