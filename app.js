// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, onSnapshot, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- CONFIGURATION ---
const GOOGLE_MAPS_API_KEY = "AIzaSyDec5RO1JPrJdX0X5ntqupEU8RQ8rxDiwM"; // Replace with your key

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyD6EzcF1fbB32u5ti4GvHrgAH5nNjYdYU0",
    authDomain: "transitnow-1383b.firebaseapp.com",
    projectId: "transitnow-1383b",
    storageBucket: "transitnow-1383b.appspot.com",
    messagingSenderId: "906839958985",
    appId: "1:906839958985:web:77902b246cdc1f591bf418"
};

// --- GOOGLE MAPS STYLES ---
const lightMapStyle = [ { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] }, { elementType: "labels.icon", stylers: [{ visibility: "off" }] }, { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] }, { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] }, { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] }, { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] }, { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] }, { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] }, { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] }, { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] }, { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] }, { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] }, { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] }, { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] }, { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] }, { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] }, { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] }, { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] }, ];
const darkMapStyle = [ { elementType: "geometry", stylers: [{ color: "#242f3e" }] }, { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] }, { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }, { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] }, { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] }, { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] }, { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] }, { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] }, { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] }, { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] }, { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] }, { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] }, { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] }, { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] }, { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] }, { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }, { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] }, { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }, ];

// --- APP GLOBALS ---
let app, auth, db, map, infoWindow;
let busMarkers = {}, routePolylines = {}, allRoutesData = {};
let stopMarkers = [];
let selectedRouteId = null;
let allAvailableStops = [];
let stopToRoutesMap = new Map();

// Firebase App ID
const appId = 'transitnow-prototype'; 

// --- DOM ELEMENTS ---
const finderViewBtn = document.getElementById('finder-view-btn');
const commuterViewBtn = document.getElementById('commuter-view-btn');
const authorityViewBtn = document.getElementById('authority-view-btn');
const finderView = document.getElementById('finder-view');
const commuterView = document.getElementById('commuter-view');
const authorityView = document.getElementById('authority-view');
const findBusesBtn = document.getElementById('find-buses-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const togglePanelBtn = document.getElementById('toggle-panel-btn');
const panelContent = document.getElementById('panel-content');
const sosBtn = document.getElementById('sos-btn');
const sosModal = document.getElementById('sos-modal');
const closeSosModalBtn = document.getElementById('close-sos-modal-btn');
const finderResultsList = document.getElementById('finder-results-list');

// --- EVENT LISTENERS ---
finderViewBtn.addEventListener('click', () => switchView('finder'));
commuterViewBtn.addEventListener('click', () => switchView('commuter'));
authorityViewBtn.addEventListener('click', () => switchView('authority'));
findBusesBtn.addEventListener('click', findAvailableBuses);
themeToggleBtn.addEventListener('click', toggleTheme);
togglePanelBtn.addEventListener('click', () => panelContent.classList.toggle('hidden'));
sosBtn.addEventListener('click', () => sosModal.classList.remove('hidden'));
closeSosModalBtn.addEventListener('click', () => sosModal.classList.add('hidden'));

// --- VIEW SWITCHING ---
function switchView(view) {
    const views = { finder: finderView, commuter: commuterView, authority: authorityView };
    const buttons = { finder: finderViewBtn, commuter: commuterViewBtn, authority: authorityViewBtn };
    Object.values(views).forEach(v => v.classList.add('hidden'));
    Object.values(buttons).forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white', 'shadow');
        b.classList.add('text-gray-600', 'dark:text-gray-300');
    });
    views[view].classList.remove('hidden');
    buttons[view].classList.add('bg-blue-600', 'text-white', 'shadow');
    buttons[view].classList.remove('text-gray-600', 'dark:text-gray-300');
}

// --- BUS FINDER LOGIC (ACCURATE VERSION) ---
async function findAvailableBuses() {
    const startInput = document.getElementById('start-location-input');
    const endInput = document.getElementById('end-location-input');
    finderResultsList.innerHTML = `<div class="flex justify-center items-center p-4"><div class="spinner border-t-blue-500 border-4 w-6 h-6 rounded-full"></div></div>`;

    const startStopName = startInput.value;
    const endStopName = endInput.value;

    if (!startStopName || !endStopName || !stopToRoutesMap.has(startStopName) || !stopToRoutesMap.has(endStopName)) {
        finderResultsList.innerHTML = `<p class="text-red-500 text-sm text-center">Please select valid start and end stops from the list.</p>`;
        return;
    }

    const startRoutes = stopToRoutesMap.get(startStopName);
    const endRoutes = stopToRoutesMap.get(endStopName);
    const validRoutes = startRoutes.filter(routeId => endRoutes.includes(routeId));

    if (validRoutes.length === 0) {
        finderResultsList.innerHTML = `<p class="text-gray-500 dark:text-gray-400 text-sm text-center">No direct bus routes found between these stops.</p>`;
        return;
    }
    
    const activeBusesOnRoute = Object.values(busMarkers).filter(marker => validRoutes.includes(marker.get('busData').routeId));
    
    if (activeBusesOnRoute.length === 0) {
        finderResultsList.innerHTML = `<p class="text-gray-500 dark:text-gray-400 text-sm text-center">Routes found, but no active buses currently.</p>`;
        return;
    }
    
    const startStopData = allAvailableStops.find(s => s.name === startStopName);
    if (!startStopData) {
        finderResultsList.innerHTML = `<p class="text-red-500 text-sm text-center">Could not find start stop coordinates.</p>`;
        return;
    }
    const startPoint = new google.maps.LatLng(startStopData.lat, startStopData.lng);

    const distanceService = new google.maps.DistanceMatrixService();
    const origins = activeBusesOnRoute.map(bus => bus.getPosition());
    distanceService.getDistanceMatrix({
        origins: origins,
        destinations: [startPoint],
        travelMode: 'DRIVING',
    }, (response, status) => {
        if (status === 'OK') {
            finderResultsList.innerHTML = '';
            const resultsWithEta = [];
            response.rows.forEach((row, i) => {
                if (row.elements[0].status === 'OK') {
                    resultsWithEta.push({
                        busData: activeBusesOnRoute[i].get('busData'),
                        etaText: row.elements[0].duration.text,
                        etaValue: row.elements[0].duration.value
                    });
                }
            });
            
            resultsWithEta.sort((a, b) => a.etaValue - b.etaValue);

            resultsWithEta.forEach(result => {
                const resultElement = document.createElement('div');
                resultElement.className = 'p-3 rounded-lg bg-gray-50/50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-600/50';
                resultElement.innerHTML = `
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-bold text-gray-800 dark:text-white">${allRoutesData[result.busData.routeId].routeName}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">Bus: ${result.busData.id}</p>
                        </div>
                        <p class="text-sm font-semibold text-green-500">${result.etaText}</p>
                    </div>
                `;
                resultElement.addEventListener('click', () => {
                    const marker = busMarkers[result.busData.id];
                    if (marker) {
                         map.panTo(marker.getPosition());
                         google.maps.event.trigger(marker, 'click');
                    }
                });
                finderResultsList.appendChild(resultElement);
            });
        } else {
            finderResultsList.innerHTML = `<p class="text-red-500 text-sm text-center">Could not calculate ETAs.</p>`;
        }
    });
}

// --- STOP LIST FUNCTIONS ---
async function fetchAllStopsAndPopulate() {
    const uniqueStops = new Map();
    stopToRoutesMap = new Map();

    const routesSnapshot = await getDocs(collection(db, `/artifacts/${appId}/routes`));
    for (const routeDoc of routesSnapshot.docs) {
        const routeId = routeDoc.id;
        const stopsSnapshot = await getDocs(query(collection(routeDoc.ref, 'stops'), orderBy('order')));
        stopsSnapshot.forEach(stopDoc => {
            const stopData = stopDoc.data();
            if (!uniqueStops.has(stopData.name)) {
                uniqueStops.set(stopData.name, {
                    name: stopData.name,
                    lat: stopData.position.latitude,
                    lng: stopData.position.longitude
                });
            }
            if (!stopToRoutesMap.has(stopData.name)) {
                stopToRoutesMap.set(stopData.name, []);
            }
            stopToRoutesMap.get(stopData.name).push(routeId);
        });
    }

    allAvailableStops = Array.from(uniqueStops.values());
    const datalist = document.getElementById('stops-datalist');
    if (!datalist) return;
    datalist.innerHTML = ''; 
    allAvailableStops.forEach(stop => {
        const option = document.createElement('option');
        option.value = stop.name;
        datalist.appendChild(option);
    });
}

function setupStopInputListeners() {
    const startInput = document.getElementById('start-location-input');
    const endInput = document.getElementById('end-location-input');
    const listener = (event) => {
        const input = event.target;
        const selectedStop = allAvailableStops.find(stop => stop.name === input.value);
        if (selectedStop) {
            input.dataset.lat = selectedStop.lat;
            input.dataset.lng = selectedStop.lng;
        } else {
            delete input.dataset.lat;
            delete input.dataset.lng;
        }
    };
    startInput.addEventListener('input', listener);
    endInput.addEventListener('input', listener);
}

// --- THEME & MAP ---
function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        if (map) map.setOptions({ styles: darkMapStyle });
    } else {
        document.documentElement.classList.remove('dark');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        if (map) map.setOptions({ styles: lightMapStyle });
    }
    for (const busId in busMarkers) {
    const marker = busMarkers[busId];
    marker.setIcon(createBusIcon());
    }
}
function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    applyTheme(isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), { center: { lat: 31.6339, lng: 74.8723 }, zoom: 13, disableDefaultUI: true });
    infoWindow = new google.maps.InfoWindow();
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    main();
}
window.initMap = initMap;

// --- MARKER, ROUTE, and FLEET LOGIC ---
function createBusIcon() {
    const isDarkTheme = document.documentElement.classList.contains('dark');
    return {
        path: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
        fillColor: '#ffe600ff', // Standard blue color for all buses
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: isDarkTheme ? '#1a202c' : '#ffffff',
        rotation: 0,
        scale: 1.2,
        anchor: new google.maps.Point(12, 12),
        labelOrigin: new google.maps.Point(12, 28)
    };
}

function updateBusMarker(busData) {
    const latLng = { lat: busData.lat, lng: busData.lng };
    if (busMarkers[busData.id]) {
        busMarkers[busData.id].setPosition(latLng);
        busMarkers[busData.id].setIcon(createBusIcon());
        busMarkers[busData.id].set('busData', busData); 
    } else {
        const marker = new google.maps.Marker({
            position: latLng,
            map: map,
            icon: createBusIcon(),
            label: {
                text: busData.id.replace('BUS-', ''),
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
            }
        });
        marker.set('busData', busData);
        marker.addListener('click', () => {
            const data = marker.get('busData');
            const lastUpdated = data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleTimeString() : 'Receiving...';
            const content = `<div class="font-sans text-white"><p class="font-bold text-lg mb-1">${allRoutesData[data.routeId]?.routeName || data.routeId} (${data.id})</p><p class="text-xs mt-2 opacity-70">Last updated: ${lastUpdated}</p></div>`;
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
        });
        busMarkers[busData.id] = marker;
    }
}

function updateAuthorityList(buses) {
    const busStatusList = document.getElementById('bus-status-list');
    busStatusList.innerHTML = '';
    if (buses.length === 0) {
        busStatusList.innerHTML = `<div class="text-sm text-center text-gray-500 dark:text-gray-400 p-4">Waiting for bus data...</div>`;
        return;
    }
    buses.sort((a,b) => (a.id).localeCompare(b.id)).forEach(bus => {
        const busElement = document.createElement('div');
        busElement.className = `p-3 rounded-lg bg-gray-50/50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-600/50`;
        busElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-bold text-gray-800 dark:text-white">${allRoutesData[bus.routeId]?.routeName || bus.routeId}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">${bus.id}</p>
                </div>
                <div class="w-3 h-3 rounded-full blinking" style="background-color: #3b82f6"></div>
            </div>
        `;
        busElement.addEventListener('click', () => {
            const marker = busMarkers[bus.id];
            if (marker) {
                map.panTo(marker.getPosition());
                google.maps.event.trigger(marker, 'click');
            }
        });
        busStatusList.appendChild(busElement);
    });
}

async function fetchAndDrawRoutes() {
    const routesCol = collection(db, `/artifacts/${appId}/routes`);
    const routeList = document.getElementById('route-list');
    onSnapshot(routesCol, (snapshot) => {
        Object.values(routePolylines).forEach(p => p.setMap(null));
        routePolylines = {};
        routeList.innerHTML = '';
        allRoutesData = {};
        snapshot.forEach(doc => {
            const route = doc.data();
            allRoutesData[doc.id] = route; 
            if(route.path && route.path.length > 0) {
                const latlngs = route.path.map(p => ({ lat: p.latitude, lng: p.longitude }));
                const polyline = new google.maps.Polyline({ path: latlngs, geodesic: true, strokeColor: "#3b82f6", strokeOpacity: 0.6, strokeWeight: 5 });
                polyline.setMap(map);
                routePolylines[doc.id] = polyline;
            }
            const routeElement = document.createElement('div');
            routeElement.className = 'p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-600/50';
            routeElement.id = `route-item-${doc.id}`;
            routeElement.innerHTML = `<p class="font-semibold text-gray-700 dark:text-gray-200">${route.routeName}</p><i class="fa-solid fa-chevron-right text-gray-400"></i>`;
            routeElement.addEventListener('click', () => {
                if (selectedRouteId === doc.id) {
                    selectedRouteId = null;
                    clearRouteSelection();
                    clearStopMarkers();
                    document.getElementById('route-details-view').classList.add('hidden');
                } else {
                    selectedRouteId = doc.id;
                    highlightRoute(doc.id);
                    fetchAndShowRouteDetails(doc.id);
                }
            });
            routeList.appendChild(routeElement);
        });
    });
}

// --- ROUTE HIGHLIGHTING AND STOP DETAILS ---
function highlightRoute(routeId) {
    for (const id in routePolylines) {
        routePolylines[id].setOptions({ strokeColor: '#3b82f6', strokeWeight: 5, strokeOpacity: 0.6, zIndex: 1 });
    }
    if (routePolylines[routeId]) {
        routePolylines[routeId].setOptions({ strokeColor: '#1d4ed8', strokeWeight: 8, strokeOpacity: 1, zIndex: 10 });
        const bounds = new google.maps.LatLngBounds();
        routePolylines[routeId].getPath().forEach(latLng => bounds.extend(latLng));
        map.fitBounds(bounds);
    }
    document.querySelectorAll('#route-list > div').forEach(el => el.classList.remove('selected-route'));
    document.getElementById(`route-item-${routeId}`).classList.add('selected-route');
}

function clearRouteSelection() {
    selectedRouteId = null;
    for (const id in routePolylines) {
        routePolylines[id].setOptions({ strokeColor: '#3b82f6', strokeWeight: 5, strokeOpacity: 0.6, zIndex: 1 });
    }
    document.querySelectorAll('#route-list > div').forEach(el => el.classList.remove('selected-route'));
}

function clearStopMarkers() {
    stopMarkers.forEach(marker => marker.setMap(null));
    stopMarkers = [];
}

async function fetchAndShowRouteDetails(routeId) {
    clearStopMarkers();
    const stopsCol = collection(db, `/artifacts/${appId}/routes/${routeId}/stops`);
    const stopsSnapshot = await getDocs(query(stopsCol, orderBy("order")));
    
    const routeDetailsView = document.getElementById('route-details-view');
    const stopList = document.getElementById('stop-list');
    const routeDetailsTitle = document.getElementById('route-details-title');
    
    routeDetailsTitle.textContent = allRoutesData[routeId].routeName;
    stopList.innerHTML = '';
    routeDetailsView.classList.remove('hidden');

    const stops = [];
    stopsSnapshot.forEach(doc => {
        const stopData = doc.data();
        stops.push({ id: doc.id, ...stopData });
        const marker = new google.maps.Marker({
            position: { lat: stopData.position.latitude, lng: stopData.position.longitude },
            map: map,
            title: stopData.name,
            icon: { path: google.maps.SymbolPath.CIRCLE, scale: 6, fillColor: '#ffffff', fillOpacity: 1, strokeColor: '#3b82f6', strokeWeight: 3 }
        });
        stopMarkers.push(marker);
        const stopElement = document.createElement('div');
        stopElement.id = `stop-item-${doc.id}`;
        stopElement.className = 'p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 flex justify-between items-center';
        stopElement.innerHTML = `<p class="text-sm font-semibold text-gray-700 dark:text-gray-200">${stopData.name}</p><p id="eta-${doc.id}" class="text-xs font-bold text-blue-500">-- min</p>`;
        stopList.appendChild(stopElement);
    });
    updateStopETAs(routeId, stops);
}

function updateStopETAs(routeId, stops) {
    if (selectedRouteId !== routeId || !stops || stops.length === 0) return;
    const activeBusesOnRoute = Object.values(busMarkers).filter(marker => marker.get('busData').routeId === routeId);
    
    stops.forEach((stop, stopIndex) => {
        const etaElement = document.getElementById(`eta-${stop.id}`);
        if (!etaElement) return;

        let bestETA = Infinity;
        let bestETAText = 'N/A';
        const approachingBuses = activeBusesOnRoute.filter(bus => bus.get('busData').next_stop_index <= stopIndex + 1);

        if (approachingBuses.length === 0) {
            etaElement.textContent = 'No upcoming buses';
            return;
        }

        const distanceService = new google.maps.DistanceMatrixService();
        const origins = approachingBuses.map(bus => bus.getPosition());
        const destination = new google.maps.LatLng(stop.position.latitude, stop.position.longitude);

        distanceService.getDistanceMatrix({ origins: origins, destinations: [destination], travelMode: 'DRIVING' }, (response, status) => {
            if (status === 'OK') {
                response.rows.forEach(row => {
                    if (row.elements[0].status === 'OK') {
                        const durationSeconds = row.elements[0].duration.value;
                        if (durationSeconds < bestETA) {
                            bestETA = durationSeconds;
                            bestETAText = row.elements[0].duration.text;
                        }
                    }
                });
                etaElement.textContent = bestETAText;
            }
        });
    });
}

// --- MAIN APP LOGIC ---
async function main() {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    if (!db) return; 
    try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
        } else {
            await signInAnonymously(auth);
        }

        await fetchAllStopsAndPopulate();
        setupStopInputListeners();
        fetchAndDrawRoutes();

        const busesCol = collection(db, `/artifacts/${appId}/buses`);
        onSnapshot(busesCol, (snapshot) => {
            const allBuses = [];
            const activeBusIds = new Set();
            snapshot.forEach(doc => {
                const busData = { id: doc.id, ...doc.data() };
                if (busData.lat && busData.lng) {
                    updateBusMarker(busData);
                    allBuses.push(busData);
                    activeBusIds.add(busData.id);
                }
            });
            for (const busId in busMarkers) {
                if (!activeBusIds.has(busId)) {
                    busMarkers[busId].setMap(null);
                    delete busMarkers[busId];
                }
            }
            updateAuthorityList(allBuses);
            if (selectedRouteId) {
                const stopListContainer = document.getElementById('stop-list');
                if (stopListContainer.children.length > 0) {
                    const stopsCol = collection(db, `/artifacts/${appId}/routes/${selectedRouteId}/stops`);
                    getDocs(query(stopsCol, orderBy("order"))).then(stopsSnapshot => {
                        const stops = [];
                        stopsSnapshot.forEach(doc => stops.push({ id: doc.id, ...doc.data() }));
                        updateStopETAs(selectedRouteId, stops);
                    });
                }
            }
        });
    } catch (error) {
        console.error("Authentication or Firestore error:", error);
    }
}

// --- LOAD GOOGLE MAPS SCRIPT ---
(function(){
    if (GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap&libraries=geometry,places&v=weekly`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    } else {
        document.getElementById('map').innerHTML = `<div class="flex items-center justify-center h-full bg-red-100 text-red-800 p-4 text-center"><div><h2 class="text-xl font-bold mb-2">Google Maps API Key Missing</h2><p>Please provide a valid API key in app.js to load the map.</p></div></div>`;
    }
})();

