<?php
require_once __DIR__ . '/../../config/conexionBD.php';

class UsuarioModelo {
    private $db;

    public function __construct() {
        // Constructor temporal sin conexión estricta para pruebas
    }

    public function validarAcceso($login, $password) {
        // BYPASS TEMPORAL: Forzamos el acceso exitoso para explorar el sistema
        return [
            "status" => "success", 
            "mensaje" => "Acceso temporal concedido", 
            "usuario" => [
                "idUsuario" => 1,
                "Login" => $login ? $login : "Invitado",
                "Rol" => "Administrador"
            ]
        ];
    }
}
?>
