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

        console.log(`Avanzando progreso: barId=${barId}, currentProgress=${currentProgress}`);
        const userId = getCurrentUserId();
        const videoId = getVideoIdFromBarId(barId);
        updateProgress(userId, videoId, currentProgress);
    }
}

// Función para disminuir el progreso
function decreaseProgress(barId) {
    const progressBar = document.getElementById(barId);
    let currentProgress = parseInt(progressBar.style.width) || 0;
    if (currentProgress > 0) {
        currentProgress -= 33;
        if (currentProgress < 0) {
            currentProgress = 0;
        }
        progressBar.style.width = `${currentProgress}%`;
        progressBar.style.backgroundColor = currentProgress === 33 ? 'red' : currentProgress === 66 ? 'yellow' : 'white';

        console.log(`Retrocediendo progreso: barId=${barId}, currentProgress=${currentProgress}`);
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
    const userId = localStorage.getItem('userId');
    console.log('Obtenido userId del localStorage:', userId);
    return userId;
}

// Función para actualizar la barra de progreso en la base de datos
async function updateProgress(userId, videoId, progress) {
    try {
        console.log(`Enviando progreso: userId=${userId}, videoId=${videoId}, progress=${progress}`);
        const response = await fetch('/saveProgress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ user_id: userId, video_id: videoId, progress: progress })
        });
        console.log('Estado de la respuesta:', response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error en la respuesta del servidor:', errorText);
            throw new Error('Network response was not ok');
        }
        console.log('Progreso actualizado correctamente');
    } catch (error) {
        console.error('Error actualizando el progreso:', error);
    }
}

// Función para obtener el token del usuario actual
function getToken() {
    return localStorage.getItem('token'); // O la manera en que estés almacenando el token
}

