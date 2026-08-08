import { describe, it, expect } from 'vitest';
import { findNearby, findRelated, findClusters, correlateEvent } from './correlation';
import { addEvent } from './history';
import type { TimelineEvent } from './history';

const BASE_LAT = 35.0;
const BASE_LON = 139.0;

function makeEvent(overrides: Partial<TimelineEvent> = {}): TimelineEvent {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    type: 'quake',
    lat: BASE_LAT + (Math.random() - 0.5),
    lon: BASE_LON + (Math.random() - 0.5),
    label: 'Test event',
    ...overrides,
  };
}

describe('Event Correlation', () => {
  it('finds events within radius', () => {
    addEvent(makeEvent({ lat: 35.0, lon: 139.0, label: 'near' }));
    addEvent(makeEvent({ lat: 35.1, lon: 139.1, label: 'near2' }));
    addEvent(makeEvent({ lat: 40.0, lon: 140.0, label: 'far' }));

    const nearby = findNearby(35.0, 139.0, 50);
    expect(nearby.some(e => e.label === 'near')).toBe(true);
    expect(nearby.some(e => e.label === 'far')).toBe(false);
  });

  it('finds clusters of events', () => {
    // Add a cluster of events close together
    for (let i = 0; i < 5; i++) {
      addEvent(makeEvent({ lat: 36.0 + i * 0.01, lon: 140.0 + i * 0.01, type: 'quake' }));
    }
    // Add one more for wildfire nearby
    addEvent(makeEvent({ lat: 36.0, lon: 140.0, type: 'wildfire' }));

    const clusters = findClusters(100, 3600000);
    expect(clusters.length).toBeGreaterThan(0);
    // The cluster should have at least 5 events
    const biggest = clusters[0]!;
    expect(biggest.events.length).toBeGreaterThanOrEqual(5);
  });

  it('correlates event with nearby', () => {
    addEvent(makeEvent({ lat: 35.0, lon: 139.0, type: 'quake', magnitude: 6, label: 'Big quake' }));
    addEvent(makeEvent({ lat: 35.05, lon: 139.05, type: 'wildfire', label: 'Fire' }));
    addEvent(makeEvent({ lat: 35.02, lon: 139.02, type: 'flight', label: 'MIL flight' }));

    const group = correlateEvent(
      { id: '', timestamp: Date.now(), type: 'quake', lat: 35.0, lon: 139.0, label: 'Test' },
      50
    );
    expect(group.events.length).toBeGreaterThanOrEqual(2);
    expect(group.severity).toBeDefined();
  });

  it('handles empty results gracefully', () => {
    const nearby = findNearby(0, 0, 10);
    expect(nearby).toEqual([]);
  });
});
