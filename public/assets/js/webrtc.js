let localStream;
let peer;
const videoCallContainer = document.getElementById('videoCallContainer');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

async function setupMediaStream() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        localVideo.srcObject = localStream;
    } catch (err) {
        console.error('Error accessing media devices:', err);
    }
}

function initiateCall(targetUserId) {
    videoCallContainer.classList.remove('hidden');
    setupMediaStream().then(() => {
        peer = new SimplePeer({
            initiator: true,
            stream: localStream
        });

        setupPeerEvents(peer, targetUserId);
    });
}

function receiveCall(signal, fromUserId) {
    videoCallContainer.classList.remove('hidden');
    setupMediaStream().then(() => {
        peer = new SimplePeer({
            initiator: false,
            stream: localStream
        });

        peer.signal(signal);
        setupPeerEvents(peer, fromUserId);
    });
}

function setupPeerEvents(peer, targetUserId) {
    peer.on('signal', data => {
        socketConnection.emit('signal', {
            target: targetUserId,
            signal: data
        });
    });

    peer.on('stream', stream => {
        remoteVideo.srcObject = stream;
    });

    peer.on('error', err => console.error('Peer error:', err));

    peer.on('close', () => {
        cleanupCall();
    });
}

function cleanupCall() {
    if (peer) {
        peer.destroy();
        peer = null;
    }
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
    videoCallContainer.classList.add('hidden');
}

// Event Listeners
document.getElementById('closeCall').addEventListener('click', cleanupCall);
document.getElementById('toggleAudio').addEventListener('click', () => {
    const audioTrack = localStream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
    document.getElementById('toggleAudio').classList.toggle('bg-red-500');
});

document.getElementById('toggleVideo').addEventListener('click', () => {
    const videoTrack = localStream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
    document.getElementById('toggleVideo').classList.toggle('bg-red-500');
});

document.getElementById('endCall').addEventListener('click', cleanupCall);

// socketConnection events for WebRTC signaling
socketConnection.on('signal', ({ signal, from }) => {
    if (peer) {
        peer.signal(signal);
    } else {
        receiveCall(signal, from);
    }
});