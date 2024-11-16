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

                /*Pilates*/
                'progress-bar-1', 'progress-bar-2', 'progress-bar-3', 'progress-bar-4',
                'progress-bar-5', 'progress-bar-6', 'progress-bar-7', 'progress-bar-8',
                'progress-bar-9', 'progress-bar-10', 'progress-bar-11', 'progress-bar-12',
                'progress-bar-13', 'progress-bar-14', 'progress-bar-15', 'progress-bar-16',
                'progress-bar-17', 'progress-bar-18', 'progress-bar-19', 'progress-bar-20',
                /*Funcional*/
                'progress-bar-21', 'progress-bar-22', 'progress-bar-23', 'progress-bar-24',
                'progress-bar-25', 'progress-bar-26', 'progress-bar-27', 'progress-bar-28',
                'progress-bar-29', 'progress-bar-30', 'progress-bar-31', 'progress-bar-32',
                'progress-bar-33', 'progress-bar-34', 'progress-bar-35', 'progress-bar-36',
                'progress-bar-37', 'progress-bar-38', 'progress-bar-39', 'progress-bar-40',
                /*PausasActivas*/
                'progress-bar-41', 'progress-bar-42', 'progress-bar-43', 'progress-bar-44',
                'progress-bar-45', 'progress-bar-46', 'progress-bar-47', 'progress-bar-48',
                'progress-bar-49', 'progress-bar-50', 'progress-bar-51', 'progress-bar-52',
                'progress-bar-53', 'progress-bar-54', 'progress-bar-55', 'progress-bar-56',
                'progress-bar-57', 'progress-bar-58', 'progress-bar-59', 'progress-bar-60',
                /*Rumba*/
                'progress-bar-61', 'progress-bar-62', 'progress-bar-63', 'progress-bar-64',
                'progress-bar-65', 'progress-bar-66', 'progress-bar-67', 'progress-bar-68',
                'progress-bar-69', 'progress-bar-70', 'progress-bar-71', 'progress-bar-72',
                'progress-bar-73', 'progress-bar-74', 'progress-bar-75', 'progress-bar-76',
                'progress-bar-77', 'progress-bar-78', 'progress-bar-79', 'progress-bar-80',
                /*Combat*/
                'progress-bar-81', 'progress-bar-82', 'progress-bar-83', 'progress-bar-84',
                'progress-bar-85', 'progress-bar-86', 'progress-bar-87', 'progress-bar-88',
                'progress-bar-89', 'progress-bar-90', 'progress-bar-91', 'progress-bar-92',
                'progress-bar-93', 'progress-bar-94', 'progress-bar-95', 'progress-bar-96',
                'progress-bar-97', 'progress-bar-98', 'progress-bar-99', 'progress-bar-100',
                /*Yoga*/
                'progress-bar-101', 'progress-bar-102', 'progress-bar-103', 'progress-bar-104',
                'progress-bar-105', 'progress-bar-106', 'progress-bar-107', 'progress-bar-108',
                'progress-bar-109', 'progress-bar-110', 'progress-bar-111', 'progress-bar-112',
                'progress-bar-113', 'progress-bar-114', 'progress-bar-115', 'progress-bar-116',
                'progress-bar-117', 'progress-bar-118', 'progress-bar-119', 'progress-bar-120',
                /*EdadDeOro*/
                'progress-bar-121', 'progress-bar-122', 'progress-bar-123', 'progress-bar-124',
                'progress-bar-125', 'progress-bar-126', 'progress-bar-127', 'progress-bar-128',
                'progress-bar-129', 'progress-bar-130', 'progress-bar-131', 'progress-bar-132',
                'progress-bar-133', 'progress-bar-134', 'progress-bar-135', 'progress-bar-136',
                'progress-bar-137', 'progress-bar-138', 'progress-bar-139', 'progress-bar-140',
                /*AltoImpacto*/
                'progress-bar-141', 'progress-bar-142', 'progress-bar-143', 'progress-bar-144',
                'progress-bar-145', 'progress-bar-146', 'progress-bar-147', 'progress-bar-148',
                'progress-bar-149', 'progress-bar-150', 'progress-bar-151', 'progress-bar-152',
                'progress-bar-153', 'progress-bar-154', 'progress-bar-155', 'progress-bar-156',
                'progress-bar-157', 'progress-bar-158', 'progress-bar-159', 'progress-bar-160'
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









