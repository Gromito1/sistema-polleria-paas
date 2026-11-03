<?php
require_once __DIR__ . '/../../config/conexionBD.php';

class UsuarioModelo {
    private $db;

    public function __construct() {
        $database = new ConexionBD();
        $this->db = $database->getConexion();
    }

    public function validarAcceso($login, $password) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM musuario WHERE Login = :login AND Password = :password LIMIT 1");
            $stmt->execute([
                ':login' => $login,
                ':password' => $password
            ]);
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($usuario) {
                return ["status" => "success", "mensaje" => "Acceso concedido", "usuario" => $usuario];
            } else {
                return ["status" => "error", "mensaje" => "Usuario o contraseña incorrectos"];
            }
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => "Error en la consulta: " . $e->getMessage()];
        }
    }
}
?>
