let map;
let markers = new Map();
let currentPosition = null;

function initMap() {
    map = L.map('map').setView([48.8566, 2.3522], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Get user's position
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            position => {
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
            error => console.error('Error getting location:', error),
            { enableHighAccuracy: true }
        );
    }
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

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', initMap);