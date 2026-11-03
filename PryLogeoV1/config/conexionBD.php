<?php
$host = getenv('MYSQL_ADDON_HOST') ?: 'b6r97syfb1cm98gl75cv-mysql.services.clever-cloud.com';
$db   = getenv('MYSQL_ADDON_DB') ?: 'b6r97syfb1cm98gl75cv';
$user = getenv('MYSQL_ADDON_USER') ?: 'uz8ia64bxapybifr';
$pass = getenv('MYSQL_ADDON_PASSWORD') ?: 'I8neeQbGpYVq1FT24lqN';
$port = getenv('MYSQL_ADDON_PORT') ?: '3306';

try {
    $conexion = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4", $user, $pass);
    $conexion->setAttribute(PDO.ATTR_ERRMODE, PDO.ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Error de conexión: " . $e->getMessage();
    exit();
}
?>
