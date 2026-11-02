<?php
require_once __DIR__ . '/../../config/conexionBD.php';

class UsuarioModelo {
    private $conn;

    public function __construct() {
        $database = new ConexionBD();
        $this->conn = $database->getConnection();
    }

    public function validarAcceso($login, $password) {
        // 1. Buscamos primero SOLO el Login
        $queryUser = "SELECT * FROM mUsuarios WHERE Login = :login LIMIT 1";
        $stmtUser = $this->conn->prepare($queryUser);
        $stmtUser->bindParam(':login', $login);
        $stmtUser->execute();

        $errorLogin = "";
        $errorPassword = "";
        $row = null;

        // Si no encontró el usuario
        if ($stmtUser->rowCount() === 0) {
            $errorLogin = "No existe o formato incorrecto";
            $errorPassword = "No existe o formato incorrecto"; 
        } else {
            $row = $stmtUser->fetch(PDO::FETCH_ASSOC);
            
            // 2. Si el usuario existe, revisamos su Password
            if ($row['Password'] !== $password) {
                $errorPassword = "No existe o formato incorrecto";
            }
        }

        // Si hubo algún error de credenciales (Pruebas 1, 2, 3 y 4 del Excel)
        if ($errorLogin !== "" || $errorPassword !== "") {
            return [
                "status" => "error",
                "mensajeGeneral" => "login o Password, incorrecto",
                "errorLogin" => $errorLogin,
                "errorPassword" => $errorPassword
            ];
        }

        // --- Si pasó las validaciones, revisamos las Pruebas 5 y 6 ---
        $cvUser = $row['CvUser'];
        $edoCta = $row['EdoCta'];
        $fecIni = $row['FecIni'];
        $fechaServidor = date('Y-m-d'); 

        // Prueba 6: Cuenta Inactiva
        if ($edoCta == 0) {
            return [
                "status" => "error", 
                "mensajeGeneral" => "Cuenta desactivada, póngase en contacto con el administrador", 
                "errorLogin" => "",
                "errorPassword" => ""
            ];
        }

        // Prueba 5: Cuenta no ha iniciado
        if ($fechaServidor < $fecIni) {
            return [
                "status" => "error", 
                "mensajeGeneral" => "Cuenta Pendiente de Activar", 
                "errorLogin" => "",
                "errorPassword" => ""
            ];
        }

        // Si todo está perfecto, damos acceso
        $sqlAcc = "SELECT CvAplicacion FROM mAccesos WHERE CvUser = :user";
        $stmtAcc = $this->conn->prepare($sqlAcc);
        $stmtAcc->bindParam(':user', $cvUser);
        $stmtAcc->execute();
        $permisos = $stmtAcc->fetchAll(PDO::FETCH_COLUMN);

        return [
            "status" => "success", 
            "mensaje" => "Acceso permitido", 
            "usuario" => $row['Login'],
            "permisos" => $permisos
        ];
    }
}
?>