<?php
require_once __DIR__ . '/../../config/conexionBD.php';

class AccesosModelo {
    private $conn;

    public function __construct() {
        $database = new ConexionBD();
        $this->conn = $database->getConnection();
    }

    // 1. Traer a todos los usuarios para llenar el <select>
    public function obtenerUsuarios() {
        try {
            // CORRECCIÓN: Tabla musuarios en minúsculas
            $query = "SELECT CvUser, Login, EdoCta FROM musuarios ORDER BY Login ASC";
            $stmt = $this->conn->query($query);
            return ["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)];
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => $e->getMessage()];
        }
    }

    // 2. Traer todos los módulos disponibles
    public function obtenerAplicaciones() {
        try {
            // CORRECCIÓN: Tabla maplicaciones en minúsculas
            $query = "SELECT CvAplicacion, DsAplicacion FROM maplicaciones ORDER BY CvAplicacion ASC";
            $stmt = $this->conn->query($query);
            return ["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)];
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => $e->getMessage()];
        }
    }

    // 3. Traer los permisos que ya tiene un usuario seleccionado
    public function obtenerAccesosUsuario($cvUser) {
        try {
            // CORRECCIÓN: Tabla maccesos en minúsculas
            $query = "SELECT CvAplicacion FROM maccesos WHERE CvUser = :cvUser";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':cvUser', $cvUser, PDO::PARAM_INT);
            $stmt->execute();
            
            // Sacamos solo un arreglo sencillo con los códigos de las apps
            $accesos = $stmt->fetchAll(PDO::FETCH_COLUMN); 
            return ["status" => "success", "data" => $accesos];
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => $e->getMessage()];
        }
    }

    // 4. Guardar los nuevos permisos
    public function guardarAccesos($cvUser, $aplicaciones) {
        try {
            $this->conn->beginTransaction();

            // Primero borramos todos los permisos viejos de ese usuario
            $queryDelete = "DELETE FROM maccesos WHERE CvUser = :cvUser";
            $stmtDelete = $this->conn->prepare($queryDelete);
            $stmtDelete->bindParam(':cvUser', $cvUser, PDO::PARAM_INT);
            $stmtDelete->execute();

            // Luego insertamos los nuevos que hayan palomeado
            if (!empty($aplicaciones)) {
                $queryInsert = "INSERT INTO maccesos (CvUser, CvAplicacion) VALUES (:cvUser, :cvApp)";
                $stmtInsert = $this->conn->prepare($queryInsert);
                
                foreach ($aplicaciones as $app) {
                    $stmtInsert->bindParam(':cvUser', $cvUser, PDO::PARAM_INT);
                    $stmtInsert->bindParam(':cvApp', $app);
                    $stmtInsert->execute();
                }
            }

            $this->conn->commit();
            return ["status" => "success", "mensaje" => "Permisos actualizados correctamente."];

        } catch (PDOException $e) {
            $this->conn->rollBack(); 
            return ["status" => "error", "mensaje" => "Error al guardar: " . $e->getMessage()];
        }
    }
}
?>