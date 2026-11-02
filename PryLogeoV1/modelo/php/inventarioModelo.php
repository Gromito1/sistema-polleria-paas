<?php
require_once __DIR__ . '/../../config/conexionBD.php';

class InventarioModelo {
    private $conn;

    public function __construct() {
        $database = new ConexionBD();
        $this->conn = $database->getConnection();
    }

    public function obtenerInventario() {
        try {
            $query = "SELECT CvInsumo, DsInsumo, Categoria, Stock, UnidadMedida, CostoEstimado FROM cInsumos ORDER BY CvInsumo ASC";
            $stmt = $this->conn->query($query);
            return ["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)];
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => "Error BD: " . $e->getMessage()];
        }
    }

    public function registrarInsumo($nombre, $categoria, $unidad, $costo) {
        try {
            $query = "INSERT INTO cInsumos (DsInsumo, Categoria, UnidadMedida, CostoEstimado, Stock) 
                      VALUES (:nombre, :categoria, :unidad, :costo, 0.00)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':categoria', $categoria);
            $stmt->bindParam(':unidad', $unidad);
            $stmt->bindParam(':costo', $costo);
            
            if ($stmt->execute()) {
                return ["status" => "success", "mensaje" => "Insumo registrado exitosamente."];
            } else {
                return ["status" => "error", "mensaje" => "No se pudo insertar el registro."];
            }
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => "Error BD: " . $e->getMessage()];
        }
    }

    // NUEVA FUNCIÓN: Sumar o restar inventario directamente
    public function ajustarStock($id, $tipo, $cantidad) {
        try {
            if ($tipo === 'entrada') {
                $query = "UPDATE cInsumos SET Stock = Stock + :cantidad WHERE CvInsumo = :id";
            } else {
                // Es merma o salida
                $query = "UPDATE cInsumos SET Stock = Stock - :cantidad WHERE CvInsumo = :id";
            }

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':cantidad', $cantidad);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                return ["status" => "success", "mensaje" => "Stock actualizado correctamente."];
            } else {
                return ["status" => "error", "mensaje" => "No se pudo actualizar el stock."];
            }
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => "Error BD: " . $e->getMessage()];
        }
    }

    // NUEVA FUNCIÓN: Editar el nombre, categoría o precio de un insumo
    public function editarInsumo($id, $nombre, $categoria, $unidad, $costo) {
        try {
            $query = "UPDATE cInsumos 
                      SET DsInsumo = :nombre, Categoria = :categoria, UnidadMedida = :unidad, CostoEstimado = :costo 
                      WHERE CvInsumo = :id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':categoria', $categoria);
            $stmt->bindParam(':unidad', $unidad);
            $stmt->bindParam(':costo', $costo);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                return ["status" => "success", "mensaje" => "Datos del insumo actualizados."];
            } else {
                return ["status" => "error", "mensaje" => "No se pudo actualizar el registro."];
            }
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => "Error BD: " . $e->getMessage()];
        }
    }
}
?>