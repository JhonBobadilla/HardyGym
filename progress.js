// progress.js

function getProgressColor(progress) {
    if (progress <= 33) {
      return 'red';
    } else if (progress <= 66) {
      return 'yellow';
    } else {
      return 'green';
    }
  }
  
  function updateProgressBar(progressBar, progress) {
    progressBar.style.width = progress + '%';
    progressBar.style.backgroundColor = getProgressColor(progress);
  }
  
  function advanceProgress(barId) {
    const progressBar = document.getElementById(barId);
    let currentProgress = parseInt(progressBar.style.width) || 0;
    if (currentProgress < 100) {
      currentProgress += 33;
      updateProgressBar(progressBar, currentProgress);
      // Guardar el progreso en la base de datos
      saveProgressToDatabase(barId, currentProgress);
    }
  }
  
  function decreaseProgress(barId) {
    const progressBar = document.getElementById(barId);
    let currentProgress = parseInt(progressBar.style.width) || 0;
    if (currentProgress > 0) {
      currentProgress -= 33;
      updateProgressBar(progressBar, currentProgress);
      // Guardar el progreso en la base de datos
      saveProgressToDatabase(barId, currentProgress);
    }
  }
  
  function saveProgressToDatabase(barId, progress) {
    const userId = localStorage.getItem('userId');
    fetch('/save-progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ userId, barId, progress })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Progreso guardado:', data);
    })
    .catch(error => {
      console.error('Error al guardar el progreso:', error);
    });
  }
  
  function loadProgressFromDatabase(barId) {
    const userId = localStorage.getItem('userId');
    fetch(`/load-progress?userId=${userId}&barId=${barId}`, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    })
    .then(response => response.json())
    .then(data => {
      const progressBar = document.getElementById(barId);
      if (progressBar) {
        updateProgressBar(progressBar, data.progress);
      }
    })
    .catch(error => {
      console.error('Error al cargar el progreso:', error);
    });
  }
  
  // Llama a esta función cuando el usuario se loguee y se cargue la página de videos
  function initializeProgressBars() {
    const videoIds = ['progress-bar-39', 'progress-bar-40', 'progress-bar-41']; // Añade todos los IDs de las barras de progreso
    videoIds.forEach(loadProgressFromDatabase);
  }
  
  initializeProgressBars();
  


