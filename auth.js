// Función para establecer cookies
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; domain=.hardygym.com"; // Asegúrate de usar tu dominio
}

// Función para obtener cookies
function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Función para registrar un usuario como invitado
function registrarUsuarioInvitado() {
    const emailInvitado = 'invitado@ejemplo.com';
    setCookie('usuarioEmail', emailInvitado, 7); // Guardamos la cookie por 7 días
    console.log('Correo electrónico de invitado guardado en cookies:', emailInvitado);
}

// Al cargar la aplicación, verificar si hay un usuario autenticado o se debe registrar como invitado
window.addEventListener('DOMContentLoaded', () => {
    if (!getCookie('usuarioEmail')) {
        registrarUsuarioInvitado();
    }
});

logMessage('Script de autenticación iniciado');

const token = getCookie('token'); // Recuperar el token de la cookie
const isFromPagoSuscripcion = document.referrer.includes('pago_suscripcion.html');

if (isFromPagoSuscripcion) {
    setCookie('fromPagoSuscripcion', 'true', 1); // Guardar el estado en una cookie
}

const fromPagoSuscripcion = getCookie('fromPagoSuscripcion') === 'true';

logMessage('Token: ' + token);
logMessage('Viene de pago_suscripcion.html: ' + isFromPagoSuscripcion);
logMessage('Desde pago_suscripcion almacenado: ' + fromPagoSuscripcion);

// Lógica para manejar el nombre de usuario
if (token || fromPagoSuscripcion) {
    logMessage('Validación permitida');

    if (token) {
        fetch('/getUserId', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('No autorizado');
            }
            return response.json();
        })
        .then(data => {
            logMessage('Usuario autenticado: ' + data.userId);
            if (data && data.nombre) {
                setCookie('usuarioNombre', data.nombre, 7); // Guardamos el nombre en cookies
                document.getElementById('nombreUsuario').innerText = data.nombre;
            } else {
                document.getElementById('nombreUsuario').innerText = 'Usuario';
            }
        })
        .catch(error => {
            logMessage('Error en la autenticación: ' + error);
            document.getElementById('nombreUsuario').innerText = 'Usuario';
        });
    } else {
        logMessage('Acceso permitido desde pago_suscripcion.html');
        document.getElementById('nombreUsuario').innerText = 'Usuario';
    }
} else {
    logMessage('Acceso como invitado');
    document.getElementById('nombreUsuario').innerText = 'Invitado';
}

logMessage('Script de autenticación finalizado');
