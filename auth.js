// auth.js

// Función para registrar un usuario como invitado
function registrarUsuarioInvitado() {
    const emailInvitado = 'invitado@ejemplo.com'; // Asigna un correo predeterminado para invitados
    localStorage.setItem('usuarioEmail', emailInvitado);
    document.getElementById('nombreUsuario').innerText = 'Usuario'; // Mostrar "Usuario" de manera consistente
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
            document.getElementById('nombreUsuario').innerText = data.nombre; // Mostrar nombre real del usuario
        } else {
            document.getElementById('nombreUsuario').innerText = 'Usuario'; // Nombre por defecto
        }

        console.log('Nombre de usuario cargado:', data.nombre || 'Usuario');
    } catch (error) {
        console.error('Error al obtener el nombre del usuario:', error);
        document.getElementById('nombreUsuario').innerText = 'Usuario'; // Fallback para errores
    }
}

// Función para obtener parámetros de la URL
function obtenerParametroURL(nombre) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(nombre);
}

// Al cargar la página (para sincronizar el estado del usuario en cada carga)
window.addEventListener('DOMContentLoaded', async () => {
    const token = obtenerParametroURL('token') || localStorage.getItem('token');

    console.log('Token detectado al cargar la página:', token); // Log para depurar

    if (token) {
        // Guardar el token en localStorage para mantenerlo persistente
        localStorage.setItem('token', token);

        try {
            // Verificar el usuario con el backend
            const response = await fetch('/getUserId', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Error en la validación del token');
            }

            const data = await response.json();
            document.getElementById('nombreUsuario').innerText = data.nombre || 'Usuario'; // Mostrar el nombre real o "Usuario"
            console.log('Usuario autenticado:', data.nombre);
        } catch (error) {
            console.error('Error al obtener el nombre del usuario:', error);
            document.getElementById('nombreUsuario').innerText = 'Usuario'; // En caso de error, mostrar "Usuario"
        }
    } else {
        // Si no hay token, mostrar "Usuario" de manera consistente
        document.getElementById('nombreUsuario').innerText = 'Usuario';
        console.log('Token no encontrado. Mostrando "Usuario".');
    }
});

// Función para redirigir con el token en la URL al cambiar de contexto
function redirigirConToken(urlDestino) {
    const token = localStorage.getItem('token');
    if (token) {
        // Pasar el token en la URL
        console.log('Redirigiendo con token:', token); // Log para depurar
        window.location.href = `${urlDestino}?token=${token}`;
    } else {
        // Redirigir como invitado
        console.log('Redirigiendo como invitado (sin token)');
        window.location.href = `${urlDestino}?invitado=true`;
    }
}

// Función para redirigir a una de las cinco páginas posibles
function redirigirAPagina(pagina) {
    const paginasValidas = {
        Pilates: "https://hardy-2839d6e03ba8.herokuapp.com/pages/Pilates.html",
        Funcional: "https://hardy-2839d6e03ba8.herokuapp.com/pages/Funcional.html",
        Rumba: "https://hardy-2839d6e03ba8.herokuapp.com/pages/Rumba.html",
        Combat: "https://hardy-2839d6e03ba8.herokuapp.com/pages/combat.html",
        Pausas_activas: "https://hardy-2839d6e03ba8.herokuapp.com/pages/Pausas_activas.html"
    };

    const urlDestino = paginasValidas[pagina];
    if (urlDestino) {
        redirigirConToken(urlDestino);
    } else {
        console.error('Página no válida:', pagina);
    }
}

// Función para guardar logs (opcional)
function logMessage(message) {
    let logs = JSON.parse(localStorage.getItem('logs')) || [];
    logs.push(`[${new Date().toISOString()}] ${message}`);
    localStorage.setItem('logs', JSON.stringify(logs));
    console.log(message);
}

logMessage('Script de autenticación finalizado');


