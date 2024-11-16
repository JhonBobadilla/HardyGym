/*HARDY SHOP*/

//PRODUCTOS

const productos = [
    {
        "id": "deportivo-01",
        "titulo": "Deportivo 01",
        "imagen": "../img/bola_de_pilates_75_com2.jpg",
        "categoria": {
            "nombre": "Deportivos",
            "id": "deportivos"
        },
        "precio": 1000
    },
    {
        "id": "deportivo-02",
        "titulo": "Deportivo 02",
        "imagen": "../img/bola_de_pilates_75_com2.jpg",
        "categoria": {
            "nombre": "Deportivos",
            "id": "deportivos"
        },
        "precio": 1000
    },
    {
        "id": "deportivo-03",
        "titulo": "Deportivo 03",
        "imagen": "../img/bola_de_pilates_75_com2.jpg",
        "categoria": {
            "nombre": "Deportivos",
            "id": "deportivos"
        },
        "precio": 1000
    },
    {
        "id": "deportivo-04",
        "titulo": "Deportivo 04",
        "imagen": "../img/bola_de_pilates_75_com2.jpg",
        "categoria": {
            "nombre": "Deportivos",
            "id": "deportivos"
        },
        "precio": 1000
    },
    {
        "id": "deportivo-05",
        "titulo": "Deportivo 05",
        "imagen": "../img/bola_de_pilates_75_com.jpg",
        "categoria": {
            "nombre": "Deportivos",
            "id": "deportivos"
        },
        "precio": 1000
    },
    {
        "id": "prenda-01",
        "titulo": "Ropa 01",
        "imagen": "../img/bola_de_pilates_75_com.jpg",
        "categoria": {
            "nombre": "Prendas",
            "id": "prendas"
        },
        "precio": 1000
    },
    {
        "id": "prenda-02",
        "titulo": "Ropa 02",
        "imagen": "../img/bola_de_pilates_75_com.jpg",
        "categoria": {
            "nombre": "Prendas",
            "id": "prendas"
        },
        "precio": 1000
    },
    {
        "id": "prenda-03",
        "titulo": "Ropa 03",
        "imagen": "../img/bola_de_pilates_75_com.jpg",
        "categoria": {
            "nombre": "Prendas",
            "id": "prendas"
        },
        "precio": 1000
    },
    {
        "id": "prenda-04",
        "titulo": "Ropa 04",
        "imagen": "../img/bola_de_pilates_75_com.jpg",
        "categoria": {
            "nombre": "Prendas",
            "id": "prendas"
        },
        "precio": 1000
    },
    {
        "id": "prenda-05",
        "titulo": "Ropa 05",
        "imagen": "../img/bola_de_pilates_75_com3.jpg",
        "categoria": {
            "nombre": "Prendas",
            "id": "prendas"
        },
        "precio": 1000
    },
    {
        "id": "prenda-06",
        "titulo": "Ropa 06",
        "imagen": "../img/bola_de_pilates_75_com3.jpg",
        "categoria": {
            "nombre": "Prendas",
            "id": "prendas"
        },
        "precio": 1000
    },
    {
        "id": "prenda-07",
        "titulo": "Ropa 07",
        "imagen": "../img/bola_de_pilates_75_com3.jpg",
        "categoria": {
            "nombre": "Prendas",
            "id": "prendas"
        },
        "precio": 1000
    },
    {
        "id": "prenda-08",
        "titulo": "Ropa 08",
        "imagen": "../img/bola_de_pilates_75_com3.jpg",
        "categoria": {
            "nombre": "Prendas",
            "id": "prendas"
        },
        "precio": 1000
    },
    {
        "id": "otro-01",
        "titulo": "Otros 01",
        "imagen": "../img/bola_de_pilates_75_com3.jpg",
        "categoria": {
            "nombre": "Otros",
            "id": "otros"
        },
        "precio": 1000
    },
    {
        "id": "otro-02",
        "titulo": "Otros 02",
        "imagen": "../img/bola_de_pilates_75_com1.jpg",
        "categoria": {
            "nombre": "Otros",
            "id": "otros"
        },
        "precio": 1000
    },
    {
        "id": "otro-03",
        "titulo": "Otros 03",
        "imagen": "../img/bola_de_pilates_75_com1.jpg",
        "categoria": {
            "nombre": "Otros",
            "id": "otros"
        },
        "precio": 1000
    },
    {
        "id": "otro-04",
        "titulo": "Otros 04",
        "imagen": "../img/bola_de_pilates_75_com1.jpg",
        "categoria": {
            "nombre": "Otros",
            "id": "otros"
        },
        "precio": 1000
    },
    {
        "id": "otro-05",
        "titulo": "Otros 05",
        "imagen": "../img/bola_de_pilates_75_com1.jpg",
        "categoria": {
            "nombre": "Otros",
            "id": "otros"
        },
        "precio": 1000
    }
];

const contenedorProductos = document.querySelector("#contenedor-productos");

function cargarProductos() {

productos.forEach(producto => {

    const div = document.createElement("div"); 
    div.classList.add("producto");
    div.innerHTML = `
        <img class="producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
        <div class="producto-detalles">
         <h3 class="h3shop">${producto.titulo}</h3>
         <p class="producto-precio">$${producto.precio}</p>
         <button class="producto-agregar" id="${producto.id}">Agregar</button>
         </div>
       
         `;

    contenedorProductos.append(div);

})

}

cargarProductos();