import { getEvents, getEventTypes, subscribe } from '../tracking/history';
import { flyTo } from '../map/core';

let playing = false;
let playbackSpeed = 1; // 1x, 10x, 60x, 600x
let currentTime = Date.now();
let animFrame: number | null = null;

const SPEEDS = [1, 10, 60, 600];
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export function initTimeline() {
  const slider = document.getElementById('timeline-slider') as HTMLInputElement;
  const playBtn = document.getElementById('timeline-play') as HTMLElement;
  const speedBtn = document.getElementById('timeline-speed') as HTMLElement;
  const timeLabel = document.getElementById('timeline-label') as HTMLElement;
  const statsEl = document.getElementById('timeline-stats') as HTMLElement;

  if (!slider) return;

  // Update UI on slider change
  slider.addEventListener('input', () => {
    const pct = parseInt(slider.value) / 100;
    currentTime = Date.now() - (1 - pct) * WINDOW_MS;
    updateLabel(timeLabel, currentTime);
    updateStats(statsEl, currentTime);
    if (!playing) dispatchTimeChange(currentTime);
  });

  // Play/pause
  playBtn?.addEventListener('click', () => {
    playing = !playing;
    playBtn.textContent = playing ? '⏸' : '▶';
    if (playing) startPlayback(slider, timeLabel, statsEl);
    else stopPlayback();
  });

  // Speed cycle
  speedBtn?.addEventListener('click', () => {
    const idx = SPEEDS.indexOf(playbackSpeed);
    playbackSpeed = SPEEDS[(idx + 1) % SPEEDS.length]!;
    speedBtn.textContent = playbackSpeed + 'x';
  });

  // Subscribe to event updates
  subscribe(() => {
    if (!playing) updateStats(statsEl, currentTime);
  });

  updateLabel(timeLabel, currentTime);
  updateStats(statsEl, currentTime);
}

function startPlayback(slider: HTMLInputElement, timeLabel: HTMLElement, statsEl: HTMLElement) {
  const step = () => {
    if (!playing) return;
    const pct = parseInt(slider.value) / 100;
    const increment = (playbackSpeed / WINDOW_MS) * 100 * 16; // 16ms per frame
    const newPct = Math.min(100, pct + increment);
    
    if (newPct >= 100) {
      playing = false;
      document.getElementById('timeline-play')!.textContent = '▶';
      slider.value = '100';
      currentTime = Date.now();
    } else {
      slider.value = String(newPct);
      currentTime = Date.now() - (1 - newPct / 100) * WINDOW_MS;
      animFrame = requestAnimationFrame(step);
    }
    updateLabel(timeLabel, currentTime);
    updateStats(statsEl, currentTime);
    dispatchTimeChange(currentTime);
  };
  animFrame = requestAnimationFrame(step);
}

function stopPlayback() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
}

function updateLabel(el: HTMLElement, time: number) {
  const diff = Date.now() - time;
  if (diff < 60000) el.textContent = 'Now';
  else if (diff < 3600000) el.textContent = Math.round(diff / 60000) + 'm ago';
  else if (diff < 86400000) el.textContent = Math.round(diff / 3600000) + 'h ago';
  else el.textContent = Math.round(diff / 86400000) + 'd ago';
}

function updateStats(el: HTMLElement, time: number) {
  const types = getEventTypes(time);
  const parts: string[] = [];
  if (types.quake) parts.push('🌍' + types.quake);
  if (types.flight) parts.push('✈' + types.flight);
  if (types.wildfire) parts.push('🔥' + types.wildfire);
  if (types.lightning) parts.push('⚡' + types.lightning);
  if (types.disaster) parts.push('⚠' + types.disaster);
  el.textContent = parts.join(' ') || 'No events';
}

function dispatchTimeChange(time: number) {
  window.dispatchEvent(new CustomEvent('timeline-change', { detail: time }));
}
