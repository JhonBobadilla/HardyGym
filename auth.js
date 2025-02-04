// auth.js

// auth.js

console.log('Script de autenticación iniciado');

const token = localStorage.getItem('token');
const isFromPagoSuscripcion = document.referrer.includes('pago_suscripcion.html'); // Verifica si viene de la página de suscripción

console.log('Token:', token);
console.log('Viene de pago_suscripcion.html:', isFromPagoSuscripcion);

if (!token && !isFromPagoSuscripcion) {
    console.log('Redirigiendo a la página de inicio de sesión');
    window.location.href = '../public/index.html'; // Redirige a la página de inicio de sesión si no hay token y no viene de 'pago_suscripcion.html'
} else {
    if (token || isFromPagoSuscripcion) {
        // Si tiene token o viene de 'pago_suscripcion.html', continua con la validación
        console.log('Validación permitida');
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
                console.log('Usuario autenticado:', data.userId);
                document.getElementById('nombreUsuario').innerText = data.nombre; // Mostrar el nombre del usuario
            })
            .catch(error => {
                console.error('Error en la autenticación:', error);
                window.location.href = '../public/index.html'; // Redirige a la página de inicio de sesión en caso de error
            });
        } else {
            console.log('Acceso permitido desde pago_suscripcion.html');
            document.getElementById('nombreUsuario').innerText = 'Invitado'; // Opción de usuario no autenticado, puede mostrar algo diferente
        }
    }
}

// Lógica para cerrar sesión
document.getElementById('logoutButton').addEventListener('click', function(event) {
    event.preventDefault(); // Prevenir el comportamiento por defecto del enlace
    localStorage.removeItem('token'); // Elimina el token del almacenamiento local
    window.location.href = '../public/index.html'; // Redirige a la página de inicio de sesión
});

console.log('Script de autenticación finalizado');

