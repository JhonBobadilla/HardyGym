document.addEventListener('DOMContentLoaded', () => {
    const INCREMENT = 34; // Definimos el tamaño del incremento/decremento
    const token = localStorage.getItem('token'); // Obtener el token desde localStorage

    if (!token) {
        console.error('Token no encontrado en localStorage.');
        return;
    }

    const BASE_URL = 'https://hardy-2839d6e03ba8.herokuapp.com'; // Cambia esto por tu URL de Heroku

    function obtenerUserIdAutenticado() {
        return fetch(`${BASE_URL}/getUserId`, {
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
            return null;
        });
    }

    obtenerUserIdAutenticado().then(userId => {
        if (!userId) {
            console.error('No se pudo obtener el userId');
            return;
        }

        const videos = [
            'progress-bar-1', 'progress-bar-2', 'progress-bar-3', 'progress-bar-4', 'progress-bar-5', 'progress-bar-6', 'progress-bar-7', 'progress-bar-8', 'progress-bar-9', 'progress-bar-10', 'progress-bar-11', 'progress-bar-12',
            'progress-bar-13', 'progress-bar-14', 'progress-bar-15', 'progress-bar-16', 'progress-bar-17', 'progress-bar-18', 'progress-bar-19', 'progress-bar-20',
            'progress-bar-21', 'progress-bar-22', 'progress-bar-23', 'progress-bar-24', 'progress-bar-25', 'progress-bar-26', 'progress-bar-27', 'progress-bar-28', 'progress-bar-29', 'progress-bar-30', 'progress-bar-31', 'progress-bar-32',
            'progress-bar-33', 'progress-bar-34', 'progress-bar-35', 'progress-bar-36', 'progress-bar-37', 'progress-bar-38', 'progress-bar-39', 'progress-bar-40',
            'progress-bar-41', 'progress-bar-42', 'progress-bar-43', 'progress-bar-44', 'progress-bar-45', 'progress-bar-46', 'progress-bar-47', 'progress-bar-48', 'progress-bar-49', 'progress-bar-50', 'progress-bar-51', 'progress-bar-52',
            'progress-bar-53', 'progress-bar-54', 'progress-bar-55', 'progress-bar-56', 'progress-bar-57', 'progress-bar-58', 'progress-bar-59', 'progress-bar-60',
            'progress-bar-61', 'progress-bar-62', 'progress-bar-63', 'progress-bar-64', 'progress-bar-65', 'progress-bar-66', 'progress-bar-67', 'progress-bar-68', 'progress-bar-69', 'progress-bar-70', 'progress-bar-71', 'progress-bar-72',
            'progress-bar-73', 'progress-bar-74', 'progress-bar-75', 'progress-bar-76', 'progress-bar-77', 'progress-bar-78', 'progress-bar-79', 'progress-bar-80',
            'progress-bar-81', 'progress-bar-82', 'progress-bar-83', 'progress-bar-84', 'progress-bar-85', 'progress-bar-86', 'progress-bar-87', 'progress-bar-88', 'progress-bar-89', 'progress-bar-90', 'progress-bar-91', 'progress-bar-92',
            'progress-bar-93', 'progress-bar-94', 'progress-bar-95', 'progress-bar-96', 'progress-bar-97', 'progress-bar-98', 'progress-bar-99', 'progress-bar-100'
        ];

        // Cargar el progreso de cada video al iniciar
        videos.forEach(videoId => {
            loadProgress(userId, videoId, videoId);
        });
    });

    // Función para aumentar el progreso
    window.advanceProgress = function(barId) {
        const progressBar = document.getElementById(barId);
        if (!progressBar) {
            console.error(`Elemento progressBar con ID ${barId} no encontrado`);
            return;
        }
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
        if (!progressBar) {
            console.error(`Elemento progressBar con ID ${barId} no encontrado`);
            return;
        }
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
        if (!progressBar) {
            console.error('Elemento progressBar no encontrado');
            return;
        }

        value = Math.round(value);
        progressBar.style.width = `${value}%`;

        console.log(`Actualizando progressBar a ${value}%`);

        // Establecer el color correcto según el valor de progreso
        if (value === 0) {
            progressBar.style.backgroundColor = 'white';
        } else if (value <= 33) {
            progressBar.style.backgroundColor = '#ff0000';
        } else if (value <= 66) {
            progressBar.style.backgroundColor = '#f39c12';
        } else {
            progressBar.style.backgroundColor = '#7ed957';
        }
    }

    // Función para guardar el progreso en la base de datos
    function saveProgress(userId, videoId, progress) {
        console.log('Intentando guardar progreso:', { userId, videoId, progress });

        fetch(`${BASE_URL}/saveProgress`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ userId, videoId, progress })
        })
        .then(response => {
            if (response.ok) {
                console.log('Progreso guardado exitosamente.');
            } else {
                console.error('Error al guardar el progreso. Respuesta del servidor:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Error en la solicitud fetch:', error);
        });
    }

    // Función para cargar el progreso desde la base de datos
    function loadProgress(userId, videoId, elementId) {
        console.log(`Cargando progreso para ${videoId} en elemento ${elementId}`);

        fetch(`${BASE_URL}/getProgress/${userId}/${videoId}`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => response.json())
        .then(data => {
            const progress = data.progress;
            console.log(`Progreso cargado: ${progress}`);
            const progressBar = document.getElementById(elementId);
            if (progressBar) {
                console.log(`Actualizando progressBar con ID ${elementId} a ${progress}%`);
                updateProgressBar(progressBar, progress);
            } else {
                console.error(`Elemento progressBar con ID ${elementId} no encontrado`);
            }
        })
        .catch(error => {
            console.error('Error al obtener el progreso:', error);
        });
    }
});


