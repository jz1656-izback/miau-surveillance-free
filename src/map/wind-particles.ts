import L from 'leaflet';

let velocityLayer: any = null;
let windActive = false;

// Global wind data URL (14-day NOAA GFS forecast)
const WIND_DATA_URL = 'https://raw.githubusercontent.com/danwild/leaflet-velocity/master/demo/wind-global.json';

export async function toggleWindOnMap(map: L.Map): Promise<boolean> {
  if (windActive) {
    removeWindFromMap(map);
    return false;
  }
  return await showWindOnMap(map);
}

async function showWindOnMap(map: L.Map): Promise<boolean> {
  try {
    // Load the leaflet-velocity module (registers L.velocityLayer)
    await import('leaflet-velocity');

    // Fetch global wind data
    const res = await fetch(WIND_DATA_URL, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error('Wind data fetch failed');
    const data = await res.json();

    // Remove existing
    if (velocityLayer) {
      map.removeLayer(velocityLayer);
      velocityLayer = null;
    }

    // Create animated wind particle layer directly on the map
    velocityLayer = (L as any).velocityLayer({
      displayValues: true,
      displayOptions: {
        velocityType: 'Global Wind',
        position: 'bottomleft',
        emptyString: 'No wind data',
      },
      data,
      maxVelocity: 15,
      colorScale: [
        'rgb(0,80,0)',     // calm
        'rgb(0,180,0)',    // light breeze  
        'rgb(100,255,0)',  // moderate
        'rgb(255,255,0)',  // fresh
        'rgb(255,150,0)',  // strong
        'rgb(255,50,0)',   // very strong
        'rgb(200,0,200)',  // storm
      ],
      lineWidth: 1.5,
      particleAge: 90,
      frameRate: 10,
      opacity: 0.6,
    });

    velocityLayer.addTo(map);
    windActive = true;
    return true;
  } catch (e) {
    console.warn('Wind particles failed:', e);
    return false;
  }
}

export function removeWindFromMap(map: L.Map) {
  if (velocityLayer) {
    map.removeLayer(velocityLayer);
    velocityLayer = null;
  }
  windActive = false;
}

export function isWindActive() { return windActive; }
