export interface IssPosition {
  lat: number; lon: number;
  timestamp: number;
}

export async function fetchIssPosition(): Promise<IssPosition | null> {
  try {
    const res = await fetch('http://api.open-notify.org/iss-now.json', { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    return {
      lat: parseFloat(data.iss_position.latitude),
      lon: parseFloat(data.iss_position.longitude),
      timestamp: data.timestamp,
    };
  } catch {
    return null;
  }
}

export async function fetchIssPasses(lat: number, lon: number): Promise<any[]> {
  try {
    const res = await fetch(`http://api.open-notify.org/iss-pass.json?lat=${lat}&lon=${lon}&n=3`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    return (data.response || []).map((p: any) => ({
      duration: p.duration,
      risetime: new Date(p.risetime * 1000),
    }));
  } catch {
    return [];
  }
}
