<?php
$anfitrion  = getenv('MYSQL_ADDON_HOST') ?: 'b6r97syfb1cm98gl75cv-mysql.services.clever-cloud.com';
$base_datos = getenv('MYSQL_ADDON_DB') ?: 'b6r97syfb1cm98gl75cv';
$usuario    = getenv('MYSQL_ADDON_USER') ?: 'uz8ia64bxapybifr';
$aprobar    = getenv('MYSQL_ADDON_PASSWORD') ?: 'I8neeQbGpYVq1FT24lqN';
$puerto     = getenv('MYSQL_ADDON_PORT') ?: '3306';

try {
    $dsn = "mysql:host=$anfitrion;port=$puerto;dbname=$base_datos;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false,
    ];
    $conexion = new PDO($dsn, $usuario, $aprobar, $options);
} catch (PDOException $mi) {
    header('Content-Type: application/json');
    echo json_encode(["status" => "error", "mensaje" => "Error de conexión: " . $mi->getMessage()]);
    exit();
}

// Clase de compatibilidad universal para los modelos del sistema
if (!class_exists('ConexionBD')) {
    class ConexionBD {
        public function getConexion() {
            global $conexion;
            return $conexion;
        }
    }
}
?>
