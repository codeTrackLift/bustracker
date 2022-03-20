// Global variables
let markerArray = [];
let busArray = [];
let darkMode = true;
let runStatus = false;
var runTimeout;
var refreshTimeout;
let refreshTimer = 15; // seconds
const refreshRate = 15000; // milliseconds
mapboxgl.accessToken = 'cx.rlW1VwbvL29xMKElLJAeoTyzqPVfVzRvBvWwoQO6q2WvqQDlMKqmZ2gko2fjMmZlLKE5Va0.xmnDmOvxA-E0XuvW2-wH3j';

// DOM elements
let lastUpdated = document.getElementById('lastUpdated');
const displayButton = document.getElementById('displayButton');
const runButton = document.getElementById('runButton');
const refreshCountdown = document.getElementById('refreshTimer');
const pText = document.getElementsByTagName('p');
const h5Text = document.getElementsByTagName('h5');

// Initialize refresh countdown timer
refreshCountdown.innerText = refreshTimer;

// Random color generator
const randomColor = () => {
    const getRandom = (scale) => {
        return Math.floor(Math.random() * scale);
    }
    return `rgb(${getRandom(255)},${getRandom(255)},${getRandom(255)})`;
}

// Run tracker, get data, make/update markerArray
const run = async () => {
    busArray = await getBusLocations();
    lastUpdated.innerText = new Date();
    refreshTimer = refreshRate / 1000;
    for (bus of busArray) {
        const item = getMarker(bus['id']);
        if (!item) {
            makeMarker(bus, bus['id']);
        } else {
            const marker = Object.values(item)[0];
            updateMarker(marker, bus);
        }
    }
    console.log(busArray);
    runTimeout = setTimeout(run, refreshRate);
}

// Fetch bus data from API
const getBusLocations = async () => {
    const response = await fetch('https://api-v3.mbta.com/vehicles?filter[route]=1&include=trip');
    const json = await response.json();
    return json.data;
}

// Get marker & bus id
const getMarker = (busId) => {
    const result = markerArray.find((item) =>
        item['id'] === busId
    );
    return result;
}

// Make marker and push to array
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
    markerArray.push(item);
}

// Update marker location
const updateMarker = (marker, bus) => {
    marker.setLngLat([bus['attributes']['longitude'], bus['attributes']['latitude']])
}

// Utility function
const cips = (data) => {
    let output = '';
    for (let i = 0; i < data.length; i++) {
        let char = data[i];
        if (char.match(/[a-z]/i)) {
            let code = data.charCodeAt(i);
            if (code >= 65 && code <= 90) {
                char = String.fromCharCode(((code - 65 + 13) % 26) + 65);
            } else if (code >= 97 && code <= 122) {
                char = String.fromCharCode(((code - 97 + 13) % 26) + 97);
            }
        }
        output += char;
    }
    return output;
};

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

// Toggle run status, currently only on working
mapboxgl.accessToken = cips(mapboxgl.accessToken);
const toggleStatus = () => {
    if (!runStatus) {
        runStatus = !runStatus;
        runButton.innerText = 'Live';
        runButton.onclick = '';
        runButton.classList.add('buttonEffect');
        run();
        return
    }
}

// Updates refresh timer
const timer = () => {
    refreshTimer -= 0.1;
    refreshCountdown.innerText = refreshTimer.toFixed(1);
    refreshTimeout = setTimeout(timer, 100);
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

// Dark/light mode text changes
const toggleLightModeText = () => {
    for (p of pText) {
        p.classList.toggle('lightText');
    }
    h5Text[0].classList.toggle('lightText');
}

// Mapbox default dark mode
let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-71.104081, 42.365554],
    zoom: 12,
}).addControl(new mapboxgl.NavigationControl());

// Clear map, refreshes if running
const clearMap = () => {
    myMap = document.getElementById('map');
    myMap.innerHTML = '';
    markerArray = [];
    if (runStatus) {
        clearTimeout(runTimeout)
        setTimeout(run,500);
    }
}