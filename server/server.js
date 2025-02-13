require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;
const hostUrl = process.env.HOST_URL || '0.0.0.0'; // Écouter sur toutes les interfaces

const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

let users = new Map(); // Stocker les utilisateurs avec un Map (plus sécurisé)

// Gestion de l'upgrade HTTP -> WebSocket
server.on('upgrade', (request, socket, head) => {
    if (request.url === '/ws') {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});

// Servir les fichiers statiques du client
app.use(express.static('/var/www/tracking/client'));

// Route pour obtenir la config WebSocket
app.get('/config', (req, res) => {
    res.json({ wsServer: process.env.WS_SERVER || 'wss://valentin.renaudin.caen.mds-project.fr/ws' });
});

// Redirection vers index.html pour les autres routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join('/var/www/tracking/client', 'index.html'));
});

// WebSocket - Gestion des connexions
wss.on('connection', (ws, request) => {
    const userId = request.socket.remoteAddress;
    console.log(`🔵 Utilisateur connecté : ${userId}`);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'updatePosition':
                    users.set(ws, { lat: data.lat, lng: data.lng });

                    // Diffuser la position à tous les clients sauf l'expéditeur
                    wss.clients.forEach(client => {
                        if (client !== ws && client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'updatePosition',
                                userId,
                                lat: data.lat,
                                lng: data.lng,
                            }));
                        }
                    });
                    break;

                case 'offer':
                case 'answer':
                case 'candidate':
                    // Relayer directement les messages WebRTC
                    wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify(data));
                        }
                    });
                    break;

                default:
                    console.warn(`⚠️ Message inconnu reçu :`, data);
            }
        } catch (err) {
            console.error('❌ Erreur WebSocket:', err);
        }
    });

    ws.on('close', () => {
        console.log(`🔴 Utilisateur déconnecté : ${userId}`);
        users.delete(ws);
    });
});

// Démarrer le serveur
server.listen(port, hostUrl, () => {
    console.log(`✅ Serveur en écoute sur http://${hostUrl}:${port}`);
});
