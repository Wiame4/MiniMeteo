import requests
import json
import time
from datetime import datetime
from config import Config

class WeatherAPI:
    """Classe pour gérer les appels à l'API météo"""
    
    def __init__(self):
        self.api_key = Config.OPENWEATHER_API_KEY
        self.base_url = Config.OPENWEATHER_BASE_URL
        self.cache = {}
        self.cache_duration = Config.CACHE_DURATION
    
    def _get_from_cache(self, cache_key):
        """Récupérer les données du cache si elles sont valides"""
        if cache_key in self.cache:
            data, timestamp = self.cache[cache_key]
            if time.time() - timestamp < self.cache_duration:
                return data
        return None
    
    def _add_to_cache(self, cache_key, data):
        """Ajouter les données au cache"""
        self.cache[cache_key] = (data, time.time())
    
    def get_weather_by_city(self, city_name, units='metric', lang='fr'):
        """
        Récupérer la météo pour une ville
        
        Args:
            city_name: Nom de la ville
            units: 'metric' pour Celsius, 'imperial' pour Fahrenheit
            lang: Langue des descriptions
        
        Returns:
            dict: Données météo formatées
        """
        cache_key = f"{city_name}_{units}_{lang}"
        
        # Vérifier le cache
        cached_data = self._get_from_cache(cache_key)
        if cached_data:
            return cached_data
        
        try:
            # Appel à l'API OpenWeatherMap
            url = f"{self.base_url}/weather"
            params = {
                'q': city_name,
                'appid': self.api_key,
                'units': units,
                'lang': lang
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # Formater les données
            formatted_data = self._format_weather_data(data, units)
            
            # Mettre en cache
            self._add_to_cache(cache_key, formatted_data)
            
            return formatted_data
            
        except requests.exceptions.HTTPError as e:
            if response.status_code == 404:
                return {'error': 'Ville non trouvée'}
            elif response.status_code == 401:
                return {'error': 'Clé API invalide'}
            else:
                return {'error': f'Erreur API: {str(e)}'}
        except requests.exceptions.RequestException as e:
            return {'error': f'Erreur de connexion: {str(e)}'}
        except Exception as e:
            return {'error': f'Erreur inattendue: {str(e)}'}
    
    def get_weather_forecast(self, city_name, units='metric', lang='fr'):
        """
        Récupérer les prévisions sur 5 jours
        
        Args:
            city_name: Nom de la ville
            units: 'metric' pour Celsius, 'imperial' pour Fahrenheit
            lang: Langue des descriptions
        
        Returns:
            dict: Prévisions formatées
        """
        cache_key = f"forecast_{city_name}_{units}_{lang}"
        
        # Vérifier le cache
        cached_data = self._get_from_cache(cache_key)
        if cached_data:
            return cached_data
        
        try:
            # Appel à l'API OpenWeatherMap pour les prévisions
            url = f"{self.base_url}/forecast"
            params = {
                'q': city_name,
                'appid': self.api_key,
                'units': units,
                'lang': lang,
                'cnt': 8  # 8 prévisions (24 heures)
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # Formater les données de prévision
            formatted_data = self._format_forecast_data(data, units)
            
            # Mettre en cache
            self._add_to_cache(cache_key, formatted_data)
            
            return formatted_data
            
        except requests.exceptions.RequestException as e:
            return {'error': f'Erreur de connexion: {str(e)}'}
        except Exception as e:
            return {'error': f'Erreur inattendue: {str(e)}'}
    
    def _format_weather_data(self, data, units):
        """Formater les données météo brutes"""
        try:
            temp_unit = '°C' if units == 'metric' else '°F'
            wind_unit = 'm/s' if units == 'metric' else 'mph'
            
            formatted = {
                'city': data['name'],
                'country': data['sys']['country'],
                'temperature': round(data['main']['temp']),
                'feels_like': round(data['main']['feels_like']),
                'humidity': data['main']['humidity'],
                'pressure': data['main']['pressure'],
                'wind_speed': round(data['wind']['speed'], 1),
                'wind_direction': self._get_wind_direction(data['wind'].get('deg', 0)),
                'description': data['weather'][0]['description'].capitalize(),
                'icon': data['weather'][0]['icon'],
                'sunrise': datetime.fromtimestamp(data['sys']['sunrise']).strftime('%H:%M'),
                'sunset': datetime.fromtimestamp(data['sys']['sunset']).strftime('%H:%M'),
                'units': {
                    'temp': temp_unit,
                    'wind': wind_unit
                },
                'timestamp': datetime.now().strftime('%d/%m/%Y %H:%M')
            }
            
            # Ajouter les prévisions météo quotidiennes si disponibles
            if 'rain' in data:
                formatted['rain'] = data['rain'].get('1h', 0)
            if 'snow' in data:
                formatted['snow'] = data['snow'].get('1h', 0)
            
            return formatted
            
        except KeyError as e:
            return {'error': f'Données API incomplètes: {str(e)}'}
    
    def _format_forecast_data(self, data, units):
        """Formater les données de prévision"""
        try:
            temp_unit = '°C' if units == 'metric' else '°F'
            forecasts = []
            
            for item in data['list']:
                forecast = {
                    'time': datetime.fromtimestamp(item['dt']).strftime('%H:%M'),
                    'date': datetime.fromtimestamp(item['dt']).strftime('%d/%m'),
                    'temperature': round(item['main']['temp']),
                    'feels_like': round(item['main']['feels_like']),
                    'humidity': item['main']['humidity'],
                    'description': item['weather'][0]['description'].capitalize(),
                    'icon': item['weather'][0]['icon'],
                    'wind_speed': round(item['wind']['speed'], 1)
                }
                forecasts.append(forecast)
            
            return {
                'city': data['city']['name'],
                'country': data['city']['country'],
                'forecasts': forecasts,
                'units': {
                    'temp': temp_unit,
                    'wind': 'm/s' if units == 'metric' else 'mph'
                }
            }
            
        except KeyError as e:
            return {'error': f'Données de prévision incomplètes: {str(e)}'}
    
    def _get_wind_direction(self, degrees):
        """Convertir les degrés en direction cardinale"""
        if degrees is None:
            return "N/A"
        
        directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                     'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO']
        index = round(degrees / (360. / len(directions))) % len(directions)
        return directions[index]