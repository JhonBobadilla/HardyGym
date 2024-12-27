document.addEventListener('DOMContentLoaded', () => {
    const INCREMENT = 34; // Definimos el tamaño del incremento/decremento
    const token = localStorage.getItem('token'); // Obtener el token desde localStorage

    // Asegúrate de que el token no sea nulo antes de hacer solicitudes
    if (!token) {
        console.error('Token no encontrado en localStorage.');
        return;
    }

    function obtenerUserIdAutenticado() {
        return fetch('http://localhost:3000/getUserId', {
            headers: {
                'Authorization': 'Bearer ' + token // Incluir el token de autenticación
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Token no válido');
            }
            return response.json();
        })
        .then(data => data.userId)
        .catch(error => {
            console.error('Error al obtener el userId:', error);
            return null; // Manejo de error básico
        });
    }

    obtenerUserIdAutenticado().then(userId => {
        if (!userId) {
            console.error('No se pudo obtener el userId');
            return;
        }

        const videos = [
            'progress-bar-1', 'progress-bar-2', 'progress-bar-3', 'progress-bar-4',
            'progress-bar-5', 'progress-bar-6', 'progress-bar-7', 'progress-bar-8',
            'progress-bar-9', 'progress-bar-10', 'progress-bar-11', 'progress-bar-12',
            'progress-bar-13', 'progress-bar-14', 'progress-bar-15', 'progress-bar-16',
            'progress-bar-17', 'progress-bar-18', 'progress-bar-19', 'progress-bar-20',
        ];

        // Cargar el progreso de cada video al iniciar
        videos.forEach(videoId => {
            loadProgress(userId, videoId, videoId);
        });
    });

    // Función para aumentar el progreso
    window.advanceProgress = function(barId) {
        const progressBar = document.getElementById(barId);
        let progress = parseFloat(progressBar.style.width) || 0;
        if (progress < 100) {
            progress = Math.min(100, progress + INCREMENT);
            updateProgressBar(progressBar, progress);
            obtenerUserIdAutenticado().then(userId => {
                if (userId) saveProgress(userId, barId, progress);
            });
        }
    };

    // Función para disminuir el progreso
    window.decreaseProgress = function(barId) {
        const progressBar = document.getElementById(barId);
        let progress = parseFloat(progressBar.style.width) || 0;
        if (progress > 0) {
            progress = Math.max(0, progress - INCREMENT);
            updateProgressBar(progressBar, progress);
            obtenerUserIdAutenticado().then(userId => {
                if (userId) saveProgress(userId, barId, progress);
            });
        }
    };

    // Función para actualizar la barra de progreso
    function updateProgressBar(progressBar, value) {
        value = Math.round(value);
        if (value > 100) {
            value = 100;
        } else if (value < 0) {
            value = 0;
        }
        progressBar.style.width = `${value}%`;
        if (value <= 34) {
            progressBar.style.backgroundColor = '#ff0000';
        } else if (value <= 68) {
            progressBar.style.backgroundColor = '#f39c12';
        } else {
            progressBar.style.backgroundColor = '#7ed957';
        }
    }

    // Función para guardar el progreso en la base de datos
    function saveProgress(userId, videoId, progress) {
        fetch('http://localhost:3000/saveProgress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token // Incluir el token de autenticación
            },
            body: JSON.stringify({ userId, videoId, progress })
        })
        .then(response => {
            if (response.ok) {
                console.log('Progreso guardado exitosamente.');
            } else {
                console.error('Error al guardar el progreso.');
            }
        });
    }

    // Función para cargar el progreso desde la base de datos
    function loadProgress(userId, videoId, elementId) {
        fetch(`http://localhost:3000/getProgress/${userId}/${videoId}`, {
            headers: {
                'Authorization': 'Bearer ' + token // Incluir el token de autenticación
            }
        })
        .then(response => response.json())
        .then(data => {
            const progress = data.progress;
            const progressBar = document.getElementById(elementId);
            updateProgressBar(progressBar, progress);
        })
        .catch(error => {
            console.error('Error al obtener el progreso:', error);
        });
    }
});
