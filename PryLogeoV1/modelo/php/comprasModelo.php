<?php
require_once __DIR__ . '/../../config/conexionBD.php';

class ComprasModelo {
    private $conn;

    public function __construct() {
        $database = new ConexionBD();
        $this->conn = $database->getConnection();
    }

    public function obtenerProveedores() {
        try {
            $query = "SELECT CvProveedor, DsProveedor FROM cProveedores ORDER BY DsProveedor ASC";
            $stmt = $this->conn->query($query);
            return ["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)];
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => "Error BD: " . $e->getMessage()];
        }
    }

    public function obtenerInsumos() {
        try {
            $query = "SELECT CvInsumo, DsInsumo, UnidadMedida, CostoEstimado FROM cInsumos ORDER BY DsInsumo ASC";
            $stmt = $this->conn->query($query);
            return ["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)];
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => "Error BD: " . $e->getMessage()];
        }
    }

    // 3. Registrar Compra y ACTUALIZAR INVENTARIO SIMULTÁNEAMENTE
    public function registrarCompra($loginUsuario, $cvProveedor, $total, $detalles) {
        try {
            $stmtUser = $this->conn->prepare("SELECT CvUser FROM musuarios WHERE Login = :login LIMIT 1");
            $stmtUser->bindParam(':login', $loginUsuario);
            $stmtUser->execute();
            
            if ($stmtUser->rowCount() === 0) {
                return ["status" => "error", "mensaje" => "Usuario no válido."];
            }
            $cvUser = $stmtUser->fetch(PDO::FETCH_ASSOC)['CvUser'];

            $this->conn->beginTransaction();

            // A) Insertar Cabecera
            $queryCab = "INSERT INTO mCabCompra (CvUser, CvProveedor, FecCompra, TotalCompra) 
                         VALUES (:cvUser, :cvProveedor, NOW(), :total)";
            $stmtCab = $this->conn->prepare($queryCab);
            $stmtCab->bindParam(':cvUser', $cvUser, PDO::PARAM_INT);
            $stmtCab->bindParam(':cvProveedor', $cvProveedor, PDO::PARAM_INT);
            $stmtCab->bindParam(':total', $total);
            $stmtCab->execute();

            $folioCompra = $this->conn->lastInsertId();

            // B) Preparar las dos acciones del detalle
            $queryDet = "INSERT INTO dDetCompra (FolioCompra, CvInsumo, Cantidad, CostoUnitario, Subtotal) 
                         VALUES (:folio, :insumo, :cantidad, :costo, :subtotal)";
            $stmtDet = $this->conn->prepare($queryDet);

            // LA MAGIA: Query para sumarle la mercancía comprada al almacén
            $queryStock = "UPDATE cInsumos SET Stock = Stock + :cantidad WHERE CvInsumo = :insumo";
            $stmtStock = $this->conn->prepare($queryStock);

            foreach ($detalles as $item) {
                // 1. Guardar el ticket
                $stmtDet->bindParam(':folio', $folioCompra, PDO::PARAM_INT);
                $stmtDet->bindParam(':insumo', $item->id, PDO::PARAM_INT);
                $stmtDet->bindParam(':cantidad', $item->cantidad);
                $stmtDet->bindParam(':costo', $item->costo);
                $stmtDet->bindParam(':subtotal', $item->subtotal);
                $stmtDet->execute();

                // 2. Incrementar el stock en tiempo real
                $stmtStock->bindParam(':cantidad', $item->cantidad);
                $stmtStock->bindParam(':insumo', $item->id, PDO::PARAM_INT);
                $stmtStock->execute();
            }

            $this->conn->commit();
            return ["status" => "success", "mensaje" => "Ingreso #$folioCompra registrado. El inventario ha sido actualizado."];

        } catch (PDOException $e) {
            $this->conn->rollBack(); 
            return ["status" => "error", "mensaje" => "Error al guardar compra: " . $e->getMessage()];
        }
    }
}
?>