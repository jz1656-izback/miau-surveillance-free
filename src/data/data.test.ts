import { describe, it, expect } from 'vitest';
import { CAMERAS } from '../data/cameras';
import { CONFLICTS } from '../data/conflicts';
import { MILITARY } from '../data/military';

describe('Camera Data', () => {
  it('has at least 100 cameras', () => {
    expect(CAMERAS.length).toBeGreaterThanOrEqual(100);
  });

  it('all cameras have required fields', () => {
    CAMERAS.forEach(c => {
      expect(c.n).toBeTruthy();
      expect(typeof c.la).toBe('number');
      expect(typeof c.lo).toBe('number');
      expect(c.u).toBeTruthy();
      expect(c.u.startsWith('http')).toBe(true);
      expect(c.c).toBeTruthy();
    });
  });

  it('has multiple camera types', () => {
    const types = new Set(CAMERAS.map(c => c.t));
    expect(types.size).toBeGreaterThan(3);
  });

  it('cameras with vid have valid YouTube IDs', () => {
    const withVid = CAMERAS.filter(c => c.vid);
    expect(withVid.length).toBeGreaterThan(20);
    withVid.forEach(c => {
      expect(c.vid).toBeTruthy();
      expect(c.vid!.length).toBeGreaterThanOrEqual(10);
    });
  });

  it('no duplicate camera names', () => {
    const names = CAMERAS.map(c => c.n);
    const unique = new Set(names);
    expect(unique.size).toBe(CAMERAS.length);
  });
});

describe('Conflict Data', () => {
  it('has at least 40 conflicts', () => {
    expect(CONFLICTS.length).toBeGreaterThanOrEqual(40);
  });

  it('all have valid intensity and coordinates', () => {
    CONFLICTS.forEach(c => {
      expect(['high', 'medium', 'low']).toContain(c.i);
      expect(c.la).toBeGreaterThan(-90);
      expect(c.la).toBeLessThan(90);
      expect(c.lo).toBeGreaterThan(-180);
      expect(c.lo).toBeLessThan(180);
    });
  });
});

describe('Military Data', () => {
  it('has at least 40 installations', () => {
    expect(MILITARY.length).toBeGreaterThanOrEqual(40);
  });

  it('has nuclear and base types', () => {
    const types = new Set(MILITARY.map(m => m.t));
    expect(types.has('nuclear')).toBe(true);
    expect(types.has('base')).toBe(true);
  });
});
