<?php
require_once __DIR__ . '/../../config/conexionBD.php';

class CmbPassModelo {
    private $conn;

    public function __construct() {
        $database = new ConexionBD();
        $this->conn = $database->getConnection();
    }

    public function actualizarPassword($login, $passAnt, $passNvo, $passRep) {
        $errAnt = "";
        $errNvo = "";
        $errRep = "";

        // Regla de Formato (12 caracteres)
        $formatoNvoValido = strlen($passNvo) >= 12 && preg_match('/[\W_0-9]/', $passNvo);
        $formatoRepValido = strlen($passRep) >= 12 && preg_match('/[\W_0-9]/', $passRep);

        try {
            // Traemos el password actual
            $queryCheck = "SELECT Password FROM mUsuarios WHERE Login = :login LIMIT 1";
            $stmtCheck = $this->conn->prepare($queryCheck);
            $stmtCheck->bindParam(':login', $login);
            $stmtCheck->execute();
            
            $dbPassword = "";
            if ($stmtCheck->rowCount() > 0) {
                $row = $stmtCheck->fetch(PDO::FETCH_ASSOC);
                $dbPassword = $row['Password'];
            }

            // Verificar si el nuevo password ya existe en la BD
            $queryExist = "SELECT CvUser FROM mUsuarios WHERE Password = :passNvo LIMIT 1";
            $stmtExist = $this->conn->prepare($queryExist);
            $stmtExist->bindParam(':passNvo', $passNvo);
            $stmtExist->execute();
            $passNvoExisteBD = $stmtExist->rowCount() > 0;

            // --- LÓGICA DE MENSAJES DEL PIZARRÓN ---
            if ($passAnt !== $dbPassword) { $errAnt = "Dato Inconsistente"; }

            if (!$formatoNvoValido) {
                $errNvo = "Formato invalido";
            } else if ($passNvo === $dbPassword || $passNvoExisteBD) {
                $errNvo = "Dato Inconsistente"; 
            }

            if ($passRep !== $passNvo) {
                $errRep = "Dato Inconsistente con el Pw Nvo"; 
            } else {
                if (!$formatoRepValido) {
                    $errRep = "Formato invalido"; 
                } else if ($passNvo === $dbPassword || $passNvoExisteBD) {
                    $errRep = "Dato Inconsistente"; 
                }
            }

            if ($errAnt !== "" || $errNvo !== "" || $errRep !== "") {
                return [
                    "status" => "error",
                    "mensajeGeneral" => "Cambio de Password Inconcluso, póngase en contacto con el administrador o reinténtelo",
                    "errAnt" => $errAnt,
                    "errNvo" => $errNvo,
                    "errRep" => $errRep
                ];
            }

            // A) Éxito: Actualizar en base principal
            $queryUpdate = "UPDATE mUsuarios SET Password = :passNvo WHERE Login = :login";
            $stmtUpdate = $this->conn->prepare($queryUpdate);
            $stmtUpdate->bindParam(':passNvo', $passNvo);
            $stmtUpdate->bindParam(':login', $login);
            $stmtUpdate->execute();

            // B) Sincronizar actualización de contraseña en dbpryfinmat
            try {
                $querySync = "UPDATE dbpryfinmat.musuarios SET Password = :passNvo WHERE Login = :login";
                $stmtSync = $this->conn->prepare($querySync);
                $stmtSync->bindParam(':passNvo', $passNvo);
                $stmtSync->bindParam(':login', $login);
                $stmtSync->execute();
            } catch(PDOException $e) {}

            return ["status" => "success", "mensajeGeneral" => "Cambio de Password concluido y Sincronizado"];

        } catch (PDOException $e) {
            return ["status" => "error", "mensajeGeneral" => "Error de BD: " . $e->getMessage()];
        }
    }
}
?>