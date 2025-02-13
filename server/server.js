// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);

// Configuration CORS
app.use(cors({
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST"],
    credentials: true
}));

// Configuration Socket.IO
const io = new Server(server, {
    cors: {
        origin: "http://127.0.0.1:5500",
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['polling', 'websocket'],
    pingTimeout: 60000,
    pingInterval: 25000
});

// Test route
app.get('/', (req, res) => {
    res.send('Server is running');
});

const users = new Map();

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

        // Ajoutez l'utilisateur à la Map
        users.set(socket.id, { id: socket.id });
    
        // Émettez immédiatement la mise à jour des utilisateurs
        console.log('Emitting usersUpdate event after connection', Array.from(users.values()));
        io.emit('usersUpdate', Array.from(users.values()));

    socket.on('updateLocation', ({ userId, location }) => {
        if (users.has(userId)) {
            users.get(userId).location = location;
            console.log('Emitting usersUpdate event after location update', Array.from(users.values()));
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
        console.log('Client disconnected:', socket.id);
        users.delete(socket.id);
        io.emit('usersUpdate', Array.from(users.values()));
    });

    // Gestion des erreurs
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Gestion des erreurs serveur
server.on('error', (error) => {
    console.error('Server error:', error);

});