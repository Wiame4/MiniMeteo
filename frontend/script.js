// Configuration
const CONFIG = {
    API_BASE_URL: 'http://127.0.0.1:5000',
    DEFAULT_CITY: 'Paris',
    DEFAULT_UNITS: 'metric',
    DEFAULT_LANG: 'fr',
    REFRESH_INTERVAL: 300000, // 5 minutes
    WEATHER_ICON_BASE_URL: 'https://openweathermap.org/img/wn/'
};

// État de l'application
const AppState = {
    currentCity: CONFIG.DEFAULT_CITY,
    currentUnits: CONFIG.DEFAULT_UNITS,
    currentLang: CONFIG.DEFAULT_LANG,
    weatherData: null,
    forecastData: null,
    lastUpdate: null,
    isLoading: false
};

// Éléments DOM
const DOM = {
    cityInput: document.getElementById('city-input'),
    searchBtn: document.getElementById('search-btn'),
    unitButtons: document.querySelectorAll('.unit-btn'),
    cityButtons: document.querySelectorAll('.city-btn'),
    currentWeather: document.getElementById('current-weather'),
    forecastContainer: document.getElementById('forecast-container'),
    additionalInfo: document.getElementById('additional-info'),
    lastUpdate: document.getElementById('last-update'),
    errorModal: document.getElementById('error-modal'),
    infoModal: document.getElementById('info-modal'),
    refreshBtn: document.getElementById('refresh-data'),
    apiInfoBtn: document.getElementById('api-info')
};

// Initialisation de l'application
function initApp() {
    // Charger les données par défaut
    loadWeatherData();
    loadForecastData();
    
    // Configurer les écouteurs d'événements
    setupEventListeners();
    
    // Configurer l'actualisation automatique
    setInterval(() => {
        if (!AppState.isLoading) {
            loadWeatherData();
            loadForecastData();
        }
    }, CONFIG.REFRESH_INTERVAL);
    
    // Afficher l'heure de la dernière mise à jour
    updateLastUpdateTime();
}

// Configurer les écouteurs d'événements
function setupEventListeners() {
    // Recherche par bouton
    DOM.searchBtn.addEventListener('click', () => {
        const city = DOM.cityInput.value.trim();
        if (city) {
            AppState.currentCity = city;
            loadWeatherData();
            loadForecastData();
        }
    });
    
    // Recherche par entrée
    DOM.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = DOM.cityInput.value.trim();
            if (city) {
                AppState.currentCity = city;
                loadWeatherData();
                loadForecastData();
            }
        }
    });
    
    // Changement d'unités
    DOM.unitButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Désactiver tous les boutons
            DOM.unitButtons.forEach(b => b.classList.remove('active'));
            // Activer le bouton cliqué
            btn.classList.add('active');
            // Mettre à jour les unités
            AppState.currentUnits = btn.dataset.unit;
            // Recharger les données
            loadWeatherData();
            loadForecastData();
        });
    });
    
    // Villes favorites
    DOM.cityButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            AppState.currentCity = btn.dataset.city;
            DOM.cityInput.value = btn.dataset.city;
            loadWeatherData();
            loadForecastData();
        });
    });
    
    // Actualisation manuelle
    DOM.refreshBtn.addEventListener('click', () => {
        loadWeatherData();
        loadForecastData();
    });
    
    // Informations API
    DOM.apiInfoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showModal(DOM.infoModal);
    });
    
    // Gestion des modales
    setupModalEvents();
}

// Configuration des événements des modales
function setupModalEvents() {
    // Fermer les modales
    document.querySelectorAll('.close-modal, .btn-ok').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });
    
    // Fermer les modales en cliquant à l'extérieur
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Fermer les modales avec la touche Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });
}

// Afficher une modale
function showModal(modalElement) {
    modalElement.classList.add('active');
}

// Afficher une erreur
function showError(message, details = '') {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message + (details ? `\nDétails: ${details}` : '');
    DOM.errorModal.classList.add('active');
}

// Charger les données météo
async function loadWeatherData() {
    try {
        AppState.isLoading = true;
        
        // Afficher l'état de chargement
        DOM.currentWeather.innerHTML = `
            <div class="weather-loading">
                <div class="spinner"></div>
                <p>Chargement des données météo pour ${AppState.currentCity}...</p>
            </div>
        `;
        
        // Construire l'URL
        const url = new URL(`${CONFIG.API_BASE_URL}/api/weather`);
        url.searchParams.append('city', AppState.currentCity);
        url.searchParams.append('units', AppState.currentUnits);
        url.searchParams.append('lang', AppState.currentLang);
        
        // Faire la requête
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Vérifier les erreurs de l'API
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Mettre à jour l'état
        AppState.weatherData = data;
        AppState.lastUpdate = new Date();
        
        // Mettre à jour l'affichage
        updateWeatherDisplay(data);
        updateLastUpdateTime();
        
    } catch (error) {
        console.error('Erreur lors du chargement des données météo:', error);
        DOM.currentWeather.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <div class="error-text">
                    <h4>Erreur de chargement</h4>
                    <p>Impossible de charger les données météo pour ${AppState.currentCity}.</p>
                    <p><small>${error.message}</small></p>
                </div>
            </div>
        `;
        showError('Impossible de charger les données météo', error.message);
    } finally {
        AppState.isLoading = false;
    }
}

// Charger les prévisions
async function loadForecastData() {
    try {
        // Afficher l'état de chargement
        DOM.forecastContainer.innerHTML = `
            <div class="forecast-loading">
                <div class="spinner"></div>
                <p>Chargement des prévisions pour ${AppState.currentCity}...</p>
            </div>
        `;
        
        // Construire l'URL
        const url = new URL(`${CONFIG.API_BASE_URL}/api/forecast`);
        url.searchParams.append('city', AppState.currentCity);
        url.searchParams.append('units', AppState.currentUnits);
        url.searchParams.append('lang', AppState.currentLang);
        
        // Faire la requête
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Vérifier les erreurs de l'API
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Mettre à jour l'état
        AppState.forecastData = data;
        
        // Mettre à jour l'affichage
        updateForecastDisplay(data);
        
    } catch (error) {
        console.error('Erreur lors du chargement des prévisions:', error);
        DOM.forecastContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <div class="error-text">
                    <h4>Erreur de chargement</h4>
                    <p>Impossible de charger les prévisions pour ${AppState.currentCity}.</p>
                    <p><small>${error.message}</small></p>
                </div>
            </div>
        `;
    }
}

// Mettre à jour l'affichage de la météo actuelle
function updateWeatherDisplay(data) {
    const tempUnit = data.units.temp;
    const windUnit = data.units.wind;
    
    // Déterminer l'icône et la couleur de fond
    const weatherCondition = getWeatherCondition(data.icon);
    
    // Mettre à jour la couleur de fond en fonction de la météo
    updateWeatherBackground(weatherCondition);
    
    DOM.currentWeather.innerHTML = `
        <div class="weather-content">
            <div class="weather-main">
                <div class="city-name">${data.city}, <span class="country">${data.country}</span></div>
                <div class="temperature">${data.temperature}${tempUnit}</div>
                <div class="description">
                    <img src="${CONFIG.WEATHER_ICON_BASE_URL}${data.icon}@2x.png" alt="${data.description}" class="weather-icon">
                    ${data.description}
                </div>
                <div class="feels-like">Ressenti: ${data.feels_like}${tempUnit}</div>
            </div>
            
            <div class="weather-details">
                <div class="detail-item">
                    <h4><i class="fas fa-wind"></i> Vent</h4>
                    <div class="detail-value">${data.wind_speed} ${windUnit}<br><small>${data.wind_direction}</small></div>
                </div>
                
                <div class="detail-item">
                    <h4><i class="fas fa-tint"></i> Humidité</h4>
                    <div class="detail-value">${data.humidity}%</div>
                </div>
                
                <div class="detail-item">
                    <h4><i class="fas fa-tachometer-alt"></i> Pression</h4>
                    <div class="detail-value">${data.pressure} hPa</div>
                </div>
                
                <div class="detail-item">
                    <h4><i class="fas fa-sun"></i> Lever/coucher</h4>
                    <div class="detail-value">${data.sunrise} / ${data.sunset}</div>
                </div>
            </div>
        </div>
    `;
    
    // Mettre à jour les informations supplémentaires
    updateAdditionalInfo(data);
}

// Mettre à jour l'affichage des prévisions
function updateForecastDisplay(data) {
    const tempUnit = data.units.temp;
    
    if (!data.forecasts || data.forecasts.length === 0) {
        DOM.forecastContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-info-circle"></i>
                <div class="error-text">
                    <h4>Aucune prévision disponible</h4>
                    <p>Les prévisions ne sont pas disponibles pour cette ville.</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Limiter à 8 prévisions (24 heures)
    const forecasts = data.forecasts.slice(0, 8);
    
    DOM.forecastContainer.innerHTML = forecasts.map(forecast => `
        <div class="forecast-card">
            <div class="forecast-time">${forecast.time}</div>
            <div class="forecast-date">${forecast.date}</div>
            <img src="${CONFIG.WEATHER_ICON_BASE_URL}${forecast.icon}.png" alt="${forecast.description}" class="forecast-icon">
            <div class="forecast-temp">${forecast.temperature}${tempUnit}</div>
            <div class="forecast-desc">${forecast.description}</div>
            <div class="forecast-details">
                <div class="forecast-detail">
                    <div class="detail-label">Ressenti</div>
                    <div class="detail-value-small">${forecast.feels_like}${tempUnit}</div>
                </div>
                <div class="forecast-detail">
                    <div class="detail-label">Humidité</div>
                    <div class="detail-value-small">${forecast.humidity}%</div>
                </div>
            </div>
        </div>
    `).join('');
}

// Mettre à jour les informations supplémentaires
function updateAdditionalInfo(data) {
    const tempUnit = data.units.temp;
    
    DOM.additionalInfo.innerHTML = `
        <div class="info-card">
            <h3><i class="fas fa-thermometer-half"></i> Détails de température</h3>
            <ul class="info-list">
                <li>
                    <span class="info-label">Température actuelle</span>
                    <span class="info-value">${data.temperature}${tempUnit}</span>
                </li>
                <li>
                    <span class="info-label">Ressenti</span>
                    <span class="info-value">${data.feels_like}${tempUnit}</span>
                </li>
                <li>
                    <span class="info-label">Min/Max (typique)</span>
                    <span class="info-value">${data.temperature - 5}${tempUnit} / ${data.temperature + 5}${tempUnit}</span>
                </li>
            </ul>
        </div>
        
        <div class="info-card">
            <h3><i class="fas fa-cloud"></i> Conditions atmosphériques</h3>
            <ul class="info-list">
                <li>
                    <span class="info-label">Pression atmosphérique</span>
                    <span class="info-value">${data.pressure} hPa</span>
                </li>
                <li>
                    <span class="info-label">Humidité</span>
                    <span class="info-value">${data.humidity}%</span>
                </li>
                <li>
                    <span class="info-label">Visibilité</span>
                    <span class="info-value">${data.pressure > 1010 ? 'Bonne' : 'Réduite'}</span>
                </li>
            </ul>
        </div>
        
        <div class="info-card">
            <h3><i class="fas fa-info-circle"></i> Informations système</h3>
            <ul class="info-list">
                <li>
                    <span class="info-label">Ville</span>
                    <span class="info-value">${data.city}</span>
                </li>
                <li>
                    <span class="info-label">Pays</span>
                    <span class="info-value">${data.country}</span>
                </li>
                <li>
                    <span class="info-label">Dernière mise à jour</span>
                    <span class="info-value">${data.timestamp}</span>
                </li>
                <li>
                    <span class="info-label">Unités</span>
                    <span class="info-value">${AppState.currentUnits === 'metric' ? 'Métriques (°C)' : 'Impériales (°F)'}</span>
                </li>
            </ul>
        </div>
    `;
}

// Mettre à jour l'heure de la dernière mise à jour
function updateLastUpdateTime() {
    if (AppState.lastUpdate) {
        const timeString = AppState.lastUpdate.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        DOM.lastUpdate.textContent = `Dernière mise à jour: ${timeString}`;
    }
}

// Déterminer la condition météo à partir de l'icône
function getWeatherCondition(iconCode) {
    if (iconCode.includes('01')) return 'clear';
    if (iconCode.includes('02')) return 'partly-cloudy';
    if (iconCode.includes('03') || iconCode.includes('04')) return 'cloudy';
    if (iconCode.includes('09') || iconCode.includes('10')) return 'rain';
    if (iconCode.includes('11')) return 'thunderstorm';
    if (iconCode.includes('13')) return 'snow';
    if (iconCode.includes('50')) return 'mist';
    return 'clear';
}

// Mettre à jour l'arrière-plan en fonction de la météo
function updateWeatherBackground(condition) {
    const weatherCard = document.querySelector('.weather-card');
    if (!weatherCard) return;
    
    // Supprimer les anciennes classes
    weatherCard.classList.remove(
        'weather-clear', 'weather-cloudy', 'weather-rain', 
        'weather-thunderstorm', 'weather-snow', 'weather-mist'
    );
    
    // Ajouter la nouvelle classe
    weatherCard.classList.add(`weather-${condition}`);
    
    // Mettre à jour le dégradé en fonction de la condition
    let gradient;
    switch (condition) {
        case 'clear':
            gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            break;
        case 'partly-cloudy':
        case 'cloudy':
            gradient = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
            break;
        case 'rain':
            gradient = 'linear-gradient(135deg, #09203f 0%, #537895 100%)';
            break;
        case 'thunderstorm':
            gradient = 'linear-gradient(135deg, #434343 0%, #000000 100%)';
            break;
        case 'snow':
            gradient = 'linear-gradient(135deg, #e6dada 0%, #274046 100%)';
            break;
        case 'mist':
            gradient = 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)';
            break;
        default:
            gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
    
    weatherCard.style.background = gradient;
}

// Fonction utilitaire pour formater la date
function formatDate(date) {
    return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Initialiser l'application quand la page est chargée
document.addEventListener('DOMContentLoaded', initApp);