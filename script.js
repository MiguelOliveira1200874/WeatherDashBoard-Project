// Your JavaScript goes here

// Function to initialize the map
function initMap(lat, lon) {
    // The location
    var location = {lat: lat, lon: lon};

    // The map, centered at the location
    var map = new google.maps.Map(
        document.getElementById('map'), {zoom: 4, center: location});

    // The marker, positioned at the location
    var marker = new google.maps.Marker({position: location, map: map});
}

// Your actual API key
const API_KEY = 'ac19721b4c5345c449d200ed55f84340';

// Variable to store the current system (metric or imperial)
let system = 'metric';

// Function to get weather data for a given city or coordinates
function getWeatherData(city) {
    let url;
    if (city) {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${system}&appid=${API_KEY}`;
    } else {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${system}&appid=${API_KEY}`;
    }
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Log the data to the console
            console.log(data);

            // Convert temperature from Kelvin to Celsius or Fahrenheit, depending on the system
            const temp = system === 'metric' ? data.main.temp : (data.main.temp - 32) * 5/9;

            // Convert wind speed from m/s to km/h or mph, depending on the system
            const windSpeed = system === 'metric' ? data.wind.speed * 3.6 : data.wind.speed;

            // Get the timezone offset in hours
            const timezoneOffsetHours = data.timezone / 3600;

            // Get the current date and time
            const now = new Date();

            // Get the local time in the city
            const localTime = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours() + timezoneOffsetHours, now.getUTCMinutes(), now.getUTCSeconds());

            // Display the data on the page
            document.getElementById('weather-data').innerHTML = `
                <h2>Weather in ${data.name}</h2>
                <p>${data.weather[0].description}</p>
                <p>Temperature: ${temp.toFixed(2)} ${system === 'metric' ? '°C' : '°F'}</p>
                <p>Humidity: ${data.main.humidity}%</p>
                <p>Wind Speed: ${windSpeed.toFixed(2)} ${system === 'metric' ? 'km/h' : 'mph'}</p>
                <p>Local Time: ${localTime.toLocaleTimeString()}</p>
            `;
        })
        .catch(error => console.error('Error:', error));
}

// Get reference to the system toggle button
const toggleSystemButton = document.getElementById('toggle-system');

// Add event listener to the system toggle button
toggleSystemButton.addEventListener('click', function() {
    // Toggle the system
    system = system === 'metric' ? 'imperial' : 'metric';

    // Update the button text
    toggleSystemButton.textContent = `Switch to ${system === 'metric' ? 'Imperial' : 'Metric'}`;

    // Fetch the weather data again to update the displayed values
    getWeatherData(cityInput.value.trim());
});

// Get references to the form and city input
const form = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');

// Listen for form submission
form.addEventListener('submit', function(event) {
    // Prevent the form from being submitted
    event.preventDefault();

    // Get the city from the input and trim any leading/trailing whitespace
    const city = cityInput.value.trim();

    // Display a loading message
    document.getElementById('weather-data').innerHTML = 'Loading...';

    // If the city input is empty, get the user's current location and fetch the weather data for it
    if (!city) {
        navigator.geolocation.getCurrentPosition(function(position) {
            getWeatherData(null, position.coords.latitude, position.coords.longitude);
        });
    } else {
        // Fetch the weather data for the city
        getWeatherData(city);
    }
});

// Update the getWeatherData function to display the data on the page
function getWeatherData(city) {
    fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Log the data to the console
            console.log(data);

            // Initialize the map
            initMap(data.coord.lat, data.coord.lon);

            // Convert temperature from Kelvin to Celsius
            const tempCelsius = data.main.temp - 273.15;

            // Convert wind speed from m/s to km/h
            const windSpeedKmh = data.wind.speed * 3.6;

            // Change the background image based on the weather condition
            switch (data.weather[0].main) {
                case 'Clear':
                    document.body.style.backgroundImage = "url('sun.jpg')";
                    break;
                case 'Clouds':
                    document.body.style.backgroundImage = "url('mist.jpg')";
                    break;
                case 'Rain':
                    document.body.style.backgroundImage = "url('rain.jpg')";
                    break;
                default:
                    document.body.style.backgroundImage = "url('mist.jpg')";
            }

            // Display the data on the page
            document.getElementById('weather-data').innerHTML = `
                <h2>Weather in ${data.name}</h2>
                <p>${data.weather[0].description}</p>
                <p>Temperature: ${tempCelsius.toFixed(2)}°C</p>
                <p>Humidity: ${data.main.humidity}%</p>
                <p>Wind Speed: ${windSpeedKmh.toFixed(2)} km/h</p>
            `;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('weather-data').innerHTML = 'An error occurred while fetching the weather data.';
        });
}
