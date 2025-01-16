const localVideo = document.getElementById('local-video');
const remoteVideosContainer = document.getElementById('remote-videos');
const socket = new WebSocket('ws://localhost:5000'); // Connexion WebSocket

let localStream;
let peerConnections = {}; // Connexions avec les autres utilisateurs

// Fonction pour démarrer la capture de la vidéo locale
async function startLocalVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStream = stream;
        localVideo.srcObject = stream;
    } catch (err) {
        console.error('Erreur lors de la capture de la vidéo locale', err);
    }
}

// Fonction pour mettre à jour la position de l'utilisateur
function updatePosition() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Envoyer la position via WebSocket
            socket.send(JSON.stringify({
                type: 'updatePosition',
                lat,
                lng,
            }));
        });
    }
}

// Fonction pour gérer les connexions WebRTC
async function createOffer(remoteUserId) {
    const peerConnection = new RTCPeerConnection();
    peerConnections[remoteUserId] = peerConnection;

    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.send(JSON.stringify({ type: 'offer', offer, userId: remoteUserId }));

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.send(JSON.stringify({
                type: 'candidate',
                candidate: event.candidate,
                userId: remoteUserId,
            }));
        }
    };

    peerConnection.ontrack = (event) => {
        const remoteVideo = document.createElement('video');
        remoteVideo.srcObject = event.streams[0];
        remoteVideo.autoplay = true;
        remoteVideosContainer.appendChild(remoteVideo);
    };
}

// Gérer les messages WebSocket
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const { type, offer, answer, candidate, userId } = data;

    if (type === 'offer') {
        const peerConnection = new RTCPeerConnection();
        peerConnections[userId] = peerConnection;

        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
        peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        peerConnection.createAnswer()
            .then(answer => peerConnection.setLocalDescription(answer))
            .then(() => {
                socket.send(JSON.stringify({ type: 'answer', answer: peerConnection.localDescription, userId }));
            });

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.send(JSON.stringify({
                    type: 'candidate',
                    candidate: event.candidate,
                    userId,
                }));
            }
        };

        peerConnection.ontrack = (event) => {
            const remoteVideo = document.createElement('video');
            remoteVideo.srcObject = event.streams[0];
            remoteVideo.autoplay = true;
            remoteVideosContainer.appendChild(remoteVideo);
        };
    }

    if (type === 'answer') {
        peerConnections[userId].setRemoteDescription(new RTCSessionDescription(answer));
    }

    if (type === 'candidate') {
        peerConnections[userId].addIceCandidate(new RTCIceCandidate(candidate));
    }
};

// Initialisation
startLocalVideo();
updatePosition();
setInterval(updatePosition, 5000); // Mettre à jour la position toutes les 5 secondes


const cameraButton = document.querySelector('button:nth-child(1)');
const micButton = document.querySelector('button:nth-child(2)');
const quitButton = document.querySelector('button:nth-child(3)');

// Variables de gestion des états
let cameraEnabled = true;
let micEnabled = true;

// Activer/Désactiver la caméra
cameraButton.addEventListener('click', () => {
    cameraEnabled = !cameraEnabled;
    localStream.getVideoTracks()[0].enabled = cameraEnabled;
    cameraButton.classList.toggle('bg-red-600', !cameraEnabled);
    cameraButton.classList.toggle('bg-blue-600', cameraEnabled);
});

// Activer/Désactiver le micro
micButton.addEventListener('click', () => {
    micEnabled = !micEnabled;
    localStream.getAudioTracks()[0].enabled = micEnabled;
    micButton.classList.toggle('bg-red-600', !micEnabled);
    micButton.classList.toggle('bg-blue-600', micEnabled);
});

// Quitter la session
quitButton.addEventListener('click', () => {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    Object.values(peerConnections).forEach(pc => pc.close());
    peerConnections = {};
    alert('Vous avez quitté la session.');
    location.reload(); // Recharge la page pour repartir à zéro
});
