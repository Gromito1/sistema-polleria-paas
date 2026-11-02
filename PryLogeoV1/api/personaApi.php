<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");

require_once '../modelo/php/personaModelo.php';

$modelo = new PersonaModelo();

// 1. Si es una petición GET (para pedir los catálogos)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['accion']) && $_GET['accion'] == 'getCatalogos') {
        $resultado = $modelo->obtenerCatalogos();
        
        // Reestructuramos un poco la respuesta para que JS la lea fácil
        if ($resultado['status'] == 'success') {
            echo json_encode(array_merge(["status" => "success"], $resultado['data']));
        } else {
            http_response_code(500);
            echo json_encode($resultado);
        }
    }
    exit();
}

// 2. Si es una petición POST (para guardar la persona)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Leer los datos en formato JSON que envía JavaScript
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->curp) && !empty($data->tpPerson)) {
        $resultado = $modelo->registrarPersona($data);
        
        if ($resultado['status'] == 'success') {
            http_response_code(201); // 201 significa "Creado"
        } else {
            http_response_code(400); // 400 significa "Bad Request" (Error del cliente)
        }
        echo json_encode($resultado);
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "mensaje" => "Faltan datos obligatorios (CURP o Tipo de Persona)."]);
    }
    exit();
}
?>