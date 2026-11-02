<?php
require_once __DIR__ . '/../../config/conexionBD.php';

class CajaModelo {
    private $conn;

    public function __construct() {
        $database = new ConexionBD();
        $this->conn = $database->getConnection();
    }

    public function obtenerCorteHoy() {
        try {
            // AQUÍ ESTÁ LA MAGIA: Unimos ventas -> usuarios -> personas -> nombres -> apellidos
            $query = "
                SELECT 
                    c.FolioVenta AS folio, 
                    DATE_FORMAT(c.FecVenta, '%H:%i') AS hora, 
                    IFNULL(CONCAT(n.DsNombre, ' ', ap.DsApellido, ' ', am.DsApellido), u.Login) AS cajero, 
                    c.TotalVenta AS total 
                FROM mCabVenta c
                INNER JOIN musuarios u ON c.CvUser = u.CvUser
                LEFT JOIN mdtperson p ON u.CvPerson = p.CvPerson
                LEFT JOIN cnombres n ON p.CvNombre = n.CvNombre
                LEFT JOIN capellidos ap ON p.CvApePat = ap.CvApellido
                LEFT JOIN capellidos am ON p.CvApelMat = am.CvApellido
                WHERE DATE(c.FecVenta) = CURDATE()
            ";
            
            $stmt = $this->conn->prepare($query);
            
            if (!$stmt) {
                $error = $this->conn->errorInfo();
                return ["status" => "error", "mensaje" => "Error SQL: " . $error[2]];
            }

            $stmt->execute();
            $ventas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return ["status" => "success", "data" => $ventas];

        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => "Error al obtener el corte: " . $e->getMessage()];
        }
    }

    public function obtenerDetalleTicket($folio) {
        try {
            $query = "
                SELECT 
                    d.Cantidad, 
                    p.DsProducto, 
                    d.PrecioUnitario, 
                    d.Subtotal 
                FROM dDetVenta d
                INNER JOIN cProductos p ON d.CvProducto = p.CvProducto
                WHERE d.FolioVenta = :folio
            ";
            $stmt = $this->conn->prepare($query);
            
            if (!$stmt) {
                $error = $this->conn->errorInfo();
                return ["status" => "error", "mensaje" => "Error SQL Detalles: " . $error[2]];
            }

            $stmt->bindParam(':folio', $folio, PDO::PARAM_INT);
            $stmt->execute();
            
            return ["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)];
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => $e->getMessage()];
        }
    }

    // FUNCIÓN CORREGIDA: Sin transacciones manuales debido al TRUNCATE
    public function reiniciarCaja() {
        try {
            // Apagamos la revisión de llaves foráneas para poder vaciar la cabecera
            $this->conn->exec("SET FOREIGN_KEY_CHECKS = 0;");
            
            // TRUNCATE borra los datos, reinicia el Auto Increment a 1 y hace un commit automático
            $this->conn->exec("TRUNCATE TABLE dDetVenta;");
            $this->conn->exec("TRUNCATE TABLE mCabVenta;");
            
            // Volvemos a encender la seguridad
            $this->conn->exec("SET FOREIGN_KEY_CHECKS = 1;");
            
            return ["status" => "success", "mensaje" => "La caja se ha reiniciado correctamente."];
        } catch (PDOException $e) {
            return ["status" => "error", "mensaje" => "Error al reiniciar: " . $e->getMessage()];
        }
    }
}
?>