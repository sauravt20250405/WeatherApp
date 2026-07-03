const apiKey = '73297ed0a02348898da94546260207'; 

const searchBtn = document.getElementById('search-btn');
const geoBtn = document.getElementById('geo-btn');
const locationInput = document.getElementById('location-input');
const zipInput = document.getElementById('zip-input');
const weatherInfo = document.getElementById('weather-info');
const errorMessage = document.getElementById('error-message');

// Interface element nodes
const cityName = document.getElementById('city-name');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const uvIndex = document.getElementById('uv-index');
const visibility = document.getElementById('visibility');
const pressure = document.getElementById('pressure');
const forecastContainer = document.getElementById('forecast-container');

// Advanced Environment Condition-Theme Manager Mapping
function updateAppTheme(conditionCode, isDay) {
    let theme = "clear-day";
    if (!isDay) { theme = "clear-night"; }
    else if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(conditionCode)) { theme = "rain"; }
    else if ([1066, 1114, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(conditionCode)) { theme = "snow"; }
    else if ([1087, 1273, 1276, 1279, 1282].includes(conditionCode)) { theme = "thunderstorm"; }
    
    document.body.setAttribute('data-theme', theme);
}

// Master asynchronous fetch sequence engine
async function fetchWeather(query) {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(query)}&days=4&aqi=no`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Query mismatch');
        const data = await response.json();
        
        // 1. Populate Core Hero Metrics
        cityName.textContent = `${data.location.name}, ${data.location.country}`;
        temperature.textContent = `${Math.round(data.current.temp_c)}°C`;
        description.textContent = data.current.condition.text;
        weatherIcon.src = `https:${data.current.condition.icon}`;
        
        // 2. Map MSN Metric Parameters
        feelsLike.textContent = `${Math.round(data.current.feelslike_c)}°C`;
        humidity.textContent = `${data.current.humidity}%`;
        windSpeed.textContent = `${Math.round(data.current.wind_kph)} km/h`;
        uvIndex.textContent = data.current.uv;
        visibility.textContent = `${data.current.vis_km} km`;
        pressure.textContent = `${data.current.pressure_mb} hPa`;
        
        // 3. Dynamic Theme Adjustment Initialization
        updateAppTheme(data.current.condition.code, data.current.is_day);

        // 4. Render Horizontal Future Forecast Block Matrix Array
        forecastContainer.innerHTML = '';
        const forecastDays = data.forecast.forecastday.slice(1, 4); // Capture subsequent days
        
        forecastDays.forEach(dayInfo => {
            const dateObj = new Date(dayInfo.date);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            
            const card = document.createElement('div');
            card.classList.add('forecast-card');
            card.innerHTML = `
                <span class="forecast-day">${dayName}</span>
                <img src="https:${dayInfo.day.condition.icon}" alt="Icon">
                <span class="forecast-temp">${Math.round(dayInfo.day.maxtemp_c)}° / ${Math.round(dayInfo.day.mintemp_c)}°</span>
            `;
            forecastContainer.appendChild(card);
        });

        weatherInfo.classList.remove('hidden');
        errorMessage.classList.add('hidden');
    } catch (error) {
        showError("Location variant missing or unknown. Verify terms.");
    }
}

// Geolocation & Input Sorting Controller Pipelines
async function handleSearch() {
    const city = locationInput.value.trim();
    let zip = zipInput.value.trim();

    if (!city && !zip) {
        showError("Please fill out a target search query.");
        return;
    }

    let query = "";
    if (zip) {
        if (/^\d{6}$/.test(zip)) {
            // Integration tracking module wrapper mapping resolving past query lock issues
            try {
                const geoRes = await fetch(`https://api.zippopotam.us/IN/${zip}`);
                if (!geoRes.ok) throw new Error();
                const geoData = await geoRes.json();
                query = `${geoData.places[0]['place name']}, ${geoData.places[0]['state']}`;
            } catch {
                showError("Invalid Indian PIN code entry.");
                return;
            }
        } else {
            query = zip;
        }
    } else {
        query = city;
    }
    fetchWeather(query);
}

function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove('hidden');
    weatherInfo.classList.add('hidden');
}

function getUserLocation() {
    if (!navigator.geolocation) return showError("Geolocation unsupported.");
    if (window.location.protocol === 'file:') return showError("Run via local server environment.");

    geoBtn.textContent = "⌛ Locating...";
    navigator.geolocation.getCurrentPosition(async (pos) => {
        await fetchWeather(`${pos.coords.latitude},${pos.coords.longitude}`);
        geoBtn.textContent = "📍 Use Current Location";
    }, () => {
        geoBtn.textContent = "📍 Use Current Location";
        showError("Location pinpoint sequence timed out.");
    });
}

searchBtn.addEventListener('click', handleSearch);
geoBtn.addEventListener('click', getUserLocation);
locationInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSearch(); });
zipInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSearch(); });