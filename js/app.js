const baseUrl = 'https://api.openweathermap.org/data/2.5/';
const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', "Jeudi", 'Vendredi', 'Samedi'];
const currentDate = new Date();
let authorize = false;
let apiKey;
fetch("config.json")
    .then(res => res.json())
    .then(data => {
        apiKey = data.apiKey;
    });

document.getElementById('form').addEventListener('submit', async function (event) {
    event.preventDefault();
    const city = document.getElementById('town').value;
    oneCallAPI(city);
})

document.querySelector("#locate").addEventListener('click', async function (event) {
    event.preventDefault();
    if (!authorize) {
        if (!confirm('Autoriser la geolocalisation ?')) {
            return;
        }
        authorize = true;
    }
    const data = await getGeoData();
    const city = data["geoplugin_city"];
    return oneCallAPI(city);
});

async function getGeoData() {
    const geoData = await fetch('http://www.geoplugin.net/json.gp');
    const json = await geoData.json();
    return json;
}

async function oneCallAPI(city) {
    const coords = await getCoords(city);
    const url = baseUrl + 'onecall?lat=' + coords[1] + '&lon=' + coords[0] + '&appid=' + apiKey + '&lang=fr'
    const result = getData(url);
    result.then(data => {
        drawPage(data, city);
    })
}

async function getData(url) {
    const response = await fetch(url);
    const json = await response.json();
    return json;
}

function drawCurrentWeather(data, city) {
    const description = data.current.weather[0].description;
    document.getElementById('description').innerHTML = description;
    document.getElementById('actual-temp').innerHTML = celcius(data.current.temp) + '&deg;';
    document.getElementById('location').innerHTML = city;
    icon_url = openWeatherMapIcon(data.current.weather[0]["icon"]);;
    document.getElementById('current-icon').setAttribute('src', icon_url);
    changeWeatherClass(document.querySelector('.card'), getConditions(description), 'card ');
}

const changeWeatherClass = (subject, className, card = null) => subject.className = card + className;


function drawNextDays(data) {
    let html = '';
    let newDate = currentDate;
    data.forEach(function (day, k) {
        const dateSum = newDate.getDay() + k;
        const dayIndex = dateSum > 6 ? dateSum - 7 : dateSum;
        const conditions = getConditions(day.weather[0].description);
        const date = newDate.addDays(k);
        const dateFormated = date.getDate() + '/' + (date.getMonth() + 1);

        html += `
        <li class="${conditions} day-column">
            <h3>${days[dayIndex]}</h3>
            <h4 class="date">${dateFormated}</h4>
            <div>
            <span class="temp-cards">${celcius(day.temp.morn)}°C</span>
            /
            <span class="temp-cards">${celcius(day.temp.day)}°C</span>
            </div>
        </li>
        `;
    });
    document.querySelector('.next-days').innerHTML = html;
}

function drawNextHours(data) {
    let html = '';
    let date = new Date(currentDate.getTime());
    let aujourdhui = true;
    let demain = false;
    data.forEach(function (hour) {
        const conditions = getConditions(hour.weather[0].description);
        date.setHours(date.getHours() + 1);

        let dayLitterral = aujourdhui ? 'Aujourd\'hui' : (demain ? 'Demain' : days[date.getDay()]);
        html += `
        <li class="${conditions} day-column">
            <h5>${dayLitterral}</h5>
            <h4>${date.getHours()} h</h4>
            <div class="temp-cards">${celcius(hour.temp)}°C</div>
        </li>
        `;
        if (date.getHours() == 23) {
            if (!demain) {
                demain = true;
                aujourdhui = false;
                return;
            }
            demain = false; // after last hour 
        }
    });
    document.querySelector('.next-hours').innerHTML = html;
}

function drawPage(data, city) {
    drawCurrentWeather(data, city);
    drawNextDays(data.daily);
    drawNextHours(data.hourly);
}

async function getCoords(city) {
    const response = await fetch(baseUrl + '/weather?q=' + city + '&appid=777f91b6cfc9562f9f83fc9851c0fa20&lang=fr');
    const json = await response.json();
    const coords = [json.coord.lon, json.coord.lat];
    return coords;
}

function getConditions(description) {
    if (description.match(/plu/)) {
        return 'rainy';
    } else if (description.match(/nuag|brum|couvert/)) {
        return 'cloudy';
    } else if (description.match(/soleil|dégagé/)) {
        return 'sunny';
    } else if (description.match(/neig/)) {
        return 'snow';
    }
}

function openWeatherMapIcon(icon) {
    return "http://openweathermap.org/img/w/" + icon + ".png";
}

function celcius(temp) {
    return Math.round(parseFloat(temp) - 273.15);
}

Date.prototype.addDays = function (days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

Date.prototype.addHours = function (hours) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + hours);
    return date;
}
