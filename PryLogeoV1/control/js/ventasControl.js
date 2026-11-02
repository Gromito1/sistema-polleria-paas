// Memoria temporal del ticket
let ticketVenta = [];
let totalVenta = 0;

document.addEventListener("DOMContentLoaded", () => {
    // 1. Mostrar quién es el cajero y la fecha
    const usuario = localStorage.getItem('usuarioLogueado');
    if (!usuario) {
        alert("Sesión no encontrada. Regresando al Login...");
        window.location.href = '../../index.html';
        return;
    }
    document.getElementById('lblUsuario').innerText = 'Cajero: ' + usuario;
    
    const hoy = new Date();
    document.getElementById('lblFecha').innerText = hoy.toLocaleDateString();

    // 2. Cargar los productos de la BD
    cargarProductos();

    // 3. Activar los eventos de los botones y de la caja de texto del pago
    document.getElementById('txtPago').addEventListener('input', calcularCambio);
    document.getElementById('btnCobrar').addEventListener('click', registrarVenta);
    document.getElementById('btnCancelarVenta').addEventListener('click', limpiarTicket);
});

// Traer productos de la API y crear los botones grandes
function cargarProductos() {
    fetch('../../api/ventasApi.php?accion=getProductos')
        .then(response => response.json())
        .then(data => {
            const contenedor = document.getElementById('contenedorProductos');
            contenedor.innerHTML = ""; // Limpiar mensaje de carga

            if (data.status === 'success') {
                data.data.forEach(prod => {
                    const card = document.createElement('div');
                    card.className = 'product-card';
                    card.innerHTML = `
                        <span class="p-name">${prod.DsProducto}</span>
                        <span class="p-price">$${parseFloat(prod.Precio).toFixed(2)}</span>
                    `;
                    // Al hacer clic, se agrega al ticket
                    card.onclick = () => agregarAlTicket(prod.CvProducto, prod.DsProducto, parseFloat(prod.Precio));
                    contenedor.appendChild(card);
                });
            }
        })
        .catch(err => console.error("Error cargando productos:", err));
}

// Lógica para agregar al carrito
function agregarAlTicket(id, nombre, precio) {
    // Buscar si el producto ya está en el ticket
    let itemExistente = ticketVenta.find(item => item.id === id);

    if (itemExistente) {
        itemExistente.cantidad++;
        itemExistente.subtotal = itemExistente.cantidad * itemExistente.precio;
    } else {
        ticketVenta.push({
            id: id,
            nombre: nombre,
            precio: precio,
            cantidad: 1,
            subtotal: precio
        });
    }
    dibujarTicket();
}

function eliminarFila(index) {
    ticketVenta.splice(index, 1);
    dibujarTicket();
}

// Actualizar la tabla de la derecha
function dibujarTicket() {
    const tabla = document.getElementById('tablaTicket');
    tabla.innerHTML = "";
    totalVenta = 0;

    ticketVenta.forEach((item, index) => {
        totalVenta += item.subtotal;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><b>${item.cantidad}</b></td>
            <td class="td-name">${item.nombre}</td>
            <td>$${item.subtotal.toFixed(2)}</td>
            <td><button class="btn-del-row" onclick="eliminarFila(${index})">X</button></td>
        `;
        tabla.appendChild(tr);
    });

    document.getElementById('lblTotal').innerText = `$${totalVenta.toFixed(2)}`;
    calcularCambio(); // Recalcular por si borraron algo
}

// Calcular cuánto cambio darle al cliente
function calcularCambio() {
    const txtPago = document.getElementById('txtPago').value;
    const pago = parseFloat(txtPago) || 0;
    const btnCobrar = document.getElementById('btnCobrar');
    const lblCambio = document.getElementById('lblCambio');

    if (ticketVenta.length > 0 && pago >= totalVenta) {
        const cambio = pago - totalVenta;
        lblCambio.innerText = `$${cambio.toFixed(2)}`;
        lblCambio.style.color = "green";
        btnCobrar.disabled = false; // Habilitar el botón de cobrar
    } else {
        lblCambio.innerText = `$0.00`;
        lblCambio.style.color = "gray";
        btnCobrar.disabled = true; // Bloquear el botón
    }
}

function limpiarTicket() {
    ticketVenta = [];
    document.getElementById('txtPago').value = "";
    dibujarTicket();
}

// Enviar el cobro a PHP
function registrarVenta() {
    const usuario = localStorage.getItem('usuarioLogueado');
    
    const data = {
        usuario: usuario,
        total: totalVenta,
        detalles: ticketVenta
    };

    fetch('../../api/ventasApi.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === 'success') {
            alert("✅ " + result.mensaje + "\nEntregue su cambio: " + document.getElementById('lblCambio').innerText);
            limpiarTicket();
        } else {
            alert("❌ Error: " + result.mensaje);
        }
    })
    .catch(error => alert("Ocurrió un problema de conexión al registrar la venta."));
}