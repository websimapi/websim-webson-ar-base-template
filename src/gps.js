import { haversineDistance, setText, banner } from "utils";

let watchId = null;
let lastUserPos = null;

export function startGPSWatch(highAccuracy = true) {
  if (!('geolocation' in navigator)) return;

  stopGPSWatch();
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      lastUserPos = pos.coords;
      updateDistanceToPOI();
    },
    (err) => {
      banner('GPS watch error. Tracking may be limited.');
      console.warn('GPS watch error', err);
    },
    {
      enableHighAccuracy: highAccuracy,
      maximumAge: 2000,
      timeout: 8000
    }
  );
}

export function stopGPSWatch() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}

function getPOICoords() {
  const poi = document.getElementById('poi');
  if (!poi) return null;
  // Read from gps-entity-place component attributes
  const lat = parseFloat(poi.getAttribute('gps-entity-place')?.match(/latitude:\s*([-\d.]+)/)?.[1] ?? NaN);
  const lon = parseFloat(poi.getAttribute('gps-entity-place')?.match(/longitude:\s*([-\d.]+)/)?.[1] ?? NaN);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  return { lat, lon };
}

export function updateDistanceToPOI() {
  if (!lastUserPos) return;
  const poi = getPOICoords();
  if (!poi) return;
  const d = haversineDistance(lastUserPos.latitude, lastUserPos.longitude, poi.lat, poi.lon);
  setText('distanceStatus', `Distance: ${d < 1000 ? `${Math.round(d)}m` : `${(d/1000).toFixed(2)}km`}`);
}

