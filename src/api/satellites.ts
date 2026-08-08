// TLE (Two-Line Element) format for satellite orbit calculation
export interface TLE {
  name: string;
  line1: string;
  line2: string;
  noradId: number;
}

// Parse TLE data from celestrak format
export function parseTLE(data: string): TLE[] {
  const lines = data.trim().split('\n');
  const result: TLE[] = [];
  for (let i = 0; i < lines.length - 2; i += 3) {
    const name = lines[i]!.trim();
    const line1 = lines[i + 1]!.trim();
    const line2 = lines[i + 2]!.trim();
    if (line1.startsWith('1 ') && line2.startsWith('2 ')) {
      result.push({
        name,
        line1,
        line2,
        noradId: parseInt(line1.substring(2, 7).trim()),
      });
    }
  }
  return result;
}

// Fetch TLE data from celestrak (free, no API key)
export async function fetchTLE(group: string = 'stations'): Promise<TLE[]> {
  try {
    const res = await fetch(
      `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=tle`,
      { signal: AbortSignal.timeout(8000) }
    );
    const text = await res.text();
    return parseTLE(text);
  } catch {
    return [];
  }
}

// Fetch multiple satellite groups
export async function fetchAllSatellites(): Promise<TLE[]> {
  const groups = ['stations', 'visual', 'weather', 'starlink', 'gps-ops'];
  const results = await Promise.allSettled(groups.map(g => fetchTLE(g)));
  const all: TLE[] = [];
  results.forEach(r => {
    if (r.status === 'fulfilled') all.push(...r.value);
  });
  return all;
}

// Pre-defined satellites of interest
export const TRACKED_SATELLITES = [
  { noradId: 25544, name: 'ISS' },
  { noradId: 20580, name: 'Hubble' },
  { noradId: 40967, name: 'Tiangong' },
];
