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
  const res = await fetch('https://opensky-network.org/api/states/all', { signal: AbortSignal.timeout(8000) });
  const data = await res.json();
  return (data.states || [])
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
}
