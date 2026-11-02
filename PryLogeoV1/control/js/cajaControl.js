document.addEventListener("DOMContentLoaded", () => {
    const hoy = new Date();
    document.getElementById('lblFechaActual').innerText = 'Fecha: ' + hoy.toLocaleDateString();
    
    cargarCorteDeCaja();
});

function cargarCorteDeCaja() {
    fetch('../../api/cajaApi.php?accion=getCorteHoy')
        .then(response => response.json())
        .then(data => {
            const tabla = document.getElementById('tablaCorte');
            tabla.innerHTML = ""; 

            if (data.status === 'success' && data.data.length > 0) {
                let totalTickets = 0;
                let totalDinero = 0;

                data.data.forEach(venta => {
                    totalTickets++;
                    totalDinero += parseFloat(venta.total);

                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td style="text-align: center;"><strong>${venta.folio}</strong></td>
                        <td style="text-align: center;">${venta.hora}</td>
                        <td style="text-align: center;">${venta.cajero}</td>
                        <td style="text-align: center; color: #198754; font-weight: bold;">$${parseFloat(venta.total).toFixed(2)}</td>
                        <td style="text-align: center;">
                            <button onclick="verDetalles(${venta.folio})" style="background-color: #17a2b8; border: none; color: white; padding: 5px 10px; border-radius: 4px; cursor: pointer;">👀 Ver</button>
                        </td>
                    `;
                    tabla.appendChild(tr);
                });

                document.getElementById('lblTotalTickets').innerText = totalTickets;
                document.getElementById('lblTotalDinero').innerText = `$${totalDinero.toFixed(2)}`;

            } else {
                tabla.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #aaa; padding: 20px;">No hay ventas registradas el día de hoy.</td></tr>`;
                document.getElementById('lblTotalTickets').innerText = "0";
                document.getElementById('lblTotalDinero').innerText = "$0.00";
            }
        })
        .catch(error => {
            console.error("Error al cargar el corte de caja:", error);
            document.getElementById('tablaCorte').innerHTML = `<tr><td colspan="5" style="text-align: center; color: #dc3545; padding: 20px;">Error de conexión con la base de datos.</td></tr>`;
        });
}

function imprimirYLimpiar() {
    window.print();
    
    document.getElementById('tablaCorte').innerHTML = `<tr><td colspan="5" style="text-align: center; color: #aaa; padding: 20px;">Corte de caja finalizado e impreso.</td></tr>`;
    document.getElementById('lblTotalTickets').innerText = "0";
    document.getElementById('lblTotalDinero').innerText = "$0.00";
}

// MODIFICADO: Agregamos el detector profundo de errores del servidor
function reiniciarCaja() {
    const confirmacion = confirm("⚠️ ADVERTENCIA: ¿Estás seguro de querer ELIMINAR TODOS los tickets?\n\nLa caja quedará en ceros y los folios volverán a empezar desde el #1. Esta acción no se puede deshacer.");
    
    if(confirmacion) {
        fetch('../../api/cajaApi.php?accion=reiniciarCaja', {
            method: 'POST'
        })
        .then(async response => {
            // Extraemos el texto crudo del servidor en lugar de forzar el JSON
            const textoServidor = await response.text();
            try {
                const data = JSON.parse(textoServidor);
                if(data.status === 'success') {
                    alert("✅ " + data.mensaje);
                    cargarCorteDeCaja(); 
                } else {
                    alert("❌ Error de la BD: " + data.mensaje);
                }
            } catch(e) {
                // Si PHP arroja un Fatal Error, lo mostraremos aquí
                alert("ERROR CRUDO DEL SERVIDOR PHP:\n\n" + textoServidor);
            }
        })
        .catch(error => alert("Ocurrió un error de red al intentar reiniciar la caja."));
    }
}

function verDetalles(folio) {
    document.getElementById('modalDetalle').style.display = 'flex';
    document.getElementById('lblFolioModal').innerText = folio;
    
    const tablaDetalle = document.getElementById('tablaDetalleTicket');
    tablaDetalle.innerHTML = '<tr><td colspan="4" style="text-align: center;">Cargando...</td></tr>';

    fetch(`../../api/cajaApi.php?accion=getDetalleTicket&folio=${folio}`)
        .then(response => response.json())
        .then(data => {
            tablaDetalle.innerHTML = '';
            if(data.status === 'success' && data.data.length > 0) {
                data.data.forEach(item => {
                    tablaDetalle.innerHTML += `
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #333; text-align: center;">${item.Cantidad}</td>
                            <td style="padding: 8px; border-bottom: 1px solid #333;">${item.DsProducto}</td>
                            <td style="padding: 8px; border-bottom: 1px solid #333;">$${parseFloat(item.PrecioUnitario).toFixed(2)}</td>
                            <td style="padding: 8px; border-bottom: 1px solid #333;">$${parseFloat(item.Subtotal).toFixed(2)}</td>
                        </tr>
                    `;
                });
            } else {
                tablaDetalle.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">No se encontraron detalles para este ticket.</td></tr>';
            }
        })
        .catch(err => console.error(err));
}

function cerrarModal() {
    document.getElementById('modalDetalle').style.display = 'none';
}