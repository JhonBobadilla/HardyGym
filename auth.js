// auth.js

// LOGICA DE COMPRAS USUARIOS NO DONANTES

// Función para registrar un usuario como invitado
function registrarUsuarioInvitado() {
    const emailInvitado = 'invitado@ejemplo.com'; // Asigna un correo electrónico predeterminado para invitados
    localStorage.setItem('usuarioEmail', emailInvitado);
    console.log('Correo electrónico de invitado guardado en localStorage:', emailInvitado);
}

// Verificar si el usuario es un invitado o autenticado al cargar la aplicación
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token'); // Supongamos que tenemos un token para identificar al usuario
    if (token) {
        fetch('/getUserEmail', { // Ajusta esta ruta según tu servidor
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.email) {
                localStorage.setItem('usuarioEmail', data.email);
                console.log('Correo electrónico del usuario autenticado guardado en localStorage:', data.email);
            } else {
                registrarUsuarioInvitado();
            }
        })
        .catch(error => {
            console.error('Error al recuperar el correo electrónico del usuario:', error);
            registrarUsuarioInvitado();
        });
    } else {
        registrarUsuarioInvitado();
    }
});



// HASTA ACÁ 



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

if (!token && !fromPagoSuscripcion) {
    logMessage('Redirigiendo a la página de inicio de sesión');
    window.location.href = '../public/index.html'; // Redirige a la página de inicio de sesión si no hay token y no viene de 'pago_suscripcion.html'
} else {
    if (token || fromPagoSuscripcion) {
        // Si tiene token o viene de 'pago_suscripcion.html', continua con la validación
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
                document.getElementById('nombreUsuario').innerText = data.nombre; // Mostrar el nombre del usuario
            })
            .catch(error => {
                logMessage('Error en la autenticación: ' + error);
                window.location.href = '../public/index.html'; // Redirige a la página de inicio de sesión en caso de error
            });
        } else {
            logMessage('Acceso permitido desde pago_suscripcion.html');
            document.getElementById('nombreUsuario').innerText = 'Usuario'; // Opción de usuario no autenticado, puede mostrar algo diferente
        }
    }
}

// Lógica para cerrar sesión
document.getElementById('logoutButton').addEventListener('click', function(event) {
    event.preventDefault(); // Prevenir el comportamiento por defecto del enlace
    localStorage.removeItem('token'); // Elimina el token del almacenamiento local
    localStorage.removeItem('fromPagoSuscripcion'); // Elimina el indicador de acceso desde pago_suscripcion.html
    window.location.href = '../public/index.html'; // Redirige a la página de inicio de sesión
});

logMessage('Script de autenticación finalizado');



