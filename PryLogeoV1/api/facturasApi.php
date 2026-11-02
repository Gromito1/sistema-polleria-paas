<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once '../modelo/php/facturasModelo.php';
$modelo = new FacturasModelo();

// 1. Ruta para validar si el ticket existe y traer sus datos
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['accion']) && $_GET['accion'] == 'buscarTicket') {
    $datos = json_decode(file_get_contents("php://input"));
    
    if (!empty($datos->folio)) {
        $resultado = $modelo->buscarTicket($datos->folio);
        echo json_encode($resultado);
    } else {
        echo json_encode(["status" => "error", "mensaje" => "No se recibió un folio."]);
    }
    exit();
}

// 2. Ruta para emitir y guardar la factura en BD
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['accion']) && $_GET['accion'] == 'generarFactura') {
    $datos = json_decode(file_get_contents("php://input"));
    
    if (!empty($datos->folio) && !empty($datos->rfc) && !empty($datos->nombre)) {
        $resultado = $modelo->generarFactura(
            $datos->folio, 
            $datos->rfc, 
            $datos->nombre, 
            $datos->cp, 
            $datos->regimen, 
            $datos->uso
        );
        echo json_encode($resultado);
    } else {
        echo json_encode(["status" => "error", "mensaje" => "Faltan datos fiscales obligatorios."]);
    }
    exit();
}
?>