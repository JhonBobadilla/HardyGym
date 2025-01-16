let productosEnCarrito = localStorage.getItem("productos-en-carrito");
productosEnCarrito = JSON.parse(productosEnCarrito) || [];

const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#carrito-productos");
const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");
let botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
const botonVaciar = document.querySelector("#carrito-acciones-vaciar");
const contenedorTotal = document.querySelector("#total");
const botonComprar = document.querySelector("#carrito-acciones-comprar");
const formularioEpayco = document.querySelector("#frm_ePaycoCheckoutOpen");

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

cargarProductosCarrito();

function actualizarBotonesEliminar() {
    botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar"); 
    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", eliminarDelCarrito);
    });
}

function eliminarDelCarrito(e) {
    const idBoton = e.currentTarget.id;
    const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);
    productosEnCarrito.splice(index, 1);
    cargarProductosCarrito(); 
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}

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

function actualizarTotal() {
    const totalCalculado = productosEnCarrito.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0);
    contenedorTotal.innerText = `$${totalCalculado}`;
}

botonComprar.addEventListener("click", comprarCarrito);
function comprarCarrito() {
    const totalCompra = productosEnCarrito.reduce((acc, producto) => acc + (producto.precio * producto.cantidad), 0);
    localStorage.setItem("total-compra", totalCompra);  // Guardamos el total en el localStorage

    // Guardamos la compra en el historial de compras en localStorage
    let comprasRealizadas = JSON.parse(localStorage.getItem('comprasRealizadas')) || [];
    const nuevaCompra = {
        productos: productosEnCarrito,
        total: totalCompra,
        fecha: new Date().toLocaleString()
    };
    comprasRealizadas.push(nuevaCompra);
    localStorage.setItem('comprasRealizadas', JSON.stringify(comprasRealizadas));

    productosEnCarrito.length = 0;
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
    contenedorCarritoVacio.classList.add("disabled");
    contenedorCarritoProductos.classList.add("disabled");
    contenedorCarritoAcciones.classList.add("disabled");
    contenedorCarritoComprado.classList.remove("disabled");

    formularioEpayco.style.display = 'block';

    mostrarMensajeCompra();
}

function mostrarMensajeCompra() {
    const totalCompra = localStorage.getItem("total-compra");
    const mensajeCompra = `Recuerda digitar el valor de tu compra al acceder al botón de pago, tu valor fue $${totalCompra} IMPUESTOS INCLUIDOS" no selecciones la casilla incluir impuestos." para el envio de tus productos nos pondremos en contactos contigo al correo registrado...`;
    const contenedorCompra = document.createElement('p');
    contenedorCompra.textContent = mensajeCompra;
    contenedorCompra.classList.add('pshop', 'carrito-comprado');
    
    const contenedorGracias = document.querySelector("#carrito-comprado");
    contenedorGracias.insertAdjacentElement('afterend', contenedorCompra);
}

function generarHTMLcompras() {
    const compras = JSON.parse(localStorage.getItem('comprasRealizadas')) || [];
    let comprasHTML = `
        <html>
        <head><title>Registro de Compras</title></head>
        <body>
        <h1>Registro de Compras</h1>
        <table border="1">
            <tr>
                <th>Fecha</th>
                <th>Productos</th>
                <th>Total</th>
            </tr>`;

    compras.forEach(compra => {
        comprasHTML += `
            <tr>
                <td>${compra.fecha}</td>
                <td>${compra.productos.map(p => `${p.titulo} (x${p.cantidad})`).join(', ')}</td>
                <td>$${compra.total}</td>
            </tr>`;
    });

    comprasHTML += `
        </table>
        </body>
        </html>`;

    // Creamos un blob con el HTML generado
    const blob = new Blob([comprasHTML], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'compras.html';  // El archivo descargado se llamará compras.html
    link.click();
}

// Este botón solo debería estar disponible para ti, el administrador
const botonGenerarCompras = document.getElementById('botonGenerarCompras');
botonGenerarCompras.addEventListener('click', generarHTMLcompras);






