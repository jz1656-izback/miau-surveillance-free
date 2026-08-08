import { getPosition, getOrbitalPath } from '../tracking/orbit';
import { TRACKED_SATELLITES } from '../api/satellites';

export interface PassPrediction {
  satName: string;
  riseTime: Date;
  duration: number; // seconds
  maxElevation: number; // degrees
  direction: string; // N, NE, E, etc.
}

// Predict next overhead passes for a ground location
export function predictPasses(lat: number, lon: number, hoursAhead = 12): PassPrediction[] {
  const predictions: PassPrediction[] = [];
  const now = Date.now();
  const stepMs = 30000; // check every 30 seconds

  for (const sat of TRACKED_SATELLITES) {
    let inPass = false;
    let passStart = 0;
    let maxElev = 0;

    for (let t = 0; t < hoursAhead * 3600000; t += stepMs) {
      const pos = getPosition(sat.noradId, now + t);
      if (!pos) continue;

      const dist = haversineKm(lat, lon, pos.lat, pos.lon);
      const elev = Math.max(0, 90 - (dist / 20)); // rough elevation estimate

      if (dist < 5000 && !inPass) {
        inPass = true;
        passStart = t;
        maxElev = elev;
      }
      if (inPass) {
        maxElev = Math.max(maxElev, elev);
        if (dist > 5000 || t >= hoursAhead * 3600000 - stepMs) {
          const duration = t - passStart;
          if (duration > 60000) { // minimum 1 minute pass
            predictions.push({
              satName: sat.name,
              riseTime: new Date(now + passStart),
              duration: Math.round(duration / 1000),
              maxElevation: Math.round(maxElev),
              direction: getDirection(lat, lon, pos.lat, pos.lon),
            });
          }
          inPass = false;
        }
      }
    }
  }

  return predictions.sort((a, b) => a.riseTime.getTime() - b.riseTime.getTime());
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getDirection(fromLat: number, fromLon: number, toLat: number, toLon: number): string {
  const dLon = ((toLon - fromLon) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((toLat * Math.PI) / 180);
  const x = Math.cos((fromLat * Math.PI) / 180) * Math.sin((toLat * Math.PI) / 180) -
            Math.sin((fromLat * Math.PI) / 180) * Math.cos((toLat * Math.PI) / 180) * Math.cos(dLon);
  const brng = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(brng / 45) % 8]!;
}
