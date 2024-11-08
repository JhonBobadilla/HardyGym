function sus(s)
{

let intentos = 0;
let max_intentos = 3;
    
do { edad = parseInt(prompt("ingresa tu edad"));
    intentos++;
    
    if(edad != edad){
    alert ("Debes ingresar un valor")
    console.log("intentos = " + intentos);
    
    }
    if (edad < 18) {

        alert ("Debes tener más de 18 años");
        window.location.href = "../pages/contactenos.html";
        
    }

    if (edad >= 18) {

   alert ("Puedes inscribirte")
   window.location.href = "../pages/terminos_y_condiciones.html";
   break;
    }
     
    if(intentos >= max_intentos){
        alert("Hiciste tres intentos, contactate con nosotros")
        window.location.href = "../pages/contactenos.html";
    break;   
    }
 }
 
   
while(edad != edad)
}     
    

function acceptTerms() {

    alert("Aceptaste los terminos y condiciones");
    
    window.location.href = "register.html";
  }//ojo corregir esta ruta cuando todos los archivos esten juntos.

  function rejectTerms() {
    alert("No aceptaste los terminos y condiciones te redirigiremos al home");
    window.location.href = '../public/index.html';
  }

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  document.addEventListener('DOMContentLoaded', () => {
    const INCREMENT = 34; // Definimos el tamaño del incremento/decremento

    fetch('http://localhost:3000/getUserId')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Usuario no autenticado');
            }
        })
        .then(data => {
            const userId = data.userId;
            const videos = [
                'progress-bar-1', 'progress-bar-2', 'progress-bar-3', 'progress-bar-4',
                'progress-bar-5', 'progress-bar-6', 'progress-bar-7', 'progress-bar-8',
                'progress-bar-9', 'progress-bar-10', 'progress-bar-11', 'progress-bar-12',
                'progress-bar-13', 'progress-bar-14', 'progress-bar-15', 'progress-bar-16',
                'progress-bar-17', 'progress-bar-18', 'progress-bar-19', 'progress-bar-20'
            ];

            videos.forEach(videoId => {
                loadProgress(userId, videoId, videoId);
            });

            function saveProgress(userId, videoId, progress) {
                fetch('http://localhost:3000/saveProgress', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
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

            function loadProgress(userId, videoId, elementId) {
                fetch(`http://localhost:3000/getProgress/${userId}/${videoId}`)
                    .then(response => response.json())
                    .then(data => {
                        const progress = data.progress;
                        const progressBar = document.getElementById(elementId);
                        updateProgressBar(progressBar, progress); // Asegurarse de que los colores se actualicen al cargar el progreso
                    });
            }

            // Función para aumentar el progreso
            window.advanceProgress = function(barId) {
                const progressBar = document.getElementById(barId);
                let progress = parseFloat(progressBar.style.width) || 0; // Asegurarse de trabajar con valores enteros
                if (progress < 100) {
                    progress = Math.min(100, progress + INCREMENT); // Usar Math.min para asegurar que no exceda 100%
                    updateProgressBar(progressBar, progress);
                    saveProgress(userId, barId, progress);
                }
                console.log('Progreso después de incrementar:', progress); // Debugging
            };

            // Función para disminuir el progreso
            window.decreaseProgress = function(barId) {
                const progressBar = document.getElementById(barId);
                let progress = parseFloat(progressBar.style.width) || 0; // Asegurarse de trabajar con valores enteros
                if (progress > 0) {
                    progress = Math.max(0, progress - INCREMENT); // Usar Math.max para asegurar que no sea menor a 0%
                    updateProgressBar(progressBar, progress);
                    saveProgress(userId, barId, progress);
                }
                console.log('Progreso después de decrementar:', progress); // Debugging
            };

            // Función para actualizar la barra de progreso
            function updateProgressBar(progressBar, value) {
                value = Math.round(value); // Asegurarse de trabajar con valores enteros
                if (value > 100) {
                    value = 100;
                } else if (value < 0) {
                    value = 0;
                }
                progressBar.style.width = `${value}%`;
                if (value <= 34) {
                    progressBar.style.backgroundColor = '#ff0000'; // Rojo
                } else if (value <= 68) {
                    progressBar.style.backgroundColor = '#f39c12'; // Naranja
                } else {
                    progressBar.style.backgroundColor = '#7ed957'; // Verde
                }
            }
        })
        .catch(error => {
            console.error('Error al obtener el userId:', error);
        });
});
0107
