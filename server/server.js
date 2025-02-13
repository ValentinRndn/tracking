require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;
const hostUrl = process.env.HOST_URL || 'localhost';

const server = http.createServer(app);

// Initialiser WebSocket sur /ws
const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', (request, socket, head) => {
    if (request.url === '/ws') {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});

// Définir le dossier client comme public
app.use(express.static('/var/www/tracking/client'));

// Route spécifique pour config
app.get('/config', (req, res) => {
    res.json({ wsServer: process.env.WS_SERVER || 'wss://valentin.renaudin.caen.mds-project.fr/ws' });
});


// Rediriger toutes les autres requêtes vers index.html
app.get('*', (req, res) => {
    res.sendFile(path.join('/var/www/tracking/client', 'index.html'));
});

let users = {};

wss.on('connection', (ws) => {
    console.log('Un utilisateur est connecté.');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'updatePosition':
                    for (const client of wss.clients) {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'updatePosition',
                                userId: ws._socket.remoteAddress,
                                lat: data.lat,
                                lng: data.lng,
                            }));
                        }
                    }
                    break;

                case 'offer':
                case 'answer':
                case 'candidate':
                    for (const client of wss.clients) {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify(data));
                        }
                    }
                    break;

                default:
                    console.log('Message inconnu reçu:', data);
            }
        } catch (err) {
            console.error('Erreur WebSocket:', err);
        }
    });

    ws.on('close', () => {
        console.log('Un utilisateur a quitté.');
    });
});

server.on('upgrade', (request, socket, head) => {
    if (request.url === '/ws') {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});



server.listen(port, () => {
    console.log(`Serveur en écoute sur http://${hostUrl}:${port}`);
});
