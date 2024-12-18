const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
dotenv.config();

const app = express();
const port = process.env.RESET_PASSWORD_PORT || 3002;
const secretKey = process.env.SECRET_KEY || 'tu_secreto';

console.log('Puerto para restablecimiento de contraseña:', port);
console.log('Clave secreta:', secretKey);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
app.use('/pages', express.static(path.join(__dirname, 'pages')));

// Conexión a la base de datos
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        throw err;
    }
    console.log('Conectado a la base de datos MySQL');
});

// Configuración del transportador de correo
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('Error al verificar el transportador:', error);
        console.log('Detalles del error:', error.message, error.response);
        console.log('Código de error:', error.code, 'Sistema:', error.syscall, 'Dirección:', error.address, 'Puerto:', error.port);
    } else {
        console.log('Transportador de correo está listo para enviar mensajes');
    }
});

console.log('Correo de usuario:', process.env.EMAIL_USER);
console.log('Configuración del transportador de correo:', transporter.options);

// Ruta para enviar el enlace de restablecimiento de contraseña
app.post('/reset-password', (req, res) => {
    const { email } = req.body;

    console.log('Solicitud para restablecer contraseña recibida para:', email);

    const sql = 'SELECT * FROM datos WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Error al verificar el correo en la base de datos:', err);
            return res.status(500).send({ message: 'Error al verificar el correo' });
        }

        if (results.length === 0) {
            console.log('Correo no registrado:', email);
            return res.status(400).send({ message: 'El correo no está registrado' });
        }

        const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
        console.log('Token generado:', token);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Enlace para restablecer tu contraseña',
            text: `Haz clic en el siguiente enlace para restablecer tu contraseña: http://localhost:${port}/pages/new_password.html?token=${token}`
        };

        console.log('Opciones de correo:', mailOptions);

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error al enviar el correo:', err);
                console.log('Error detalles:', err.message, err.response);
                return res.status(500).send({ message: 'Error al enviar el enlace de restablecimiento', error: err.message });
            }

            console.log('Correo enviado:', info.response);
            res.send({ message: 'Enlace de restablecimiento enviado a tu correo' });
        });
    });
});

// Ruta para actualizar la contraseña en la base de datos
app.post('/new-password', (req, res) => {
    const { token, newPassword } = req.body;
    console.log('Token recibido:', token);
    console.log('Nueva contraseña recibida:', newPassword);

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            console.error('Error al verificar el token:', err);
            return res.status(400).send('Token no válido o expirado');
        }
        const email = decoded.email;

        console.log('Email decodificado del token:', email);

        const sql = 'UPDATE datos SET password = ? WHERE email = ?';
        db.query(sql, [newPassword, email], (err, result) => {
            if (err) {
                console.error('Error al actualizar la contraseña:', err);
                return res.status(500).send('Error al actualizar la contraseña');
            }

            console.log('Contraseña actualizada para el usuario:', email);
            res.status(200).send({ message: 'Contraseña actualizada exitosamente' });
        });
    });
});

// Capturar todos los errores no manejados
process.on('uncaughtException', (err) => {
    console.error('Excepción no controlada:', err);
});

// Capturar todas las promesas rechazadas no manejadas
process.on('unhandledRejection', (err) => {
    console.error('Promesa no controlada:', err);
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor de restablecimiento de contraseña ejecutándose en el puerto ${port}`);
});
















