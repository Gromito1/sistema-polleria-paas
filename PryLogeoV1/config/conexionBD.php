<?php
$anfitrion = getenv('MYSQL_ADDON_HOST') ?: 'b6r97syfb1cm98gl75cv-mysql.services.clever-cloud.com';
$base_datos = getenv('MYSQL_ADDON_DB') ?: 'b6r97syfb1cm98gl75cv';
$usuario = getenv('MYSQL_ADDON_USER') ?: 'uz8ia64bxapybifr';
$aprobar = getenv('MYSQL_ADDON_PASSWORD') ?: 'I8neeQbGpYVq1FT24lqN';
$puerto = getenv('MYSQL_ADDON_PORT') ?: '3306';

try {
    $conexion = new PDO("mysql:host=$anfitrion;port=$puerto;dbname=$base_datos;charset=utf8mb4", $usuario, $aprobar);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $mi) {
    echo "Error de conexión: " . $mi->getMessage();
    exit();
}
?>
