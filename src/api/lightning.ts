export interface LightningStrike {
  lat: number; lon: number;
  time: number;
}

// Blitzortung provides lightning data via their public API
export async function fetchLightning(): Promise<LightningStrike[]> {
  try {
    // Use Blitzortung's public data API
    const res = await fetch('https://map.blitzortung.org/data_1.json', { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    const strikes: LightningStrike[] = [];
    if (data?.strokes) {
      for (const s of data.strokes) {
        strikes.push({ lat: s[0], lon: s[1], time: s[2] });
      }
    }
    return strikes.slice(0, 200);
  } catch {
    // Fallback: no lightning data available
    return [];
  }
}
