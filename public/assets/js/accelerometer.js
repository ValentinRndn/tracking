class DeviceAccelerometer {
    constructor() {
        this.isSupported = 'DeviceMotionEvent' in window;
        this.isEnabled = false;
        this.threshold = 15; // Seuil de sensibilité
        this.lastUpdate = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.lastZ = 0;
        this.statusElement = document.getElementById('accelerometer-data');
        this.shakeHandlers = new Set();

        this.initialize();
    }

    initialize() {
        if (!this.isSupported) {
            this.updateStatus('Non supporté');
            return;
        }

        // Pour iOS 13+, nous devons demander la permission
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            this.requestIOSPermission();
        } else {
            this.startListening();
        }
    }

    async requestIOSPermission() {
        try {
            const permission = await DeviceMotionEvent.requestPermission();
            if (permission === 'granted') {
                this.startListening();
            } else {
                this.updateStatus('Permission refusée');
            }
        } catch (error) {
            console.error('Erreur de permission:', error);
            this.updateStatus('Erreur de permission');
        }
    }

    startListening() {
        this.isEnabled = true;
        window.addEventListener('devicemotion', this.handleMotion.bind(this), true);
        this.updateStatus('Actif');
    }

    stopListening() {
        this.isEnabled = false;
        window.removeEventListener('devicemotion', this.handleMotion.bind(this), true);
        this.updateStatus('Inactif');
    }

    handleMotion(event) {
        const current = event.accelerationIncludingGravity;
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - this.lastUpdate;

        if (timeDiff > 100) {
            const deltaX = Math.abs(current.x - this.lastX);
            const deltaY = Math.abs(current.y - this.lastY);
            const deltaZ = Math.abs(current.z - this.lastZ);

            if (deltaX + deltaY + deltaZ > this.threshold) {
                this.notifyShake({
                    x: deltaX,
                    y: deltaY,
                    z: deltaZ,
                    total: deltaX + deltaY + deltaZ
                });
            }

            this.lastX = current.x;
            this.lastY = current.y;
            this.lastZ = current.z;
            this.lastUpdate = currentTime;

            // Mettre à jour l'affichage
            this.updateStatus(`X: ${Math.round(current.x)} Y: ${Math.round(current.y)} Z: ${Math.round(current.z)}`);
        }
    }

    onShake(callback) {
        this.shakeHandlers.add(callback);
    }

    notifyShake(data) {
        this.shakeHandlers.forEach(handler => handler(data));
    }

    updateStatus(message) {
        if (this.statusElement) {
            this.statusElement.querySelector('span').textContent = `Accéléromètre: ${message}`;
        }
    }

    // Modifier la sensibilité
    setSensitivity(threshold) {
        this.threshold = threshold;
    }

    // Obtenir l'état actuel
    isActive() {
        return this.isEnabled;
    }
}

// Initialiser l'accéléromètre et l'exposer globalement
const accelerometer = new DeviceAccelerometer();

// Exemple d'utilisation avec la carte
accelerometer.onShake((data) => {
    console.log('Secousse détectée:', data);
    
    // Si la carte est définie (depuis map.js)
    if (typeof map !== 'undefined') {
        // Recentrer la carte sur la position actuelle
        if (currentPosition) {
            map.setView([currentPosition.lat, currentPosition.lng], 15);
        }
    }
});