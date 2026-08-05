import { state, saveTheme, notify } from '../store/state';

export type Theme = 'crt' | 'dark' | 'matrix';

export function setTheme(theme: Theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  saveTheme();
  notify();
}

export function cycleTheme(): Theme {
  const themes: Theme[] = ['crt', 'dark', 'matrix'];
  const idx = themes.indexOf(state.theme);
  const next = themes[(idx + 1) % themes.length];
  setTheme(next);
  return next;
}

export function initTheme() {
  setTheme(state.theme);
}
