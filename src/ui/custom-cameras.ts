import { CAMERAS, Camera } from '../data/cameras';
import { state, notify, saveFavorites } from '../store/state';
import { toast } from './toast';

const STORAGE_KEY = 'miau-custom-cameras';

export function getCustomCameras(): Camera[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

export function saveCustomCameras(cams: Camera[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cams));
}

export function addCustomCamera(cam: Camera) {
  const cams = getCustomCameras();
  if (cams.find(c => c.u === cam.u)) {
    toast('Camera already added', 2000);
    return false;
  }
  cams.push(cam);
  saveCustomCameras(cams);
  notify();
  toast(`Camera "${cam.n}" added!`, 2000);
  return true;
}

export function removeCustomCamera(idx: number) {
  const cams = getCustomCameras();
  const removed = cams.splice(idx, 1)[0];
  saveCustomCameras(cams);
  notify();
  toast(`Removed "${removed?.n}"`, 2000);
}

export function getAllCameras(): Camera[] {
  return [...CAMERAS, ...getCustomCameras()];
}

export function importCameras(jsonStr: string): number {
  try {
    const imported = JSON.parse(jsonStr);
    if (!Array.isArray(imported)) throw new Error('Not an array');
    const valid = imported.filter((c: any) => c.n && c.la && c.lo && c.u);
    const cams = getCustomCameras();
    let added = 0;
    valid.forEach((c: Camera) => {
      if (!cams.find(ex => ex.u === c.u)) { cams.push(c); added++; }
    });
    saveCustomCameras(cams);
    notify();
    toast(`Imported ${added} cameras`, 2000);
    return added;
  } catch {
    toast('Invalid camera JSON format', 3000);
    return 0;
  }
}

export function exportCameras(): string {
  return JSON.stringify(getCustomCameras(), null, 2);
}
