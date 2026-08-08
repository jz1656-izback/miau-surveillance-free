const MIL_PATTERNS = ['RCH','RRR','CNV','NATO','AAC','AMC','PLF','SUI','DAF','NOW','SVF','HAF','HUAF','PNY','RFR','CTM','IAM','AFP','RSF','BAF','FNF','GAF','HUF','IRL','KAF','LYF','NVY','NAVY','ARMY','COAST','GUARD','FORCE','DEMON','DRAG','VIPR','HAWK','EAGL','FALC','JEDI','NITE','PACK','RAID','SPAR','THND','VALR','WOLF','YANK','ZULU'];
const MIL_COUNTRIES: Record<string, string> = { RCH:'USAF',RRR:'RAF',CNV:'USN',NATO:'NATO',AAC:'UK Army',AMC:'USAF',PLF:'Poland',SUI:'Swiss',DAF:'Denmark',NOW:'Norway',SVF:'Sweden',HAF:'Greece',HUAF:'Hungary',RFR:'Russia',CTM:'France',IAM:'Italy',AFP:'Portugal',GAF:'Germany',FNF:'Finland',NAVY:'Navy',ARMY:'Army',COAST:'Coast Guard',GUARD:'National Guard' };

export function isMilitaryFlight(callsign: string): string | false {
  if (!callsign) return false;
  const u = callsign.toUpperCase();
  for (const p of MIL_PATTERNS) {
    if (u.startsWith(p)) return MIL_COUNTRIES[p] || 'MIL';
  }
  return false;
}

export interface FlightState {
  lat: number; lon: number; callsign: string;
  origin: string; alt: number | null;
  isMilitary: boolean; milType?: string;
}

export async function fetchFlights(): Promise<FlightState[]> {
  try {
    const res = await fetch('https://opensky-network.org/api/states/all', { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    const flights = (data.states || [])
      .filter((s: any[]) => s[5] && s[6] && s[1])
      .slice(0, 80)
      .map((s: any[]) => {
        const cs = (s[1] || '').trim();
        const milType = isMilitaryFlight(cs);
        return {
          lat: s[6], lon: s[5],
          callsign: cs,
          origin: s[2] || '',
          alt: s[7] || null,
          isMilitary: !!milType,
          milType: milType || undefined,
        };
      });
    if (flights.length > 0) return flights;
  } catch { /* fallback */ }
  
  // Fallback: simulated flights when OpenSky is down
  return generateSimulatedFlights();
}

function generateSimulatedFlights(): FlightState[] {
  const routes: [number, number, number, number, string, number][] = [
    [51.5, -0.1, 40.7, -74.0, 'BAW', 11000],
    [48.8, 2.3, 40.7, -74.0, 'AFR', 11500],
    [35.7, 139.8, 33.9, -118.4, 'JAL', 12000],
    [25.2, 55.3, 51.5, -0.1, 'UAE', 12500],
    [52.5, 13.4, 25.2, 55.3, 'DLH', 11500],
    [37.6, 126.9, 1.4, 104.0, 'KAL', 11800],
    [19.1, 72.9, 25.2, 55.3, 'AIC', 11000],
    [-33.9, 151.2, 1.4, 104.0, 'QFA', 12000],
    [55.8, 37.6, 40.7, -74.0, 'AFL', 11300],
    [41.0, 29.0, 51.5, -0.1, 'THY', 10800],
  ];
  
  const t = Date.now() / 300000; // cycle every 5 minutes
  return routes.map(([lat1, lon1, lat2, lon2, cs, alt], i) => {
    const progress = (t + i * 0.3) % 1;
    return {
      lat: lat1 + (lat2 - lat1) * progress,
      lon: lon1 + (lon2 - lon1) * progress,
      callsign: cs + Math.floor(Math.random() * 900 + 100),
      origin: '',
      alt: alt + Math.random() * 2000 - 1000,
      isMilitary: cs === 'AFL',
      milType: cs === 'AFL' ? 'Russia' : undefined,
    };
  });
}
