export interface FireSpot {
  lat: number; lon: number;
  brightness: number;
  confidence: number;
  acqDate: string;
  satellite: string;
}

export async function fetchWildfires(): Promise<FireSpot[]> {
  try {
    const res = await fetch(
      'https://firms.modaps.eosdis.nasa.gov/api/country/csv/ALL/24h',
      { signal: AbortSignal.timeout(10000) }
    );
    const text = await res.text();
    const lines = text.trim().split('\n');
    // Skip header
    return lines.slice(1).map(line => {
      const parts = line.split(',');
      return {
        lat: parseFloat(parts[1]!),
        lon: parseFloat(parts[2]!),
        brightness: parseFloat(parts[3]!) || 0,
        confidence: parseInt(parts[7]!) || 0,
        acqDate: parts[6] || '',
        satellite: parts[8] || '',
      };
    }).filter(f => f.lat && f.lon && !isNaN(f.lat));
  } catch {
    return [];
  }
}
