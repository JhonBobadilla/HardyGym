// Lógica para cerrar sesión
document.getElementById('logoutButton').addEventListener('click', function(event) {
    event.preventDefault(); // Prevenir el comportamiento por defecto del enlace
    localStorage.removeItem('token'); // Elimina el token del almacenamiento local
    localStorage.removeItem('fromPagoSuscripcion'); // Elimina el indicador de acceso desde pago_suscripcion.html
    window.location.href = '../public/index.html'; // Redirige a la página de inicio de sesión
});

logMessage('Script de autenticación finalizado');
