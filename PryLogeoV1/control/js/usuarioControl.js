// Variable global para controlar que la alerta desaparezca solita
let temporizadorError;

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. LIMPIEZA TOTAL: Si llegamos al login, matamos cualquier sesión vieja por seguridad
    localStorage.clear();

    // 2. TRAMPA ANTI-AUTOCOMPLETADO
    setTimeout(() => {
        const inputLog = document.getElementById("txtLogin");
        const inputPass = document.getElementById("txtPassword");
        
        if (inputLog) {
            inputLog.value = "";
            inputLog.focus(); 
        }
        if (inputPass) {
            inputPass.value = "";
        }
    }, 50);

    const btnAceptar = document.getElementById("btnAceptar");
    const btnCancelar = document.getElementById("btnCancelar");

    if (btnAceptar) {
        btnAceptar.addEventListener("click", validarLogin);
    }

    if (btnCancelar) {
        btnCancelar.addEventListener("click", () => {
            document.getElementById("txtLogin").value = "";
            document.getElementById("txtPassword").value = "";
            document.getElementById("txtLogin").focus();
            document.getElementById("cajaErrores").style.display = "none";
            clearTimeout(temporizadorError);
        });
    }

    // 3. LA SOLUCIÓN: Si el usuario empieza a escribir, detenemos el borrado automático 
    // y escondemos el cuadro de error para no interrumpirlo.
    document.getElementById("txtLogin").addEventListener("input", ocultarErrorAlEscribir);
    document.getElementById("txtPassword").addEventListener("input", ocultarErrorAlEscribir);
});

function ocultarErrorAlEscribir() {
    document.getElementById("cajaErrores").style.display = "none";
    clearTimeout(temporizadorError);
}

function validarLogin() {
    ocultarErrorAlEscribir(); // Detener cualquier temporizador pendiente por si acaso

    const inputLogin = document.getElementById("txtLogin");
    const inputPassword = document.getElementById("txtPassword");

    const login = inputLogin.value.trim();
    const password = inputPassword.value.trim();

    if (login === "" || password === "") {
        mostrarError(
            "Login o Password incorrecto", 
            login === "" ? "No existe o formato incorrecto" : "", 
            password === "" ? "No existe o formato incorrecto" : ""
        );
        return;
    }

    const btnAceptar = document.getElementById("btnAceptar");
    btnAceptar.innerText = "Cargando...";
    btnAceptar.disabled = true;

    const data = {
        login: login,
        password: password
    };

    fetch('api/usuarioApi.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        btnAceptar.innerText = "Aceptar";
        btnAceptar.disabled = false;

        if (result.status === "success") {
            // 1. Guardamos el Login
            localStorage.setItem("usuarioLogueado", result.usuario);
            
            // 2. MAGIA: Traducimos el Login al Nombre Real
            // Actualizamos el diccionario con tus usuarios reales de la base de datos
            const nombresPDF = {
                "Pro18Mot04+": "Yaraví Concepción Dionisio",
                "Pro20Mot04+": "Mauricio José De Jesús (Ayudante)",
                "Probando1*": "Guadalupe Llamas Alfonzo (Cliente)",
                "Man20Dar05*": "Mauricio José De Jesús Del Niño Jesús",
                "Man21Dar05*": "Brayan de Jesus Del Rosario Del Carmen",
                "Man22Dar05*": "Trinidad Camargo Salas"
            };
            
            // Prioridad: 1. Lo que mande la BD (si existe), 2. Nuestro diccionario, 3. El Login puro
            const nombreReal = result.nombreReal || nombresPDF[result.usuario] || result.usuario;
            localStorage.setItem("nombreRealUsuario", nombreReal);

            // 3. Guardamos permisos y entramos
            localStorage.setItem("permisosUsuario", JSON.stringify(result.permisos));
            window.location.href = "vista/html/mainMenVista.html"; 
        } else {
            // MODIFICACIÓN AQUÍ: Ya no borramos la contraseña de inmediato, 
            // se lo dejamos al temporizador de la función mostrarError.
            mostrarError(result.mensajeGeneral, result.errorLogin, result.errorPassword);
        }
    })
    .catch(error => {
        mostrarError("Error del Servidor", "No se pudo conectar a la API", "");
        btnAceptar.innerText = "Aceptar";
        btnAceptar.disabled = false;
    });
}

// FUNCIÓN PARA MOSTRAR ERROR EXACTAMENTE COMO EL EXCEL
function mostrarError(general, errLogin, errPassword) {
    const cajaErrores = document.getElementById("cajaErrores");
    
    general = general || "Error de conexión";
    errLogin = errLogin || "";
    errPassword = errPassword || "";

    document.getElementById("msgGeneral").innerText = general;
    document.getElementById("txtErrLogin").innerText = errLogin;
    document.getElementById("txtErrPassword").innerText = errPassword;

    // Solo mostramos las líneas de error que realmente tienen texto
    document.getElementById("msgLogin").style.display = errLogin ? "list-item" : "none";
    document.getElementById("msgPassword").style.display = errPassword ? "list-item" : "none";

    cajaErrores.style.display = "block";

    clearTimeout(temporizadorError);
    
    // MODIFICACIÓN AQUÍ: El temporizador ahora oculta el error y limpia ambas cajas al mismo tiempo
    temporizadorError = setTimeout(() => {
        cajaErrores.style.display = "none";
        document.getElementById("txtLogin").value = "";
        document.getElementById("txtPassword").value = "";
        document.getElementById("txtLogin").focus(); // Regresa el cursor a la caja de Login
    }, 4000); 
}