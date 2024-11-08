const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const dotenv = require('dotenv');
const session = require('express-session');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

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

// Rutas de autenticación
app.post('/login', (req, res) => {
    const { txtemail, txtpassword } = req.body;
    const sql = "SELECT * FROM datos WHERE email = ? AND password = ?";
    db.query(sql, [txtemail, txtpassword], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            req.session.userId = results[0].id;  // Almacenar el ID del usuario en la sesión
            res.redirect('/pages/servicios.html');
        } else {
            res.send('Credenciales inválidas');
        }
    });
});

app.get('/getUserId', (req, res) => {
    if (req.session.userId) {
        res.json({ userId: req.session.userId });
    } else {
        res.status(401).send('Usuario no autenticado');
    }
});

// Rutas para guardar y obtener progreso de video
app.post('/saveProgress', (req, res) => {
    const { userId, videoId, progress } = req.body;
    let sql = 'INSERT INTO video_progress (user_id, video_id, progress) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE progress = ?';
    db.query(sql, [userId, videoId, progress, progress], (err, result) => {
        if (err) throw err;
        res.send('Progreso guardado');
    });
});

app.get('/getProgress/:userId/:videoId', (req, res) => {
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

