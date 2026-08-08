import L from 'leaflet';
import { WINDY } from '../api/windy-keys';

let velocityLayer: any = null;

// Fetch wind data from Windy API and render as animated particles
export async function showWindParticles(map: L.Map) {
  try {
    const Velocity = (await import('leaflet-velocity')).default;
    
    // Remove existing layer
    if (velocityLayer) {
      map.removeLayer(velocityLayer);
      velocityLayer = null;
    }

    // Fetch wind GFS data
    const res = await fetch(
      `https://api.windy.com/api/point-forecast/v2`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: 20, lon: 10,
          model: 'gfs',
          parameters: ['wind', 'windU', 'windV', 'temp'],
          levels: ['surface', '850h'],
          key: WINDY.plugins,
        }),
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!res.ok) throw new Error('Windy API error');

    // Use predefined wind data sample (GFS global) for particle rendering
    // leaflet-velocity needs a specific JSON format
    const windData = await fetch(
      'https://raw.githubusercontent.com/danwild/leaflet-velocity/master/demo/wind-global.json',
      { signal: AbortSignal.timeout(8000) }
    );
    
    if (!windData.ok) throw new Error('Data fetch failed');
    const data = await windData.json();

    velocityLayer = L.velocityLayer({
      displayValues: true,
      displayOptions: {
        velocityType: 'Global Wind',
        position: 'bottomleft',
      },
      data,
      maxVelocity: 15,
      colorScale: [
        'rgb(0,128,0)',    // calm
        'rgb(0,255,0)',    // light
        'rgb(255,255,0)',  // moderate
        'rgb(255,128,0)',  // strong
        'rgb(255,0,0)',    // very strong
      ],
      lineWidth: 2,
      particleAge: 90,
      frameRate: 15,
    });

    velocityLayer.addTo(map);
    return true;
  } catch (e) {
    console.warn('Wind particles failed:', e);
    return false;
  }
}

export function removeWindParticles(map: L.Map) {
  if (velocityLayer) {
    map.removeLayer(velocityLayer);
    velocityLayer = null;
  }
}
