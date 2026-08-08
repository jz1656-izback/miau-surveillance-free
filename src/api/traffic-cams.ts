export interface TrafficCam {
  description: string;
  direction?: string;
  latitude: number;
  longitude: number;
  url: string;
  format: 'M3U8' | 'IMAGE_STREAM' | 'M3U9' | 'UNIQUE_TEXASDOT' | string;
  encoding?: string;
  state?: string;
  county?: string;
}

const REPO_V1 = 'https://raw.githubusercontent.com/AidanWelch/OpenTrafficCamMap/v1/cameras/USA.json';
const REPO_MASTER = 'https://raw.githubusercontent.com/AidanWelch/OpenTrafficCamMap/master/cameras/USA.json';

export async function fetchTrafficCams(): Promise<TrafficCam[]> {
  const results: TrafficCam[] = [];
  
  // Try v1 first (11MB, more cameras), fallback to master (1.5MB)
  for (const url of [REPO_V1, REPO_MASTER]) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      const data = await res.json();
      for (const [state, counties] of Object.entries(data)) {
        for (const [county, cams] of Object.entries(counties as any)) {
          for (const cam of (cams as any[])) {
            // Handle both v1 format (location.latitude) and master format (flat)
            const loc = cam.location || cam;
            const lat = loc.latitude || 0;
            const lon = loc.longitude || 0;
            if (lat && lon && lat !== 0) {
              results.push({
                description: loc.description || cam.description || '',
                latitude: lat,
                longitude: lon,
                url: cam.url || '',
                format: cam.format || 'IMAGE_STREAM',
                encoding: cam.encoding,
                state: state as string,
                county: county as string,
                direction: loc.direction || cam.direction,
              });
            }
          }
        }
      }
      if (results.length > 0) break;
    } catch { /* try next */ }
  }
  
  return results;
}
