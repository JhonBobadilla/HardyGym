const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const session = require('express-session');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
const secretKey = process.env.SECRET_KEY || 'tu_secreto';

// Configuración de la conexión a la base de datos PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

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

pool.on('connect', () => {
    console.log('Conectado a la base de datos PostgreSQL');
});

pool.on('error', (err) => {
    console.error('Error en la conexión a PostgreSQL:', err);
    if (err.code === 'ECONNRESET') {
        // Intentar reconectar
        console.error('Reconectando a la base de datos PostgreSQL...');
        handleDisconnect();
    } else {
        throw err;
    }
});

function handleDisconnect() {
    pool.connect((err) => {
        if (err) {
            console.error('Error connecting to PostgreSQL database:', err);
            setTimeout(handleDisconnect, 2000); // Intentar reconectar después de 2 segundos
        }
    });
}

handleDisconnect();

// Ruta para la página de inicio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Ruta para registrar nuevos usuarios
app.post('/register', async (req, res) => {
    const { nombre, email, password, telefono, ciudad } = req.body;
    console.log('Datos recibidos para registro:', req.body);

    const sql = `INSERT INTO datos (nombre, email, password, telefono, ciudad) 
                VALUES ($1, $2, $3, $4, $5) RETURNING id`;
    try {
        const result = await pool.query(sql, [nombre, email, password, telefono, ciudad]);
        res.json({ success: true, redirectUrl: 'https://hardy-2839d6e03ba8.herokuapp.com/pages/pago_suscripcion.html' });
    } catch (err) {
        console.error('Error al registrar usuario:', err);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});



// Ruta para recibir notificaciones de PayU
/*app.post('/webhook-payu', async (req, res) => {
    const { transaction } = req.body;
    if (transaction.state === 'APPROVED') {
        const userId = transaction.reference;
        const subscriptionStartDate = new Date();

        const sql = 'UPDATE datos SET subscription_start_date = $1 WHERE id = $2';
        try {
            const result = await pool.query(sql, [subscriptionStartDate, userId]);
            console.log(`Suscripción renovada para el usuario ID: ${userId}`);
            res.sendStatus(200);
        } catch (err) {
            console.error('Error al actualizar la suscripción:', err);
            res.status(500).send('Error al actualizar la suscripción');
        }
    } else {
        res.sendStatus(400);
    }
});*/

// Rutas de autenticación

app.post('/login', async (req, res) => {
    const { txtemail, txtpassword } = req.body;
    console.log('Datos recibidos para login:', txtemail, txtpassword);

    const sql = "SELECT * FROM datos WHERE email = $1 AND password = $2";
    try {
        const results = await pool.query(sql, [txtemail, txtpassword]);
        console.log('Resultados de la consulta SQL:', results.rows);

        if (results.rows.length > 0) {
            const user = results.rows[0];
            const currentDate = new Date();
            const subscriptionEndDate = new Date(user.subscription_start_date);
            subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);

            console.log('Fecha de suscripción:', subscriptionEndDate);
            console.log('Fecha actual:', currentDate);

            if (currentDate <= subscriptionEndDate) {
                const token = jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn: '1h' });
                console.log('Usuario autenticado, generando token');
                
                // Guardar el userId y el correo del usuario en la sesión
                req.session.userId = user.id;  // Almacenar el userId en la sesión
                req.session.email = user.email;  // Almacenar el correo en la sesión
                console.log('ID del usuario almacenado en la sesión:', user.id);

                return res.json({ token, userId: user.id });
            } else {
                console.log('Suscripción expirada, redirigiendo a la página de pago');
                return res.json({ redirectUrl: 'https://hardy-2839d6e03ba8.herokuapp.com/pages/pago_suscripcion.html' });
            }
        } else {
            console.log('Credenciales inválidas: No se encontró ningún usuario con esas credenciales');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
    } catch (err) {
        console.error('Error en la consulta SQL:', err);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
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
app.get('/getUserId', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    const sql = 'SELECT nombre FROM datos WHERE id = $1';
    try {
        const results = await pool.query(sql, [userId]);
        console.log('Resultados de la consulta SQL:', results.rows);

        if (results.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ userId: userId, nombre: results.rows[0].nombre });
    } catch (err) {
        console.error('Error al obtener el nombre del usuario:', err);
        return res.status(500).json({ message: 'Error al obtener el nombre del usuario' });
    }
});

// Ruta para solicitar el restablecimiento de la contraseña
const nodemailer = require('nodemailer');

app.post('/request-password-reset', async (req, res) => {
    const { email } = req.body;
    const sql = 'SELECT * FROM datos WHERE email = $1';

    try {
        const results = await pool.query(sql, [email]);
        console.log('Resultados de la consulta SQL:', results.rows);

        if (results.rows.length > 0) {
            const user = results.rows[0];
            const token = jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn: '1h' });
            // Enviar el token al correo del usuario
            sendPasswordResetEmail(user.email, token);
            res.json({ success: true, message: 'Correo de restablecimiento de contraseña enviado' });
        } else {
            res.status(404).json({ error: 'Correo no encontrado' });
        }
    } catch (err) {
        console.error('Error en la consulta SQL:', err);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Ruta para actualizar la contraseña
app.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) {
            return res.status(400).json({ error: 'Token inválido o expirado' });
        }

        const sql = 'UPDATE datos SET password = $1 WHERE id = $2';
        try {
            await pool.query(sql, [newPassword, decoded.id]);
            res.json({ success: true, message: 'Contraseña restablecida correctamente' });
        } catch (err) {
            console.error('Error al actualizar la contraseña:', err);
            return res.status(500).json({ error: 'Error al actualizar la contraseña' });
        }
    });
});



/////////////////////////////////////ruta de las compras////////////////////////////////////////////////////



app.post('/registrar-compra', async (req, res) => {
    console.log('Datos recibidos:', req.body);  // Log para verificar los datos recibidos

    const userId = req.session.userId;  // Obtener el ID del usuario desde la sesión
    console.log('userId de la sesión:', userId);  // Añadir log para verificar el userId

    const { email, articulos } = req.body;
    console.log('Correo electrónico:', email);  // Añadir log para verificar el correo
    console.log('Artículos:', articulos);  // Añadir log para verificar los artículos

    // Validar los datos
    if (!userId || !email || !articulos || articulos.length === 0) {
        console.log('Datos incompletos:', { userId, email, articulos });  // Añadir log para verificar los datos incompletos
        return res.status(400).json({ error: 'Datos incompletos para registrar la compra' });
    }

    try {
        const valorTotal = articulos.reduce((total, articulo) => total + articulo.valor, 0);
        const sql = `INSERT INTO compras (usuario_email, articulo, cantidad, valor, valor_total) VALUES ($1, $2, $3, $4, $5)`;

        for (const articulo of articulos) {
            console.log('Artículo a insertar:', {
                email,
                nombre: articulo.nombre,
                cantidad: articulo.cantidad,
                valor: articulo.valor,
                valorTotal
            });  // Log para verificar el artículo antes de la inserción
            await pool.query(sql, [email, articulo.nombre, articulo.cantidad, articulo.valor, valorTotal]);
        }

        res.json({ success: true, message: 'Compra registrada con éxito' });
    } catch (err) {
        console.error('Error al registrar la compra:', err);
        res.status(500).json({ error: 'Error al registrar la compra' });
    }
});





/////////////////////////////////////fin ruta de las compras/////////////////////////////////////////////////




// Función para enviar el correo de restablecimiento de contraseña
function sendPasswordResetEmail(email, token) {
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Usa tu servicio de correo electrónico
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Restablecimiento de contraseña',
        text: `Haz clic en el siguiente enlace para restablecer tu contraseña: https://hardy-2839d6e03ba8.herokuapp.com/pages/new_password.html?token=${token}`
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Error al enviar el correo:', err);
        } else {
            console.log('Correo enviado:', info.response);
        }
    });
}

/* ----------------------------barra de progreso --------------------*/

// Guardar el progreso del video
app.post('/save-progress', authenticateToken, async (req, res) => {
    const { video_id, progress } = req.body;
    const userId = req.user.id;

    const sql = `
        INSERT INTO video_progress (user_id, video_id, progress)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, video_id)
        DO UPDATE SET progress = $3`;
    try {
        await pool.query(sql, [userId, video_id, progress]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error al guardar el progreso:', err);
        return res.status(500).json({ error: 'Error al guardar el progreso' });
    }
});

// Obtener el progreso de todos los videos para un usuario
app.get('/get-progress', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    const sql = 'SELECT video_id, progress FROM video_progress WHERE user_id = $1';
    try {
        const results = await pool.query(sql, [userId]);
        res.json(results.rows);
    } catch (err) {
        console.error('Error al obtener el progreso:', err);
        return res.status(500).json({ error: 'Error al obtener el progreso' });
    }
});

/*----------------------------barra de progreso hasta aquí --------------------*/


// Ejemplo de ruta protegida

// Ruta para obtener solo el correo del usuario
app.get('/get-email', authenticateToken, (req, res) => {
    const userEmail = req.session.email;  // Obtener el correo del usuario desde la sesión
    res.json({ email: userEmail });
});

// Ruta para obtener el perfil completo del usuario
app.get('/profile', authenticateToken, (req, res) => {
    const userEmail = req.session.email;  // Obtener el correo del usuario desde la sesión
    res.json({ message: `Perfil del usuario: ${userEmail}` });
});




// Iniciar el servidor principal de la app
app.listen(port, () => {
    console.log(`Servidor ejecutándose en el puerto ${port}`);
});







