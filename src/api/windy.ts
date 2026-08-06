import { WINDY } from './windy-keys';

export type WindyLayer = 'wind' | 'temp' | 'precip' | 'clouds' | 'pressure' | 'waves';

export function getWindyTileUrl(layer: WindyLayer): string {
  return `https://tiles.windy.com/tiles/v9.0/${layer}/{z}/{x}/{y}.png?key=${WINDY.mapForecast}`;
}

export async function fetchWindyPointForecast(lat: number, lon: number) {
  try {
    const res = await fetch('https://api.windy.com/api/point-forecast/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat, lon,
        model: 'gfs',
        parameters: ['wind', 'temp', 'precip', 'rh', 'pressure'],
        levels: ['surface'],
        key: WINDY.pointForecast,
      }),
      signal: AbortSignal.timeout(5000),
    });
    return await res.json();
  } catch {
    return null;
  }
}

export interface WindyWebcam {
  id: string;
  title: string;
  lat: number; lon: number;
  url: string;
  player: string; // 'youtube' | 'windy' | 'other'
  image: string;
}

export async function fetchWindyWebcams(limit = 20): Promise<WindyWebcam[]> {
  try {
    const res = await fetch(
      `https://api.windy.com/webcams/api/v3/webcams?limit=${limit}&include=location,player&key=${WINDY.webcams}`,
      { signal: AbortSignal.timeout(8000) }
    );
    const data = await res.json();
    return (data.webcams || []).map((w: any) => ({
      id: w.id,
      title: w.title,
      lat: w.location?.latitude,
      lon: w.location?.longitude,
      url: w.player?.lifetime?.embed || w.urls?.desktop || '',
      player: w.player?.type || 'other',
      image: w.images?.current?.preview || '',
    }));
  } catch {
    return [];
  }
}
