import { state, notify } from '../store/state';
import { logger } from '../utils/logger';
import { toast } from '../ui/toast';

export interface AlertRule {
  id: string;
  type: 'quake' | 'wildfire' | 'military-flight' | 'iss-overhead' | 'lightning-storm' | 'disaster';
  threshold?: number;
  enabled: boolean;
  sound: boolean;
}

const DEFAULT_RULES: AlertRule[] = [
  { id: 'quake-m5', type: 'quake', threshold: 5, enabled: true, sound: true },
  { id: 'quake-m7', type: 'quake', threshold: 7, enabled: true, sound: true },
  { id: 'wildfire-large', type: 'wildfire', threshold: 90, enabled: true, sound: false },
  { id: 'military-flight', type: 'military-flight', enabled: true, sound: true },
  { id: 'lightning-storm', type: 'lightning-storm', threshold: 50, enabled: false, sound: false },
  { id: 'disaster-new', type: 'disaster', enabled: true, sound: true },
];

let rules: AlertRule[] = [];
let permission: NotificationPermission = 'default';
let alertHistory: { time: number; ruleId: string; message: string }[] = [];

try {
  const saved = localStorage.getItem('miau-alert-rules');
  rules = saved ? JSON.parse(saved) : DEFAULT_RULES;
} catch { rules = DEFAULT_RULES; }

export async function requestPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  const result = await Notification.requestPermission();
  permission = result;
  return result === 'granted';
}

export function getPermission() { return permission; }
export function getRules(): AlertRule[] { return rules; }
export function getAlertHistory() { return [...alertHistory].reverse().slice(0, 50); }

export function toggleRule(id: string) {
  const rule = rules.find(r => r.id === id);
  if (rule) { rule.enabled = !rule.enabled; save(); notify(); }
}

export function toggleSound(id: string) {
  const rule = rules.find(r => r.id === id);
  if (rule) { rule.sound = !rule.sound; save(); notify(); }
}

export function setThreshold(id: string, value: number) {
  const rule = rules.find(r => r.id === id);
  if (rule) { rule.threshold = value; save(); notify(); }
}

function save() {
  localStorage.setItem('miau-alert-rules', JSON.stringify(rules));
}

export function checkAlert(type: string, value: number, message: string) {
  for (const rule of rules) {
    if (!rule.enabled || rule.type !== type) continue;
    if (rule.threshold && value < rule.threshold) continue;

    alertHistory.push({ time: Date.now(), ruleId: rule.id, message });
    if (alertHistory.length > 200) alertHistory = alertHistory.slice(-200);

    if (permission === 'granted') {
      try {
        new Notification('🐱 Miau Alert', { body: message, icon: '/favicon.svg' });
      } catch { /* */ }
    }

    toast(`🚨 ${message}`, 5000);
    logger.warn('ALERT', message);
    break; // one alert per event type
  }
}

// Play alert sound using Web Audio API
export function playAlertSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = 'sine';
    gain.gain.value = 0.1;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.stop(ctx.currentTime + 0.3);
  } catch { /* */ }
}
