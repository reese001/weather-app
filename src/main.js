// imports
import "./../sass/styles.scss";
import "./../css/weather-icons-wind.min.css";
import "./../css/weather-icons.min.css";

import { Spinner } from "spin.js";
import "spin.js/spin.css";
import { getJSONData } from "./Toolkit";

// initialize variables
let jsonData;
let citySelect;
let tempDisplay;
let cityName;
let weather;
let temperatureList;
let airPressureList;
let humidityList;
let visibilityList;
let windList;
let windIconDiv;
let panel;
let background;
let loadingOverlay;
let credits;


// populate the dropdown
function populateDropdown() {
    if (citySelect) {
        for (let i = 0; i < jsonData.data.cities.length; i++) {
            let option = document.createElement("option");
            option.text = jsonData.data.cities[i].name + ", " + jsonData.data.cities[i].province;
            citySelect.add(option);
        }
    } else {
        console.log("Error");
    }
}

// set background image and icon based on weather condition
function setBackgroundAndIcon(weatherCode) {
    let backgroundImage = new Image();
    let weatherIcon = document.createElement("i");
    weatherIcon.className = `wi wi-owm-${weatherCode}`;

    // set background image based on weather condition
    if (weatherCode >= 300 && weatherCode <= 550) {
        backgroundImage.src = "/images/rainy.jpg";
    } else if (weatherCode == 800) {
        backgroundImage.src = "/images/sunny.jpg";
    } else if (weatherCode == 801) {
        backgroundImage.src = "/images/few-clouds.jpg";
    } else if (weatherCode == 802) {
        backgroundImage.src = "images/scattered-clouds.jpg";
    } else if (weatherCode == 803) {
        backgroundImage.src = "/images/broken-clouds.jpg";
    } else if (weatherCode == 804) {
        backgroundImage.src = "/images/cloudy.jpg";
    } else if (weatherCode >= 700 && weatherCode <= 799) {
        backgroundImage.src = "/images/fog.jpg";
    } else if (weatherCode >= 200 && weatherCode <= 250) {
        backgroundImage.src = "/images/storm.jpg";
    } else if (weatherCode >= 600 && weatherCode <= 650) {
        backgroundImage.src = "/images/snowy.jpg";
    }
    // make sure it only appends to the page once the image is loaded
    backgroundImage.onload = function () {
        document.querySelector(".g-base").style.backgroundImage = `url("${backgroundImage.src}")`;
        weather.appendChild(weatherIcon);
        loadingOverlay.style.display = "none";

    };
}

function fetchWeather(city) {
    const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${city},CA&appid=30941f4e6be0e7c1793d30a4d67ae612&units=metric`;
    getJSONData(API_URL, onWeatherResponse, onError);
}

function onWeatherResponse(data) {
    if (!data.main) {
        document.querySelector(".g-base").style.backgroundImage = "url('/images/sunny.jpg')";
        tempDisplay.textContent = "City Not Found";
        tempDisplay.classList.add("notFound");

        // Clear other weather data
        cityName.textContent = "";
        panel.style.display = "none";
        credits.classList.add("city-not-found");
        document.querySelector(".g-base").style.color = "rgba(255, 255, 255)";
        document.querySelector(".g-banner").style.color = "rgb(255, 255, 255)";
        document.querySelector("select").style.color = "rgb(255, 255, 255)";
        document.querySelector(".g-base").style.minHeight = "100vh";
        loadingOverlay.style.display = "none";
        // else, display the weather data for the city selected
    } else {
        tempDisplay.textContent = `${Math.round(data.main.temp)}°C`;
        temperatureList.innerHTML = `
            <li><h4>Temperature<span><i class="wi wi-thermometer"></i></span></h4></li>
            <li>Feels like: &nbsp&nbsp ${data.main.feels_like}°C</li>
            <li>High: &nbsp&nbsp ${data.main.temp_min}°C</li>
            <li>Low: &nbsp&nbsp ${data.main.temp_max}°C</li>`;
        airPressureList.innerHTML = `
            <li><h4>Pressure<span><i class="wi wi-barometer"></i></span></h4></li>
            <li>${data.main.pressure} hPa</li>`;
        humidityList.innerHTML = `
            <li><h4>Humidity<span><i class="wi wi-humidity"></i></span></h4></li>
            <li>${data.main.humidity}%</li>`;
        visibilityList.innerHTML = `
            <li><h4>Visibility<span><i class="wi wi-horizon"></i></span></h4></li>
            <li>${data.visibility / 1000}km</li>`;
        windIconDiv.innerHTML = "";
        windList.innerHTML = `
            <li><h4>Wind <span><i class="wi wi-wind towards-` + data.wind.deg + `-deg"></i><span></h4></li>
            <li>Wind Speed: &nbsp&nbsp ${Math.round(data.wind.speed) * 3.6} km/h</li>
            <li>Wind Direction: &nbsp&nbsp ${data.wind.deg}°</li>`;
        weather.textContent = data.weather[0].description;
        cityName.textContent = data.name;
        panel.style.display = "block";
        setBackgroundAndIcon(data.weather[0].id);
        document.querySelector(".g-base").style.color = "#fff";
        document.querySelector(".g-banner").style.color = "#fff";
        document.querySelector("select").style.color = "rgba(250, 250, 250, 0.7)";
        credits.classList.remove("city-not-found");
        background.style.opacity = "1";
        panel.style.opacity = "1";
        tempDisplay.classList.remove("notFound");
    }
}

function onCityResponse(data) {
    jsonData = data;
    populateDropdown();
    background.style.opacity = "1";


    // retrieve selected city from local storage
    let selectedCity = localStorage.getItem("selectedCity");

    // if no city is selected in local storage or if the selected city is not present in the dropdown options
    if (!selectedCity || !Array.from(citySelect.options).some(option => option.value == selectedCity)) {
        citySelect.selectedIndex = 0; // select the first option
        selectedCity = citySelect.value; // get the value of the selected city
        fetchWeather(selectedCity); // fetch weather data for the selected city
        localStorage.setItem("selectedCity", selectedCity); // save selected city to local storage
    } else {
        // if a city is already selected in local storage, fetch weather data for it
        citySelect.value = selectedCity; // set the dropdown value to the selected city
        fetchWeather(selectedCity);
    }
}

function onError(error) {
    console.log("Error: " + error.message);
    throw error;
}

// main function to assign variables to elements and handle local storage
function main() {
    citySelect = document.getElementById("s-select").querySelector("select");
    tempDisplay = document.querySelector(".temp");
    cityName = document.querySelector(".city .name");
    weather = document.querySelector(".weather");
    temperatureList = document.querySelector(".temperature");
    airPressureList = document.querySelector(".air-pressure");
    humidityList = document.querySelector(".humidity");
    visibilityList = document.querySelector(".visibility");
    windIconDiv = document.querySelector(".wind-icon");
    windList = document.querySelector(".wind");
    panel = document.getElementById("s-panel");
    background = document.querySelector(".g-base");
    loadingOverlay = document.querySelector(".g-loading-overlay");
    credits = document.querySelector("#s-credits");
    let spinner = new Spinner({ color: "#FFFFFF", lines: 12 }).spin(document.querySelector(".g-loading-overlay"));


    // event listener for when a city is selected from the dropdown
    citySelect.addEventListener("change", function () {
        let selectedCity = this.value;
        localStorage.setItem("selectedCity", selectedCity); // save current selected city to local storage
        if (selectedCity !== "0") {
            fetchWeather(selectedCity);
            // "grey out" text during loading (lower opacity cause grey is ugly)
            document.querySelector(".g-base").style.color = "rgba(255, 255, 255, 0.415)";
            document.querySelector(".g-banner").style.color = "rgba(255, 255, 255, 0.415)";
            document.querySelector("select").style.color = "rgba(255, 255, 255, 0.415)";
            document.querySelector("#s-panel").style.opacity = "0";
        }
    });

    getJSONData("cities.json", onCityResponse, onError);
}

main();
