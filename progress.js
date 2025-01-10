document.addEventListener('DOMContentLoaded', () => {
    // Cargar progreso inicial desde el backend
    fetch('/get-progress', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar el progreso.');
            }
            return response.json();
        })
        .then(data => {
            // Iterar sobre los datos recibidos y actualizar las barras de progreso
            data.forEach(({ video_id, progress }) => {
                const progressBar = document.getElementById(`progress-bar-${video_id}`);
                if (progressBar) {
                    updateProgressBar(progressBar, progress);
                }
            });
        })
        .catch(console.error);
});

function updateProgressBar(progressBar, progress) {
    progressBar.style.width = `${progress}%`;

    // Cambiar el color según el progreso
    if (progress === 33) {
        progressBar.style.backgroundColor = 'red';
    } else if (progress === 66) {
        progressBar.style.backgroundColor = 'yellow';
    } else if (progress >= 99) {
        progressBar.style.backgroundColor = '#7ed957';
    }
}

function advanceProgress(videoId) {
    const progressBar = document.getElementById(`progress-bar-${videoId}`);
    let currentWidth = parseInt(progressBar.style.width) || 0;

    if (currentWidth < 100) {
        currentWidth += 33; // Incrementar progreso en 33%
        if (currentWidth > 100) currentWidth = 100; // Limitar al 100%
        updateProgressBar(progressBar, currentWidth);
        saveProgress(videoId, currentWidth);
    }
}

function decreaseProgress(videoId) {
    const progressBar = document.getElementById(`progress-bar-${videoId}`);
    let currentWidth = parseInt(progressBar.style.width) || 0;

    if (currentWidth > 0) {
        currentWidth -= 33; // Reducir progreso en 33%
        if (currentWidth < 0) currentWidth = 0; // No permitir menos de 0
        updateProgressBar(progressBar, currentWidth);
        saveProgress(videoId, currentWidth);
    }
}

function saveProgress(videoId, progress) {
    // Guardar progreso en el backend
    fetch('/save-progress', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ video_id: videoId, progress })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al guardar el progreso.');
            }
        })
        .catch(console.error);
}






