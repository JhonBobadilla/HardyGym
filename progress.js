// Cargar progreso inicial
document.addEventListener('DOMContentLoaded', () => {
    fetch('/get-progress', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar el progreso');
            }
            return response.json();
        })
        .then(data => {
            data.forEach(({ video_id, progress }) => {
                const progressBar = document.getElementById(video_id);
                if (progressBar) {
                    updateProgressBar(progressBar, progress);
                }
            });
        })
        .catch(error => {
            console.error('Error al cargar el progreso:', error);
        });
});

function updateProgressBar(progressBar, progress) {
    progressBar.style.width = `${progress}%`;

    if (progress === 33) {
        progressBar.style.backgroundColor = 'red';
    } else if (progress === 66) {
        progressBar.style.backgroundColor = 'yellow';
    } else if (progress >= 99) {
        progressBar.style.backgroundColor = '#7ed957';
    }
}





