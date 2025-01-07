// Función para avanzar el progreso
function advanceProgress(barId) {
    const progressBar = document.getElementById(barId);
    let currentProgress = parseInt(progressBar.style.width) || 0;
    if (currentProgress < 100) {
        currentProgress += 33;
        if (currentProgress > 100) {
            currentProgress = 100;
        }
        progressBar.style.width = `${currentProgress}%`;
        progressBar.style.backgroundColor = currentProgress === 33 ? 'red' : currentProgress === 66 ? 'yellow' : 'green';

        // Actualizar el progreso en la base de datos
        const userId = getCurrentUserId();
        const videoId = getVideoIdFromBarId(barId);
        updateProgress(userId, videoId, currentProgress);
    }
}

// Función para obtener el ID del video a partir del ID de la barra
function getVideoIdFromBarId(barId) {
    return barId.split('-').pop();
}

// Función para obtener el ID del usuario actual
function getCurrentUserId() {
    // Implementa esta función para devolver el ID del usuario actual
    // Ejemplo: return user.id;
}

// Función para actualizar la barra de progreso en la base de datos
async function updateProgress(userId, videoId, progress) {
    try {
        const response = await fetch('/saveProgress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ user_id: userId, video_id: videoId, progress: progress })
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
    } catch (error) {
        console.error('Error actualizando el progreso:', error);
    }
}

// Función para obtener el token del usuario actual
function getToken() {
    // Implementa esta función para devolver el token de autenticación
    // Ejemplo: return localStorage.getItem('token');
}
