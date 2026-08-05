import { state, notify } from '../store/state';

export interface AlertRule {
  id: string;
  type: string;
  threshold?: number;
  enabled: boolean;
}

let rules: AlertRule[] = [];
let permission: NotificationPermission = 'default';

try {
  rules = JSON.parse(localStorage.getItem('miau-alerts') || '[]');
} catch { rules = []; }

export async function requestPermission() {
  if (!('Notification' in window)) return;
  permission = await Notification.requestPermission();
}

export function getRules(): AlertRule[] { return rules; }

export function toggleRule(id: string) {
  const rule = rules.find(r => r.id === id);
  if (rule) { rule.enabled = !rule.enabled; saveRules(); notify(); }
}

export function addRule(rule: AlertRule) {
  if (!rules.find(r => r.id === rule.id)) rules.push(rule);
  saveRules();
}

function saveRules() {
  localStorage.setItem('miau-alerts', JSON.stringify(rules));
}

export function sendAlert(title: string, body: string) {
  if (permission !== 'granted') return;
  try { new Notification(title, { body }); } catch {}
}
