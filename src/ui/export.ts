import { CAMERAS } from '../data/cameras';
import { getCustomCameras } from '../ui/custom-cameras';
import { getRules } from '../ui/alert-system';

export function exportDashboard(): string {
  const state = {
    version: '4.0',
    timestamp: Date.now(),
    cameras: CAMERAS.map(c => ({ n: c.n, la: c.la, lo: c.lo, t: c.t, vid: c.vid })),
    customCameras: getCustomCameras(),
    alerts: getRules(),
    exported: new Date().toISOString(),
  };
  return JSON.stringify(state, null, 2);
}

export function exportSnapshotURL(): string {
  const data = exportDashboard();
  const blob = new Blob([data], { type: 'application/json' });
  return URL.createObjectURL(blob);
}
