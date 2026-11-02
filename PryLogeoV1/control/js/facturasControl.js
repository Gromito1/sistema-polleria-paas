// Variable global para asegurar que no se facture si no hay un ticket válido
let ticketValidado = null;

document.addEventListener("DOMContentLoaded", () => {
    // Interceptamos los botones del HTML para darles su función real
    document.querySelector('.btn-buscar').onclick = buscarTicket;
    document.querySelector('.btn-facturar').onclick = generarFactura;
});

function buscarTicket() {
    const folio = document.getElementById('txtFolio').value.trim();
    
    if (folio === '') {
        alert("⚠️ Por favor, ingresa un Folio de Venta.");
        return;
    }

    fetch('../../api/facturasApi.php?accion=buscarTicket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folio: folio })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Hacemos visible el cuadrito del ticket
            document.getElementById('cajaTicket').style.display = 'block';
            document.getElementById('lblFolio').innerText = data.ticket.FolioVenta;
            
            // Asignamos la fecha actual (o la de la BD si existiera)
            document.getElementById('lblFecha').innerText = new Date().toLocaleDateString();
            document.getElementById('lblTotal').innerText = parseFloat(data.ticket.TotalVenta).toFixed(2);

            // Dibujamos la lista de pollos/combos que compró
            let listaHTML = '';
            data.detalles.forEach(item => {
                listaHTML += `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>${item.Cantidad}x ${item.DsProducto}</span>
                        <span>$${parseFloat(item.Subtotal).toFixed(2)}</span>
                    </div>`;
            });
            document.getElementById('listaArticulos').innerHTML = listaHTML;
            
            // Confirmamos que el ticket es real para permitir facturarlo
            ticketValidado = folio; 
        } else {
            alert("❌ " + data.mensaje);
            document.getElementById('cajaTicket').style.display = 'none';
            ticketValidado = null;
        }
    })
    .catch(error => {
        console.error(error);
        alert("Error de conexión al buscar el ticket.");
    });
}

function generarFactura() {
    if (!ticketValidado) {
        alert("⚠️ Primero debes buscar y validar un Folio de Venta exitosamente.");
        return;
    }

    const rfc = document.getElementById('txtRFC').value.trim().toUpperCase();
    const nombre = document.getElementById('txtNombre').value.trim();
    const cp = document.getElementById('txtCP').value.trim();
    const regimen = document.getElementById('selRegimen').value;
    const uso = document.getElementById('selUsoCFDI').value;

    if (rfc === '' || nombre === '' || cp === '' || regimen === '' || uso === '') {
        alert("⚠️ Todos los campos fiscales son obligatorios.");
        return;
    }

    const datosFactura = {
        folio: ticketValidado,
        rfc: rfc,
        nombre: nombre,
        cp: cp,
        regimen: regimen,
        uso: uso
    };

    fetch('../../api/facturasApi.php?accion=generarFactura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosFactura)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert("✅ " + data.mensaje);
            
            // Limpiar la pantalla después de facturar exitosamente
            document.getElementById('txtFolio').value = '';
            document.getElementById('txtRFC').value = '';
            document.getElementById('txtNombre').value = '';
            document.getElementById('txtCP').value = '';
            document.getElementById('selRegimen').value = '';
            document.getElementById('selUsoCFDI').value = '';
            document.getElementById('cajaTicket').style.display = 'none';
            ticketValidado = null;
        } else {
            alert("❌ Error: " + data.mensaje);
        }
    })
    .catch(error => {
        console.error(error);
        alert("Ocurrió un error al intentar emitir la factura.");
    });
}