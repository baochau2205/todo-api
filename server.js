require("dotenv").config();
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const app = require('./app');

const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: CLIENT_URL },
});
app.set('io', io);

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
        try {
            socket.user = jwt.verify(token, process.env.JWT_SECRET);
        } catch { }
    }
    next();
});

io.on('connection', (socket) => {
    console.log('connected', socket.id, socket.user?.email ?? 'guest');
    if (socket.user) socket.join(`user:${socket.user.id}`);
    socket.on('disconnect', () => console.log('disconnected', socket.id));
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));