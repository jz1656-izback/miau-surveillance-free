import { describe, it, expect, beforeEach } from 'vitest';
import type { TLE } from '../api/satellites';

// Test TLE parsing
describe('TLE Parser', () => {
  it('parses valid TLE data', async () => {
    const { parseTLE } = await import('../api/satellites');
    const data = `ISS (ZARYA)             
1 25544U 98067A   26219.85990514  .00005515  00000+0  10677-3 0  9990
2 25544  51.6325  44.3665 0007337  23.4740 336.6582 15.49380334579769
NOAA 19                 
1 33591U 09005A   26219.72438309 -.00000036  00000+0  00000+0 0  9990
2 33591  98.9977 276.3499 0013268  45.5901 314.6632 14.12449535903695`;

    const tles = parseTLE(data);
    expect(tles).toHaveLength(2);
    expect(tles[0]!.name).toBe('ISS (ZARYA)');
    expect(tles[0]!.noradId).toBe(25544);
    expect(tles[1]!.name).toBe('NOAA 19');
    expect(tles[1]!.noradId).toBe(33591);
  });

  it('returns empty for invalid data', async () => {
    const { parseTLE } = await import('../api/satellites');
    const tles = parseTLE('garbage data\nnot tle');
    expect(tles).toHaveLength(0);
  });

  it('handles empty input', async () => {
    const { parseTLE } = await import('../api/satellites');
    const tles = parseTLE('');
    expect(tles).toHaveLength(0);
  });
});

// Test satellite position calculation
describe('Orbit Calculator', () => {
  it('computes ISS position from TLE', async () => {
    const { updateSatellite, getPosition } = await import('../tracking/orbit');

    const issTLE = {
      name: 'ISS',
      line1: '1 25544U 98067A   26219.85990514  .00005515  00000+0  10677-3 0  9990',
      line2: '2 25544  51.6325  44.3665 0007337  23.4740 336.6582 15.49380334579769',
      noradId: 25544,
    };

    updateSatellite(issTLE);
    const pos = getPosition(25544);
    expect(pos).not.toBeNull();
    expect(pos!.lat).toBeDefined();
    expect(pos!.lon).toBeDefined();
    expect(pos!.alt).toBeGreaterThan(300); // ISS is above 300km
    expect(pos!.alt).toBeLessThan(500); // ISS is below 500km
    expect(pos!.name).toBe('ISS');
  });

  it('returns null for unknown satellite', async () => {
    const { updateSatellite, getPosition } = await import('../tracking/orbit');
    const pos = getPosition(99999);
    expect(pos).toBeNull();
  });
});
