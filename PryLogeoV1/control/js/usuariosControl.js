let modoActual = 'inicio'; 
let idUsuarioActual = null; 

document.addEventListener("DOMContentLoaded", () => {
    const nombreReal = localStorage.getItem("nombreRealUsuario");
    const login = localStorage.getItem("usuarioLogueado");
    if (!login) {
        window.location.href = "../../index.html";
    } else {
        document.getElementById("lblUsuarioActivo").innerText = nombreReal ? nombreReal : login;
    }

    cargarDatos(); 

    document.getElementById("btnNuevo").addEventListener("click", manejarBotonNuevo);
    document.getElementById("btnModificar").addEventListener("click", manejarBotonModificar);
    document.getElementById("btnBorrar").addEventListener("click", manejarBotonBorrar);
    document.getElementById("btnCancelar").addEventListener("click", cancelarOperacion);
    
    document.getElementById("btnAbrirPrivilegios").addEventListener("click", () => {
        if (idUsuarioActual === null) {
            alert("⚠️ Primero debes seleccionar un usuario de la tabla inferior.");
            return;
        }
        abrirModalPrivilegios(document.getElementById("txtLogin").value);
    });

    document.getElementById("btnCerrarModal").addEventListener("click", () => {
        document.getElementById("modalAccesos").style.display = "none";
        document.getElementById("selAppModal").value = "";
    });

    document.getElementById("btnGuardarAcceso").addEventListener("click", guardarPrivilegio);
    document.getElementById("btnRevocarAccesos").addEventListener("click", revocarPrivilegios);

    document.getElementById("btnEdoCta").addEventListener("click", function() {
        if(this.disabled) return;
        const hidEdoCta = document.getElementById("hidEdoCta");
        if(hidEdoCta.value === "1") {
            hidEdoCta.value = "0";
            this.innerText = "Inactivo";
            this.className = "btn-estado inactivo";
        } else {
            hidEdoCta.value = "1";
            this.innerText = "Activo";
            this.className = "btn-estado activo";
        }
    });

    manejarBotonNuevo(); 
});

function togglePass() {
    const input = document.getElementById("txtPassword");
    input.type = input.type === "password" ? "text" : "password";
}

// -------------------------------------------------------------
// FUNCIONES DEL GESTOR DE PRIVILEGIOS
// -------------------------------------------------------------
function abrirModalPrivilegios(nombreUsuario) {
    document.getElementById("txtUsuarioModal").value = nombreUsuario;
    document.getElementById("selAppModal").value = "";
    document.getElementById("modalAccesos").style.display = "flex";
}

function guardarPrivilegio() {
    const cvApp = document.getElementById("selAppModal").value;
    if (!cvApp) { alert("⚠️ Por favor, selecciona un Nivel de Acceso."); return; }

    const btnGuardar = document.getElementById("btnGuardarAcceso");
    btnGuardar.innerText = "Guardando..."; btnGuardar.disabled = true;

    fetch('../../api/usuariosApi.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'asignarAcceso', cvUser: idUsuarioActual, cvApp: cvApp })
    }).then(r => r.json()).then(res => {
        btnGuardar.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Privilegio'; btnGuardar.disabled = false;
        if (res.status === 'success') {
            alert("✅ " + res.mensaje); document.getElementById("modalAccesos").style.display = "none";
        } else { alert("❌ " + res.mensaje); }
    }).catch(err => {
        btnGuardar.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Privilegio'; btnGuardar.disabled = false;
        alert("❌ Error de comunicación con el servidor.");
    });
}

function revocarPrivilegios() {
    if(!confirm("⚠️ ¿Estás seguro de quitarle TODOS los accesos a esta cuenta?")) return;
    const btnRevocar = document.getElementById("btnRevocarAccesos");
    btnRevocar.innerText = "Revocando..."; btnRevocar.disabled = true;

    fetch('../../api/usuariosApi.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'revocarAccesos', cvUser: idUsuarioActual })
    }).then(r => r.json()).then(res => {
        btnRevocar.innerHTML = '<i class="fa-solid fa-trash-can"></i> Revocar Todo'; btnRevocar.disabled = false;
        if (res.status === 'success') {
            alert("✅ " + res.mensaje); document.getElementById("modalAccesos").style.display = "none";
        } else { alert("❌ " + res.mensaje); }
    }).catch(err => {
        btnRevocar.innerHTML = '<i class="fa-solid fa-trash-can"></i> Revocar Todo'; btnRevocar.disabled = false;
        alert("❌ Error de comunicación con el servidor.");
    });
}

// -------------------------------------------------------------
// RECOLECTOR GLOBAL DE ERRORES FRONT-END
// -------------------------------------------------------------
function validarReglasFront() {
    let errores = [];
    const cvPerson = document.getElementById("selCvPerson").value;
    const login = document.getElementById("txtLogin").value.trim();
    const password = document.getElementById("txtPassword").value.trim();

    if (modoActual === 'nuevo' && (!cvPerson || !login || !password)) {
        errores.push("❌ FALTAN DATOS: Debes completar todos los campos obligatorios.");
    } else if (modoActual === 'modificando' && !login) {
        errores.push("❌ FALTAN DATOS: El Login no puede estar vacío.");
    }

    if (login) {
        if (login.length < 11 || login.length > 16) {
            errores.push("❌ LONGITUD DE LOGIN: Debe tener entre 11 y 16 caracteres.");
        } else {
            const regexLogin = /^[A-Z][a-z]{2}\d{2}[A-Za-z]{3}\d{2}[\+\*\$@%;]+$/;
            if (!regexLogin.test(login)) {
                errores.push("❌ FORMATO DE LOGIN INCORRECTO:\n   - 1 Mayúscula, 2 minúsculas, 2 dígitos, 3 letras, 2 dígitos.\n   - Terminado ÚNICAMENTE con caracteres especiales (+ * $ @ % ;)");
            }
        }
    }

    if (password && (modoActual === 'nuevo' || (modoActual === 'modificando' && password !== ""))) {
        if (password.length !== 16) {
            errores.push("❌ LONGITUD DE PASSWORD: Debe tener exactamente 16 caracteres.");
        } else {
            const regexPassword = /^[A-Z][a-z]{2}\d{2}[A-Za-z]{3}\d{2}[A-Za-z]{3}\d{2}[\+\*\$@%;]+$/;
            if (!regexPassword.test(password)) {
                errores.push("❌ FORMATO DE PASSWORD INCORRECTO:\n   - 1 Mayúscula, 2 minúsculas, 2 dig, 3 letras, 2 dig, 3 letras, 2 dig.\n   - Terminado ÚNICAMENTE con carácter especial (+ * $ @ % ;)");
            }
        }
    }

    const hoy = new Date();
    hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
    const hoyStr = hoy.toISOString().split('T')[0];
    const ini = document.getElementById("txtFecIni").value;
    const fin = document.getElementById("txtFecFin").value;

    if (modoActual === 'nuevo' && ini < hoyStr) {
        errores.push("❌ FECHAS: La Fecha de Inicio no puede ser menor a la fecha actual.");
    }
    if (fin < ini) {
        errores.push("❌ FECHAS: La Fecha de Término no puede ser menor a la Fecha de Inicio.");
    }

    return errores;
}

// -------------------------------------------------------------
// MÁQUINA DE ESTADOS Y SINCRONIZACIÓN DE ERRORES (FRONT + BD)
// -------------------------------------------------------------
function manejarBotonNuevo() {
    const btnNuevo = document.getElementById("btnNuevo");
    const btnModificar = document.getElementById("btnModificar");

    if (modoActual !== 'nuevo') {
        modoActual = 'nuevo';
        idUsuarioActual = null; 
        btnNuevo.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> GUARDAR / REGISTRAR';
        btnNuevo.className = "btn btn-nuevo"; 
        btnModificar.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Modificar';
        
        habilitarFormulario(true);
        document.getElementById("formUsuario").reset();

        setTimeout(() => {
            document.getElementById("txtLogin").value = "";
            document.getElementById("txtPassword").value = "";
            document.getElementById("selCvPerson").value = "";
        }, 50);

        const hoy = new Date();
        const fechaFin = new Date(hoy);
        fechaFin.setDate(hoy.getDate() + 30); 

        document.getElementById("txtFecIni").value = hoy.toISOString().split('T')[0];
        document.getElementById("txtFecFin").value = fechaFin.toISOString().split('T')[0];
        
        document.getElementById("btnEdoCta").innerText = "Activo";
        document.getElementById("btnEdoCta").className = "btn-estado activo";
        document.getElementById("hidEdoCta").value = "1";

    } else {
        const erroresFront = validarReglasFront();
        const loginGuardado = document.getElementById("txtLogin").value.trim();
        const passwordGuardado = document.getElementById("txtPassword").value.trim();
        const cvPerson = document.getElementById("selCvPerson").value;

        btnNuevo.innerText = "Analizando datos..."; 
        btnNuevo.disabled = true;

        fetch('../../api/usuariosApi.php?accion=getUsuarios')
        .then(res => res.json())
        .then(dataUsuarios => {
            let erroresDB = [];
            if (dataUsuarios && dataUsuarios.status === 'success') {
                const usuarios = dataUsuarios.data;
                if (usuarios.some(u => u.CvPerso == cvPerson)) {
                    erroresDB.push("❌ BASE DE DATOS: Esta persona ya tiene una cuenta asignada.");
                }
                if (usuarios.some(u => u.Login === loginGuardado)) {
                    erroresDB.push("❌ BASE DE DATOS: El Login ingresado ya está en uso.");
                }
                if (usuarios.some(u => u.Password === passwordGuardado)) {
                    erroresDB.push("❌ BASE DE DATOS: El Password ingresado ya pertenece a otra cuenta.");
                }
            }

            const todosErrores = erroresFront.concat(erroresDB);
            if (todosErrores.length > 0) {
                // Muestra la alerta
                alert("⚠️ EL SISTEMA DETECTÓ LOS SIGUIENTES ERRORES:\n\n" + todosErrores.join("\n\n"));
                
                // Restaura el botón
                btnNuevo.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> GUARDAR / REGISTRAR'; 
                btnNuevo.disabled = false;
                
                // === LIMPIEZA AUTOMÁTICA COMPLETA ===
                document.getElementById("txtLogin").value = "";
                document.getElementById("txtPassword").value = "";
                document.getElementById("selCvPerson").value = "";
                
                // Restauramos las fechas por defecto
                const hoyLimpio = new Date();
                const fechaFinLimpio = new Date(hoyLimpio);
                fechaFinLimpio.setDate(hoyLimpio.getDate() + 30); 
                document.getElementById("txtFecIni").value = hoyLimpio.toISOString().split('T')[0];
                document.getElementById("txtFecFin").value = fechaFinLimpio.toISOString().split('T')[0];

                // Restauramos el Estado a Activo
                document.getElementById("btnEdoCta").innerText = "Activo";
                document.getElementById("btnEdoCta").className = "btn-estado activo";
                document.getElementById("hidEdoCta").value = "1";

                document.getElementById("txtLogin").focus();
                // ====================================

                return Promise.reject('Validation failed'); 
            }

            btnNuevo.innerText = "Guardando...";
            const data = {
                accion: 'insertar', cvPerson: cvPerson, login: loginGuardado, password: passwordGuardado,
                fecIni: document.getElementById("txtFecIni").value, fecFin: document.getElementById("txtFecFin").value,
                edoCta: document.getElementById("hidEdoCta").value
            };

            return fetch('../../api/usuariosApi.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
            }).then(r => r.json());
        })
        .then(res => {
            if (!res) return;
            btnNuevo.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> GUARDAR / REGISTRAR'; 
            btnNuevo.disabled = false;
            if (res.status === 'success') {
                alert("✅ " + res.mensaje + "\n\nLa cuenta fue creada. Por favor, asígnale sus privilegios de acceso ahora mismo.");
                cargarDatos(); idUsuarioActual = res.cvUser; modoActual = 'modificando'; abrirModalPrivilegios(loginGuardado);
            } else { alert("❌ Error: " + res.mensaje); }
        })
        .catch(err => {
            if (err !== 'Validation failed') {
                btnNuevo.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> GUARDAR / REGISTRAR'; 
                btnNuevo.disabled = false;
                alert("❌ Error de comunicación con el servidor.");
            }
        });
    }
}

function manejarBotonModificar() {
    if (idUsuarioActual === null) { alert("⚠️ Selecciona un usuario de la tabla para modificarlo."); return; }

    const btnModificar = document.getElementById("btnModificar");
    const btnNuevo = document.getElementById("btnNuevo");

    if (modoActual === 'seleccionado') {
        modoActual = 'modificando';
        btnModificar.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> EDITAR / ACTUALIZAR';
        btnNuevo.innerHTML = '<i class="fa-solid fa-file"></i> ＋ NUEVO';
        habilitarFormulario(true);
        document.getElementById("selCvPerson").disabled = true;
        document.getElementById("txtPassword").value = "";
        document.getElementById("txtPassword").placeholder = "(Dejar en blanco para conservar actual)";
    } else if (modoActual === 'modificando') {
        
        const erroresFront = validarReglasFront();
        const loginGuardado = document.getElementById("txtLogin").value.trim();
        const passwordGuardado = document.getElementById("txtPassword").value.trim();

        btnModificar.innerText = "Analizando datos..."; btnModificar.disabled = true;

        fetch('../../api/usuariosApi.php?accion=getUsuarios')
        .then(res => res.json())
        .then(dataUsuarios => {
            let erroresDB = [];
            if (dataUsuarios && dataUsuarios.status === 'success') {
                const usuarios = dataUsuarios.data;
                if (usuarios.some(u => u.Login === loginGuardado && u.CvUser != idUsuarioActual)) {
                    erroresDB.push("❌ BASE DE DATOS: El Login ingresado ya está en uso.");
                }
                if (passwordGuardado !== "" && usuarios.some(u => u.Password === passwordGuardado && u.CvUser != idUsuarioActual)) {
                    erroresDB.push("❌ BASE DE DATOS: El Password ingresado ya pertenece a otra cuenta.");
                }
            }

            const todosErrores = erroresFront.concat(erroresDB);
            if (todosErrores.length > 0) {
                alert("⚠️ EL SISTEMA DETECTÓ LOS SIGUIENTES ERRORES:\n\n" + todosErrores.join("\n\n"));
                
                btnModificar.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Modificar'; 
                btnModificar.disabled = false;

                // === LIMPIEZA AUTOMÁTICA COMPLETA ===
                document.getElementById("txtLogin").value = "";
                document.getElementById("txtPassword").value = "";
                
                const hoyLimpio = new Date();
                const fechaFinLimpio = new Date(hoyLimpio);
                fechaFinLimpio.setDate(hoyLimpio.getDate() + 30); 
                document.getElementById("txtFecIni").value = hoyLimpio.toISOString().split('T')[0];
                document.getElementById("txtFecFin").value = fechaFinLimpio.toISOString().split('T')[0];
                
                // Restauramos el Estado a Activo
                document.getElementById("btnEdoCta").innerText = "Activo";
                document.getElementById("btnEdoCta").className = "btn-estado activo";
                document.getElementById("hidEdoCta").value = "1";

                document.getElementById("txtLogin").focus();
                // ====================================

                return Promise.reject('Validation failed'); 
            }

            btnModificar.innerText = "Guardando...";
            const data = {
                accion: 'actualizar', cvUser: idUsuarioActual, login: loginGuardado, password: passwordGuardado,
                fecIni: document.getElementById("txtFecIni").value, fecFin: document.getElementById("txtFecFin").value,
                edoCta: document.getElementById("hidEdoCta").value
            };

            return fetch('../../api/usuariosApi.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
            }).then(r => r.json());
        })
        .then(res => {
            if (!res) return;
            btnModificar.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Modificar'; btnModificar.disabled = false;
            if (res.status === 'success') {
                alert("✅ " + res.mensaje); cargarDatos(); modoActual = 'inicio'; manejarBotonNuevo(); 
            } else { alert("❌ Error: " + res.mensaje); }
        })
        .catch(err => {
            if (err !== 'Validation failed') {
                btnModificar.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Modificar'; btnModificar.disabled = false;
                alert("❌ Error de comunicación con el servidor.");
            }
        });
    }
}

function manejarBotonBorrar() {
    if (idUsuarioActual === null) { alert("⚠️ Selecciona un usuario de la tabla para eliminarlo."); return; }
    const combo = document.getElementById("selCvPerson");
    const mensaje = `Seguro que quieres borrar el siguiente registro:\n - Persona: ${combo.options[combo.selectedIndex].text}\n - Login: ${document.getElementById("txtLogin").value}\n\nSE PERDERAN PERMANENTEMENTE.`;

    if (confirm(mensaje)) {
        fetch('../../api/usuariosApi.php', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accion: 'borrar', cvUser: idUsuarioActual })
        }).then(r => r.json()).then(res => {
            if (res.status === 'success') { alert("✅ " + res.mensaje); cargarDatos(); modoActual = 'inicio'; manejarBotonNuevo(); 
            } else { alert("❌ " + res.mensaje); }
        });
    } else { modoActual = 'inicio'; manejarBotonNuevo(); }
}

function cancelarOperacion() { modoActual = 'inicio'; manejarBotonNuevo(); }

function habilitarFormulario(estado) {
    document.getElementById("selCvPerson").disabled = !estado; document.getElementById("txtLogin").disabled = !estado;
    document.getElementById("txtPassword").disabled = !estado; document.querySelector(".btn-eye").disabled = !estado;
    document.getElementById("txtFecIni").disabled = !estado; document.getElementById("txtFecFin").disabled = !estado;
    document.getElementById("btnEdoCta").disabled = !estado;
}

function seleccionarDesdeTabla(id, cvPersonId, login, ini, fin, edo) {
    modoActual = 'seleccionado'; idUsuarioActual = id;
    setTimeout(() => { document.getElementById("selCvPerson").value = cvPersonId; }, 100);
    document.getElementById("txtLogin").value = login; document.getElementById("txtPassword").value = "********"; 
    document.getElementById("txtFecIni").value = ini; document.getElementById("txtFecFin").value = fin;

    const btnEdo = document.getElementById("btnEdoCta"); const hidEdo = document.getElementById("hidEdoCta");
    if(edo == 1 || edo === "Activo") { btnEdo.innerText = "Activo"; btnEdo.className = "btn-estado activo"; hidEdo.value = "1";
    } else { btnEdo.innerText = "Inactivo"; btnEdo.className = "btn-estado inactivo"; hidEdo.value = "0"; }

    document.getElementById("btnNuevo").innerHTML = '<i class="fa-solid fa-file"></i> ＋ NUEVO'; document.getElementById("btnNuevo").disabled = false;
    document.getElementById("btnModificar").innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Modificar';
    habilitarFormulario(false);
}

function ejecutarBorradoDesdeTabla(id, cvPersonId, login, ini, fin, edo) {
    seleccionarDesdeTabla(id, cvPersonId, login, ini, fin, edo); setTimeout(() => { manejarBotonBorrar(); }, 100);
}

function cargarDatos() {
    fetch('../../api/usuariosApi.php?accion=getPersonas').then(res => res.json()).then(dataPersonas => {
        if(dataPersonas.status === 'success') {
            const select = document.getElementById("selCvPerson"); const valorActual = select.value; 
            select.innerHTML = '<option value="">-- Seleccione una Persona --</option>';
            dataPersonas.data.forEach(p => { let option = document.createElement("option"); option.value = p.CvPerso; option.text = `${p.Nombre} ${p.ApePater} ${p.ApeMater}`; select.appendChild(option); });
            if (valorActual) select.value = valorActual;
        }
        return fetch('../../api/usuariosApi.php?accion=getUsuarios');
    }).then(res => res.json()).then(dataUsuarios => {
        if(dataUsuarios && dataUsuarios.status === 'success') {
            const tabla = document.getElementById("tablaUsuarios"); tabla.innerHTML = "";
            if(dataUsuarios.data.length === 0) { tabla.innerHTML = "<tr><td colspan='7' style='text-align:center;'>No usuarios.</td></tr>";
            } else {
                dataUsuarios.data.forEach(u => {
                    tabla.innerHTML += `<tr><td>${u.CvUser}</td><td>${`${u.Nombre || ''} ${u.ApePater || ''} ${u.ApeMater || ''}`.trim()}</td><td>${u.Login}</td><td>${u.FecIni}</td><td>${u.FecFin}</td><td style="color: ${u.EdoCta == 1 ? '#2e7d32' : '#777'};">${u.EdoCta == 1 ? "Activo" : "Inactivo"}</td>
                        <td><span onclick="seleccionarDesdeTabla(${u.CvUser}, ${u.CvPerso}, '${u.Login}', '${u.FecIni}', '${u.FecFin}', ${u.EdoCta})" style="cursor: pointer;">📝</span>
                        <span onclick="ejecutarBorradoDesdeTabla(${u.CvUser}, ${u.CvPerso}, '${u.Login}', '${u.FecIni}', '${u.FecFin}', ${u.EdoCta})" style="color:red; cursor: pointer; margin-left:10px;">🗑️</span></td></tr>`;
                });
                const select = document.getElementById("selCvPerson");
                dataUsuarios.data.forEach(u => {
                    if (u.CvPerso && u.CvPerso !== 0 && u.CvPerso !== 'null' && !Array.from(select.options).some(opt => opt.value == u.CvPerso)) {
                        let option = document.createElement("option"); option.value = u.CvPerso;
                        option.text = `${`${u.Nombre || ''} ${u.ApePater || ''} ${u.ApeMater || ''}`.trim()} (Ya tiene cuenta)`;
                        select.appendChild(option); 
                    }
                });
            }
        }
    });
}