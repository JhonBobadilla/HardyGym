const express = require('express');
const logger = require('morgan');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const { createServer } = require('http');
const { Pool } = require('pg');

dotenv.config();
const port = process.env.PORT || 3001; // Heroku asigna el puerto automáticamente
const app = express();
const server = createServer(app);
const io = new Server(server, { connectionStateRecovery: {} });

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT // Usar el puerto especificado en el .env (5432)
});

pool.connect((err) => {
  if (err) throw err;
  console.log('Conectado a la base de datos PostgreSQL');
});

// Middleware
app.use(express.json());
app.use(logger('dev'));
app.use(express.static('public'));
app.use(express.static('client'));

// Configuración del servidor de chat
io.on('connection', (socket) => {
  console.log('¡Un usuario se ha conectado!');

  socket.on('disconnect', () => {
    console.log('¡Un usuario se ha desconectado!');
  });

  socket.on('chat message', (msg) => {
    const username = socket.handshake.auth.username || 'anonymous';

    pool.query('INSERT INTO chat_messages (content, user) VALUES ($1, $2) RETURNING id', [msg, username], (err, result) => {
      if (err) throw err;
      io.emit('chat message', msg, result.rows[0].id.toString(), username);
    });
  });

  socket.on('private message', (msg, toUsername) => {
    const fromUsername = socket.handshake.auth.username || 'anonymous';
    const targetSocket = Array.from(io.sockets.sockets.values()).find(s => s.handshake.auth.username === toUsername);
    if (targetSocket) {
      targetSocket.emit('private message', msg, fromUsername);
    }
  });

  pool.query('SELECT id, content, user FROM chat_messages ORDER BY id DESC LIMIT 50', (err, results) => {
    if (err) throw err;
    results.rows.reverse().forEach(row => { // Reverse to maintain correct order
      socket.emit('chat message', row.content, row.id.toString(), row.user);
    });
  });
});

// Rutas para el chat
app.get('/chat', (req, res) => {
  res.sendFile(process.cwd() + '/client/chat/chat.html');
});

// Rutas para el registro y login
app.post('/register', (req, res) => {
  const { name, password, email, phone } = req.body;
  if (!name || !password || !email || !phone) {
    return res.send(`<h3 class="error">Llena todos los campos</h3><a href="/pages/register.html">Volver</a>`);
  }
  const sql = "INSERT INTO datos (nombre, password, email, telefono, fecha) VALUES ($1, $2, $3, $4, NOW())";
  pool.query(sql, [name, password, email, phone], (err, result) => {
    if (err) throw err;
    res.send(`<h3 class="success">Tu registro se ha completado, regresa al home → <a href="/public/index.html">Home</a>`);
  });
});

app.post('/login', (req, res) => {
  const { txtemail, txtpassword } = req.body;
  const sql = "SELECT * FROM datos WHERE email = $1 AND password = $2";
  pool.query(sql, [txtemail, txtpassword], (err, results) => {
    if (err) throw err;
    if (results.rows.length > 0) {
      res.redirect('/pages/servicios.html');
    } else {
      res.send('Credenciales inválidas');
    }
  });
});

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

