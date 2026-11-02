<?php
require_once __DIR__ . '/../../config/conexionBD.php';

class PersonaModelo {
    private $conn;

    public function __construct() {
        $database = new ConexionBD();
        $this->conn = $database->getConnection();
    }

    public function obtenerCatalogos() {
        $catalogos = [];
        try {
            // Catálogos existentes
            $catalogos['tpPerson'] = $this->conn->query("SELECT CvTpPerson, DsTpPerson FROM cTpPerson")->fetchAll(PDO::FETCH_ASSOC);
            $catalogos['genero'] = $this->conn->query("SELECT CvGenero, DsGenero FROM cGenero")->fetchAll(PDO::FETCH_ASSOC);
            $catalogos['gdoAca'] = $this->conn->query("SELECT CvGdoAca, DsGdoAca FROM cGdoAca")->fetchAll(PDO::FETCH_ASSOC);
            $catalogos['puesto'] = $this->conn->query("SELECT CvPuesto, DsPuesto FROM cPuesto")->fetchAll(PDO::FETCH_ASSOC);
            $catalogos['depto'] = $this->conn->query("SELECT CvDepto, DsDepto FROM cDepto")->fetchAll(PDO::FETCH_ASSOC);
            $catalogos['aficion'] = $this->conn->query("SELECT CvAficion, DsAficion FROM cAficion")->fetchAll(PDO::FETCH_ASSOC);
            
            // NUEVOS Catálogos
            $catalogos['nombres'] = $this->conn->query("SELECT CvNombre, DsNombre FROM cNombres ORDER BY DsNombre ASC")->fetchAll(PDO::FETCH_ASSOC);
            $catalogos['apellidos'] = $this->conn->query("SELECT CvApellido, DsApellido FROM cApellidos ORDER BY DsApellido ASC")->fetchAll(PDO::FETCH_ASSOC);
            $catalogos['nacionalidad'] = $this->conn->query("SELECT CvNaciodad, DsNaciodad FROM cNaciodad ORDER BY DsNaciodad ASC")->fetchAll(PDO::FETCH_ASSOC);
            
            return ["status" => "success", "data" => $catalogos];
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => "Error al cargar catálogos: " . $e->getMessage()];
        }
    }

    public function registrarPersona($datos) {
        try {
            // Agregamos CvNombre, CvApePat y CvApelMat al INSERT
            $query = "INSERT INTO mDtPerson 
                      (CURP, RFC, CvTpPerson, CvNombre, CvApePat, CvApelMat, CvGenero, CvGdoAca, CvPuesto, CvDepto, FecNac, Edad, E_Mail, Telefono, CvAficion, Notas) 
                      VALUES 
                      (:curp, :rfc, :tpPerson, :nombre, :apePat, :apelMat, :genero, :gdoAca, :puesto, :depto, :fecNac, :edad, :email, :telefono, :aficion, :notas)";
            
            $stmt = $this->conn->prepare($query);

            $stmt->bindValue(':curp', !empty($datos->curp) ? $datos->curp : null);
            $stmt->bindValue(':rfc', !empty($datos->rfc) ? $datos->rfc : null);
            $stmt->bindValue(':tpPerson', !empty($datos->tpPerson) ? $datos->tpPerson : null, PDO::PARAM_INT);
            
            // Nuevos campos vinculados
            $stmt->bindValue(':nombre', !empty($datos->nombre) ? $datos->nombre : null, PDO::PARAM_INT);
            $stmt->bindValue(':apePat', !empty($datos->apePat) ? $datos->apePat : null, PDO::PARAM_INT);
            $stmt->bindValue(':apelMat', !empty($datos->apelMat) ? $datos->apelMat : null, PDO::PARAM_INT);
            
            $stmt->bindValue(':genero', !empty($datos->genero) ? $datos->genero : null, PDO::PARAM_INT);
            $stmt->bindValue(':gdoAca', !empty($datos->gdoAca) ? $datos->gdoAca : null, PDO::PARAM_INT);
            $stmt->bindValue(':puesto', !empty($datos->puesto) ? $datos->puesto : null, PDO::PARAM_INT);
            $stmt->bindValue(':depto', !empty($datos->depto) ? $datos->depto : null, PDO::PARAM_INT);
            $stmt->bindValue(':fecNac', !empty($datos->fecNac) ? $datos->fecNac : null);
            $stmt->bindValue(':edad', !empty($datos->edad) ? $datos->edad : null, PDO::PARAM_INT);
            $stmt->bindValue(':email', !empty($datos->email) ? $datos->email : null);
            $stmt->bindValue(':telefono', !empty($datos->telefono) ? $datos->telefono : null);
            $stmt->bindValue(':aficion', !empty($datos->aficion) ? $datos->aficion : null, PDO::PARAM_INT);
            $stmt->bindValue(':notas', !empty($datos->notas) ? $datos->notas : null);

            if ($stmt->execute()) {
                return ["status" => "success", "mensaje" => "Registro guardado exitosamente."];
            } else {
                return ["status" => "error", "mensaje" => "No se pudo guardar el registro."];
            }
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => "Error de BD: " . $e->getMessage()];
        }
    }
}
?>