interface TimelineEvent {
  time: number;
  type: string;
  label: string;
  lat?: number;
  lon?: number;
}

const history: TimelineEvent[] = [];
const MAX_HISTORY = 200;

export function addHistoryEvent(event: TimelineEvent) {
  history.push({ ...event, time: Date.now() });
  if (history.length > MAX_HISTORY) history.shift();
}

export function getHistory(): TimelineEvent[] {
  return [...history].reverse();
}

export function getEventsSince(ms: number): TimelineEvent[] {
  const cutoff = Date.now() - ms;
  return history.filter(e => e.time >= cutoff);
}
