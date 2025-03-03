// auth.js

// Función para registrar un usuario como invitado
function registrarUsuarioInvitado() {
    const emailInvitado = 'invitado@ejemplo.com'; // Asigna un correo predeterminado para invitados
    localStorage.setItem('usuarioEmail', emailInvitado);
    document.getElementById('nombreUsuario').innerText = 'Invitado';
    console.log('Usuario registrado como invitado');
}

// Función para obtener y mostrar el nombre del usuario autenticado
async function obtenerNombreUsuario(token) {
    try {
        const response = await fetch('/getUserId', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('No autorizado');
        }

        const data = await response.json();
        if (data && data.nombre) {
            document.getElementById('nombreUsuario').innerText = data.nombre; // Mostrar nombre real
        } else {
            document.getElementById('nombreUsuario').innerText = 'Usuario'; // Nombre por defecto
        }

        console.log('Nombre de usuario cargado:', data.nombre || 'Usuario');
    } catch (error) {
        console.error('Error al obtener el nombre del usuario:', error);
        document.getElementById('nombreUsuario').innerText = 'Usuario'; // Fallback
    }
}

// Evento al cargar la aplicación
window.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const isFromPagoSuscripcion = document.referrer.includes('pago_suscripcion.html');

    // Guardar el estado de acceso desde pago_suscripcion.html
    if (isFromPagoSuscripcion) {
        localStorage.setItem('fromPagoSuscripcion', 'true');
    }

    const fromPagoSuscripcion = localStorage.getItem('fromPagoSuscripcion') === 'true';

    console.log('Token:', token);
    console.log('Viene de pago_suscripcion.html:', isFromPagoSuscripcion);

    if (token) {
        // Usuario autenticado con token
        console.log('Validación de usuario autenticado...');
        await obtenerNombreUsuario(token);
    } else if (fromPagoSuscripcion) {
        // Acceso desde página de suscripción, pero sin token
        console.log('Acceso permitido desde pago_suscripcion.html');
        document.getElementById('nombreUsuario').innerText = 'Usuario';
    } else {
        // Usuario invitado
        console.log('Acceso como invitado');
        registrarUsuarioInvitado();
    }
});

// Función para guardar logs (opcional)
function logMessage(message) {
    let logs = JSON.parse(localStorage.getItem('logs')) || [];
    logs.push(`[${new Date().toISOString()}] ${message}`);
    localStorage.setItem('logs', JSON.stringify(logs));
    console.log(message);
}

logMessage('Script de autenticación finalizado');



