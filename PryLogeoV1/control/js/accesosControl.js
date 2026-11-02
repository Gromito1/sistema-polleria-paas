document.addEventListener("DOMContentLoaded", () => {
    cargarDatosIniciales();

    const selUsuario = document.getElementById("selUsuario");
    const btnGuardar = document.getElementById("btnGuardar");
    const btnCancelar = document.getElementById("btnCancelar");

    // Cuando elijo un usuario distinto
    selUsuario.addEventListener("change", (e) => {
        const cvUser = e.target.value;
        const index = e.target.selectedIndex;
        
        // Blindaje estricto: Aceptamos "0" de Gromito, pero rechazamos vacíos
        if (cvUser !== "" && cvUser !== "undefined" && cvUser !== null) {
            // Mostrar la cajita de información
            document.getElementById("userInfoBox").style.display = "block";
            document.getElementById("lblCvUser").innerText = cvUser;
            
            // Ver si su cuenta está activa o inactiva
            const edoCta = e.target.options[index].getAttribute('data-estado');
            document.getElementById("lblEstado").innerText = (edoCta == 1) ? "Activa (TRUE)" : "Inactiva (FALSE)";
            document.getElementById("lblEstado").style.color = (edoCta == 1) ? "green" : "red";

            // Activar botón y cargar sus palomitas
            btnGuardar.disabled = false;
            cargarPermisosUsuario(cvUser);
        } else {
            // Si elige el valor por defecto, ocultamos y limpiamos todo
            document.getElementById("userInfoBox").style.display = "none";
            btnGuardar.disabled = true;
            limpiarCheckboxes();
        }
    });

    btnGuardar.addEventListener("click", guardarPermisos);
    
    btnCancelar.addEventListener("click", () => {
        selUsuario.value = "";
        selUsuario.dispatchEvent(new Event('change')); // Fuerza a ocultar la info
    });
});

// Función para traer lista de usuarios y crear las casillas en la pantalla
function cargarDatosIniciales() {
    fetch('../../api/accesosApi.php?accion=getIniciales')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // 1. Llenar el menú desplegable
                const sel = document.getElementById("selUsuario");
                sel.innerHTML = '<option value="">-- Seleccione un Login --</option>';
                
                data.usuarios.forEach(user => {
                    let opt = document.createElement('option');
                    
                    // Blindaje del "Bug del Cero": Aseguramos que el 0 se vuelva "0" en texto
                    const idUser = (user.CvUser !== undefined) ? user.CvUser : ((user.cvUser !== undefined) ? user.cvUser : user.cvuser);
                    opt.value = String(idUser); 
                    opt.text = user.Login;
                    opt.setAttribute('data-estado', user.EdoCta || user.edoCta);
                    sel.appendChild(opt);
                });

                // 2. Dibujar las casillitas (checkboxes) de las aplicaciones
                const contenedor = document.getElementById("contenedorPermisos");
                contenedor.innerHTML = ""; 
                
                data.aplicaciones.forEach(app => {
                    let div = document.createElement('div');
                    div.className = 'chk-row';
                    
                    const idApp = app.CvAplicacion || app.cvAplicacion;
                    const dsApp = app.DsAplicacion || app.dsAplicacion;
                    
                    div.innerHTML = `
                        <input type="checkbox" id="chk_${idApp}" value="${idApp}" class="app-checkbox">
                        <label for="chk_${idApp}">${idApp} - ${dsApp}</label>
                    `;
                    contenedor.appendChild(div);
                });
            }
        })
        .catch(err => console.error("Error al cargar datos iniciales:", err));
}

// Función para prender los checkboxes que el usuario ya tiene en la Base de Datos
function cargarPermisosUsuario(cvUser) {
    limpiarCheckboxes(); // Apagamos todos primero
    
    fetch(`../../api/accesosApi.php?accion=getAccesos&cvUser=${cvUser}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success' && data.data) {
                data.data.forEach(cvApp => {
                    const chk = document.getElementById(`chk_${cvApp}`);
                    if(chk) chk.checked = true; // Si lo encuentra, lo enciende
                });
            }
        })
        .catch(err => console.error("Error cargando accesos:", err));
}

function limpiarCheckboxes() {
    const checkboxes = document.querySelectorAll(".app-checkbox");
    checkboxes.forEach(chk => chk.checked = false);
}

// Función para enviar los cambios a PHP
function guardarPermisos() {
    const selUsuario = document.getElementById("selUsuario");
    const cvUser = selUsuario.value;
    const nombreUsuarioSeleccionado = selUsuario.options[selUsuario.selectedIndex].text;
    const checkboxes = document.querySelectorAll(".app-checkbox");
    
    // Recolectar cuáles están palomeados
    let aplicacionesSeleccionadas = [];
    checkboxes.forEach(chk => {
        if (chk.checked) {
            aplicacionesSeleccionadas.push(chk.value);
        }
    });

    // LA SOLUCIÓN: Agregamos "accion: 'guardar'" para que el PHP sepa qué hacer
    const data = {
        accion: 'guardar',
        cvUser: cvUser,
        aplicaciones: aplicacionesSeleccionadas
    };

    const btnGuardar = document.getElementById("btnGuardar");
    btnGuardar.innerText = "Guardando...";
    btnGuardar.disabled = true;

    fetch('../../api/accesosApi.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        btnGuardar.innerText = "Guardar Cambios";
        btnGuardar.disabled = false;

        if(result.status === 'success') {
            alert("✅ ¡Éxito! " + result.mensaje);
            
            // MAGIA: Actualizamos la memoria si te estás editando a ti mismo
            const usuarioLogueado = localStorage.getItem("usuarioLogueado");
            if (usuarioLogueado === nombreUsuarioSeleccionado) {
                localStorage.setItem("permisosUsuario", JSON.stringify(aplicacionesSeleccionadas));
            }
        } else {
            alert("❌ Error: " + result.mensaje);
        }
    })
    .catch(error => {
        btnGuardar.innerText = "Guardar Cambios";
        btnGuardar.disabled = false;
        alert("Ocurrió un error de comunicación con el servidor al guardar.");
    });
}