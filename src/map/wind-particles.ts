import L from 'leaflet';

let velocityLayer: any = null;
let windActive = false;
let windData: any = null;
let shiftTimer: ReturnType<typeof setInterval> | null = null;

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
    displayOptions: { velocityType: 'Global Wind', position: 'bottomleft', emptyString: 'No wind data' },
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
    pane: 'overlayPane',
  });
}

export async function toggleWindOnMap(map: L.Map): Promise<boolean> {
  if (windActive) { removeWindFromMap(map); return false; }
  return await showWindOnMap(map);
}

async function showWindOnMap(map: L.Map): Promise<boolean> {
  try {
    await import('leaflet-velocity');
    if (!windData) {
      const res = await fetch(WIND_DATA_URL, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error('Wind fetch failed');
      windData = await res.json();
    }

    if (velocityLayer) { map.removeLayer(velocityLayer); velocityLayer = null; }

    const shifted = shiftWindData(windData);
    velocityLayer = createVelocityLayer(shifted);
    velocityLayer.addTo(map);
    windActive = true;

    // Subtle pattern shift every 30s — uses setData (no flicker)
    if (shiftTimer) clearInterval(shiftTimer);
    shiftTimer = setInterval(() => {
      if (!windActive || !velocityLayer) return;
      try {
        const s = shiftWindData(windData);
        if (typeof velocityLayer.setData === 'function') velocityLayer.setData(s);
      } catch {}
    }, 30000);

    return true;
  } catch (e) { console.warn('Wind particles failed:', e); return false; }
}

export function removeWindFromMap(map: L.Map) {
  if (velocityLayer) { map.removeLayer(velocityLayer); velocityLayer = null; }
  windActive = false;
  if (shiftTimer) { clearInterval(shiftTimer); shiftTimer = null; }
}

export function isWindActive() { return windActive; }
