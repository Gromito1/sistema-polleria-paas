<?php
$host = getenv('MYSQL_ADDON_HOST');
$db   = getenv('MYSQL_ADDON_DB');
$user = getenv('MYSQL_ADDON_USER');
$pass = getenv('MYSQL_ADDON_PASSWORD');
$port = getenv('MYSQL_ADDON_PORT') ?: '3306';

echo "<h3>Probando credenciales de Clever Cloud:</h3>";
echo "Host: " . ($host ? $host : "NO DETECTADO") . "<br>";
echo "Base de datos: " . ($db ? $db : "NO DETECTADA") . "<br>";
echo "Usuario: " . ($user ? $user : "NO DETECTADO") . "<br><br>";

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false,
    ];
    $pdo = new PDO($dsn, $user, $pass, $options);
    echo "<h2 style='color:green;'>¡Conexión exitosa a la base de datos de Clever Cloud!</h2>";
} catch (PDOException $e) {
    echo "<h2 style='color:red;'>Error de PDO: " . $e->getMessage() . "</h2>";
}
?>
