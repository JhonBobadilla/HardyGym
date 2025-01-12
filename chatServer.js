// chatServer.js

const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const cors = require('cors');
const app = express();

// Puerto dinámico proporcionado por Heroku o 3001 para desarrollo local
const port = process.env.PORT || 3001;

// Configurar CORS para permitir la comunicación desde tu frontend
app.use(cors({
    origin: "*", // Permitir todas las conexiones, ajusta esto para mayor seguridad en producción
    methods: ["GET", "POST"]
}));

// Crear servidor HTTP
const server = http.createServer(app);

// Integrar Socket.IO al servidor HTTP
const io = new Server(server, {
    cors: {
        origin: "*", // Permitir todas las conexiones para pruebas, ajusta esto si necesitas más seguridad
        methods: ["GET", "POST"]
    }
});

// Manejar eventos de conexión de Socket.IO
io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado');
    
    // Recibir un mensaje de un cliente
    socket.on('mensaje', (msg) => {
        console.log('Mensaje recibido:', msg);
        io.emit('mensaje', msg); // Emitir el mensaje a todos los clientes conectados
    });
    
    // Manejar desconexiones de los usuarios
    socket.on('disconnect', () => {
        console.log('Un usuario se ha desconectado');
    });
});

// Iniciar el servidor de chat
server.listen(port, () => {
    console.log(`Servidor de chat ejecutándose en el puerto ${port}`);
});


