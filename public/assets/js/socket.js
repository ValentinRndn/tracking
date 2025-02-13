// socket.js
const socketConnection = io('http://localhost:3000', {
    withCredentials: true,
    extraHeaders: {
        "Access-Control-Allow-Origin": "*"
    }
});

// Exportons socket pour l'utiliser dans les autres fichiers
window.socketConnection = socketConnection;

socketConnection.on('connect', () => {
    document.getElementById('connectionStatus').classList.replace('text-red-500', 'text-green-500');
});

socketConnection.on('disconnect', () => {
    document.getElementById('connectionStatus').classList.replace('text-green-500', 'text-red-500');
});

socketConnection.on('usersUpdate', (users) => {
    document.getElementById('userCount').textContent = `${users.length} utilisateurs`;
    
    // Update markers
    users.forEach(user => {
        if (user.location) {
            updateUserMarker(user.id, user.location);
        }
    });

    // Remove disconnected users
    markers.forEach((marker, userId) => {
        if (!users.find(u => u.id === userId)) {
            removeUserMarker(userId);
        }
    });
});