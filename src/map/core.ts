import L from 'leaflet';
import 'leaflet.markercluster';
import { getWindyTileUrl, WindyLayer } from '../api/windy';

let map: L.Map | null = null;
let currentTile: L.TileLayer | null = null;
let windyOverlays: L.TileLayer[] = [];
let windyMode = false;

export const TILE_LAYERS: Record<string, { name: string; url: string; attr: string }> = {
  dark: {
    name: 'Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attr: 'CartoDB',
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attr: 'Esri',
  },
  terrain: {
    name: 'Terrain',
    url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
    attr: 'OpenTopoMap',
  },
  streets: {
    name: 'Streets',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attr: 'OpenStreetMap',
  },
  windy: {
    name: 'Windy Blue',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attr: 'CartoDB Light',
  },
};

// Windy mode layers to activate
const WINDY_MODE_LAYERS: WindyLayer[] = ['wind', 'temp', 'precip', 'clouds', 'pressure'];

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

  switchTile('dark');

  L.control.zoom({ position: 'bottomleft' }).addTo(map);
  L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

  setTimeout(() => map!.invalidateSize(), 200);
  window.addEventListener('resize', () => map!.invalidateSize());

  return map;
}

export function isWindyMode() { return windyMode; }

export function toggleWindyMode(): boolean {
  if (!map) return false;
  windyMode = !windyMode;

  if (windyMode) {
    // Switch to light base map
    switchTile('windy');
    // Add all weather overlays
    WINDY_MODE_LAYERS.forEach(layer => {
      const url = getWindyTileUrl(layer);
      const overlay = L.tileLayer(url, { opacity: 0.6, attribution: 'Windy.com' }).addTo(map!);
      windyOverlays.push(overlay);
    });
  } else {
    // Remove all overlays
    windyOverlays.forEach(o => map!.removeLayer(o));
    windyOverlays = [];
    // Switch back to dark
    switchTile('dark');
  }

  updateWindyUI();
  return windyMode;
}

export function toggleSingleWindyLayer(layer: WindyLayer) {
  if (!map) return;
  // If in full Windy mode, switch to single-layer mode
  if (windyMode && windyOverlays.length > 1) {
    windyOverlays.forEach(o => map!.removeLayer(o));
    windyOverlays = [];
    switchTile('windy');
    windyMode = false;
  }
  const existing = windyOverlays.find(o => (o as any)._windyLayer === layer);
  if (existing) {
    map.removeLayer(existing);
    windyOverlays = windyOverlays.filter(o => o !== existing);
  } else {
    const url = getWindyTileUrl(layer);
    const overlay = L.tileLayer(url, { opacity: 0.5, attribution: 'Windy.com' }).addTo(map);
    (overlay as any)._windyLayer = layer;
    windyOverlays.push(overlay);
    if (!windyMode) switchTile('windy');
  }
  updateWindyUI();
}

export function removeWindyOverlay() {
  if (!map) return;
  windyOverlays.forEach(o => map!.removeLayer(o));
  windyOverlays = [];
  windyMode = false;
  switchTile('dark');
  updateWindyUI();
}

function updateWindyUI() {
  const btn = document.getElementById('windy-mode-btn');
  if (btn) {
    btn.classList.toggle('on', windyMode);
    btn.textContent = windyMode ? '🌪 Windy ON' : '🌪 Windy';
  }
  document.querySelectorAll('.windy-btn').forEach(b => {
    const el = b as HTMLElement;
    const layer = el.dataset.windy;
    const active = windyOverlays.some(o => (o as any)._windyLayer === layer);
    el.classList.toggle('on', active);
  });
}

export function switchTile(key: string) {
  if (!map) return;
  const layer = TILE_LAYERS[key];
  if (!layer) return;
  if (currentTile) map.removeLayer(currentTile);
  currentTile = L.tileLayer(layer.url, { attribution: layer.attr, maxZoom: 19 }).addTo(map);
  document.querySelectorAll('.tile-btn').forEach(b => {
    b.classList.toggle('on', (b as HTMLElement).dataset.tile === key);
  });
}

export function flyTo(lat: number, lon: number, zoom = 14) {
  map?.flyTo([lat, lon], zoom, { duration: 0.8 });
}

export function fitBounds(coords: [number, number][], padding = 50) {
  if (coords.length === 0) return;
  const bounds = L.latLngBounds(coords.map(c => L.latLng(c[0], c[1])));
  map?.flyToBounds(bounds, { padding: [padding, padding], duration: 1 });
}
