<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");

require_once '../modelo/php/accesosModelo.php';

$modelo = new AccesosModelo();

// Si es una petición GET (Para pedir datos)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    
    if (isset($_GET['accion'])) {
        if ($_GET['accion'] == 'getIniciales') {
            // Mandamos los usuarios y los módulos al mismo tiempo
            $usuarios = $modelo->obtenerUsuarios();
            $aplicaciones = $modelo->obtenerAplicaciones();
            echo json_encode([
                "status" => "success", 
                "usuarios" => $usuarios['data'], 
                "aplicaciones" => $aplicaciones['data']
            ]);
        } 
        else if ($_GET['accion'] == 'getAccesos' && isset($_GET['cvUser'])) {
            // Mandamos qué módulos tiene permitidos un usuario específico
            $resultado = $modelo->obtenerAccesosUsuario($_GET['cvUser']);
            echo json_encode($resultado);
        }
    }
    exit();
}

// Si es una petición POST (Para guardar datos)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (isset($data->cvUser) && isset($data->aplicaciones)) {
        $resultado = $modelo->guardarAccesos($data->cvUser, $data->aplicaciones);
        echo json_encode($resultado);
    } else {
        echo json_encode(["status" => "error", "mensaje" => "Datos incompletos."]);
    }
    exit();
}
?>