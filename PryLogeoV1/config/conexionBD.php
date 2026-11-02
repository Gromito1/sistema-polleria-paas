<?php
class ConexionBD {
    private $host = "localhost";
    // CORRECCIÓN: El nombre real de tu base de datos
    private $db_name = "dbpryfinmat";
    private $username = "root"; // Usuario por defecto en XAMPP
    private $password = "";     // Contraseña por defecto en XAMPP (vacía)
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            echo "Error de conexión: " . $exception->getMessage();
        }
        return $this->conn;
    }
}
?>