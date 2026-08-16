// Open-Meteo does not require an API key.
// First we find the city coordinates, then we get its weather.

let selectedLocation = null;
let weatherData = null;


// Search city and get its weather
async function getWeather() {
    const city = document.getElementById("cityInput").value.trim();
    const message = document.getElementById("message");

    if (city === "") {
        message.innerText = "Please enter a city name.";
        return;
    }

    message.innerText = "Searching...";

    try {
        // Find city latitude, longitude and timezone
        const locationURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const locationResponse = await fetch(locationURL);
        const location = await locationResponse.json();

        if (!location.results || location.results.length === 0) {
            throw new Error("City not found");
        }

        selectedLocation = location.results[0];

        await updateWeather();

        message.innerText = "";

    } catch (error) {
        console.error(error);
        message.innerText = "City not found. Please try another city.";
    }
}


// Get latest weather data
async function updateWeather() {
    if (!selectedLocation) {
        return;
    }

    const latitude = selectedLocation.latitude;
    const longitude = selectedLocation.longitude;

    const weatherURL =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;

    const response = await fetch(weatherURL);
    const data = await response.json();

    if (!response.ok) {
        throw new Error("Weather data could not be loaded");
    }

    weatherData = data.current;

    // City name
    document.getElementById("city").innerText =
        selectedLocation.name;

    // Temperature
    document.getElementById("temperature").innerText =
        Math.round(weatherData.temperature_2m) + "°C";

    // Humidity
    document.getElementById("humidity").innerText =
        Math.round(weatherData.relative_humidity_2m) + "%";

    // Wind speed
    document.getElementById("wind").innerText =
        Math.round(weatherData.wind_speed_10m) + " km/h";

    // Weather condition and icon
    const condition = getWeatherCondition(weatherData.weather_code);

    document.getElementById("condition").innerText =
        condition.text;

    document.getElementById("weatherIcon").innerText =
        condition.icon;

    document.getElementById("updated").innerText =
        "Weather updated: " + new Date().toLocaleTimeString();
}


// Convert weather code into simple text and icon
function getWeatherCondition(code) {

    if (code === 0) {
        return { text: "Clear Sky", icon: "☀️" };
    }

    if (code === 1 || code === 2) {
        return { text: "Partly Cloudy", icon: "⛅" };
    }

    if (code === 3) {
        return { text: "Overcast", icon: "☁️" };
    }

    if (code >= 45 && code <= 48) {
        return { text: "Foggy", icon: "🌫️" };
    }

    if (code >= 51 && code <= 57) {
        return { text: "Drizzle", icon: "🌦️" };
    }

    if (code >= 61 && code <= 67) {
        return { text: "Rain", icon: "🌧️" };
    }

    if (code >= 71 && code <= 77) {
        return { text: "Snow", icon: "❄️" };
    }

    if (code >= 80 && code <= 82) {
        return { text: "Rain Showers", icon: "🌦️" };
    }

    if (code >= 95) {
        return { text: "Thunderstorm", icon: "⛈️" };
    }

    return { text: "Unknown", icon: "🌤️" };
}


// Live local clock of the selected city
function updateClock() {

    if (!selectedLocation) {
        return;
    }

    const timeZone = selectedLocation.timezone;

    const now = new Date();

    const time = new Intl.DateTimeFormat("en-US", {
        timeZone: timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    }).format(now);

    const date = new Intl.DateTimeFormat("en-US", {
        timeZone: timeZone,
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    }).format(now);

    document.getElementById("currentTime").innerText = time;
    document.getElementById("date").innerText = date;
}


// Clock changes every second
setInterval(updateClock, 1000);


// Weather automatically refreshes every 5 minutes
setInterval(() => {
    if (selectedLocation) {
        updateWeather().catch(console.error);
    }
}, 5 * 60 * 1000);


// Press Enter to search
document.getElementById("cityInput").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        getWeather();
    }
});
