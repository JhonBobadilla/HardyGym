const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const dotenv = require('dotenv');
const session = require('express-session');
const jwt = require('jsonwebtoken'); // Añadir jwt para autenticación con tokens
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const secretKey = process.env.SECRET_KEY || 'tu_secreto';

// Middleware de sesión
app.use(session({
    secret: 'tu_secreto',
    resave: false,
    saveUninitialized: true
}));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));  // Servir archivos estáticos desde el directorio raíz

// Conexión a la base de datos
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) throw err;
    console.log('Conectado a la base de datos MySQL');
});

// Ruta para registrar nuevos usuarios
app.post('/register', (req, res) => {
    const { nombre, email, password, telefono, ciudad } = req.body;
    console.log('Datos recibidos para registro:', req.body); // Depuración
    console.log('Teléfono recibido:', telefono); // Depuración adicional
    console.log('Ciudad recibida:', ciudad); // Depuración adicional

    const sql = 'INSERT INTO datos (nombre, email, password, telefono, ciudad) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nombre, email, password, telefono, ciudad], (err, result) => {
        if (err) {
            console.error('Error al registrar usuario:', err);
            res.status(500).send('Error al registrar usuario');
        } else {
            // Enviar una respuesta JSON con un campo 'success' en lugar de redirigir directamente
            res.json({ success: true, redirectUrl: 'http://localhost:3000/pages/pago_suscripcion.html' });
        }
    });
});

// Rutas de autenticación
app.post('/login', (req, res) => {
    const { txtemail, txtpassword } = req.body;
    const sql = "SELECT * FROM datos WHERE email = ? AND password = ?";
    db.query(sql, [txtemail, txtpassword], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            // Crear un token y enviarlo al cliente
            const user = { id: results[0].id, email: results[0].email };
            const token = jwt.sign(user, secretKey, { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.send('Credenciales inválidas');
        }
    });
});

// Middleware de autenticación para rutas protegidas
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.redirect('/public/login.html'); // Redirige a la página de inicio de sesión si no hay token

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.redirect('/public/login.html'); // Redirige a la página de inicio de sesión si el token no es válido
        req.user = user;
        next();
    });
}

// Ejemplo de ruta protegida
app.get('/protected', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'protected.html'));
});

// Ajuste para incluir el nombre del usuario
app.get('/getUserId', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const sql = 'SELECT nombre FROM datos WHERE id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error al obtener el nombre del usuario:', err);
            return res.status(500).send({ message: 'Error al obtener el nombre del usuario' });
        }

        if (results.length === 0) {
            return res.status(404).send({ message: 'Usuario no encontrado' });
        }

        res.json({ userId: userId, nombre: results[0].nombre });
    });
});

// Rutas para guardar y obtener progreso de video
app.post('/saveProgress', authenticateToken, (req, res) => {
    const { userId, videoId, progress } = req.body;
    let sql = 'INSERT INTO video_progress (user_id, video_id, progress) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE progress = ?';
    db.query(sql, [userId, videoId, progress, progress], (err, result) => {
        if (err) throw err;
        res.send('Progreso guardado');
    });
});

app.get('/getProgress/:userId/:videoId', authenticateToken, (req, res) => {
    const { userId, videoId } = req.params;
    let sql = 'SELECT progress FROM video_progress WHERE user_id = ? AND video_id = ?';
    db.query(sql, [userId, videoId], (err, results) => {
        if (err) throw err;
        const progress = results.length ? results[0].progress : 0;
        res.json({ progress });
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor ejecutándose en el puerto ${port}`);
});



