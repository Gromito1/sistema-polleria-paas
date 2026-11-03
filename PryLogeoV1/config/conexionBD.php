<?php
$host = getenv('MYSQL_ADDON_HOST') ?: 'localhost';
$db   = getenv('MYSQL_ADDON_DB') ?: 'tu_base_de_datos';
$user = getenv('MYSQL_ADDON_USER') ?: 'tu_usuario';
$pass = getenv('MYSQL_ADDON_PASSWORD') ?: 'tu_contraseña';
$port = getenv('MYSQL_ADDON_PORT') ?: '3306';

try {
    $conexion = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4", $user, $pass);
    $conexion->setAttribute(PDO.ATTR_ERRMODE, PDO.ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Error de conexión: " . $e->getMessage();
    exit();
}
?>
