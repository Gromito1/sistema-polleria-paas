<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

// IMPORTANTE: Debe ser usuarioModelo.php (SINGULAR)
require_once '../modelo/php/usuarioModelo.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->login) && !empty($data->password)) {
        $modelo = new UsuarioModelo();
        $resultado = $modelo->validarAcceso($data->login, $data->password);
        echo json_encode($resultado);
    } else {
        echo json_encode(["status" => "error", "mensaje" => "Datos incompletos."]);
    }
}
?>