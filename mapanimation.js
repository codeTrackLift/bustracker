// Global variables
const markers = [];
let buses = {};
let darkMode = true;
let runStatus = false;

let lastUpdated = document.getElementById('lastUpdated');
const displayButton = document.getElementById('displayButton');
const runButton = document.getElementById('runButton');
const updateTime = document.getElementById('updateTimer');
const pText = document.getElementsByTagName('p');
const h5Text = document.getElementsByTagName('h5');

const refreshRate = 15000
var refreshTimer;
var runTimer;

let updateTimer = 15;
updateTime.innerText = updateTimer;

// Mapbox JS
mapboxgl.accessToken =
    'pk.eyJ1IjoiY29kZXRyYWNrbGlmdCIsImEiOiJjbDB0cnhvdGcwZTJoM2NtdW42N2RxZ3Z1In0.RJA2MpmAgTF0WjfvMVmmhg';

let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-71.104081, 42.365554],
    zoom: 12,
}).addControl(new mapboxgl.NavigationControl());

const run = async () => {
    buses = await getBusLocations();
    lastUpdated.innerText = new Date();
    updateTimer = refreshRate / 1000;
    for (bus of buses) {
        const item = getMarker(bus['id']);
        if (!item) {
            makeMarker(bus, bus['id']);
        } else {
            const marker = Object.values(item)[0];
            updateMarker(marker, bus);
        }
    }
    console.log(buses);
    runTimer = setTimeout(run, refreshRate);
}

// Fetch bus data from API
const getBusLocations = async () => {
    const response = await fetch('https://api-v3.mbta.com/vehicles?filter[route]=1&include=trip');
    const json = await response.json();
    return json.data;
}

// Make markers and push to array
const makeMarker = (bus, id) => {
    let color = randomColor();
    const marker = new mapboxgl.Marker({
            color: color
        })
        .setLngLat([bus['attributes']['longitude'], bus['attributes']['latitude']])
        .addTo(map);
    const item = {
        "marker": marker,
        "id": id
    };
    markers.push(item);
}

// Update marker location
const updateMarker = (marker, bus) => {
    marker.setLngLat([bus['attributes']['longitude'], bus['attributes']['latitude']])
}

// Get Marker & Bus Id
const getMarker = (busId) => {
    const result = markers.find((item) => 
        item.id === busId
    );
    return result;
}

const addMarkerId = () => {
    for(let i = 0; i < markers.length; i++) {
        mapboxMarkers[i].innerText += markers[i]['id'];
    }
}

// Random marker colors
const randomColor = () => {
    const getRandom = (scale) => {
        return Math.floor(Math.random() * scale);
    }
    return `rgb(${getRandom(255)},${getRandom(255)},${getRandom(255)})`;
}


// Click button effect
const buttonEffect = (buttonId) => {
    let buttonClicked = document.getElementById(buttonId);
    buttonClicked.classList.add('buttonEffect');
    buttonClicked.addEventListener('transitionend', () => {
        buttonClicked.classList.remove('buttonEffect');
    }, {
        once: true
    });
}

// Toggle run status, currently only running
const toggleStatus = () => {
    if (!runStatus) {
        runStatus = !runStatus;
        runButton.innerText = 'Running';
        runButton.onclick = '';
        run();
        return
    } 
}

const timer = () => {
    updateTimer -= 0.1;
    updateTime.innerText = updateTimer.toFixed(1);
    refreshTimer = setTimeout(timer, 100);
}

// Dark/light mode
const displayMode = () => {
    if (darkMode) {
        clearMap();
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-71.104081, 42.365554],
            zoom: 12,
        }).addControl(new mapboxgl.NavigationControl());
        darkMode = !darkMode;
        displayButton.classList.toggle('lightmode');
        runButton.classList.toggle('lightmode');
        toggleLightModeText();
        return;
    }
    clearMap();
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v10',
        center: [-71.104081, 42.365554],
        zoom: 12,
    }).addControl(new mapboxgl.NavigationControl());
    displayButton.classList.toggle('lightmode')
    runButton.classList.toggle('lightmode')
    darkMode = !darkMode;
    toggleLightModeText();
}

const clearMap = () => {
    myMap = document.getElementById('map');
    myMap.innerHTML = '';
    markers.forEach(() => markers.pop());
    if(runStatus) {
        clearTimeout(runTimer)
        run();
    }
}

const toggleLightModeText = () => {
    for(p of pText) {   
        p.classList.toggle('lightText');
    }
    h5Text[0].classList.toggle('lightText');
}