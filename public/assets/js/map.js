let map;
let markers = new Map();
let currentPosition = null;

function initMap() {
    console.log('Initialisation de la carte...');
    try {
        map = L.map('map').setView([48.8566, 2.3522], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        console.log('Carte initialisée avec succès');

        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                position => {
                    console.log('Position obtenue:', position);
                    currentPosition = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    socketConnection.emit('updateLocation', {
                        userId: socketConnection.id,
                        location: currentPosition
                    });
                    updateUserMarker(socketConnection.id, currentPosition);
                },
                error => console.error('Erreur de géolocalisation:', error),
                { enableHighAccuracy: true }
            );
        }
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la carte:', error);
    }
}

// Assurez-vous que la carte n'est initialisée qu'une fois le DOM chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
} else {
    initMap();
}

function updateUserMarker(userId, location) {
    if (markers.has(userId)) {
        markers.get(userId).setLatLng([location.lat, location.lng]);
    } else {
        const marker = L.marker([location.lat, location.lng])
            .bindPopup(`
                <div class="text-center">
                    <h3 class="font-bold">Utilisateur</h3>
                    <button 
                        onclick="initiateCall('${userId}')"
                        class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Appeler
                    </button>
                </div>
            `)
            .addTo(map);
        markers.set(userId, marker);
    }
}

function removeUserMarker(userId) {
    if (markers.has(userId)) {
        map.removeLayer(markers.get(userId));
        markers.delete(userId);
    }
}
