// Miau Surveillance — Traffic Cam Scraper
// Runs continuously, fetches OTC + DOT APIs, caches results
const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(__dirname, 'dist', 'cameras-cache.json');
const INTERVAL = 30 * 60 * 1000; // 30 minutes

const OTC_MASTER = 'https://raw.githubusercontent.com/AidanWelch/OpenTrafficCamMap/master/cameras/USA.json';
const OTC_V1 = 'https://raw.githubusercontent.com/AidanWelch/OpenTrafficCamMap/v1/cameras/USA.json';

const DOT_SOURCES = [
  ...Array.from({ length: 4 }, (_, i) => ({
    name: `Caltrans D${i+1}`,
    url: `https://cwwp2.dot.ca.gov/data/d${i+1}/cctv/cctvStatusD${(i+1).toString().padStart(2,'0')}.json`,
    parser: (data) => {
      const items = data?.data || [];
      return items.filter(c => c?.cctv?.location?.latitude).map(c => ({
        description: c.cctv.location.locationName || 'Caltrans',
        latitude: parseFloat(c.cctv.location.latitude),
        longitude: parseFloat(c.cctv.location.longitude),
        url: c.cctv.imageData?.url || '',
        format: 'IMAGE_STREAM',
        state: 'California',
        source: 'Caltrans',
      }));
    },
  })),
  {
    name: 'Colorado DOT',
    url: 'https://data.cotrip.org/api/v1/cameras',
    parser: (data) => {
      return (data?.features || []).filter(f => f?.geometry?.coordinates?.[1]).map(f => ({
        description: f.properties?.name || 'Colorado',
        latitude: f.geometry.coordinates[1],
        longitude: f.geometry.coordinates[0],
        url: f.properties?.imageUrl || '',
        format: 'IMAGE_STREAM',
        state: 'Colorado',
        source: 'CoTrip',
      }));
    },
  },
];

function log(msg) {
  console.log(`[${new Date().toISOString().slice(11,19)}] SCRAPER: ${msg}`);
}

async function fetchOTC(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const data = await res.json();
    const cams = [];
    for (const [state, counties] of Object.entries(data)) {
      for (const [, countyCams] of Object.entries(counties)) {
        for (const cam of countyCams) {
          const loc = cam.location || cam;
          const lat = loc.latitude || cam.latitude || 0;
          const lon = loc.longitude || cam.longitude || 0;
          if (lat && lon && lat !== 0) {
            cams.push({
              description: loc.description || cam.description || '',
              latitude: lat, longitude: lon,
              url: cam.url || '',
              format: cam.format || 'IMAGE_STREAM',
              state, source: 'OTC',
            });
          }
        }
      }
    }
    return cams;
  } catch (e) { log(`OTC failed: ${e.message}`); return []; }
}

async function fetchDOT() {
  const results = [];
  for (const src of DOT_SOURCES) {
    try {
      const res = await fetch(src.url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) { log(`${src.name}: HTTP ${res.status}`); continue; }
      const data = await res.json();
      const cams = src.parser(data);
      results.push(...cams);
      log(`${src.name}: ${cams.length} cameras`);
    } catch (e) { log(`${src.name}: ${e.message}`); }
  }
  return results;
}

// Deduplicate by lat/lon (closest 100m)
// Filter out cameras with invalid data and empty/broken URLs
function filterValid(cams) {
  return cams.filter(c => {
    const lat = parseFloat(c.latitude);
    const lon = parseFloat(c.longitude);
    const url = (c.url || '').trim();
    if (!lat || !lon || lat === 0) return false;
    if (!url || url.length < 5) return false;
    return true;
  });
}

function dedupe(cams) {
  const seen = new Set();
  return cams.filter(c => {
    const lat = parseFloat(c.latitude) || 0;
    const lon = parseFloat(c.longitude) || 0;
    if (!lat || !lon) return false;
    const key = `${lat.toFixed(3)},${lon.toFixed(3)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function scrape() {
  log('Starting scrape cycle...');
  
  // Load existing cache
  let cache = [];
  try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch {}

  // Fetch all sources
  const [otcMaster, otcV1, dotCams] = await Promise.all([
    fetchOTC(OTC_MASTER), fetchOTC(OTC_V1), fetchDOT()
  ]);

  // Merge: OTC > DOT > existing
  const newCams = filterValid([...otcMaster, ...otcV1, ...dotCams]);
  const merged = dedupe([...newCams, ...cache]);
  
  // Save
  fs.writeFileSync(CACHE_FILE, JSON.stringify(merged));
  log(`Saved ${merged.length} total cameras (${newCams.length} new this cycle, ${otcMaster.length} OTC-master, ${otcV1.length} OTC-v1, ${dotCams.length} DOT)`);
}

// Run immediately, then on interval
async function run() {
  try {
    await scrape();
  } catch(e) {
    log(`Error: ${e.message} — retrying in 5min`);
  }
  setTimeout(run, INTERVAL);
}
run();
