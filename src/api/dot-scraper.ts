import { TrafficCam } from './traffic-cams';

// DOT API endpoints - all free and public
const DOT_SOURCES = [
  // Caltrans districts 1-4 (confirmed working)
  ...Array.from({ length: 4 }, (_, i) => ({
    name: `Caltrans D${i + 1}`,
    url: `https://cwwp2.dot.ca.gov/data/d${i + 1}/cctv/cctvStatusD${(i + 1).toString().padStart(2, '0')}.json`,
    parser: (data: any) => {
      const cams: TrafficCam[] = [];
      const items = data?.data || [];
      for (const item of items) {
        const c = item?.cctv;
        if (!c?.location?.latitude) continue;
        cams.push({
          description: c.location.locationName || 'Caltrans Cam',
          latitude: parseFloat(c.location.latitude),
          longitude: parseFloat(c.location.longitude),
          url: c.imageData?.url || c.streamUrl || '',
          format: 'IMAGE_STREAM',
          state: 'California',
          direction: c.location.direction || '',
        });
      }
      return cams;
    },
  })),
  // Colorado DOT
  {
    name: 'Colorado DOT',
    url: 'https://data.cotrip.org/api/v1/cameras',
    parser: (data: any) => {
      const cams: TrafficCam[] = [];
      const features = data?.features || [];
      for (const f of features) {
        const coords = f?.geometry?.coordinates;
        if (!coords || coords[0] === 0) continue;
        cams.push({
          description: f.properties?.name || 'Colorado Cam',
          latitude: coords[1],
          longitude: coords[0],
          url: f.properties?.imageUrl || f.properties?.url || '',
          format: 'IMAGE_STREAM',
          state: 'Colorado',
        });
      }
      return cams;
    },
  },
];

export async function scrapeDOTCameras(): Promise<TrafficCam[]> {
  const results: TrafficCam[] = [];
  
  for (const source of DOT_SOURCES) {
    try {
      const res = await fetch(source.url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const data = await res.json();
      const cams = source.parser(data);
      results.push(...cams);
      console.log(`DOT: ${source.name}: ${cams.length} cameras`);
    } catch { /* skip unavailable */ }
  }
  
  return results;
}
