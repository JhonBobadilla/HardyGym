const express = require('express');
const path = require('path');
const mysql = require('mysql');
const app = express();
const PORT = process.env.PORT || 3000;

// Conectar con la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'formulario'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Conexión a la base de datos establecida');
});

// Middleware para manejo de datos de formularios
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '')));

// Ruta para manejar el registro
app.post('/php/send.php', (req, res) => {
    const { name, password, email, phone } = req.body;
    const fecha = new Date().toISOString().slice(0, 10);

    const query = 'INSERT INTO datos (nombre, password, email, telefono, fecha) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, password, email, phone, fecha], (err, result) => {
        if (err) {
            console.error(err);
            return res.send('Ocurrió un error');
        }
        res.send('Tu registro se ha completado, regresa al home → → → → →');
    });
});

// Ruta para manejar el login
app.post('/php/login.php', (req, res) => {
    const { txtemail, txtpassword } = req.body;

    const query = 'SELECT * FROM datos WHERE email = ? AND password = ?';
    db.query(query, [txtemail, txtpassword], (err, results) => {
        if (err) {
            console.error(err);
            return res.send('Ocurrió un error');
        }

        if (results.length > 0) {
            res.redirect('/pages/servicios.html');
        } else {
            res.send('Credenciales inválidas');
        }
    });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});