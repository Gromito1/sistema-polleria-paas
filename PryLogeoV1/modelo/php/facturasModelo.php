<?php
require_once __DIR__ . '/../../config/conexionBD.php';

class FacturasModelo {
    private $conn;

    public function __construct() {
        $database = new ConexionBD();
        $this->conn = $database->getConnection();
    }

    public function buscarTicket($folio) {
        try {
            // 1. Verificar si el ticket YA FUE FACTURADO
            $checkFactura = "SELECT COUNT(*) FROM mFacturas WHERE FolioVenta = :folio";
            $stmtFactura = $this->conn->prepare($checkFactura);
            $stmtFactura->bindParam(':folio', $folio, PDO::PARAM_INT);
            $stmtFactura->execute();
            
            if ($stmtFactura->fetchColumn() > 0) {
                return ["status" => "error", "mensaje" => "El ticket #$folio ya fue facturado anteriormente."];
            }

            // 2. Buscar si el ticket existe en las ventas (Cabecera)
            $queryCab = "SELECT FolioVenta, TotalVenta FROM mCabVenta WHERE FolioVenta = :folio";
            $stmtCab = $this->conn->prepare($queryCab);
            $stmtCab->bindParam(':folio', $folio, PDO::PARAM_INT);
            $stmtCab->execute();
            
            if ($stmtCab->rowCount() === 0) {
                return ["status" => "error", "mensaje" => "No se encontró el ticket #$folio en el sistema."];
            }
            
            $cabecera = $stmtCab->fetch(PDO::FETCH_ASSOC);

            // 3. Traer los productos de ese ticket (Detalle cruzado con cProductos)
            $queryDet = "SELECT d.Cantidad, p.DsProducto, d.Subtotal 
                         FROM dDetVenta d 
                         INNER JOIN cProductos p ON d.CvProducto = p.CvProducto 
                         WHERE d.FolioVenta = :folio";
            $stmtDet = $this->conn->prepare($queryDet);
            $stmtDet->bindParam(':folio', $folio, PDO::PARAM_INT);
            $stmtDet->execute();
            $detalles = $stmtDet->fetchAll(PDO::FETCH_ASSOC);

            return [
                "status" => "success", 
                "ticket" => $cabecera,
                "detalles" => $detalles
            ];

        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => "Error BD: " . $e->getMessage()];
        }
    }

    public function generarFactura($folio, $rfc, $nombre, $cp, $regimen, $uso) {
        try {
            $query = "INSERT INTO mFacturas (FolioVenta, RFC, RazonSocial, CodigoPostal, RegimenFiscal, UsoCFDI, FecFacturacion) 
                      VALUES (:folio, :rfc, :nombre, :cp, :regimen, :uso, NOW())";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':folio', $folio, PDO::PARAM_INT);
            $stmt->bindParam(':rfc', $rfc);
            $stmt->bindParam(':nombre', $nombre);
            $stmt->bindParam(':cp', $cp);
            $stmt->bindParam(':regimen', $regimen);
            $stmt->bindParam(':uso', $uso);
            
            if ($stmt->execute()) {
                $idFactura = $this->conn->lastInsertId();
                return ["status" => "success", "mensaje" => "¡Factura #$idFactura timbrada exitosamente para el RFC: $rfc!"];
            } else {
                return ["status" => "error", "mensaje" => "No se pudo generar la factura."];
            }
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => "Error BD: " . $e->getMessage()];
        }
    }
}
?>