let temporizadorError;

// --- REGLA ESTRICTA DEL FORMATO ---
function validarReglasPassword(str) {
    if (str.length !== 16) return false;
    const regexPatron = /^[A-Z][a-z]{2}\d{2}[A-Za-z]{3}\d{2}[A-Za-z]{3}\d{2}/;
    if (!regexPatron.test(str)) return false;
    const regexEspecial = /[\+\*\$@%;]/;
    if (!regexEspecial.test(str)) return false;
    return true;
}

document.addEventListener("DOMContentLoaded", () => {
    // --- RECUPERAR Y MOSTRAR EL USUARIO ---
    const usuarioActual = localStorage.getItem("usuarioLogueado");
    if (!usuarioActual) {
        window.location.href = '../../index.html';
        return;
    }
    document.getElementById("lblUsuarioActivo").innerText = usuarioActual;
    // ----------------------------------------------

    const btnAceptar = document.getElementById("btnAceptar");
    const btnCancelar = document.getElementById("btnCancelar");
    
    const txtPassAnt = document.getElementById("txtPassAnt");
    const txtPassNvo = document.getElementById("txtPassNvo");
    const txtPassRep = document.getElementById("txtPassRep");

    const validarCamposLlenos = () => {
        if (txtPassAnt.value.trim() !== "" && txtPassNvo.value.trim() !== "" && txtPassRep.value.trim() !== "") {
            btnAceptar.disabled = false;
        } else {
            btnAceptar.disabled = true;
        }
    };

    txtPassAnt.addEventListener("input", validarCamposLlenos);
    txtPassNvo.addEventListener("input", validarCamposLlenos);
    txtPassRep.addEventListener("input", validarCamposLlenos);

    btnAceptar.addEventListener("click", () => {
        const passAnt = txtPassAnt.value.trim();
        const passNvo = txtPassNvo.value.trim();
        const passRep = txtPassRep.value.trim();

        btnAceptar.innerText = "Cargando...";
        btnAceptar.disabled = true;

        // 1. VALIDACIONES LOCALES (Ahora son acumulativas, no se bloquean entre sí)
        let errorAntLocal = "";
        if (!validarReglasPassword(passAnt)) {
            errorAntLocal = "Formato Incorrecto";
        }

        let errorNvoLocal = "";
        if (!validarReglasPassword(passNvo)) {
            errorNvoLocal = "Formato Incorrecto";
        }

        let errorRepLocalMatch = "";
        if (passNvo !== passRep) {
            errorRepLocalMatch = "Dato Inconsistente con el Pw Nvo"; 
        }
        
        let errorRepLocalFormato = "";
        if (!validarReglasPassword(passRep)) {
            errorRepLocalFormato = "Formato Incorrecto"; 
        }

        const data = {
            login: usuarioActual,
            passAnt: passAnt,
            passNvo: passNvo,
            passRep: passRep
        };

        fetch('../../api/cmbPassApi.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            btnAceptar.innerText = "Aceptar";
            btnAceptar.disabled = false;

            // 2. FUNCIÓN PARA UNIR ERRORES (Como en tu Excel: "Error 1 / Error 2")
            const combinarErrores = (err1, err2) => {
                if (err1 && err2) return err1 + " / " + err2;
                return err1 || err2 || "";
            };

            // 3. COMBINAMOS LO DEL SERVIDOR CON NUESTRO FORMATO
            const errAntFinal = combinarErrores(result.errAnt || "", errorAntLocal);
            const errNvoFinal = combinarErrores(result.errNvo || "", errorNvoLocal); 
            
            // Unimos los dos posibles errores de la repetición, y luego con lo del servidor
            const repLocalCombinado = combinarErrores(errorRepLocalMatch, errorRepLocalFormato);
            const errRepFinal = combinarErrores(result.errRep || "", repLocalCombinado);

            // Evaluamos si hubo algún error
            const hayErrores = errAntFinal !== "" || errNvoFinal !== "" || errRepFinal !== "" || result.status === 'error';

            if (!hayErrores) {
                mostrarMensaje('success', result.mensajeGeneral);
            } else {
                const msgGeneralFinal = result.mensajeGeneral || "Cambio de Password Inconcluso, póngase en contacto con el administrador o reinténtelo";
                mostrarMensaje('error', msgGeneralFinal, errAntFinal, errNvoFinal, errRepFinal);
            }
        })
        .catch(error => {
            btnAceptar.innerText = "Aceptar";
            btnAceptar.disabled = false;
            mostrarMensaje('error', "No se pudo conectar al servidor.", "", "", "");
        });
    });

    btnCancelar.addEventListener("click", () => {
        document.getElementById("formCmbPass").reset();
        btnAceptar.disabled = true;
        document.getElementById("cajaErrores").style.display = "none";
        clearTimeout(temporizadorError);
        txtPassAnt.focus();
    });
});

// FUNCIÓN PARA CAJA VERDE (ÉXITO) O ROJA (ERROR)
function mostrarMensaje(status, general, errAnt = "", errNvo = "", errRep = "") {
    const cajaErrores = document.getElementById("cajaErrores");
    const listaErrores = document.getElementById("listaErrores");

    if (status === 'success') {
        cajaErrores.style.backgroundColor = "#e8f5e9";
        cajaErrores.style.color = "#2e7d32";
        cajaErrores.style.border = "2px solid #2e7d32";
        listaErrores.style.display = "none";
    } else {
        cajaErrores.style.backgroundColor = "#ffebee";
        cajaErrores.style.color = "#c62828";
        cajaErrores.style.border = "2px solid #c62828";
        listaErrores.style.display = "block";
    }

    document.getElementById("msgGeneral").innerText = general;
    
    // REGLA DEL PROFE: Siempre mostrar las 3 líneas si hay error
    if (status === 'error') {
        document.getElementById("liPassAnt").style.display = "list-item";
        document.getElementById("liPassNvo").style.display = "list-item";
        document.getElementById("liPassRep").style.display = "list-item";
        
        document.getElementById("txtErrAnt").innerText = errAnt || "";
        document.getElementById("txtErrNvo").innerText = errNvo || "";
        document.getElementById("txtErrRep").innerText = errRep || "";
    }

    cajaErrores.style.display = "block";

    clearTimeout(temporizadorError);
    temporizadorError = setTimeout(() => {
        cajaErrores.style.display = "none";
        document.getElementById("txtPassAnt").value = "";
        document.getElementById("txtPassNvo").value = "";
        document.getElementById("txtPassRep").value = "";
        document.getElementById("btnAceptar").disabled = true;
        document.getElementById("txtPassAnt").focus();
        
        if (status === 'success') {
            localStorage.clear();
            window.location.href = '../../index.html';
        }
    }, 4000);
}