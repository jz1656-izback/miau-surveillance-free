import L from 'leaflet';
import 'leaflet.markercluster';

let map: L.Map | null = null;
let tileLayer: L.TileLayer | null = null;

export function getMap(): L.Map {
  if (!map) throw new Error('Map not initialized');
  return map;
}

export function initMap(elementId: string): L.Map {
  map = L.map(elementId, {
    zoomControl: false,
    minZoom: 2,
    maxZoom: 18,
    preferCanvas: true,
  }).setView([20, 10], 3);

  tileLayer = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    { attribution: '© CartoDB', maxZoom: 19 }
  ).addTo(map);

  // Custom zoom control
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // Fix size on load/resize
  setTimeout(() => map!.invalidateSize(), 200);
  window.addEventListener('resize', () => map!.invalidateSize());

  return map;
}

export function flyTo(lat: number, lon: number, zoom = 14) {
  map?.flyTo([lat, lon], zoom, { duration: 0.8 });
}

export function fitBounds(coords: [number, number][], padding = 50) {
  if (coords.length === 0) return;
  const bounds = L.latLngBounds(coords.map(c => L.latLng(c[0], c[1])));
  map?.flyToBounds(bounds, { padding: [padding, padding], duration: 1 });
}
