// Función para pedir los catálogos a la base de datos vía API
function cargarCatalogos() {
    fetch('../../api/personaApi.php?accion=getCatalogos')
        .then(response => response.json())
        .then(data => {
            if(data.status === 'success') {
                llenarSelect('selTpPerson', data.tpPerson, 'CvTpPerson', 'DsTpPerson');
                llenarSelect('selGenero', data.genero, 'CvGenero', 'DsGenero');
                llenarSelect('selGdoAca', data.gdoAca, 'CvGdoAca', 'DsGdoAca');
                llenarSelect('selPuesto', data.puesto, 'CvPuesto', 'DsPuesto');
                llenarSelect('selDepto', data.depto, 'CvDepto', 'DsDepto');
                llenarSelect('selAficion', data.aficion, 'CvAficion', 'DsAficion');
                
                // NUEVOS: Llenamos los combos de nombres y apellidos
                llenarSelect('selNombre', data.nombres, 'CvNombre', 'DsNombre');
                llenarSelect('selApePat', data.apellidos, 'CvApellido', 'DsApellido');
                llenarSelect('selApelMat', data.apellidos, 'CvApellido', 'DsApellido');
            } else {
                console.error("Error al cargar catálogos:", data.mensaje);
            }
        })
        .catch(error => console.error('Error de conexión:', error));
}

// Función para recolectar y enviar datos a PHP
function guardarPersona() {
    const data = {
        curp: document.getElementById('txtCurp').value,
        rfc: document.getElementById('txtRfc').value,
        tpPerson: document.getElementById('selTpPerson').value,
        
        // NUEVOS: Recolectamos las llaves de los nombres
        nombre: document.getElementById('selNombre').value,
        apePat: document.getElementById('selApePat').value,
        apelMat: document.getElementById('selApelMat').value,

        genero: document.getElementById('selGenero').value,
        fecNac: document.getElementById('txtFecNac').value,
        edad: document.getElementById('txtEdad').value,
        gdoAca: document.getElementById('selGdoAca').value,
        puesto: document.getElementById('selPuesto').value,
        depto: document.getElementById('selDepto').value,
        email: document.getElementById('txtEmail').value,
        telefono: document.getElementById('txtTel').value,
        aficion: document.getElementById('selAficion').value,
        notas: document.getElementById('txtNotas').value
    };

    if(data.curp === "" || data.tpPerson === "") {
        alert("La CURP y el Tipo de Persona son obligatorios.");
        return;
    }

    fetch('../../api/personaApi.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if(result.status === 'success') {
            alert("¡Éxito! " + result.mensaje);
            document.getElementById("formPersona").reset(); 
        } else {
            alert("Error: " + result.mensaje);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Hubo un problema al conectar con el servidor.");
    });
}