<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");

require_once '../modelo/php/ventasModelo.php';
$modelo = new VentasModelo();

// Petición GET: Mandar los productos a la pantalla
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['accion']) && $_GET['accion'] == 'getProductos') {
    echo json_encode($modelo->obtenerProductos());
    exit();
}

// Petición POST: Recibir la venta para cobrarla
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->usuario) && !empty($data->total) && !empty($data->detalles)) {
        $resultado = $modelo->registrarVenta($data->usuario, $data->total, $data->detalles);
        echo json_encode($resultado);
    } else {
        echo json_encode(["status" => "error", "mensaje" => "Ticket vacío o datos incompletos."]);
    }
    exit();
}
?>