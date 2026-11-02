// Variable global para nuestro carrito
let carritoCompra = [];

document.addEventListener("DOMContentLoaded", () => {
    // 1. Cargar datos del usuario y fecha en la cabecera
    const usuario = localStorage.getItem('usuarioLogueado') || "Desconocido";
    const nombreReal = localStorage.getItem('nombreRealUsuario');
    
    let nombreMostrar = nombreReal ? nombreReal : usuario;
    document.getElementById('lblUsuario').innerText = 'Usuario: ' + nombreMostrar;
    
    const hoy = new Date();
    document.getElementById('lblFecha').innerText = hoy.toLocaleDateString();

    // 2. Cargar Catálogos desde la BD (Preparados para cuando exista la API)
    cargarProveedores();
    cargarInsumos();
    
    // 3. Asignar funciones a los botones principales
    document.getElementById('btnCancelarCompra').addEventListener('click', limpiarCarrito);
    document.getElementById('btnRegistrarCompra').addEventListener('click', registrarCompra);
});

function cargarProveedores() {
    fetch('../../api/comprasApi.php?accion=getProveedores')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('selProveedor');
            select.innerHTML = '<option value="">Seleccione un proveedor...</option>';
            
            if (data.status === 'success') {
                data.data.forEach(prov => {
                    select.innerHTML += `<option value="${prov.CvProveedor}">${prov.DsProveedor}</option>`;
                });
            } else {
                select.innerHTML = '<option value="">Error al cargar proveedores</option>';
            }
        })
        .catch(err => {
            console.error("Esperando a la API de proveedores...", err);
            document.getElementById('selProveedor').innerHTML = '<option value="">Falta conectar API...</option>';
        });
}

function cargarInsumos() {
    fetch('../../api/comprasApi.php?accion=getInsumos')
        .then(response => response.json())
        .then(data => {
            const tabla = document.getElementById('tablaCatalogoInsumos');
            tabla.innerHTML = '';
            
            if (data.status === 'success' && data.data.length > 0) {
                data.data.forEach(insumo => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${insumo.CvInsumo}</td>
                        <td>${insumo.DsInsumo}</td>
                        <td>${insumo.UnidadMedida}</td>
                        <td style="color: var(--accent-gold);">$${parseFloat(insumo.CostoEstimado).toFixed(2)}</td>
                        <td>
                            <button class="btn-action btn-add" onclick="agregarAlCarrito(${insumo.CvInsumo}, '${insumo.DsInsumo}', ${insumo.CostoEstimado})">
                                <i class="fa-solid fa-plus"></i> Añadir
                            </button>
                        </td>
                    `;
                    tabla.appendChild(tr);
                });
            } else {
                tabla.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No hay insumos registrados.</td></tr>';
            }
        })
        .catch(err => {
            console.error("Esperando a la API de insumos...", err);
            document.getElementById('tablaCatalogoInsumos').innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--btn-red);">Esperando conexión con la Base de Datos...</td></tr>';
        });
}

// Funciones para manejar el carrito
function agregarAlCarrito(id, nombre, costoEstimado) {
    const existe = carritoCompra.find(item => item.id === id);
    if (existe) {
        existe.cantidad += 1;
        existe.subtotal = existe.cantidad * existe.costo;
    } else {
        carritoCompra.push({
            id: id,
            nombre: nombre,
            cantidad: 1,
            costo: parseFloat(costoEstimado),
            subtotal: parseFloat(costoEstimado)
        });
    }
    actualizarTablaCarrito();
}

function actualizarCantidad(id, nuevaCantidad) {
    const item = carritoCompra.find(item => item.id === id);
    if (item) {
        item.cantidad = parseFloat(nuevaCantidad) || 1;
        item.subtotal = item.cantidad * item.costo;
        actualizarTablaCarrito();
    }
}

function actualizarCosto(id, nuevoCosto) {
    const item = carritoCompra.find(item => item.id === id);
    if (item) {
        item.costo = parseFloat(nuevoCosto) || 0;
        item.subtotal = item.cantidad * item.costo;
        actualizarTablaCarrito();
    }
}

function eliminarDelCarrito(id) {
    carritoCompra = carritoCompra.filter(item => item.id !== id);
    actualizarTablaCarrito();
}

function actualizarTablaCarrito() {
    const tabla = document.getElementById('tablaCompra');
    tabla.innerHTML = '';
    let total = 0;

    carritoCompra.forEach(item => {
        total += item.subtotal;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <input type="number" value="${item.cantidad}" min="0.1" step="0.1" style="width: 60px; padding: 5px; margin: 0;" onchange="actualizarCantidad(${item.id}, this.value)">
            </td>
            <td>${item.nombre}</td>
            <td>
                <input type="number" value="${item.costo.toFixed(2)}" min="0" step="0.5" style="width: 80px; padding: 5px; margin: 0;" onchange="actualizarCosto(${item.id}, this.value)">
            </td>
            <td style="color: var(--accent-gold); font-weight: bold;">$${item.subtotal.toFixed(2)}</td>
            <td>
                <button class="btn-action btn-del" onclick="eliminarDelCarrito(${item.id})"><i class="fa-solid fa-xmark"></i></button>
            </td>
        `;
        tabla.appendChild(tr);
    });

    document.getElementById('lblTotal').innerText = '$' + total.toFixed(2);
    
    const btnRegistrar = document.getElementById('btnRegistrarCompra');
    if (carritoCompra.length > 0) {
        btnRegistrar.disabled = false;
    } else {
        btnRegistrar.disabled = true;
    }
}

function limpiarCarrito() {
    if (carritoCompra.length > 0) {
        if(confirm("¿Estás seguro de vaciar la lista de compras?")) {
            carritoCompra = [];
            document.getElementById('selProveedor').value = "";
            actualizarTablaCarrito();
        }
    }
}

function registrarCompra() {
    const proveedorId = document.getElementById('selProveedor').value;
    const usuarioLogueado = localStorage.getItem('usuarioLogueado');

    if (!proveedorId) {
        alert("⚠️ Por favor, seleccione un proveedor.");
        return;
    }

    if (carritoCompra.length === 0) {
        alert("⚠️ El carrito de compras está vacío.");
        return;
    }

    let totalCompra = 0;
    carritoCompra.forEach(item => totalCompra += item.subtotal);

    const datosCompra = {
        loginUsuario: usuarioLogueado,
        cvProveedor: proveedorId,
        total: totalCompra,
        detalles: carritoCompra
    };

    fetch('../../api/comprasApi.php?accion=registrarCompra', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosCompra)
    })
    .then(async response => {
        const textoServidor = await response.text();
        try {
            const data = JSON.parse(textoServidor);
            if (data.status === 'success') {
                alert("✅ " + data.mensaje);
                carritoCompra = [];
                document.getElementById('selProveedor').value = "";
                actualizarTablaCarrito();
            } else {
                alert("❌ Error de la BD: " + data.mensaje);
            }
        } catch(e) {
            alert("ERROR CRUDO DEL SERVIDOR PHP:\n\n" + textoServidor);
        }
    })
    .catch(err => {
        alert("Ocurrió un error de red al intentar registrar la compra.");
    });
}