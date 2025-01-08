document.addEventListener('DOMContentLoaded', () => {
    // Cargar progreso inicial desde el servidor
    fetch('/get-progress', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
        .then(response => response.json())
        .then(data => {
            data.forEach(({ video_id, progress }) => {
                const progressBar = document.getElementById(video_id);
                if (progressBar) {
                    updateProgressBar(progressBar, progress);
                }
            });
        })
        .catch(console.error);
});

function updateProgressBar(progressBar, progress) {
    // Ajustar ancho de la barra
    progressBar.style.width = `${progress}%`;

    // Cambiar el color de la barra según el progreso
    if (progress === 0) {
        progressBar.style.backgroundColor = 'white'; // Vacío
    } else if (progress === 33) {
        progressBar.style.backgroundColor = 'red'; // 33%
    } else if (progress === 66) {
        progressBar.style.backgroundColor = 'yellow'; // 66%
    } else if (progress === 100) {
        progressBar.style.backgroundColor = '#7ed957'; // Verde 100%
    }
}

function advanceProgress(videoId) {
    const progressBar = document.getElementById(videoId);
    let currentWidth = parseInt(progressBar.style.width) || 0;

    // Incrementar el progreso, máximo hasta 100%
    if (currentWidth < 100) {
        currentWidth += 33;
        if (currentWidth > 100) currentWidth = 100; // Limitar a 100%
        updateProgressBar(progressBar, currentWidth);
        saveProgress(videoId, currentWidth);
    }
}

function decreaseProgress(videoId) {
    const progressBar = document.getElementById(videoId);
    let currentWidth = parseInt(progressBar.style.width) || 0;

    // Decrementar el progreso, mínimo hasta 0%
    if (currentWidth > 0) {
        currentWidth -= 33;
        if (currentWidth < 0) currentWidth = 0; // Limitar a 0%
        updateProgressBar(progressBar, currentWidth);
        saveProgress(videoId, currentWidth);
    }
}

function saveProgress(videoId, progress) {
    fetch('/save-progress', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ video_id: videoId, progress })
    }).catch(console.error);
}

  


