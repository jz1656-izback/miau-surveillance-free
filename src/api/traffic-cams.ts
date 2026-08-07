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

const REPO_BASE = 'https://raw.githubusercontent.com/AidanWelch/OpenTrafficCamMap/master/cameras';
const AVAILABLE_COUNTRIES = ['USA']; // Add more as needed: 'CAN', 'GBR', etc.

export async function fetchTrafficCams(): Promise<TrafficCam[]> {
  const results: TrafficCam[] = [];
  
  for (const country of AVAILABLE_COUNTRIES) {
    try {
      const res = await fetch(
        `${REPO_BASE}/${country}.json`,
        { signal: AbortSignal.timeout(15000) }
      );
      const data = await res.json();
      for (const [state, counties] of Object.entries(data)) {
        for (const [county, cams] of Object.entries(counties as any)) {
          for (const cam of (cams as any[])) {
            if (cam.latitude && cam.longitude && cam.latitude !== 0) {
              results.push({
                ...cam,
                state: state as string,
                county: county as string,
              });
            }
          }
        }
      }
    } catch { /* skip unavailable countries */ }
  }
  
  return results;
}
