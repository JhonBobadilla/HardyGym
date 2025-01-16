let productosEnCarrito = localStorage.getItem("productos-en-carrito");
productosEnCarrito = JSON.parse(productosEnCarrito);

const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#carrito-productos");
const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");
let botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
const botonVaciar = document.querySelector("#carrito-acciones-vaciar");
const contenedorTotal = document.querySelector("#total");
const botonComprar = document.querySelector("#carrito-acciones-comprar");
const formularioEpayco = document.querySelector("#frm_ePaycoCheckoutOpen");

// Cargar los productos que están en el carrito
function cargarProductosCarrito() {
    if (productosEnCarrito && productosEnCarrito.length > 0) {
        contenedorCarritoVacio.classList.add("disabled");
        contenedorCarritoProductos.classList.remove("disabled");
        contenedorCarritoAcciones.classList.remove("disabled");
        contenedorCarritoComprado.classList.add("disabled");

        contenedorCarritoProductos.innerHTML = "";
        productosEnCarrito.forEach(producto => {
            const div = document.createElement("div");
            div.classList.add("carrito-producto");
            div.innerHTML = ` 
                <img class="carrito-producto-imagen" src="${producto.imagen}" alt="${producto.titulo}"> 
                <div class="carrito-producto-titulo">
                    <small class="small-carrito">Título</small>
                    <h3 class="h3shop">${producto.titulo}</h3>
                </div>
                <div class="carrito-producto-cantidad">
                    <small class="small-carrito">Cantidad</small>
                    <p class="h3shop">${producto.cantidad}</p>
                </div>
                <div class="carrito-producto-precio">
                    <small class="small-carrito">Precio</small>
                    <p class="pshopp">$${producto.precio}</p>
                </div>
                <div class="carrito-producto-subtotal">
                    <small class="small-carrito">Subtotal</small>
                    <p class="pshopp">$${producto.precio * producto.cantidad}</p>
                </div>
                <button class="carrito-producto-eliminar" id="${producto.id}"><i class="bi bi-trash-fill"></i></button>   
            </div>`;
            contenedorCarritoProductos.append(div);
        });
    } else {
        contenedorCarritoVacio.classList.remove("disabled");
        contenedorCarritoProductos.classList.add("disabled");
        contenedorCarritoAcciones.classList.add("disabled");
        contenedorCarritoComprado.classList.add("disabled");
    }
    actualizarBotonesEliminar();
    actualizarTotal();
}

// Función para actualizar la eliminación de productos
function actualizarBotonesEliminar() {
    botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar"); 
    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", eliminarDelCarrito);
    });
}

// Función para eliminar productos del carrito
function eliminarDelCarrito(e) {
    const idBoton = e.currentTarget.id;
    const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);
    productosEnCarrito.splice(index, 1);
    cargarProductosCarrito(); 
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}

// Función para vaciar el carrito
botonVaciar.addEventListener("click", vaciarCarrito);
function vaciarCarrito() {
    Swal.fire({
        title: '¿Estás seguro?',
        icon: 'question',
        html: `Se van a borrar ${productosEnCarrito.reduce((acc, producto) => acc + producto.cantidad, 0)} productos.`,
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            productosEnCarrito.length = 0;
            localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
            cargarProductosCarrito();
        }
    });
}

// Función para actualizar el total del carrito
function actualizarTotal() {
    const totalCalculado = productosEnCarrito.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0);
    contenedorTotal.innerText = `$${totalCalculado}`;
}

// Función para realizar la compra
botonComprar.addEventListener("click", comprarCarrito);
function comprarCarrito() {
    // Guardamos el total antes de vaciar el carrito
    const totalCompra = productosEnCarrito.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0);
    localStorage.setItem("total-compra", totalCompra);  // Guardamos el total en el localStorage

    productosEnCarrito.length = 0;
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
    contenedorCarritoVacio.classList.add("disabled");
    contenedorCarritoProductos.classList.add("disabled");
    contenedorCarritoAcciones.classList.add("disabled");
    contenedorCarritoComprado.classList.remove("disabled");

    // Mostrar el formulario de ePayco
    formularioEpayco.style.display = 'block';

    // Llamamos a la función que inserta el mensaje de compra
    mostrarMensajeCompra();
}

// Mostrar mensaje con el total de la compra
function mostrarMensajeCompra() {
    // Recuperamos el total desde el localStorage
    const totalCompra = localStorage.getItem("total-compra");
    const mensajeCompra = `Recuerda digitar el valor de tu compra al acceder al botón de pago, tu valor fue $${totalCompra} IMPUESTOS INCLUIDOS. Para el envio de tus productos nos pondremos en contacto contigo al correo registrado.`;
    const contenedorCompra = document.createElement('p');
    contenedorCompra.textContent = mensajeCompra;
    contenedorCompra.classList.add('pshop', 'carrito-comprado');
    
    const contenedorGracias = document.querySelector("#carrito-comprado");
    contenedorGracias.insertAdjacentElement('afterend', contenedorCompra);
    contenedorCompra.insertAdjacentElement('afterend', contenedorInstrucciones);
}

// Función adicional para generar el archivo compras.html (solo para el administrador)
document.getElementById('botonGenerarCompras').addEventListener('click', function() {
    let comprasHTML = `
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Registro de Compras</title>
        </head>
        <body>
            <h1>Historial de Compras</h1>
            <table border="1">
                <tr>
                    <th>Título</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Total</th>
                </tr>
    `;
    
    productosEnCarrito.forEach(producto => {
        comprasHTML += `
            <tr>
                <td>${producto.titulo}</td>
                <td>${producto.cantidad}</td>
                <td>$${producto.precio}</td>
                <td>$${producto.precio * producto.cantidad}</td>
            </tr>
        `;
    });

    comprasHTML += `
            </table>
            <p><strong>Total: $${localStorage.getItem("total-compra")}</strong></p>
        </body>
        </html>
    `;

    const blob = new Blob([comprasHTML], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'compras.html';
    link.click();
});







