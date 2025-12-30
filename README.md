# Mini Application Météo

Une application météo moderne et responsive développée en Python pour le backend et HTML/CSS/JavaScript pour le frontend.

## 🌟 Fonctionnalités

- **Météo actuelle** : Affichage en temps réel de la température, conditions météorologiques, humidité, vent, etc.
- **Prévisions sur 24h** : Prévisions horaires détaillées
- **Recherche de villes** : Recherche par nom de ville
- **Unités configurables** : Choix entre Celsius (°C) et Fahrenheit (°F)
- **Interface responsive** : Optimisée pour desktop et mobile
- **Cache intelligent** : Mise en cache des données pour de meilleures performances
- **API REST** : Endpoints pour intégrer facilement les données météo

## 🛠️ Technologies utilisées

### Backend
- **Python 3.x**
- **http.server** (serveur HTTP intégré)
- **requests** (pour les appels API)
- **python-dotenv** (gestion des variables d'environnement)
- **OpenWeatherMap API** (source des données météo)

### Frontend
- **HTML5**
- **CSS3** (avec Flexbox et Grid)
- **JavaScript** (ES6+)
- **Font Awesome** (icônes)
- **Google Fonts** (typographie)

## 📋 Prérequis

- Python 3.7 ou supérieur
- Clé API OpenWeatherMap (gratuite)

## 🚀 Installation

1. **Cloner le repository** :
   ```bash
   git clone <url-du-repo>
   cd WeatherApp
   ```

2. **Installer les dépendances** :
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Configurer l'API** :
   - Obtenir une clé API gratuite sur [OpenWeatherMap](https://openweathermap.org/api)
   - Créer un fichier `.env` dans le dossier `backend/` :
     ```
     OPENWEATHER_API_KEY=votre_cle_api_ici
     ```

## ▶️ Utilisation

1. **Démarrer le serveur backend** :
   ```bash
   cd backend
   python server.py
   ```
   Le serveur démarrera sur `http://127.0.0.1:5000`

2. **Ouvrir l'application** :
   - Ouvrir `frontend/index.html` dans votre navigateur web
   - Ou servir le dossier frontend avec un serveur web local

## 📡 API Endpoints

### Météo actuelle
```
GET /api/weather?city={ville}&units={metric|imperial}&lang={fr|en}
```
**Exemple** : `/api/weather?city=Paris&units=metric&lang=fr`

### Prévisions sur 24h
```
GET /api/forecast?city={ville}&units={metric|imperial}&lang={fr|en}
```
**Exemple** : `/api/forecast?city=Paris&units=metric&lang=fr`

### Informations API
```
GET /api/info
```

## 🏗️ Architecture

```
WeatherApp/
├── backend/
│   ├── server.py          # Serveur HTTP principal
│   ├── weather_api.py     # Gestion des appels API OpenWeatherMap
│   ├── config.py          # Configuration et variables d'environnement
│   ├── requirements.txt   # Dépendances Python
│   └── .env              # Variables d'environnement (à créer)
├── frontend/
│   ├── index.html        # Page principale
│   ├── style.css         # Styles CSS
│   └── script.js         # Logique JavaScript
└── README.md             # Ce fichier
```

## 🎨 Fonctionnalités Frontend

- **Recherche intelligente** : Saisie avec suggestions de villes
- **Boutons de villes favorites** : Accès rapide aux grandes villes françaises
- **Basculement unités** : Changement dynamique °C/°F
- **Actualisation automatique** : Mise à jour toutes les 5 minutes
- **Gestion d'erreurs** : Messages d'erreur utilisateur-friendly
- **Interface moderne** : Design responsive avec animations

## 🔧 Configuration

Le fichier `backend/config.py` contient les paramètres configurables :

- `HOST` : Adresse d'écoute du serveur (défaut: 127.0.0.1)
- `PORT` : Port du serveur (défaut: 5000)
- `CACHE_DURATION` : Durée du cache en secondes (défaut: 600 = 10 min)

## 🌐 Support des langues

L'application supporte plusieurs langues via l'API OpenWeatherMap :
- Français (`fr`)
- Anglais (`en`)
- Espagnol (`es`)
- Et de nombreuses autres...

## 📱 Responsive Design

L'interface s'adapte automatiquement aux différentes tailles d'écran :
- **Desktop** : Layout complet avec toutes les sections
- **Tablette** : Ajustements des espacements et tailles
- **Mobile** : Interface optimisée pour les petits écrans


## 🙏 Remerciements

- [OpenWeatherMap](https://openweathermap.org/) pour l'API météo
- [Font Awesome](https://fontawesome.com/) pour les icônes
- [Google Fonts](https://fonts.google.com/) pour la typographie

---

**Développé par Wiame** - Mini Application Météo v1.0.0