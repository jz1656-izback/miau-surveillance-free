import { twoline2satrec, propagate, gstime, eciToGeodetic, SatRec } from 'satellite.js';
import { TLE } from '../api/satellites';

export interface SatellitePosition {
  lat: number;
  lon: number;
  alt: number; // km
  velocity: number; // km/s
  name: string;
  noradId: number;
}

// Pre-compute satrec objects for better performance
const satrecCache: Map<number, { satrec: SatRec; name: string; updated: number }> = new Map();

export function updateSatellite(tle: TLE) {
  try {
    const satrec = twoline2satrec(tle.line1, tle.line2);
    satrecCache.set(tle.noradId, { satrec, name: tle.name, updated: Date.now() });
  } catch { /* invalid TLE */ }
}

export function updateSatellites(tles: TLE[]) {
  tles.forEach(tle => updateSatellite(tle));
}

export function getPosition(noradId: number, timestamp?: number): SatellitePosition | null {
  const entry = satrecCache.get(noradId);
  if (!entry) return null;

  const time = timestamp || Date.now();
  const gmst = gstime(new Date(time));
  
  try {
    const pv = propagate(entry.satrec, new Date(time));
    if (!pv || !pv.position) return null;
    const positionAndVelocity = pv;

    const geodetic = eciToGeodetic(positionAndVelocity.position, gmst);
    const lat = (geodetic.latitude * 180) / Math.PI;
    const lon = (geodetic.longitude * 180) / Math.PI;
    const alt = geodetic.height;

    let velocity = 0;
    if (positionAndVelocity.velocity) {
      const v = positionAndVelocity.velocity;
      velocity = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
    }

    return { lat, lon, alt, velocity, name: entry.name, noradId };
  } catch {
    return null;
  }
}

export function getAllPositions(timestamp?: number): SatellitePosition[] {
  const positions: SatellitePosition[] = [];
  satrecCache.forEach((_, id) => {
    const pos = getPosition(id, timestamp);
    if (pos) positions.push(pos);
  });
  return positions;
}

// Calculate orbital path (future positions)
export function getOrbitalPath(noradId: number, steps = 60, intervalSec = 60): [number, number][] {
  const path: [number, number][] = [];
  const now = Date.now();
  for (let i = 0; i < steps; i++) {
    const pos = getPosition(noradId, now + i * intervalSec * 1000);
    if (pos) path.push([pos.lat, pos.lon]);
  }
  return path;
}
