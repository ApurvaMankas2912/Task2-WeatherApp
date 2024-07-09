const cityInput = document.querySelector(".city-input");
const searchButtton = document.querySelector(".search-btn");
const locationButtton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "b48e872297028b63be3f6f2b661738ed";

const createWeatherCard = (cityName, weatherItem, index) =>{
    if(index===0){//HTML for the main weather card
        return `<div class="details">
                        <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                        <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                        <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                        <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                    </div>
                    <div class="icon">
                        <img src="http://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon" />
                        <h4>${weatherItem.weather[0].description}</h4>
                    </div>`;
    }else{ //HTML for other 5 day forecast card
        return `<li class="cards">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="http://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon" />
                    <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </li>`;
    }
    
}

const getWeatherDetails=(cityName, lat,lon) =>{
    const WEATHER_API_URL =`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data =>{
        //Filter the forecast to get only one forecast perday
        const uniqueForecastDays=[];
        const fiveDaysForecast = data.list.filter(forecast=> {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        //clearing the previous data
        cityInput.value="";
        currentWeatherDiv.innerHTML= "";
        weatherCardsDiv.innerHTML= "";

        //creating weather card and adding them to DOM
        fiveDaysForecast.forEach((weatherItem, index)=> {
            if(index===0){
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index)); 
            }else{
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));    
            }  
        });
    }).catch(()=>{
        alert("An error occured while fetching the Weather forecast!");
    });
}

const getCityCoordinates = () =>{
    const cityName=cityInput.value.trim();
    if(!cityName) return;
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    //Get entered city coordinates(latitude, longitude and name) from the API response
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data =>{
        if(!data.length) return alert(`No coordinates found for ${cityName}`);
        const{name, lat, lon} = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(()=>{
        alert("An error occured while fetching the coordinates!");
    });
}

const getUserCoordinates = () =>{
    navigator.geolocation.getCurrentPosition(
        position => {
            const{latitude , longitude}= position.coords;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            //get city from coordinates using reverse coding API
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data =>{
                const{name} = data[0];
                getWeatherDetails(name, latitude , longitude);
            }).catch(()=>{
                alert("An error occured while fetching the city!");
            });
        },
        error =>{
            if(error.code===error.PERMISSION_DENIED){
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            }
        }
    );
}

locationButtton.addEventListener("click", getUserCoordinates);
searchButtton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());

