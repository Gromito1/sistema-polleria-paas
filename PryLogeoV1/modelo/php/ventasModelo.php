<?php
require_once __DIR__ . '/../../config/conexionBD.php';

class VentasModelo {
    private $conn;

    public function __construct() {
        $database = new ConexionBD();
        $this->conn = $database->getConnection();
    }

    // 1. Obtener el menú de productos
    public function obtenerProductos() {
        try {
            $query = "SELECT CvProducto, DsProducto, Precio FROM cProductos";
            $stmt = $this->conn->query($query);
            return ["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)];
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => $e->getMessage()];
        }
    }

    // 2. Guardar el ticket y sus detalles
    public function registrarVenta($loginUsuario, $total, $detalles) {
        try {
            // Buscamos el ID del usuario (CvUser) usando su Login
            $stmtUser = $this->conn->prepare("SELECT CvUser FROM mUsuarios WHERE Login = :login LIMIT 1");
            $stmtUser->bindParam(':login', $loginUsuario);
            $stmtUser->execute();
            if ($stmtUser->rowCount() === 0) {
                return ["status" => "error", "mensaje" => "Usuario no válido."];
            }
            $cvUser = $stmtUser->fetch(PDO::FETCH_ASSOC)['CvUser'];

            // Iniciamos la Transacción de seguridad
            $this->conn->beginTransaction();

            // A) Insertamos la Cabecera (El ticket general)
            $queryCab = "INSERT INTO mCabVenta (CvUser, TotalVenta) VALUES (:cvUser, :total)";
            $stmtCab = $this->conn->prepare($queryCab);
            $stmtCab->bindParam(':cvUser', $cvUser, PDO::PARAM_INT);
            $stmtCab->bindParam(':total', $total);
            $stmtCab->execute();

            // Obtenemos el Folio que se acaba de generar
            $folioVenta = $this->conn->lastInsertId();

            // B) Insertamos el Detalle (Los pollos que compró)
            $queryDet = "INSERT INTO dDetVenta (FolioVenta, CvProducto, Cantidad, PrecioUnitario, Subtotal) 
                         VALUES (:folio, :producto, :cantidad, :precio, :subtotal)";
            $stmtDet = $this->conn->prepare($queryDet);

            foreach ($detalles as $item) {
                $stmtDet->bindParam(':folio', $folioVenta, PDO::PARAM_INT);
                $stmtDet->bindParam(':producto', $item->id, PDO::PARAM_INT);
                $stmtDet->bindParam(':cantidad', $item->cantidad, PDO::PARAM_INT);
                $stmtDet->bindParam(':precio', $item->precio);
                $stmtDet->bindParam(':subtotal', $item->subtotal);
                $stmtDet->execute();
            }

            // Confirmamos que todo se guardó bien
            $this->conn->commit();
            return ["status" => "success", "mensaje" => "Venta #$folioVenta registrada con éxito."];

        } catch (PDOException $e) {
            $this->conn->rollBack(); // Si hay error, cancelamos todo
            return ["status" => "error", "mensaje" => "Error al cobrar: " . $e->getMessage()];
        }
    }
}
?>