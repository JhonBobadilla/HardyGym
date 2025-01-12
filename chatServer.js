import express from 'express';
import logger from 'morgan';
import dotenv from 'dotenv';
import { Client } from 'pg'; // Importamos la librería para PostgreSQL
import { Server } from 'socket.io';
import { createServer } from 'node:http';

dotenv.config();

const port = process.env.PORT ?? 3000;
const app = express();
const server = createServer(app);
const io = new Server(server, { connectionStateRecovery: {} });

// Conexión a la base de datos PostgreSQL
const db = new Client({
  connectionString: 'postgres://u7lk2rav6e1ko2:p3f4ed7a54b68554467acefe46529129a11c92ea34105c5d161c62916dc3422aa@c3nv2ev86aje4j.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/d29avlllbhcs77'
});

db.connect() // Establece la conexión a la base de datos

await db.query(`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY, 
    content TEXT, 
    user TEXT, 
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  )
`);

io.on('connection', async (socket) => {
  console.log('a user has connected!');

  socket.on('disconnect', () => {
    console.log('a user has disconnected!');
  });

  socket.on('chat message', async (msg) => {
    let result;
    const username = socket.handshake.auth.username ?? 'anonymous';
    console.log({ username });

    try {
      // Insertamos el mensaje en la base de datos PostgreSQL
      result = await db.query(
        'INSERT INTO chat_messages (content, user) VALUES ($1, $2) RETURNING id',
        [msg, username]
      );
    } catch (e) {
      console.error(e);
      return;
    }

    io.emit('chat message', msg, result.rows[0].id.toString(), username);
  });

  socket.on('private message', (msg, toUsername) => {
    const fromUsername = socket.handshake.auth.username ?? 'anonymous';
    const targetSocket = Array.from(io.sockets.sockets.values()).find(s => s.handshake.auth.username === toUsername);
    if (targetSocket) {
      targetSocket.emit('private message', msg, fromUsername);
    }
  });

  if (!socket.recovered) {
    try {
      const result = await db.query(
        'SELECT id, content, user FROM chat_messages WHERE id > $1',
        [socket.handshake.auth.serverOffset ?? 0]
      );

      result.rows.forEach(row => {
        socket.emit('chat message', row.content, row.id.toString(), row.user);
      });
    } catch (e) {
      console.error(e);
    }
  }
});

app.use(logger('dev'));
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/pages/chat.html');
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
