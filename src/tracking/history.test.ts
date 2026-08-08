import { describe, it, expect, beforeEach } from 'vitest';
import { addEvent, getEvents, getEventsInWindow, getEventTypes, getEventCount } from './history';
import type { TimelineEvent } from './history';

describe('History Store', () => {
  // Note: addEvent is async (writes to IndexedDB) but memoryEvents updates synchronously
  const now = Date.now();

  it('adds and retrieves events', () => {
    const event: TimelineEvent = {
      id: 'test-1', timestamp: now - 1000, type: 'quake',
      lat: 35, lon: 139, label: 'M5.5 Tokyo', magnitude: 5.5,
    };
    addEvent(event);
    const events = getEvents();
    expect(events.some(e => e.id === 'test-1')).toBe(true);
  });

  it('filters events by time window', () => {
    addEvent({ id: 'old', timestamp: now - 500000, type: 'quake', lat: 0, lon: 0, label: 'old' });
    addEvent({ id: 'recent', timestamp: now - 100, type: 'quake', lat: 0, lon: 0, label: 'recent' });

    const recent = getEventsInWindow(60000); // last 60s
    expect(recent.some(e => e.id === 'recent')).toBe(true);
    expect(recent.some(e => e.id === 'old')).toBe(false);
  });

  it('counts events by type', () => {
    const types = getEventTypes(0);
    expect(typeof types.quake).toBe('number');
  });

  it('returns events sorted by timestamp desc', () => {
    addEvent({ id: 'a', timestamp: now - 5000, type: 'quake', lat: 0, lon: 0, label: 'a' });
    addEvent({ id: 'b', timestamp: now - 1000, type: 'quake', lat: 0, lon: 0, label: 'b' });

    const events = getEvents();
    const aIdx = events.findIndex(e => e.id === 'a');
    const bIdx = events.findIndex(e => e.id === 'b');
    expect(bIdx).toBeLessThan(aIdx); // b is newer, should come first
  });

  it('counts events since timestamp', () => {
    const count = getEventCount(0);
    expect(count).toBeGreaterThan(0);
  });
});
