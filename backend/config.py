import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

class Config:
    # Clé API OpenWeatherMap
    OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY', 'votre_cle_api_ici')
    
    # URL de l'API
    OPENWEATHER_BASE_URL = "http://api.openweathermap.org/data/2.5"
    
    # Configuration du serveur
    HOST = '127.0.0.1'
    PORT = 5000
    
    # Cache configuration
    CACHE_DURATION = 600  # 10 minutes en secondes