import L from 'leaflet';

let velocityLayer: any = null;
let windActive = false;
let windData: any = null;
let refreshTimer: ReturnType<typeof setInterval> | null = null;
let mapRef: L.Map | null = null;

const WIND_DATA_URL = 'https://raw.githubusercontent.com/danwild/leaflet-velocity/master/demo/wind-global.json';

// Slightly shift wind data to avoid showing the exact same pattern forever
function shiftWindData(data: any): any {
  if (!Array.isArray(data)) return data;
  return data.map((arr: any[], i: number) =>
    Array.isArray(arr)
      ? arr.map((val: number, j: number) => val * (0.92 + Math.sin(Date.now() / 100000 + i * 0.1 + j * 0.1) * 0.16))
      : arr
  );
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

    // Fetch wind data if we don't have it yet
    if (!windData) {
      const res = await fetch(WIND_DATA_URL, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error('Wind data fetch failed');
      windData = await res.json();
    }

    if (velocityLayer) {
      map.removeLayer(velocityLayer);
      velocityLayer = null;
    }

    const currentData = shiftWindData(windData);

    velocityLayer = (L as any).velocityLayer({
      displayValues: true,
      displayOptions: {
        velocityType: 'Global Wind',
        position: 'bottomleft',
        emptyString: 'No wind data',
      },
      data: currentData,
      maxVelocity: 15,
      colorScale: [
        'rgb(0,80,0)',
        'rgb(0,180,0)',
        'rgb(100,255,0)',
        'rgb(255,255,0)',
        'rgb(255,150,0)',
        'rgb(255,50,0)',
        'rgb(200,0,200)',
      ],
      lineWidth: 5,
      particleAge: 60,
      frameRate: 5,
      opacity: 0.6,
    });

    velocityLayer.addTo(map);
    windActive = true;

    // Periodic refresh every 5 minutes to shift patterns
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(() => {
      if (!windActive || !mapRef) return;
      try {
        if (velocityLayer && mapRef.hasLayer(velocityLayer)) {
          mapRef.removeLayer(velocityLayer);
        }
        const shifted = shiftWindData(windData);
        velocityLayer = (L as any).velocityLayer({
          displayValues: true,
          displayOptions: { velocityType: 'Global Wind', position: 'bottomleft', emptyString: 'No wind data' },
          data: shifted,
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
        velocityLayer.addTo(mapRef);
      } catch {}
    }, 300000); // 5 minutes

    // Listen for map resize/grid view toggle - reinitialize particles
    map.on('resize', reinitializeParticles);

    return true;
  } catch (e) {
    console.warn('Wind particles failed:', e);
    return false;
  }
}

// Called when map resizes (grid view toggle, etc.)
function reinitializeParticles() {
  if (!windActive || !mapRef || !windData) return;
  setTimeout(() => {
    try {
      if (velocityLayer && mapRef!.hasLayer(velocityLayer)) {
        mapRef!.removeLayer(velocityLayer);
      }
      const shifted = shiftWindData(windData);
      velocityLayer = (L as any).velocityLayer({
        displayValues: true,
        displayOptions: { velocityType: 'Global Wind', position: 'bottomleft', emptyString: 'No wind data' },
        data: shifted,
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
      velocityLayer.addTo(mapRef!);
    } catch {}
  }, 500);
}

export function removeWindFromMap(map: L.Map) {
  if (velocityLayer) {
    map.removeLayer(velocityLayer);
    velocityLayer = null;
  }
  windActive = false;
  mapRef = null;
  if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
  map.off('resize', reinitializeParticles);
}

export function isWindActive() { return windActive; }
