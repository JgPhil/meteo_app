const baseUrl = 'https://api.openweathermap.org/data/2.5/';
const apiKey = '777f91b6cfc9562f9f83fc9851c0fa20';
const main = document.getElementById('main');
const days = ['Lundi', 'Mardi', 'Mercredi', "Jeudi", 'Vendredi', 'Samedi', 'Dimanche'];
let currentDate = new Date();


document.getElementById('form').addEventListener('submit', async function (event) {
    event.preventDefault();
    const city = document.getElementById('town').value;
    oneCallAPI(city);
})


const displaySection = document.querySelector('.display-section');
const actualWeather = displaySection.querySelector('.actual-weather');
const nextDays = displaySection.querySelector('.next-days');


async function oneCallAPI(city) {
    const coords = await getCoords(city);
    const url = baseUrl + 'onecall?lat=' + coords[1] + '&lon=' + coords[0] + '&appid=' + apiKey + '&lang=fr'
    const result = getData(url);
    result.then(data => {
        console.log(data)
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
    document.getElementById('temp').innerHTML = celcius(data.current.temp) + '&deg;';
    document.getElementById('location').innerHTML = city;
    icon_url = fetchIcon(data.current.weather[0]["icon"]);;
    document.getElementById('current-icon').setAttribute('src', icon_url);
    changeWeatherClass(document.querySelector('.card'), getConditions(description), 'card ');
}

const changeWeatherClass = (subject, className, card = null) => subject.className = card + className;


function drawNextDays(daily) {
    let html = '';
    daily.forEach(function (day, k) {
        const dateSum = currentDate.getDay() + k;
        const dayIndex = dateSum > 6 ? dateSum - 7 : dateSum;
        const conditions = getConditions(day.weather[0].description);
        const date = currentDate.addDays(k);
        const dateFormated = date.getDate() + '/' + (date.getMonth() + 1);

        html += `
        <li class="${conditions} day-column">
            <h3>${days[dayIndex]}</h3>
            <h4 class="date">${dateFormated}</h4>
            <div>
            <span class="temp-morn">${celcius(day.temp.morn)}°C</span>
            /
            <span class="temp-day">${celcius(day.temp.day)}°C</span>
            </div>
        </li>
        `;
    });
    document.querySelector('.next-days').innerHTML = html;
}

function drawNextHours() {

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

function fetchIcon(icon) {
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
