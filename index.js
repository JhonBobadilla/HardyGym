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

/* JS BARRA DE PROGRESO */

let progress = 0; const progressBar = document.getElementById('progress-bar'); function advanceProgress() { if (progress < 100) { progress += 34; // Ajusta el valor del incremento según sea necesario
updateProgressBar(progress); } } function decreaseProgress() { if (progress > 0) { progress -= 34; // Ajusta el valor del decremento según sea necesario 
updateProgressBar(progress); } } function updateProgressBar(value) { if (value > 100) { value = 100; } else if (value < 0) { value = 0; } progressBar.style.width = `${value}%`; if (value <= 34) { progressBar.style.backgroundColor = '#ff0000'; // Red 
  } else if (value <= 68) { progressBar.style.backgroundColor = '#f39c12'; // Orange 
    } else { progressBar.style.backgroundColor = '#7ed957'; // Green 
      } }









  
 

  


    
