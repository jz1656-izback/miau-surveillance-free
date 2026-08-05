export interface AppState {
  activeLayer: string | null; // null = all
  visibleLayers: Set<string>;
  searchQuery: string;
  filterType: string | null;
  favorites: string[];
  theme: 'crt' | 'dark' | 'matrix';
  sidebarCollapsed: boolean;
  cameraStatuses: Map<string, 'online' | 'offline' | 'unknown'>;
  alerts: Alert[];
}

export interface Alert {
  id: string;
  type: 'quake' | 'disaster' | 'military-flight';
  message: string;
  time: number;
  read: boolean;
}

export const state: AppState = {
  activeLayer: null,
  visibleLayers: new Set(['conflict', 'military', 'camera', 'flight', 'quake', 'disaster', 'weather']),
  searchQuery: '',
  filterType: null,
  favorites: JSON.parse(localStorage.getItem('miau-favorites') || '[]'),
  theme: (localStorage.getItem('miau-theme') as AppState['theme']) || 'crt',
  sidebarCollapsed: false,
  cameraStatuses: new Map(),
  alerts: [],
};

export function saveFavorites() {
  localStorage.setItem('miau-favorites', JSON.stringify(state.favorites));
}

export function saveTheme() {
  localStorage.setItem('miau-theme', state.theme);
}

export const subscribers: Set<() => void> = new Set();

export function subscribe(fn: () => void) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export function notify() {
  subscribers.forEach(fn => fn());
}
