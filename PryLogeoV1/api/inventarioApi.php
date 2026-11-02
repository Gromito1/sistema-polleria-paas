<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");

require_once '../modelo/php/inventarioModelo.php';
$modelo = new InventarioModelo();

// 1. Obtener Inventario
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['accion']) && $_GET['accion'] == 'getInventario') {
    $resultado = $modelo->obtenerInventario();
    echo json_encode($resultado);
    exit();
}

// 2. Registrar Nuevo Insumo
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['accion']) && $_GET['accion'] == 'registrarInsumo') {
    $datos = json_decode(file_get_contents("php://input"));
    
    if (!empty($datos->nombre) && !empty($datos->unidad)) {
        $resultado = $modelo->registrarInsumo($datos->nombre, $datos->categoria, $datos->unidad, $datos->costo);
        echo json_encode($resultado);
    } else {
        echo json_encode(["status" => "error", "mensaje" => "Faltan datos obligatorios."]);
    }
    exit();
}

// 3. NUEVO: Ajustar Stock (Entrada o Merma)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['accion']) && $_GET['accion'] == 'ajustarStock') {
    $datos = json_decode(file_get_contents("php://input"));
    
    if (!empty($datos->id) && !empty($datos->tipo) && !empty($datos->cantidad)) {
        $resultado = $modelo->ajustarStock($datos->id, $datos->tipo, $datos->cantidad);
        echo json_encode($resultado);
    } else {
        echo json_encode(["status" => "error", "mensaje" => "Datos incompletos para el ajuste."]);
    }
    exit();
}

// 4. NUEVO: Editar Insumo
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['accion']) && $_GET['accion'] == 'editarInsumo') {
    $datos = json_decode(file_get_contents("php://input"));
    
    if (!empty($datos->id) && !empty($datos->nombre)) {
        $resultado = $modelo->editarInsumo($datos->id, $datos->nombre, $datos->categoria, $datos->unidad, $datos->costo);
        echo json_encode($resultado);
    } else {
        echo json_encode(["status" => "error", "mensaje" => "Faltan datos para editar el insumo."]);
    }
    exit();
}
?>