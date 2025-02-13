require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;
// On écoute sur toutes les interfaces, ce qui permet à Nginx d'accéder à l'application
const hostUrl = '0.0.0.0';

const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

let users = new Map(); // Stocker les utilisateurs de manière sécurisée

// Gestion de l'upgrade HTTP -> WebSocket (pour la route "/ws")
server.on('upgrade', (request, socket, head) => {
    if (request.url === '/ws') {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});

// Servir les fichiers statiques du client (situés dans /var/www/tracking/client)
app.use(express.static('/var/www/tracking/client'));

// Route pour obtenir la configuration WebSocket (doit renvoyer du JSON)
app.get('/config', (req, res) => {
    res.json({ wsServer: process.env.WS_SERVER || 'wss://valentin.renaudin.caen.mds-project.fr/ws' });
});

// Pour toutes les autres routes, renvoyer index.html (pour une application SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join('/var/www/tracking/client', 'index.html'));
});

// Gestion des connexions WebSocket
wss.on('connection', (ws, request) => {
    const userId = request.socket.remoteAddress;
    console.log(`🔵 Utilisateur connecté : ${userId}`);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'updatePosition':
                    users.set(ws, { lat: data.lat, lng: data.lng });
                    // Diffuser à tous les clients sauf l'émetteur
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
                    // Relayer les messages WebRTC à tous les clients
                    wss.clients.forEach(client => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify(data));
                        }
                    });
                    break;
                default:
                    console.warn('⚠️ Message inconnu reçu :', data);
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

// Démarrer le serveur sur 0.0.0.0
server.listen(port, hostUrl, () => {
    console.log(`✅ Serveur en écoute sur http://${hostUrl}:${port}`);
});
