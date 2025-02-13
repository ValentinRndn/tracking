const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Middleware CORS pour Express
app.use(cors());

// Options CORS plus permissives
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

app.use(express.static(path.join(__dirname, '../public')));

// Configuration Socket.IO
const io = new Server(server, {
    cors: {
        origin: "http://127.0.0.1:5500",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["*"],
        credentials: true,
    },
    transport: ['websocket', 'polling']
});

app.use(express.static(path.join(__dirname, '../public')));

const users = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    users.set(socket.id, { id: socket.id });

    socket.on('updateLocation', ({ userId, location }) => {
        if (users.has(userId)) {
            users.get(userId).location = location;
            io.emit('usersUpdate', Array.from(users.values()));
        }
    });

    socket.on('signal', ({ target, signal }) => {
        io.to(target).emit('signal', {
            signal,
            from: socket.id
        });
    });

    socket.on('disconnect', () => {
        users.delete(socket.id);
        io.emit('usersUpdate', Array.from(users.values()));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
