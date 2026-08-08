import L from 'leaflet';
import { getMap } from '../map/core';

export interface FlightPoint {
  lat: number; lon: number; alt: number; time: number; heading?: number;
}

export interface FlightTrack {
  callsign: string;
  origin: string;
  isMilitary: boolean;
  milType?: string;
  points: FlightPoint[];
  trail: L.Polyline | null;
}

const tracks: Map<string, FlightTrack> = new Map();
const MAX_POINTS = 120; // 60 minutes at 30s intervals
const MAX_AGE = 60 * 60 * 1000; // 1 hour

export function updateFlight(callsign: string, lat: number, lon: number, alt: number, origin: string, isMilitary: boolean, milType?: string, heading?: number) {
  let track = tracks.get(callsign);
  if (!track) {
    track = { callsign, origin, isMilitary, milType, points: [], trail: null };
    tracks.set(callsign, track);
  }

  track.points.push({ lat, lon, alt, time: Date.now(), heading });
  
  // Trim old points
  const cutoff = Date.now() - MAX_AGE;
  track.points = track.points.filter(p => p.time > cutoff);
  if (track.points.length > MAX_POINTS) track.points = track.points.slice(-MAX_POINTS);

  // Update trail polyline
  updateTrail(track);
}

function updateTrail(track: FlightTrack) {
  const map = getMap();
  const coords = track.points.map(p => [p.lat, p.lon] as [number, number]);

  if (track.trail) {
    track.trail.setLatLngs(coords);
    if (track.points.length === 0) {
      map.removeLayer(track.trail);
      track.trail = null;
    }
  } else if (coords.length >= 2) {
    const color = track.isMilitary ? '#ff4466' : '#0066ff';
    track.trail = L.polyline(coords, {
      color,
      weight: 2,
      opacity: 0.6,
      dashArray: track.isMilitary ? '5,5' : undefined,
      pane: 'overlayPane',
    }).addTo(map);
  }
}

export function getTrack(callsign: string): FlightTrack | undefined {
  return tracks.get(callsign);
}

export function getAllTracks(): FlightTrack[] {
  return Array.from(tracks.values());
}

export function clearOldTracks() {
  const cutoff = Date.now() - MAX_AGE;
  for (const [key, track] of tracks) {
    track.points = track.points.filter(p => p.time > cutoff);
    if (track.points.length === 0) {
      if (track.trail) getMap().removeLayer(track.trail);
      tracks.delete(key);
    } else {
      updateTrail(track);
    }
  }
}
