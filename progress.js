document.addEventListener('DOMContentLoaded', () => {
    // Cargar progreso inicial
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
    progressBar.style.width = `${progress}%`;

    if (progress === 33) {
        progressBar.style.backgroundColor = 'red';
    } else if (progress === 66) {
        progressBar.style.backgroundColor = 'yellow';
    } else if (progress === 99) {
        progressBar.style.backgroundColor = '#7ed957';
    } else if (progress === 100) {
        progressBar.style.backgroundColor = '#7ed957';
    }
}

function advanceProgress(videoId) {
    const progressBar = document.getElementById(videoId);
    let currentWidth = parseInt(progressBar.style.width) || 0;

    if (currentWidth === 0) {
        currentWidth = 33;  // Primer clic, color rojo
        updateProgressBar(progressBar, currentWidth);
        saveProgress(videoId, currentWidth);
    } else if (currentWidth === 33) {
        currentWidth = 66;  // Segundo clic, color amarillo
        updateProgressBar(progressBar, currentWidth);
        saveProgress(videoId, currentWidth);
    } else if (currentWidth === 66) {
        currentWidth = 99;  // Tercer clic, color verde al 99%
        updateProgressBar(progressBar, currentWidth);
        saveProgress(videoId, currentWidth);
    } else if (currentWidth === 99) {
        currentWidth = 100;  // Cuarto clic, mantén verde al 100%
        updateProgressBar(progressBar, currentWidth);
        saveProgress(videoId, currentWidth);
    }
}

function decreaseProgress(videoId) {
    const progressBar = document.getElementById(videoId);
    let currentWidth = parseInt(progressBar.style.width) || 0;

    if (currentWidth > 0) {
        currentWidth -= 33;
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
    })
        .catch(console.error);
}




