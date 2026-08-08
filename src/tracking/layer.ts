import L from 'leaflet';
import { getMap } from '../map/core';
import { FlightState, fetchFlights } from '../api/flights';
import { updateFlight, clearOldTracks, getTrack } from './flight-paths';
import { fetchTLE, TRACKED_SATELLITES } from '../api/satellites';
import { updateSatellites, getPosition, getOrbitalPath, SatellitePosition } from './orbit';
import { getShips, Ship } from '../api/ships';
import { toast } from '../ui/toast';
import { logger } from '../utils/logger';

let flightInterval: ReturnType<typeof setInterval> | null = null;
let satelliteInterval: ReturnType<typeof setInterval> | null = null;
let shipMarkers: Map<number, L.Marker> = new Map();
let satelliteMarkers: Map<number, L.Marker> = new Map();
let orbitalPaths: Map<number, L.Polyline> = new Map();

const SHIP_TYPES: Record<string, string> = {
  cargo: '🚢', tanker: '🛢️', passenger: '🛳️', fishing: '🎣', military: '⚓', other: '🚤',
};

// ── Flight Tracking ──

export async function startFlightTracking() {
  if (flightInterval) return;
  
  const updateFlights = async () => {
    try {
      const flights = await fetchFlights();
      flights.forEach(f => {
        updateFlight(f.callsign, f.lat, f.lon, f.alt || 0, f.origin, f.isMilitary, f.milType);
      });
      clearOldTracks();
    } catch { /* silent */ }
  };

  await updateFlights();
  flightInterval = setInterval(updateFlights, 30000);
}

export function stopFlightTracking() {
  if (flightInterval) { clearInterval(flightInterval); flightInterval = null; }
}

// ── Satellite Tracking ──

export async function startSatelliteTracking() {
  try {
    const tles = await fetchTLE('stations');
    updateSatellites(tles);
    toast(`🛰 Tracking ${tles.length} satellites`, 2000);
  } catch { /* */ }

  if (satelliteInterval) return;
  satelliteInterval = setInterval(updateSatelliteMarkers, 2000);
  updateSatelliteMarkers();
}

function updateSatelliteMarkers() {
  const map = getMap();
  
  // Update tracked satellites
  TRACKED_SATELLITES.forEach(sat => {
    const pos = getPosition(sat.noradId);
    if (!pos) return;

    // Update marker
    let marker = satelliteMarkers.get(sat.noradId);
    const icon = L.divIcon({
      className: '',
      html: `<div style="font-size:16px;filter:drop-shadow(0 0 4px #fff)">🛰</div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    if (marker) {
      marker.setLatLng([pos.lat, pos.lon]);
      marker.setPopupContent(
        `<b>${pos.name}</b><br>Alt: ${pos.alt.toFixed(0)} km<br>Vel: ${pos.velocity.toFixed(2)} km/s`
      );
    } else {
      marker = L.marker([pos.lat, pos.lon], { icon })
        .addTo(map)
        .bindPopup(`<b>${pos.name}</b><br>Alt: ${pos.alt.toFixed(0)} km<br>Vel: ${pos.velocity.toFixed(2)} km/s`);
      satelliteMarkers.set(sat.noradId, marker);
    }

    // Update orbital path
    const path = getOrbitalPath(sat.noradId, 90, 60);
    if (path.length >= 2) {
      let trail = orbitalPaths.get(sat.noradId);
      if (trail) {
        trail.setLatLngs(path);
      } else {
        trail = L.polyline(path, {
          color: '#ffffff',
          weight: 1,
          opacity: 0.2,
          dashArray: '3,6',
        }).addTo(map);
        orbitalPaths.set(sat.noradId, trail);
      }
    }
  });
}

export function stopSatelliteTracking() {
  if (satelliteInterval) { clearInterval(satelliteInterval); satelliteInterval = null; }
  satelliteMarkers.forEach(m => getMap().removeLayer(m));
  satelliteMarkers.clear();
  orbitalPaths.forEach(p => getMap().removeLayer(p));
  orbitalPaths.clear();
}

// ── Ship Tracking ──

export function startShipTracking() {
  const map = getMap();
  
  const updateShips = () => {
    const ships = getShips();
    ships.forEach(ship => {
      let marker = shipMarkers.get(ship.mmsi);
      const icon = L.divIcon({
        className: '',
        html: `<div style="font-size:16px;filter:drop-shadow(0 0 3px #00aaff)">${SHIP_TYPES[ship.type] || '🚤'}</div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      if (marker) {
        marker.setLatLng([ship.lat, ship.lon]);
        marker.setPopupContent(
          `<b>${ship.name}</b><br>Type: ${ship.type}<br>Speed: ${ship.speed} kn<br>Heading: ${ship.heading}°<br>Dest: ${ship.destination || 'Unknown'}`
        );
      } else {
        marker = L.marker([ship.lat, ship.lon], { icon })
          .addTo(map)
          .bindPopup(`<b>${ship.name}</b><br>Type: ${ship.type}<br>Speed: ${ship.speed} kn<br>Heading: ${ship.heading}°<br>Dest: ${ship.destination || 'Unknown'}`);
        shipMarkers.set(ship.mmsi, marker);
      }
    });
  };

  updateShips();
  setInterval(updateShips, 30000);
  toast('🚢 12 ships tracking', 2000);
}

export function stopShipTracking() {
  shipMarkers.forEach(m => getMap().removeLayer(m));
  shipMarkers.clear();
}

// ── Init All Tracking ──

function updateStatusBar() {
  const el = document.getElementById('tracking-status');
  if (!el) return;
  const parts: string[] = [];
  if (flightInterval) parts.push('✈ Flights');
  if (satelliteInterval) parts.push('🛰 Sats');
  if (shipMarkers.size > 0) parts.push('🚢 Ships');
  el.textContent = parts.length > 0 ? '📡 Tracking: ' + parts.join(' | ') : '';
  el.style.color = parts.length > 0 ? '#0f0' : '#f44';
}

export async function initTracking() {
  updateStatusBar();
  try {
    await startFlightTracking();
    updateStatusBar();
    toast('✈ Flight trails active', 2000);
  } catch (e) { logger.error('TRACK', 'Flight tracking failed', e); }
  
  try {
    await startSatelliteTracking();
    updateStatusBar();
  } catch (e) { logger.error('TRACK', 'Satellite tracking failed', e); }
  
  try {
    startShipTracking();
    updateStatusBar();
  } catch (e) { logger.error('TRACK', 'Ship tracking failed', e); }
  
  updateStatusBar();
}
