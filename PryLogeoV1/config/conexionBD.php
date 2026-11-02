<?php
class ConexionBD {
    // Reemplaza con tus valores de Clever Cloud
    private $host = "b6r97syfb1cm98gl75cv-mysql.services.clever-cloud.com"; 
    private $db_name = "b6r97syfb1cm98gl75cv";
    private $username = "uz8ia64bxapybifr"; 
    private $password = "TU_CONTRASEÑA_DE_CLEVER_CLOUD"; // Copia el valor de MYSQL_ADDON_PASSWORD
    private $port = "3306";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            // Se añade el puerto a la cadena de conexión de PDO
            $this->conn = new PDO("mysql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            echo "Error de conexión: " . $exception->getMessage();
        }
        return $this->conn;
    }
}
?>
