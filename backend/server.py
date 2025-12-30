import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from weather_api import WeatherAPI
from config import Config
import traceback

class WeatherRequestHandler(BaseHTTPRequestHandler):
    """Handler pour les requêtes HTTP"""
    
    def __init__(self, *args, **kwargs):
        self.weather_api = WeatherAPI()
        super().__init__(*args, **kwargs)
    
    def _set_headers(self, status_code=200, content_type='application/json'):
        """Définir les en-têtes de réponse"""
        self.send_response(status_code)
        self.send_header('Content-type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_OPTIONS(self):
        """Gérer les requêtes OPTIONS pour CORS"""
        self._set_headers(200)
    
    def do_GET(self):
        """Gérer les requêtes GET"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        query_params = parse_qs(parsed_path.query)
        
        try:
            # Route pour la météo actuelle
            if path == '/api/weather':
                city = query_params.get('city', ['Paris'])[0]
                units = query_params.get('units', ['metric'])[0]
                lang = query_params.get('lang', ['fr'])[0]
                
                weather_data = self.weather_api.get_weather_by_city(city, units, lang)
                
                self._set_headers()
                self.wfile.write(json.dumps(weather_data, ensure_ascii=False).encode('utf-8'))
            
            # Route pour les prévisions
            elif path == '/api/forecast':
                city = query_params.get('city', ['Paris'])[0]
                units = query_params.get('units', ['metric'])[0]
                lang = query_params.get('lang', ['fr'])[0]
                
                forecast_data = self.weather_api.get_weather_forecast(city, units, lang)
                
                self._set_headers()
                self.wfile.write(json.dumps(forecast_data, ensure_ascii=False).encode('utf-8'))
            
            # Route pour la documentation
            elif path == '/api/info':
                info = {
                    'name': 'Mini Application Météo API',
                    'version': '1.0.0',
                    'author': 'Développeuse L2 Informatique',
                    'endpoints': {
                        '/api/weather': 'Météo actuelle (paramètres: city, units, lang)',
                        '/api/forecast': 'Prévisions (paramètres: city, units, lang)'
                    }
                }
                
                self._set_headers()
                self.wfile.write(json.dumps(info).encode('utf-8'))
            
            # Route 404
            else:
                self._set_headers(404, 'application/json')
                error = {'error': 'Endpoint non trouvé'}
                self.wfile.write(json.dumps(error).encode('utf-8'))
                
        except Exception as e:
            self._set_headers(500, 'application/json')
            error = {
                'error': 'Erreur serveur',
                'details': str(e),
                'traceback': traceback.format_exc()
            }
            self.wfile.write(json.dumps(error).encode('utf-8'))

def run_server():
    """Lancer le serveur HTTP"""
    server_address = (Config.HOST, Config.PORT)
    httpd = HTTPServer(server_address, WeatherRequestHandler)
    
    print(f"Serveur démarré sur http://{Config.HOST}:{Config.PORT}")
    print("Endpoints disponibles:")
    print(f"  http://{Config.HOST}:{Config.PORT}/api/weather?city=Paris")
    print(f"  http://{Config.HOST}:{Config.PORT}/api/forecast?city=Paris")
    print(f"  http://{Config.HOST}:{Config.PORT}/api/info")
    print("\nAppuyez sur Ctrl+C pour arrêter le serveur")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nArrêt du serveur...")
        httpd.server_close()

if __name__ == '__main__':
    # Créer un fichier .env avec votre clé API
    import os
    if not os.path.exists('.env'):
        with open('.env', 'w') as f:
            f.write('OPENWEATHER_API_KEY=votre_cle_api_ici\n')
        print("Fichier .env créé. Veuillez ajouter votre clé API OpenWeatherMap.")
    
    run_server()