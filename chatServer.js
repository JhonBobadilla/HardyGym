// chatServer.js

const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const app = express();
const port = 3001;  // Puedes usar cualquier puerto disponible

// Crear servidor HTTP
const server = http.createServer(app);

// Integrar Socket.IO al servidor HTTP
const io = new Server(server);

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
