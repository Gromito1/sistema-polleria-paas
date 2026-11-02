let catalogoGlobal = [];

document.addEventListener("DOMContentLoaded", () => {
    cargarCatalogo();

    const inputBuscador = document.getElementById('txtBuscar');
    const selectCategoria = document.getElementById('filtroCategoria');

    inputBuscador.addEventListener('keyup', aplicarFiltros);
    selectCategoria.addEventListener('change', aplicarFiltros);
});

function cargarCatalogo() {
    fetch('../../api/catalogoApi.php?accion=getCatalogo')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                catalogoGlobal = data.data; 
                aplicarFiltros(); 
            } else {
                mostrarError(data.mensaje);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            mostrarError("Esperando conexión con la Base de Datos...");
        });
}

function renderizarTabla(datos) {
    const tabla = document.getElementById('tablaCatalogo');
    tabla.innerHTML = ''; 

    if (datos.length === 0) {
        tabla.innerHTML = '<tr><td colspan="4" style="text-align:center; color: var(--text-muted); padding: 20px;">No se encontraron productos en el menú.</td></tr>';
        return;
    }

    datos.forEach(item => {
        const tr = document.createElement('tr');
        const precioNum = parseFloat(item.Precio).toFixed(2);
        const categoriaTexto = item.Categoria ? item.Categoria : "General";
        const nombreLimpio = item.DsProducto.replace(/'/g, "\\'");

        tr.innerHTML = `
            <td class="col-id">${item.CvProducto}</td>
            <td>
                <span class="item-name">${item.DsProducto}</span>
                <span class="item-category">${categoriaTexto}</span>
            </td>
            <td class="col-precio">$${precioNum}</td>
            <td class="actions-cell">
                <button class="btn-action btn-edit-item" title="Editar Producto" onclick="abrirModalEditar(${item.CvProducto}, '${nombreLimpio}', '${categoriaTexto}', ${item.Precio})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-action btn-del-item" title="Eliminar del Menú" onclick="eliminarProducto(${item.CvProducto}, '${nombreLimpio}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tabla.appendChild(tr);
    });
}

function aplicarFiltros() {
    const texto = document.getElementById('txtBuscar').value.toLowerCase();
    const categoriaSelect = document.getElementById('filtroCategoria').value;
    
    const filtrados = catalogoGlobal.filter(item => {
        const coincideTexto = item.DsProducto.toLowerCase().includes(texto) || item.CvProducto.toString().includes(texto);
        const catActual = item.Categoria ? item.Categoria : "General";
        const coincideCategoria = (categoriaSelect === "Todas las Categorías") || (catActual === categoriaSelect);
        return coincideTexto && coincideCategoria;
    });
    
    renderizarTabla(filtrados);
}

function mostrarError(mensaje) {
    document.getElementById('tablaCatalogo').innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--btn-red); padding: 20px;">${mensaje}</td></tr>`;
}


/* ==========================================
   MODAL 1: NUEVO PRODUCTO
   ========================================== */
function abrirModalNuevo() {
    document.getElementById('modalNuevoProducto').style.display = 'flex';
}

function cerrarModalNuevo() {
    document.getElementById('modalNuevoProducto').style.display = 'none';
    document.getElementById('txtNuevoNombre').value = '';
    document.getElementById('selNuevaCategoria').value = 'General';
    document.getElementById('txtNuevoPrecio').value = '';
}

function guardarProductoBD() {
    const nombre = document.getElementById('txtNuevoNombre').value.trim();
    const categoria = document.getElementById('selNuevaCategoria').value;
    const precio = document.getElementById('txtNuevoPrecio').value;

    if (nombre === '' || precio === '') {
        alert("⚠️ Por favor, completa el nombre y el precio del producto.");
        return;
    }

    const datos = { nombre: nombre, categoria: categoria, precio: parseFloat(precio) || 0 };

    fetch('../../api/catalogoApi.php?accion=registrarProducto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert("✅ " + data.mensaje);
            cerrarModalNuevo();
            cargarCatalogo();
        } else {
            alert("❌ Error: " + data.mensaje);
        }
    })
    .catch(error => { console.error(error); alert("Error al registrar el producto."); });
}

/* ==========================================
   MODAL 2: EDITAR PRODUCTO
   ========================================== */
function abrirModalEditar(id, nombre, categoria, precio) {
    document.getElementById('txtEditId').value = id;
    document.getElementById('txtEditNombre').value = nombre;
    
    const selectCat = document.getElementById('selEditCategoria');
    let opcionExiste = Array.from(selectCat.options).some(opt => opt.value === categoria);
    selectCat.value = opcionExiste ? categoria : 'General';
    
    document.getElementById('txtEditPrecio').value = parseFloat(precio).toFixed(2);
    
    document.getElementById('modalEditarProducto').style.display = 'flex';
}

function cerrarModalEditar() {
    document.getElementById('modalEditarProducto').style.display = 'none';
}

function guardarEdicionBD() {
    const id = document.getElementById('txtEditId').value;
    const nombre = document.getElementById('txtEditNombre').value.trim();
    const categoria = document.getElementById('selEditCategoria').value;
    const precio = document.getElementById('txtEditPrecio').value;

    if (nombre === '' || precio === '') {
        alert("⚠️ El nombre y el precio no pueden estar vacíos.");
        return;
    }

    const datos = { id: id, nombre: nombre, categoria: categoria, precio: parseFloat(precio) || 0 };

    fetch('../../api/catalogoApi.php?accion=editarProducto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert("✅ " + data.mensaje);
            cerrarModalEditar();
            cargarCatalogo();
        } else {
            alert("❌ Error: " + data.mensaje);
        }
    })
    .catch(error => { console.error(error); alert("Error al editar el producto."); });
}

/* ==========================================
   ACCIÓN 3: ELIMINAR PRODUCTO
   ========================================== */
function eliminarProducto(id, nombre) {
    if (confirm(`⚠️ ALERTA: ¿Estás seguro de que deseas eliminar permanentemente el producto "${nombre}" del menú de ventas?`)) {
        
        fetch('../../api/catalogoApi.php?accion=eliminarProducto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert("✅ " + data.mensaje);
                cargarCatalogo();
            } else {
                alert("❌ No se puede eliminar:\n" + data.mensaje);
            }
        })
        .catch(error => { console.error(error); alert("Error al intentar eliminar el producto."); });
    }
}