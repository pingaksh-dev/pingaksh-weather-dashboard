"use strict";

// ==========================================
// WeatherFlow
// Asynchronous JavaScript & RESTful APIs
// ==========================================

// ==========================================
// API Endpoints
// ==========================================

const GEOCODING_API =
    "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";


// ==========================================
// DOM Elements
// ==========================================

const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");

const statusMessage = document.getElementById("status-message");

const loading = document.getElementById("loading");

const errorMessage = document.getElementById("error-message");
const errorText = document.getElementById("error-text");

const weatherDashboard =
    document.getElementById("weather-dashboard");

const locationName =
    document.getElementById("location-name");

const weatherIcon =
    document.getElementById("weather-icon");

const temperature =
    document.getElementById("temperature");

const humidity =
    document.getElementById("humidity");

const windSpeed =
    document.getElementById("wind-speed");

const weatherCondition =
    document.getElementById("weather-condition");

const weatherCode =
    document.getElementById("weather-code");

const lastUpdated =
    document.getElementById("last-updated");


// ==========================================
// Weather Code Descriptions
// ==========================================

const weatherCodes = {
    0: {
        description: "Clear sky",
        icon: "☀️"
    },

    1: {
        description: "Mainly clear",
        icon: "🌤️"
    },

    2: {
        description: "Partly cloudy",
        icon: "⛅"
    },

    3: {
        description: "Overcast",
        icon: "☁️"
    },

    45: {
        description: "Fog",
        icon: "🌫️"
    },

    48: {
        description: "Depositing rime fog",
        icon: "🌫️"
    },

    51: {
        description: "Light drizzle",
        icon: "🌦️"
    },

    53: {
        description: "Moderate drizzle",
        icon: "🌦️"
    },

    55: {
        description: "Dense drizzle",
        icon: "🌧️"
    },

    56: {
        description: "Light freezing drizzle",
        icon: "🌧️"
    },

    57: {
        description: "Dense freezing drizzle",
        icon: "🌧️"
    },

    61: {
        description: "Slight rain",
        icon: "🌦️"
    },

    63: {
        description: "Moderate rain",
        icon: "🌧️"
    },

    65: {
        description: "Heavy rain",
        icon: "🌧️"
    },

    66: {
        description: "Light freezing rain",
        icon: "🌧️"
    },

    67: {
        description: "Heavy freezing rain",
        icon: "🌧️"
    },

    71: {
        description: "Slight snowfall",
        icon: "🌨️"
    },

    73: {
        description: "Moderate snowfall",
        icon: "🌨️"
    },

    75: {
        description: "Heavy snowfall",
        icon: "❄️"
    },

    77: {
        description: "Snow grains",
        icon: "❄️"
    },

    80: {
        description: "Slight rain showers",
        icon: "🌦️"
    },

    81: {
        description: "Moderate rain showers",
        icon: "🌧️"
    },

    82: {
        description: "Violent rain showers",
        icon: "⛈️"
    },

    85: {
        description: "Slight snow showers",
        icon: "🌨️"
    },

    86: {
        description: "Heavy snow showers",
        icon: "❄️"
    },

    95: {
        description: "Thunderstorm",
        icon: "⛈️"
    },

    96: {
        description: "Thunderstorm with slight hail",
        icon: "⛈️"
    },

    99: {
        description: "Thunderstorm with heavy hail",
        icon: "⛈️"
    }
};


// ==========================================
// Get Location From City
// ==========================================

async function getLocation(city) {

    const url =
        `${GEOCODING_API}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            "Unable to connect to the location service."
        );
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error(
            `Could not find a city named "${city}".`
        );
    }

    return data.results[0];
}


// ==========================================
// Get Weather Data
// ==========================================

async function getWeather(latitude, longitude) {

    const url =
        `${WEATHER_API}?latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
        `&wind_speed_unit=kmh&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            "Unable to retrieve weather data."
        );
    }

    const data = await response.json();

    if (!data.current) {
        throw new Error(
            "Weather information is unavailable."
        );
    }

    return data;
}


// ==========================================
// Search Weather
// ==========================================

async function searchWeather(city) {

    showLoading();

    hideError();

    hideWeather();

    setStatus(
        `Searching for weather in ${city}...`
    );

    try {

        // Get city coordinates
        const location = await getLocation(city);

        // Get weather using coordinates
        const weatherData = await getWeather(
            location.latitude,
            location.longitude
        );

        // Display results
        displayWeather(
            location,
            weatherData
        );

        setStatus(
            `Weather information loaded for ${location.name}.`
        );

    } catch (error) {

        console.error(
            "Weather request failed:",
            error
        );

        showError(
            error.message ||
            "Something went wrong. Please try again."
        );

    } finally {

        hideLoading();

    }
}


// ==========================================
// Display Weather
// ==========================================

function displayWeather(location, data) {

    const current = data.current;

    const code = current.weather_code;

    const weatherInfo =
        weatherCodes[code] ||
        {
            description: "Unknown",
            icon: "🌍"
        };


    // Location
    const country =
        location.country
            ? `, ${location.country}`
            : "";

    locationName.textContent =
        `${location.name}${country}`;


    // Temperature
    temperature.textContent =
        Math.round(current.temperature_2m);


    // Humidity
    humidity.textContent =
        Math.round(
            current.relative_humidity_2m
        );


    // Wind Speed
    windSpeed.textContent =
        Math.round(
            current.wind_speed_10m
        );


    // Weather condition
    weatherCondition.textContent =
        weatherInfo.description;


    // Weather code
    weatherCode.textContent =
        code;


    // Weather icon
    weatherIcon.textContent =
        weatherInfo.icon;


    // Last updated
    const updateTime =
        current.time
            ? formatDateTime(current.time)
            : "Just now";

    lastUpdated.textContent =
        `Last updated: ${updateTime}`;


    // Show dashboard
    weatherDashboard.classList.remove(
        "hidden"
    );
}


// ==========================================
// Format Date & Time
// ==========================================

function formatDateTime(dateTime) {

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
        return dateTime;
    }

    return date.toLocaleString(
        undefined,
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}


// ==========================================
// Loading State
// ==========================================

function showLoading() {

    loading.classList.remove("hidden");

    searchButton.disabled = true;

    searchButton.textContent =
        "Searching...";
}


function hideLoading() {

    loading.classList.add("hidden");

    searchButton.disabled = false;

    searchButton.textContent =
        "Search Weather";
}


// ==========================================
// Error Handling
// ==========================================

function showError(message) {

    errorText.textContent = message;

    errorMessage.classList.remove(
        "hidden"
    );

    weatherDashboard.classList.add(
        "hidden"
    );
}


function hideError() {

    errorMessage.classList.add(
        "hidden"
    );
}


// ==========================================
// Status Message
// ==========================================

function setStatus(message) {

    statusMessage.textContent =
        message;
}


// ==========================================
// Hide Weather Dashboard
// ==========================================

function hideWeather() {

    weatherDashboard.classList.add(
        "hidden"
    );
}


// ==========================================
// Form Event
// ==========================================

searchForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const city =
            cityInput.value.trim();

        if (!city) {

            showError(
                "Please enter a city name."
            );

            cityInput.focus();

            return;
        }

        await searchWeather(city);

    }
);


// ==========================================
// Initial State
// ==========================================

hideLoading();

hideError();

hideWeather();

setStatus(
    "Enter a city name to check the current weather."
);