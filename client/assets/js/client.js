// Récupération des éléments HTML par leur ID
const chatbox = document.getElementById('chatbox'); // Zone d'affichage des messages
const messageInput = document.getElementById('message'); // Champ pour saisir un message
const chatInterface = document.getElementById('chatInterface'); // Interface principale du chat
const usernameInput = document.getElementById('username'); // Champ pour entrer le pseudo

// Variables globales
const serverUrl = 'localhost:8080'; // URL du serveur WebSocket
let socket; // Instance du WebSocket pour la communication avec le serveur
let username; // Stocke le pseudo de l'utilisateur

/**
 * Fonction appelée lorsque l'utilisateur rejoint le chat.
 * Vérifie que le pseudo est saisi, puis initialise une connexion WebSocket.
 */
function joinChat() {
    username = usernameInput.value.trim(); // Supprime les espaces inutiles
    if (!username) {
        // Alerte si le pseudo n'est pas fourni
        alert('Veuillez entrer un pseudo');
        return;
    }

    // Initialisation d'une connexion WebSocket au serveur
    socket = new WebSocket('ws://' + serverUrl);

    // Événement déclenché lorsque la connexion WebSocket est ouverte
    socket.onopen = () => {
        console.log('Connecté au serveur WebSocket');

        // Afficher l'interface principale du chat
        chatInterface.style.display = 'block';

        // Masquer l'input pour le pseudo après validation
        usernameInput.parentElement.style.display = 'none';
    };

    // Événement déclenché lorsque le serveur envoie un message
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data); // Analyse le message JSON reçu
        const message = document.createElement('div'); // Crée un nouvel élément `div` pour afficher le message
        const timestamp = new Date(data.timestamp).toLocaleTimeString(); // Formate l'horodatage en heure lisible

        // Ajoute le message avec le format : "Pseudo [hh:mm:ss] : Contenu"
        message.innerHTML = `<strong>${data.sender}</strong> [${timestamp}] : ${data.content}`;
        chatbox.appendChild(message); // Ajoute le message à la boîte de chat
        chatbox.scrollTop = chatbox.scrollHeight; // Fait défiler automatiquement vers le bas
    };

    // Événement déclenché lorsque la connexion WebSocket est fermée
    socket.onclose = () => {
        console.log('Connexion fermée');
        // Affiche une alerte pour indiquer que la connexion est perdue
        alert('Connexion au serveur perdue');
    };
}

/**
 * Fonction appelée pour envoyer un message.
 * Vérifie que le message n'est pas vide, puis l'envoie au serveur.
 */
function sendMessage() {
    const content = messageInput.value.trim(); // Supprime les espaces inutiles autour du message
    if (!content) return; // Ne rien faire si le champ est vide

    // Crée un objet message contenant le pseudo et le contenu
    const message = {
        sender: username, // Ajoute le pseudo de l'utilisateur
        content: content // Ajoute le contenu du message
    };

    // Envoie le message au serveur après l'avoir converti en JSON
    socket.send(JSON.stringify(message));

    // Réinitialise le champ de saisie après l'envoi
    messageInput.value = '';
}
