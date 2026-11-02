let inventarioGlobal = [];

document.addEventListener("DOMContentLoaded", () => {
    cargarInventario();

    const inputBuscador = document.getElementById('txtBuscar');
    const selectCategoria = document.getElementById('filtroCategoria');

    inputBuscador.addEventListener('keyup', aplicarFiltros);
    selectCategoria.addEventListener('change', aplicarFiltros);
});

function cargarInventario() {
    fetch('../../api/inventarioApi.php?accion=getInventario')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                inventarioGlobal = data.data; 
                aplicarFiltros(); 
            } else {
                mostrarError(data.mensaje);
            }
        })
        .catch(error => {
            console.error(error);
            mostrarError("Esperando conexión con la Base de Datos...");
        });
}

function renderizarTabla(datos) {
    const tabla = document.getElementById('tablaInventario');
    tabla.innerHTML = ''; 

    if (datos.length === 0) {
        tabla.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--text-muted); padding: 20px;">No se encontraron insumos.</td></tr>';
        return;
    }

    datos.forEach(item => {
        const tr = document.createElement('tr');
        const stockNum = parseFloat(item.Stock);
        let colorStock = 'var(--stock-green)'; 
        
        if (stockNum <= 5) colorStock = 'var(--btn-red)'; 
        else if (stockNum <= 15) colorStock = 'var(--accent-gold)'; 

        const categoriaTexto = item.Categoria ? item.Categoria : "Materia Prima";
        const nombreLimpio = item.DsInsumo.replace(/'/g, "\\'");

        tr.innerHTML = `
            <td class="col-id">${item.CvInsumo}</td>
            <td>
                <span class="item-name">${item.DsInsumo}</span>
                <span class="item-category">${categoriaTexto}</span>
            </td>
            <td class="col-stock" style="color: ${colorStock};">${stockNum.toFixed(2)}</td>
            <td style="color: var(--text-muted);">${item.UnidadMedida}</td>
            <td class="actions-cell">
                <button class="btn-action btn-add-stock" title="Entrada Manual" onclick="abrirModalStock(${item.CvInsumo}, 'entrada', '${nombreLimpio}')"><i class="fa-solid fa-arrow-trend-up"></i></button>
                <button class="btn-action btn-sub-stock" title="Registrar Merma" onclick="abrirModalStock(${item.CvInsumo}, 'merma', '${nombreLimpio}')"><i class="fa-solid fa-arrow-trend-down"></i></button>
                <button class="btn-action btn-edit-item" title="Editar Insumo" onclick="abrirModalEditar(${item.CvInsumo}, '${nombreLimpio}', '${categoriaTexto}', '${item.UnidadMedida}', ${item.CostoEstimado})"><i class="fa-solid fa-pen"></i></button>
            </td>
        `;
        tabla.appendChild(tr);
    });
}

function aplicarFiltros() {
    const texto = document.getElementById('txtBuscar').value.toLowerCase();
    const categoriaSelect = document.getElementById('filtroCategoria').value;
    
    const filtrados = inventarioGlobal.filter(item => {
        const coincideTexto = item.DsInsumo.toLowerCase().includes(texto) || item.CvInsumo.toString().includes(texto);
        const catActual = item.Categoria ? item.Categoria : "Materia Prima";
        const coincideCategoria = (categoriaSelect === "Todas las Categorías") || (catActual === categoriaSelect);
        return coincideTexto && coincideCategoria;
    });
    
    renderizarTabla(filtrados);
}

function mostrarError(mensaje) {
    document.getElementById('tablaInventario').innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--btn-red); padding: 20px;">${mensaje}</td></tr>`;
}


/* ==========================================
   MODAL 1: NUEVO INSUMO
   ========================================== */
function abrirModalNuevo() {
    document.getElementById('modalNuevoInsumo').style.display = 'flex';
}

function cerrarModalNuevo() {
    document.getElementById('modalNuevoInsumo').style.display = 'none';
    document.getElementById('txtNuevoNombre').value = '';
    document.getElementById('selNuevaCategoria').value = 'Materia Prima';
    document.getElementById('txtNuevaUnidad').value = '';
    document.getElementById('txtNuevoCosto').value = '0.00';
}

function guardarInsumoBD() {
    const nombre = document.getElementById('txtNuevoNombre').value.trim();
    const categoria = document.getElementById('selNuevaCategoria').value;
    const unidad = document.getElementById('txtNuevaUnidad').value.trim();
    const costo = document.getElementById('txtNuevoCosto').value;

    if (nombre === '' || unidad === '') {
        alert("⚠️ Por favor, completa al menos el Nombre y la Unidad de Medida.");
        return;
    }

    const datosInsumo = { nombre: nombre, categoria: categoria, unidad: unidad, costo: parseFloat(costo) || 0 };

    fetch('../../api/inventarioApi.php?accion=registrarInsumo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosInsumo)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert("✅ " + data.mensaje);
            cerrarModalNuevo();
            cargarInventario(); 
        } else {
            alert("❌ Error: " + data.mensaje);
        }
    })
    .catch(error => { console.error(error); alert("Ocurrió un error al intentar guardar el insumo."); });
}


/* ==========================================
   MODAL 2: AJUSTE DE STOCK (Entrada/Merma)
   ========================================== */
function abrirModalStock(id, tipo, nombre) {
    document.getElementById('txtIdAjuste').value = id;
    document.getElementById('txtTipoAjuste').value = tipo;
    document.getElementById('lblNombreProdStock').innerText = nombre;
    document.getElementById('txtCantidadAjuste').value = '';

    const titulo = document.getElementById('lblTituloStock');
    const btnGuardar = document.getElementById('btnGuardarStock');

    if (tipo === 'entrada') {
        titulo.innerText = 'Entrada de Mercancía';
        titulo.style.color = 'var(--btn-green)';
        btnGuardar.style.background = 'var(--btn-green)';
        btnGuardar.innerText = 'Sumar Stock';
    } else {
        titulo.innerText = 'Registrar Merma / Salida';
        titulo.style.color = 'var(--btn-red)';
        btnGuardar.style.background = 'var(--btn-red)';
        btnGuardar.innerText = 'Restar Stock';
    }

    document.getElementById('modalAjusteStock').style.display = 'flex';
}

function cerrarModalStock() {
    document.getElementById('modalAjusteStock').style.display = 'none';
}

function guardarAjusteBD() {
    const id = document.getElementById('txtIdAjuste').value;
    const tipo = document.getElementById('txtTipoAjuste').value;
    const cantidad = parseFloat(document.getElementById('txtCantidadAjuste').value);

    if (!cantidad || cantidad <= 0) {
        alert("⚠️ Por favor ingresa una cantidad válida mayor a cero.");
        return;
    }

    const datosAjuste = { id: id, tipo: tipo, cantidad: cantidad };

    fetch('../../api/inventarioApi.php?accion=ajustarStock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosAjuste)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            cerrarModalStock();
            cargarInventario();
        } else {
            alert("❌ Error: " + data.mensaje);
        }
    })
    .catch(error => { console.error(error); alert("Ocurrió un error al ajustar el stock."); });
}


/* ==========================================
   MODAL 3: EDITAR INSUMO
   ========================================== */
function abrirModalEditar(id, nombre, categoria, unidad, costo) {
    document.getElementById('txtEditId').value = id;
    document.getElementById('txtEditNombre').value = nombre;
    document.getElementById('selEditCategoria').value = categoria;
    document.getElementById('txtEditUnidad').value = unidad;
    document.getElementById('txtEditCosto').value = parseFloat(costo).toFixed(2);

    document.getElementById('modalEditarInsumo').style.display = 'flex';
}

function cerrarModalEditar() {
    document.getElementById('modalEditarInsumo').style.display = 'none';
}

function guardarEdicionBD() {
    const id = document.getElementById('txtEditId').value;
    const nombre = document.getElementById('txtEditNombre').value.trim();
    const categoria = document.getElementById('selEditCategoria').value;
    const unidad = document.getElementById('txtEditUnidad').value.trim();
    const costo = document.getElementById('txtEditCosto').value;

    if (nombre === '' || unidad === '') {
        alert("⚠️ El nombre y la unidad no pueden estar vacíos.");
        return;
    }

    const datosEdicion = { id: id, nombre: nombre, categoria: categoria, unidad: unidad, costo: parseFloat(costo) || 0 };

    fetch('../../api/inventarioApi.php?accion=editarInsumo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosEdicion)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert("✅ " + data.mensaje);
            cerrarModalEditar();
            cargarInventario();
        } else {
            alert("❌ Error: " + data.mensaje);
        }
    })
    .catch(error => { console.error(error); alert("Ocurrió un error al actualizar el insumo."); });
}