import L from 'leaflet';

let velocityLayer: any = null;
let windActive = false;
let windData: any = null;
let mapRef: L.Map | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const WIND_DATA_URL = 'https://raw.githubusercontent.com/danwild/leaflet-velocity/master/demo/wind-global.json';

function shiftWindData(data: any): any {
  if (!Array.isArray(data)) return data;
  return data.map((arr: any[], i: number) =>
    Array.isArray(arr)
      ? arr.map((val: number, j: number) => val * (0.92 + Math.sin(Date.now() / 100000 + i * 0.1 + j * 0.1) * 0.16))
      : arr
  );
}

function createVelocityLayer(data: any): any {
  return (L as any).velocityLayer({
    displayValues: true,
    displayOptions: {
      velocityType: 'Global Wind',
      position: 'bottomleft',
      emptyString: 'No wind data',
    },
    data,
    maxVelocity: 15,
    colorScale: [
      'rgb(0,80,0)', 'rgb(0,180,0)', 'rgb(100,255,0)',
      'rgb(255,255,0)', 'rgb(255,150,0)', 'rgb(255,50,0)', 'rgb(200,0,200)',
    ],
    lineWidth: 5,
    particleAge: 60,
    frameRate: 5,
    opacity: 0.6,
  });
}

// Debounced reinitialize on map movement
function onMapMove() {
  if (!windActive || !mapRef || !windData) return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    try {
      if (velocityLayer) {
        mapRef!.removeLayer(velocityLayer);
        velocityLayer = null;
      }
      const shifted = shiftWindData(windData);
      velocityLayer = createVelocityLayer(shifted);
      velocityLayer.addTo(mapRef!);
    } catch {}
  }, 200);
}

export async function toggleWindOnMap(map: L.Map): Promise<boolean> {
  if (windActive) {
    removeWindFromMap(map);
    return false;
  }
  return await showWindOnMap(map);
}

async function showWindOnMap(map: L.Map): Promise<boolean> {
  mapRef = map;
  try {
    await import('leaflet-velocity');

    if (!windData) {
      const res = await fetch(WIND_DATA_URL, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error('Wind data fetch failed');
      windData = await res.json();
    }

    const shifted = shiftWindData(windData);
    velocityLayer = createVelocityLayer(shifted);
    velocityLayer.addTo(map);
    windActive = true;

    // Re-render on any map movement
    map.on('moveend', onMapMove);
    map.on('zoomend', onMapMove);
    map.on('resize', onMapMove);

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
  mapRef = null;
  if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
  map.off('moveend', onMapMove);
  map.off('zoomend', onMapMove);
  map.off('resize', onMapMove);
}

export function isWindActive() { return windActive; }
