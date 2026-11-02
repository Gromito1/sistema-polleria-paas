<?php
// Configuramos las cabeceras para aceptar peticiones JSON y evitar bloqueos
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

// Llamamos al cerebro de la base de datos (El Modelo)
require_once '../modelo/php/comprasModelo.php';
$modelo = new ComprasModelo();

// 1. Ruta para enviar la lista de Proveedores al menú desplegable
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['accion']) && $_GET['accion'] == 'getProveedores') {
    $resultado = $modelo->obtenerProveedores();
    echo json_encode($resultado);
    exit();
}

// 2. Ruta para enviar el catálogo de Insumos a la tabla izquierda
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['accion']) && $_GET['accion'] == 'getInsumos') {
    $resultado = $modelo->obtenerInsumos();
    echo json_encode($resultado);
    exit();
}

// 3. Ruta para recibir el carrito de compras y guardarlo en la Base de Datos
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['accion']) && $_GET['accion'] == 'registrarCompra') {
    
    // Capturamos el paquete JSON que nos envía JavaScript
    $datos = json_decode(file_get_contents("php://input"));
    
    if (!empty($datos)) {
        $loginUsuario = $datos->loginUsuario;
        $cvProveedor = $datos->cvProveedor;
        $total = $datos->total;
        $detalles = $datos->detalles;
        
        // Le pasamos los datos limpios al Modelo para que haga la Transacción Segura
        $resultado = $modelo->registrarCompra($loginUsuario, $cvProveedor, $total, $detalles);
        echo json_encode($resultado);
    } else {
        echo json_encode(["status" => "error", "mensaje" => "No se recibieron datos de la compra."]);
    }
    exit();
}
?>