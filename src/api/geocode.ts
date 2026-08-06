export interface CityResult {
  name: string;
  display: string;
  lat: number;
  lon: number;
}

export async function searchCity(query: string): Promise<CityResult[]> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=en`,
      { signal: AbortSignal.timeout(5000), headers: { 'User-Agent': 'MiauSurveillance/4.0' } }
    );
    const data = await res.json();
    return data.map((r: any) => ({
      name: r.name || r.display_name?.split(',')[0] || 'Unknown',
      display: r.display_name || '',
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
    }));
  } catch {
    return [];
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`,
      { signal: AbortSignal.timeout(3000), headers: { 'User-Agent': 'MiauSurveillance/4.0' } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  } catch {
    return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  }
}
