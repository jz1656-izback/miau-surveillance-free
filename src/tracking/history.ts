// Event history store with IndexedDB persistence

export interface TimelineEvent {
  id: string;
  timestamp: number; // epoch ms
  type: 'quake' | 'flight' | 'disaster' | 'wildfire' | 'lightning' | 'iss' | 'weather' | 'conflict' | 'ship';
  lat: number;
  lon: number;
  label: string;
  detail?: string;
  magnitude?: number; // for quakes, brightness etc
  icon?: string;
}

const DB_NAME = 'miau-timeline';
const DB_VERSION = 1;
const STORE_NAME = 'events';
const MAX_EVENTS = 10000;
const RETENTION_DAYS = 7;

let dbPromise: Promise<IDBDatabase> | null = null;
let memoryEvents: TimelineEvent[] = [];
let subscribers: Set<() => void> = new Set();

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('type', 'type');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

export function addEvent(event: TimelineEvent): void {
  event.id = event.id || crypto.randomUUID();
  memoryEvents.push(event);
  
  // Prune old events
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  memoryEvents = memoryEvents.filter(e => e.timestamp > cutoff);
  if (memoryEvents.length > MAX_EVENTS) memoryEvents = memoryEvents.slice(-MAX_EVENTS);

  // Persist to IndexedDB
  openDB().then(db => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(event);
    } catch { /* */ }
  }).catch(() => {});

  notify();
}

export function getEvents(since?: number, until?: number, type?: string): TimelineEvent[] {
  let events = memoryEvents;
  if (since) events = events.filter(e => e.timestamp >= since);
  if (until) events = events.filter(e => e.timestamp <= until);
  if (type) events = events.filter(e => e.type === type);
  return events.sort((a, b) => b.timestamp - a.timestamp);
}

export function getEventsInWindow(windowMs: number): TimelineEvent[] {
  return getEvents(Date.now() - windowMs);
}

export function getEventCount(since: number): number {
  return memoryEvents.filter(e => e.timestamp >= since).length;
}

export function getEventTypes(since: number): Record<string, number> {
  const counts: Record<string, number> = {};
  memoryEvents
    .filter(e => e.timestamp >= since)
    .forEach(e => { counts[e.type] = (counts[e.type] || 0) + 1; });
  return counts;
}

export function subscribe(fn: () => void) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

function notify() {
  subscribers.forEach(fn => fn());
}

// Load persisted events on startup
export async function loadHistory(): Promise<number> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
    const range = IDBKeyRange.lowerBound(cutoff);
    const all = await new Promise<TimelineEvent[]>((resolve) => {
      const results: TimelineEvent[] = [];
      index.openCursor(range).onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) { results.push(cursor.value); cursor.continue(); }
        else resolve(results);
      };
    });
    memoryEvents = all;
    return all.length;
  } catch {
    return 0;
  }
}
