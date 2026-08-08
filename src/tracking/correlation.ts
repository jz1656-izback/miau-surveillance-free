import { TimelineEvent, getEvents } from './history';

export interface CorrelatedGroup {
  center: { lat: number; lon: number };
  radius: number;
  events: TimelineEvent[];
  summary: string;
  severity: 'high' | 'medium' | 'low';
}

// Find all events within radius of a point
export function findNearby(lat: number, lon: number, radiusKm = 100): TimelineEvent[] {
  return getEvents().filter(e => distanceKm(lat, lon, e.lat, e.lon) <= radiusKm);
}

// Find events within radius and time window
export function findRelated(lat: number, lon: number, radiusKm = 100, timeWindowMs = 3600000): TimelineEvent[] {
  const since = Date.now() - timeWindowMs;
  return getEvents(since).filter(
    e => distanceKm(lat, lon, e.lat, e.lon) <= radiusKm
  );
}

// Find clusters of events (multiple events close together in time and space)
export function findClusters(maxRadiusKm = 200, maxTimeMs = 3600000): CorrelatedGroup[] {
  const events = getEvents(Date.now() - maxTimeMs);
  const assigned = new Set<string>();
  const groups: CorrelatedGroup[] = [];

  for (const event of events) {
    if (assigned.has(event.id)) continue;
    
    const nearby = events.filter(
      e => !assigned.has(e.id) && distanceKm(event.lat, event.lon, e.lat, e.lon) <= maxRadiusKm
    );

    if (nearby.length >= 2) {
      nearby.forEach(e => assigned.add(e.id));
      const types = countTypes(nearby);
      groups.push({
        center: { lat: avg(nearby.map(e => e.lat)), lon: avg(nearby.map(e => e.lon)) },
        radius: maxRadiusKm,
        events: nearby,
        summary: summarize(nearby, types),
        severity: nearby.some(e => e.magnitude && e.magnitude > 5) ? 'high'
          : nearby.length >= 5 ? 'medium' : 'low',
      });
    }
  }

  return groups.sort((a, b) => b.events.length - a.events.length).slice(0, 10);
}

// Generate a correlation report for a specific event
export function correlateEvent(event: TimelineEvent, radiusKm = 500): CorrelatedGroup {
  const related = findNearby(event.lat, event.lon, radiusKm);
  const types = countTypes(related);
  return {
    center: { lat: event.lat, lon: event.lon },
    radius: radiusKm,
    events: related,
    summary: summarize(related, types),
    severity: related.length >= 10 ? 'high' : related.length >= 5 ? 'medium' : 'low',
  };
}

// Auto-correlate: when new event arrives, check for related events
export function autoCorrelate(event: TimelineEvent): string[] {
  const related = findRelated(event.lat, event.lon, 200);
  const alerts: string[] = [];
  
  if (related.length >= 5) {
    alerts.push(`Cluster of ${related.length} events near ${event.label}`);
  }
  
  // Check for specific dangerous combinations
  const hasQuake = related.some(e => e.type === 'quake' && (e.magnitude || 0) >= 5);
  const hasFire = related.some(e => e.type === 'wildfire');
  const hasFlight = related.some(e => e.type === 'flight');
  
  if (hasQuake && hasFire) alerts.push('⚠ Quake + wildfire correlation');
  if (hasQuake && hasFlight) alerts.push('⚠ Quake near active flight paths');
  
  return alerts;
}

// Haversine distance in km
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function avg(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function countTypes(events: TimelineEvent[]): Record<string, number> {
  const counts: Record<string, number> = {};
  events.forEach(e => { counts[e.type] = (counts[e.type] || 0) + 1; });
  return counts;
}

function summarize(events: TimelineEvent[], types: Record<string, number>): string {
  const parts: string[] = [];
  if (types.quake) parts.push(`${types.quake} quakes`);
  if (types.flight) parts.push(`${types.flight} flights`);
  if (types.wildfire) parts.push(`${types.wildfire} fires`);
  if (types.lightning) parts.push(`${types.lightning} strikes`);
  if (types.disaster) parts.push(`${types.disaster} disasters`);
  return `${events.length} events: ${parts.join(', ')}`;
}
