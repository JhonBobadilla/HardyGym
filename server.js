const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const dotenv = require('dotenv');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
const secretKey = process.env.SECRET_KEY || 'tu_secreto';

// Middleware de sesión
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true
}));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Conexión a la base de datos
let db;

function handleDisconnect() {
    db = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    db.connect(function(err) {
        if (err) {
            console.error('Error connecting to MySQL database:', err);
            setTimeout(handleDisconnect, 2000); // Intentar reconectar después de 2 segundos
        } else {
            console.log('Conectado a la base de datos MySQL');
        }
    });

    db.on('error', function(err) {
        console.error('MySQL error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

//hasta aqui se puede borrar en caso que no se requiera lo usa heroku

// Ruta para la página de inicio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//hasta aqui eso lo usa heroku

// Ruta para registrar nuevos usuarios
app.post('/register', (req, res) => {
    const { nombre, email, password, telefono, ciudad } = req.body;
    console.log('Datos recibidos para registro:', req.body);

    const sql = 'INSERT INTO datos (nombre, email, password, telefono, ciudad) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nombre, email, password, telefono, ciudad], (err, result) => {
        if (err) {
            console.error('Error al registrar usuario:', err);
            res.status(500).json({ error: 'Error al registrar usuario' });
        } else {
            res.json({ success: true, redirectUrl: 'https://hardy-2839d6e03ba8.herokuapp.com/pages/pago_suscripcion.html' });
        }
    });
});

// Ruta para recibir notificaciones de PayU
app.post('/webhook-payu', (req, res) => {
    const { transaction } = req.body;
    if (transaction.state === 'APPROVED') {
        const userId = transaction.reference;
        const subscriptionStartDate = new Date();

        const sql = 'UPDATE datos SET subscription_start_date = ? WHERE id = ?';
        db.query(sql, [subscriptionStartDate, userId], (err, result) => {
            if (err) {
                console.error('Error al actualizar la suscripción:', err);
                res.status(500).send('Error al actualizar la suscripción');
            } else {
                console.log(`Suscripción renovada para el usuario ID: ${userId}`);
                res.sendStatus(200);
            }
        });
    } else {
        res.sendStatus(400);
    }
});

// Ruta para actualizar la suscripción desde la página de confirmación
app.post('/update-subscription', (req, res) => {
    const { reference } = req.body;
    const subscriptionStartDate = new Date();

    const sql = 'UPDATE datos SET subscription_start_date = ? WHERE id = ?';
    db.query(sql, [subscriptionStartDate, reference], (err, result) => {
        if (err) {
            console.error('Error al actualizar la suscripción:', err);
            res.status(500).send({ success: false });
        } else {
            console.log(`Suscripción renovada para el usuario ID: ${reference}`);
            res.send({ success: true });
        }
    });
});

// Ruta para verificar el pago
app.post('/verify-payment', (req, res) => {
    const { reference } = req.body;

    fakeVerifyPayment(reference, (error, paymentStatus) => {
        if (error) {
            console.error('Error al verificar el pago:', error);
            return res.status(500).send({ success: false });
        }

        if (paymentStatus === 'APPROVED') {
            const subscriptionStartDate = new Date();

            const sql = 'UPDATE datos SET subscription_start_date = ? WHERE id = ?';
            db.query(sql, [subscriptionStartDate, reference], (err, result) => {
                if (err) {
                    console.error('Error al actualizar la suscripción:', err);
                    res.status(500).send({ success: false });
                } else {
                    console.log(`Suscripción renovada para el usuario ID: ${reference}`);
                    res.send({ success: true });
                }
            });
        } else {
            res.send({ success: false });
        }
    });
});

// Rutas de autenticación
app.post('/login', (req, res) => {
    const { txtemail, txtpassword } = req.body;
    console.log('Datos recibidos para login:', txtemail, txtpassword);

    const sql = "SELECT * FROM datos WHERE email = ? AND password = ?";
    db.query(sql, [txtemail, txtpassword], (err, results) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }
        console.log('Resultados de la consulta SQL:', results);

        if (results.length > 0) {
            const user = results[0];
            const currentDate = new Date();
            const subscriptionEndDate = new Date(user.subscription_start_date);
            subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);

            console.log('Fecha de suscripción:', subscriptionEndDate);
            console.log('Fecha actual:', currentDate);

            if (currentDate <= subscriptionEndDate) {
                const token = jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn: '1h' });
                console.log('Usuario autenticado, generando token');
                return res.json({ token });
            } else {
                console.log('Suscripción expirada, redirigiendo a la página de pago');
                return res.json({ redirectUrl: 'https://hardy-2839d6e03ba8.herokuapp.com/pages/pago_suscripcion.html' });
            }
        } else {
            console.log('Credenciales inválidas: No se encontró ningún usuario con esas credenciales');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
    });
});

// Middleware de autenticación para rutas protegidas
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token no válido' });
        }
        req.user = user;
        next();
    });
}

// Ruta para obtener el userId
app.get('/getUserId', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const sql = 'SELECT nombre FROM datos WHERE id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error al obtener el nombre del usuario:', err);
            return res.status(500).json({ message: 'Error al obtener el nombre del usuario' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ userId: userId, nombre: results[0].nombre });
    });
});


// Rutas para guardar y obtener el progreso
app.post('/saveProgress', authenticateToken, (req, res) => {
    const { userId, videoId, progress } = req.body;
    let sql = 'INSERT INTO video_progress (user_id, video_id, progress) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE progress = ?';
    db.query(sql, [userId, videoId, progress, progress], (err, result) => {
        if (err) {
            console.error('Error guardando el progreso:', err);
            return res.status(500).json({ message: 'Error guardando el progreso' });
        }
        res.json({ message: 'Progreso guardado' });
    });
});

app.get('/getProgress/:userId/:videoId', authenticateToken, (req, res) => {
    const { userId, videoId } = req.params;
    let sql = 'SELECT progress FROM video_progress WHERE user_id = ? AND video_id = ?';
    db.query(sql, [userId, videoId], (err, results) => {
        if (err) {
            console.error('Error obteniendo el progreso:', err);
            return res.status(500).json({ message: 'Error obteniendo el progreso' });
        }
        const progress = results.length ? results[0].progress : 0;
        res.json({ progress });
    });
});

// Ejemplo de ruta protegida
app.get('/protected', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'protected.html'));
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
    } else {
        console.log('Transportador de correo está listo para enviar mensajes');
    }
});


// Ruta para enviar el enlace de restablecimiento de contraseña
app.post('/reset-password', (req, res) => {
    const { email } = req.body;

    console.log('Solicitud para restablecer contraseña recibida para:', email);

    const sql = 'SELECT * FROM datos WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Error al verificar el correo en la base de datos:', err);
            return res.status(500).json({ message: 'Error al verificar el correo' });
        }

        if (results.length === 0) {
            console.log('Correo no registrado:', email);
            return res.status(400).json({ message: 'El correo no está registrado' });
        }

        const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
        console.log('Token generado:', token);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Enlace para restablecer tu contraseña',
            text: `Haz clic en el siguiente enlace para restablecer tu contraseña: https://hardy-2839d6e03ba8.herokuapp.com/pages/new_password.html?token=${token}`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error al enviar el correo:', err);
                return res.status(500).json({ message: 'Error al enviar el enlace de restablecimiento', error: err.message });
            }

            console.log('Correo enviado:', info.response);
            res.json({ message: 'Enlace de restablecimiento enviado a tu correo' });
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
    console.log(`Servidor ejecutándose en el puerto ${port}`);
});
