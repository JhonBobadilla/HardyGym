const express = require('express');
const logger = require('morgan');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const { createServer } = require('http');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const { check, validationResult } = require('express-validator');

// Cargar configuración del archivo .env
dotenv.config();

const port = process.env.PORT || 3001; // Heroku asigna el puerto automáticamente
const app = express();
const server = createServer(app);
const io = new Server(server, { connectionStateRecovery: {} });

// Configuración de la base de datos PostgreSQL
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
app.use(helmet()); // Seguridad adicional con Helmet

// Configuración del servidor de chat
io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error('Se requiere un nombre de usuario'));
  }
  socket.username = username; // Asignar el nombre de usuario al socket
  next();
});

io.on('connection', (socket) => {
  console.log(`${socket.username} se ha conectado`);

  // Notificar a los demás usuarios sobre la conexión
  socket.broadcast.emit('user connected', socket.username);

  // Evento para manejar la desconexión
  socket.on('disconnect', () => {
    console.log(`${socket.username} se ha desconectado`);
    socket.broadcast.emit('user disconnected', socket.username);
  });

  // Manejo de mensajes públicos
  socket.on('chat message', (msg) => {
    const username = socket.username;
    pool.query('INSERT INTO chat_messages (content, username) VALUES ($1, $2) RETURNING id', [msg, username], (err, result) => {
      if (err) {
        console.error('Error al guardar mensaje:', err);
        return;
      }
      io.emit('chat message', msg, result.rows[0].id.toString(), username);
    });
  });

  // Manejo de mensajes privados
  socket.on('private message', (msg, toUsername) => {
    const fromUsername = socket.username;
    const targetSocket = Array.from(io.sockets.sockets.values()).find(s => s.username === toUsername);
    if (targetSocket) {
      targetSocket.emit('private message', msg, fromUsername);
    }
  });

  // Recuperar mensajes recientes
  pool.query('SELECT id, content, username FROM chat_messages ORDER BY id DESC LIMIT 50', (err, results) => {
    if (err) {
      console.error('Error al recuperar mensajes:', err);
      return;
    }
    results.rows.reverse().forEach(row => {
      socket.emit('chat message', row.content, row.id.toString(), row.username);
    });
  });
});

// Rutas para el registro y login
app.post('/register', [
  check('name').isLength({ min: 1 }).withMessage('El nombre es obligatorio'),
  check('email').isEmail().withMessage('El correo no es válido'),
  check('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  check('phone').isNumeric().withMessage('El teléfono debe ser un número')
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, password, email, phone } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Cifrar la contraseña
    const sql = "INSERT INTO datos (nombre, password, email, telefono, fecha) VALUES ($1, $2, $3, $4, NOW())";
    await pool.query(sql, [name, hashedPassword, email, phone]);
    res.send(`<h3 class="success">Registro completado. <a href="/public/index.html">Home</a></h3>`);
  } catch (err) {
    next(err);
  }
});

app.post('/login', async (req, res, next) => {
  const { txtemail, txtpassword } = req.body;
  try {
    const sql = "SELECT * FROM datos WHERE email = $1";
    const { rows } = await pool.query(sql, [txtemail]);
    if (rows.length > 0) {
      const isMatch = await bcrypt.compare(txtpassword, rows[0].password);
      if (isMatch) {
        res.redirect('/pages/servicios.html');
      } else {
        res.status(401).send('Credenciales inválidas');
      }
    } else {
      res.status(401).send('Credenciales inválidas');
    }
  } catch (err) {
    next(err);
  }
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Ha ocurrido un error en el servidor.');
});

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



