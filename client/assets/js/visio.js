let socket;
let reconnectInterval = 5000; // 5 secondes

function connectWebSocket() {
    fetch('/config')
        .then(response => response.json())
        .then(config => {
            console.log('Connexion WebSocket à :', config.wsServer);
            socket = new WebSocket(config.wsServer);

            socket.onopen = () => {
                console.log('WebSocket connecté avec succès.');
            };

            socket.onerror = (error) => {
                console.error('Erreur WebSocket:', error);
            };

            socket.onclose = () => {
                console.warn('WebSocket fermé. Tentative de reconnexion dans 5 secondes...');
                setTimeout(connectWebSocket, reconnectInterval);
            };
        })
        .catch(error => {
            console.error('Erreur lors de la récupération de la configuration WebSocket:', error);
        });
}

// Vérifier avant d'envoyer un message
function sendMessage(data) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
    } else {
        console.warn('Impossible d\'envoyer le message, WebSocket non connecté.');
    }
}

// Lancer la connexion WebSocket
connectWebSocket();
