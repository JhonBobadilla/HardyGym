// auth.js.................funciona perfecto en la web

// Función para registrar un usuario como invitado
function registrarUsuarioInvitado() {
    const emailInvitado = 'invitado@ejemplo.com'; // Asigna un correo electrónico predeterminado para invitados
    localStorage.setItem('usuarioEmail', emailInvitado);
    console.log('Correo electrónico de invitado guardado en localStorage:', emailInvitado);
}

// Verificar si el usuario es un invitado o autenticado al cargar la aplicación
window.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('usuarioEmail')) {
        registrarUsuarioInvitado();
    }
});

function logMessage(message) {
    let logs = JSON.parse(localStorage.getItem('logs')) || [];
    logs.push(message);
    localStorage.setItem('logs', JSON.stringify(logs));
    console.log(message);
}

logMessage('Script de autenticación iniciado');

const token = localStorage.getItem('token');
const isFromPagoSuscripcion = document.referrer.includes('pago_suscripcion.html'); // Verifica si viene de la página de suscripción

// Guardar el estado de acceso desde pago_suscripcion.html en localStorage
if (isFromPagoSuscripcion) {
    localStorage.setItem('fromPagoSuscripcion', 'true');
}

const fromPagoSuscripcion = localStorage.getItem('fromPagoSuscripcion') === 'true';

logMessage('Token: ' + token);
logMessage('Viene de pago_suscripcion.html: ' + isFromPagoSuscripcion);
logMessage('Desde pago_suscripcion almacenado: ' + fromPagoSuscripcion);

// Lógica para manejar el nombre de usuario
if (token || fromPagoSuscripcion) {
    logMessage('Validación permitida');

    if (token) {
        // Verifica si el token es válido y obtiene el nombre del usuario
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
            // Verifica si la respuesta contiene el nombre real y lo muestra
            if (data && data.nombre) {
                document.getElementById('nombreUsuario').innerText = data.nombre; // Nombre real del usuario
            } else {
                document.getElementById('nombreUsuario').innerText = 'Usuario'; // Si no hay nombre, muestra "Usuario"
            }
        })
        .catch(error => {
            logMessage('Error en la autenticación: ' + error);
            // En caso de error, mostramos un mensaje o el nombre "Usuario"
            document.getElementById('nombreUsuario').innerText = 'Usuario'; // Nombre por defecto
        });
    } else {
        logMessage('Acceso permitido desde pago_suscripcion.html');
        // Si no hay token pero viene de la página de suscripción, mostramos "Usuario"
        document.getElementById('nombreUsuario').innerText = 'Usuario';
    }
} else {
    // Si no hay token y no viene de la página de suscripción, mostramos "Invitado"
    logMessage('Acceso como invitado');
    document.getElementById('nombreUsuario').innerText = 'Invitado';
}

logMessage('Script de autenticación finalizado');



