// Récupération des éléments HTML par leur ID
const chatbox = document.getElementById('chatbox');
const messageInput = document.getElementById('message');
const chatInterface = document.getElementById('chatInterface');
const usernameInput = document.getElementById('username');

let socket;
let username;

/**
 * Récupère l'URL du serveur WebSocket dynamiquement
 */
async function getWebSocketUrl() {
    try {
        const response = await fetch('/config');
        const data = await response.json();
        return data.wsServer;
    } catch (error) {
        console.error('Erreur lors de la récupération de la config:', error);
        return null;
    }
}

/**
 * Fonction appelée lorsque l'utilisateur rejoint le chat.
 */
async function joinChat() {
    username = usernameInput.value.trim();
    if (!username) {
        alert('Veuillez entrer un pseudo');
        return;
    }

    const serverUrl = await getWebSocketUrl();
    if (!serverUrl) {
        alert("Impossible de récupérer l'URL du serveur WebSocket");
        return;
    }

    // Initialisation de la connexion WebSocket
    socket = new WebSocket(serverUrl);

    socket.onopen = () => {
        console.log('Connecté au serveur WebSocket');
        chatInterface.style.display = 'block';
        usernameInput.parentElement.style.display = 'none';
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const message = document.createElement('div');
        const timestamp = new Date().toLocaleTimeString();

        message.innerHTML = `<strong>${data.sender}</strong> [${timestamp}] : ${data.content}`;
        chatbox.appendChild(message);
        chatbox.scrollTop = chatbox.scrollHeight;
    };

    socket.onclose = () => {
        console.log('Connexion fermée');
        alert('Connexion au serveur perdue');
    };
}

/**
 * Fonction appelée pour envoyer un message.
 */
function sendMessage() {
    const content = messageInput.value.trim();
    if (!content) return;

    const message = {
        sender: username,
        content: content
    };

    socket.send(JSON.stringify(message));
    messageInput.value = '';
}
