<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");

require_once '../modelo/php/cajaModelo.php';
$modelo = new CajaModelo();

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['accion']) && $_GET['accion'] == 'getCorteHoy') {
    $resultado = $modelo->obtenerCorteHoy();
    echo json_encode($resultado);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['accion']) && $_GET['accion'] == 'getDetalleTicket') {
    $folio = isset($_GET['folio']) ? $_GET['folio'] : 0;
    $resultado = $modelo->obtenerDetalleTicket($folio);
    echo json_encode($resultado);
    exit();
}

// NUEVA RUTA: Recibe la orden de limpiar la caja
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['accion']) && $_GET['accion'] == 'reiniciarCaja') {
    $resultado = $modelo->reiniciarCaja();
    echo json_encode($resultado);
    exit();
}
?>