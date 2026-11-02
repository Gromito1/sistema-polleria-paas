<?php
require_once __DIR__ . '/../../config/conexionBD.php';

class CatalogoModelo {
    private $conn;

    public function __construct() {
        $database = new ConexionBD();
        $this->conn = $database->getConnection();
    }

    public function obtenerCatalogo() {
        try {
            $query = "SELECT CvProducto, DsProducto, Categoria, Precio FROM cProductos ORDER BY CvProducto ASC";
            $stmt = $this->conn->query($query);
            return ["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)];
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => "Error BD: " . $e->getMessage()];
        }
    }

    public function registrarProducto($nombre, $categoria, $precio) {
        try {
            $query = "INSERT INTO cProductos (DsProducto, Categoria, Precio) VALUES (:nombre, :categoria, :precio)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':categoria', $categoria);
            $stmt->bindParam(':precio', $precio);
            
            if ($stmt->execute()) {
                return ["status" => "success", "mensaje" => "Producto agregado al menú exitosamente."];
            } else {
                return ["status" => "error", "mensaje" => "No se pudo insertar el producto."];
            }
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => "Error BD: " . $e->getMessage()];
        }
    }

    public function editarProducto($id, $nombre, $categoria, $precio) {
        try {
            $query = "UPDATE cProductos SET DsProducto = :nombre, Categoria = :categoria, Precio = :precio WHERE CvProducto = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':categoria', $categoria);
            $stmt->bindParam(':precio', $precio);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                return ["status" => "success", "mensaje" => "Producto actualizado en el menú."];
            } else {
                return ["status" => "error", "mensaje" => "No se pudo actualizar el producto."];
            }
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => "Error BD: " . $e->getMessage()];
        }
    }

    public function eliminarProducto($id) {
        try {
            // ESCUDO DE SEGURIDAD: Revisar si el producto ya está en algún ticket de venta
            $check = "SELECT COUNT(*) FROM dDetVenta WHERE CvProducto = :id";
            $stmtCheck = $this->conn->prepare($check);
            $stmtCheck->bindParam(':id', $id, PDO::PARAM_INT);
            $stmtCheck->execute();
            
            if ($stmtCheck->fetchColumn() > 0) {
                return ["status" => "error", "mensaje" => "Este producto ya tiene ventas registradas en el sistema. Para no afectar la contabilidad, no puede ser eliminado. (Te sugerimos editarle el nombre o ponerle precio 0)"];
            }

            // Si pasa el escudo, lo borramos
            $query = "DELETE FROM cProductos WHERE CvProducto = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                return ["status" => "success", "mensaje" => "Producto eliminado permanentemente."];
            } else {
                return ["status" => "error", "mensaje" => "No se encontró el producto."];
            }
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => "Error BD: " . $e->getMessage()];
        }
    }
}
?>