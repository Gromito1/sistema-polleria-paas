<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");

require_once '../modelo/php/catalogoModelo.php';
$modelo = new CatalogoModelo();

// 1. Obtener Catálogo
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['accion']) && $_GET['accion'] == 'getCatalogo') {
    $resultado = $modelo->obtenerCatalogo();
    echo json_encode($resultado);
    exit();
}

// 2. Registrar Nuevo Producto
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['accion']) && $_GET['accion'] == 'registrarProducto') {
    $datos = json_decode(file_get_contents("php://input"));
    
    if (!empty($datos->nombre) && isset($datos->precio)) {
        $resultado = $modelo->registrarProducto($datos->nombre, $datos->categoria, $datos->precio);
        echo json_encode($resultado);
    } else {
        echo json_encode(["status" => "error", "mensaje" => "Faltan datos obligatorios."]);
    }
    exit();
}

// 3. Editar Producto
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['accion']) && $_GET['accion'] == 'editarProducto') {
    $datos = json_decode(file_get_contents("php://input"));
    
    if (!empty($datos->id) && !empty($datos->nombre)) {
        $resultado = $modelo->editarProducto($datos->id, $datos->nombre, $datos->categoria, $datos->precio);
        echo json_encode($resultado);
    } else {
        echo json_encode(["status" => "error", "mensaje" => "Faltan datos para editar el producto."]);
    }
    exit();
}

// 4. Eliminar Producto
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['accion']) && $_GET['accion'] == 'eliminarProducto') {
    $datos = json_decode(file_get_contents("php://input"));
    
    if (!empty($datos->id)) {
        $resultado = $modelo->eliminarProducto($datos->id);
        echo json_encode($resultado);
    } else {
        echo json_encode(["status" => "error", "mensaje" => "Falta el ID del producto."]);
    }
    exit();
}
?>