const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

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

// Rutas
app.post('/register', (req, res) => {
    const { name, password, email, phone } = req.body;

    // Validar que todos los campos estén completos
    if (!name || !password || !email || !phone) {
        return res.send(`
            <h3 class="error">Llena todos los campos</h3>
            <a href="/pages/register.html">Volver</a>
        `);
    }

    const sql = "INSERT INTO datos (nombre, password, email, telefono, fecha) VALUES (?, ?, ?, ?, NOW())";
    db.query(sql, [name, password, email, phone], (err, result) => {
        if (err) throw err;
        res.send(`
            <h3 class="success">Tu registro se ha completado, regresa al home → <a href="/public/index.html">Home</a></h3>
        `);
    });
});

app.post('/login', (req, res) => {
    const { txtemail, txtpassword } = req.body;
    const sql = "SELECT * FROM datos WHERE email = ? AND password = ?";
    db.query(sql, [txtemail, txtpassword], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.redirect('/pages/servicios.html');
        } else {
            res.send('Credenciales inválidas');
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor ejecutándose en el puerto ${port}`);
    });