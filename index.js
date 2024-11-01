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
        window.location.href = "./pages/contactenos.html";
        
    }

    if (edad >= 18) {

   alert ("Puedes inscribirte")
   window.location.href = "./pages/terminos_y_condiciones.html";
   break;
    }
     
    if(intentos >= max_intentos){
        alert("Hiciste tres intentos, contactate con nosotros")
        window.location.href = "./pages/contactenos.html";
    break;   
    }
 }
 
   
while(edad != edad)
}     
    

function acceptTerms() {

    alert("Aceptaste los terminos y condiciones");
    
    window.location.href = '../C:/xampp/htdocs/formulario_registro/php/index.php';
  }//ojo corregir esta ruta cuando todos los archivos esten juntos.

  function rejectTerms() {
    alert("No aceptaste los terminos y condiciones te redirigiremos al home");
    window.location.href = '../index.html';
  }

  /* OPCION 3 ES LA MAS UTILIZADA (ver HTML y js ↓↓↓↓↓↓↓)
Se hace desde JS A TRAVES DE UNA SINTAXIS LLAMADA addEventListener que es una forma más flexible y la más recomendada para gestionar eventos y su sintaxis es:

const xxxxxxxxx = document.getElementById("yyyyyyyyyy")

xxxxxxxxx.addEventListener('click', function (){
    alert("mensaje") }) 

*/




    
