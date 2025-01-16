const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const port = 5000;

// Créer un serveur HTTP
const server = http.createServer(app);

// Créer un serveur WebSocket
const wss = new WebSocket.Server({ server });

// Utiliser Express pour servir les fichiers statiques
app.use(express.static('./'));

// Stocker les connexions des utilisateurs
let users = {};

// Gestion des connexions WebSocket
wss.on('connection', (ws) => {
    console.log('Un utilisateur est connecté.');

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'updatePosition':
                // Mise à jour de la position d'un utilisateur
                const { lat, lng } = data;
                users[ws] = { lat, lng };

                // Envoyer les mises à jour à tous les autres utilisateurs
                for (const client of wss.clients) {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'updatePosition',
                            userId: ws._socket.remoteAddress,
                            lat,
                            lng,
                        }));
                    }
                }
                break;

            case 'offer':
            case 'answer':
            case 'candidate':
                // Relayer les messages WebRTC à l'utilisateur cible
                for (const client of wss.clients) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(data));
                    }
                }
                break;

            default:
                console.log('Message inconnu reçu:', data);
        }
    });

    ws.on('close', () => {
        console.log('Un utilisateur a quitté.');
        delete users[ws];
    });
});

// Démarrer le serveur Express
server.listen(port, () => {
    console.log(`Serveur express en écoute sur http://localhost:${port}`);
});
