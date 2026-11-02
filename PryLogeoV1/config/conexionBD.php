<?php

class ConexionBD {

    public $conn;

    public function getConnection() {

        $host = getenv("MYSQL_ADDON_HOST");
        $db_name = getenv("MYSQL_ADDON_DB");
        $username = getenv("MYSQL_ADDON_USER");
        $password = getenv("MYSQL_ADDON_PASSWORD");
        $port = getenv("MYSQL_ADDON_PORT") ?: "3306";

        if (!$host || !$db_name || !$username || !$password) {
            error_log("Faltan variables de configuración de MySQL.");
            return null;
        }

        try {

            $this->conn = new PDO(
                "mysql:host={$host};port={$port};dbname={$db_name};charset=utf8mb4",
                $username,
                $password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );

        } catch (PDOException $exception) {

            error_log("Error de conexión MySQL: " . $exception->getMessage());
            $this->conn = null;

        }

        return $this->conn;
    }
}

?>
