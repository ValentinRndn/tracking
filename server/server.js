require('dotenv').config();  
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 5000;  
const hostUrl = process.env.HOST_URL || 'localhost';  

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

app.get('/config', (req, res) => {
    res.json({ wsServer: process.env.WS_SERVER });
});

app.use(express.static('./'));

let users = {};

wss.on('connection', (ws) => {
    console.log('Un utilisateur est connecté.');

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'updatePosition':
                const { lat, lng } = data;
                users[ws] = { lat, lng };

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

server.listen(port, () => {
    console.log(`Serveur express en écoute sur http://${hostUrl}:${port}`);
});
