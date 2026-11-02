<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET");

require_once '../config/conexionBD.php';
require_once '../modelo/php/usuariosModelo.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $database = new ConexionBD();
    $db = $database->getConnection();
    
    if (!$db) {
        echo json_encode(["status" => "error", "mensaje" => "Fallo al conectar con la Base de Datos."]);
        exit();
    }

    $modelo = new UsuariosModelo($db);

    if ($method === 'GET') {
        $accion = isset($_GET['accion']) ? $_GET['accion'] : '';
        
        if ($accion === 'getPersonas') {
            echo json_encode(["status" => "success", "data" => $modelo->obtenerPersonasDisponibles()]);
        } elseif ($accion === 'getUsuarios') {
            echo json_encode(["status" => "success", "data" => $modelo->obtenerUsuarios()]);
        } else {
            echo json_encode(["status" => "error", "mensaje" => "Acción GET no reconocida."]);
        }
    } 
    elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"));
        $accion = isset($data->accion) ? $data->accion : '';

        if ($accion === 'insertar') {
            echo json_encode($modelo->registrarUsuario(
                $data->cvPerson, $data->login, $data->password, 
                $data->fecIni, $data->fecFin, $data->edoCta
            ));
        } 
        elseif ($accion === 'actualizar') {
            echo json_encode($modelo->actualizarUsuario(
                $data->cvUser, $data->login, $data->password, 
                $data->fecIni, $data->fecFin, $data->edoCta
            ));
        } 
        elseif ($accion === 'borrar') {
            echo json_encode($modelo->eliminarUsuario($data->cvUser));
        } 
        // --- PUENTE: Para Asignar Privilegios ---
        elseif ($accion === 'asignarAcceso') {
            echo json_encode($modelo->asignarAcceso(
                $data->cvUser,
                $data->cvApp
            ));
        }
        // --- NUEVO PUENTE: Para Revocar Privilegios ---
        elseif ($accion === 'revocarAccesos') {
            echo json_encode($modelo->revocarAccesos(
                $data->cvUser
            ));
        }
        // --- NUEVO PUENTE: Para el Catálogo Anti-clones ---
        elseif ($accion === 'insertarPersonaRapida') {
            echo json_encode($modelo->registrarPersonaRapida(
                $data->nombre, 
                $data->apePaterno, 
                $data->apeMaterno, 
                $data->tipoPersona
            ));
        } else {
            echo json_encode(["status" => "error", "mensaje" => "Acción POST no reconocida."]);
        }
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "mensaje" => "Error del servidor: " . $e->getMessage()]);
}
?>