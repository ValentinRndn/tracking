let map, userMarker;

function initMap() {
    // Coordonnées initiales
    const initialCoords = { lat: 48.8566, lng: 2.3522 }; // Paris par défaut

    // Initialiser la carte
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: initialCoords,
    });

    // Ajouter un marqueur pour l'utilisateur
    userMarker = new google.maps.Marker({
        position: initialCoords,
        map: map,
        title: 'Vous êtes ici',
    });

    // Mettre à jour la position de l'utilisateur
    updatePosition();
    setInterval(updatePosition, 5000); // Mise à jour toutes les 5 secondes
}

// Fonction pour mettre à jour la position
function updatePosition() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const userPosition = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };

            // Déplacer le marqueur de l'utilisateur
            userMarker.setPosition(userPosition);
            map.setCenter(userPosition);

            // Vous pouvez aussi envoyer cette position via WebSocket pour la partager
        }, () => {
            console.error("Impossible d'accéder à la géolocalisation.");
        });
    } else {
        console.error("La géolocalisation n'est pas prise en charge par ce navigateur.");
    }
}

// Appeler initMap après le chargement du script Google Maps
window.initMap = initMap;
