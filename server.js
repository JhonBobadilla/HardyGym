const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const dotenv = require('dotenv');
const session = require('express-session');
const jwt = require('jsonwebtoken');
dotenv.config();
const app = express();
const port = process.env.PORT || 8080;
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
app.use(express.static(path.join(__dirname)));

// Conexión a la base de datos
let db;

function handleDisconnect() {
    db = mysql.createConnection(process.env.JAWSDB_URL);

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
            res.json({ success: true, redirectUrl: 'http://localhost:3000/pages/pago_suscripcion.html' });
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
                return res.json({ redirectUrl: 'http://localhost:3000/pages/pago_suscripcion.html' });
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

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor ejecutándose en el puerto ${port}`);
});
