# **GeoMeet - Application de Géolocalisation et Visioconférence**

GeoMeet est une application web permettant des interactions en temps réel entre utilisateurs via la géolocalisation et la visioconférence. Elle propose une carte interactive, un système d'appel vidéo en peer-to-peer, et une détection de mouvements par accéléromètre.

---

## **Table des matières**

1. [Fonctionnalités](#fonctionnalités)  
2. [Technologies utilisées](#technologies-utilisées)  
3. [Installation](#installation)  
4. [Configuration](#configuration)  
5. [Lancement de l'application](#lancement-de-lapplication)  
6. [Fonctionnement](#fonctionnement)  
7. [Structure du projet](#structure-du-projet)  
8. [Contributeurs](#contributeurs)  

---

## **Fonctionnalités**

- **Géolocalisation en temps réel :** Affichage des utilisateurs sur une carte interactive
- **Visioconférence P2P :** Appels vidéo directs entre utilisateurs
- **Détection de mouvements :** Accéléromètre pour interactions gestuelles
- **Interface responsive :** Design adapté à tous les appareils
- **Mode sombre :** Interface moderne et confortable
- **WebRTC :** Communication peer-to-peer sécurisée

---

## **Technologies utilisées**

### **Frontend :**
- **HTML5/CSS3** avec Tailwind CSS
- **JavaScript** vanilla
- **Leaflet.js** pour la cartographie
- **Socket.IO Client** pour le temps réel
- **Simple-Peer** pour le WebRTC

### **Backend :**
- **Node.js** et **Express.js**
- **Socket.IO** pour la communication temps réel
- **WebRTC** pour les appels vidéo

### **Autres :**
- **Navigator API** pour la géolocalisation
- **DeviceMotion API** pour l'accéléromètre

---

## **Installation**

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/votre-repo/geomeet.git
   cd geomeet
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

## **Configuration**

1. Créez un fichier .env dans le dossier racine :
   ```bash
   PORT=3000
   ```

## **Lancement de l'application**

1. Démarrez le serveur :
   ```bash
   npm start
   ```

## **Fonctionnement**

1. Géolocalisation :
   - L'application détecte automatiquement la position de l'utilisateur
   - Les positions sont partagées en temps réel via Socket.IO
   - La carte se met à jour dynamiquement

2. Appels vidéo :
   - Communication P2P via WebRTC
   - Contrôles audio/vidéo intégrés
   - Interface d'appel responsive

3. Accéléromètre :
   - Détection des mouvements de l'appareil
   - Recentrage de la carte par secousse
   - Configuration de sensibilité ajustable

## **Structure du projet**
   ```bash
/geomeet
├── /assets
│   ├── /css
│   │   ├── style.css
│   │   └── output.css
│   └── /js
│       ├── socket.js
│       ├── webrtc.js
│       ├── map.js
│       └── accelerometer.js
├── index.html
├── tailwind.config.js
└── README.md
```

---
