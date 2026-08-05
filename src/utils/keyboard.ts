import { state } from '../store/state';

export function setupKeyboard() {
  const TAB_KEYS: Record<string, number> = { conflict: 1, military: 2, camera: 3, flight: 4, quake: 5, disaster: 6, weather: 7 };

  document.addEventListener('keydown', e => {
    if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return;

    const k = e.key.toLowerCase();

    // ⌘K / Ctrl+K → command palette
    if ((e.metaKey || e.ctrlKey) && k === 'k') {
      e.preventDefault();
      document.getElementById('cmd-palette')?.classList.add('show');
      (document.getElementById('cmd-input') as HTMLInputElement)?.focus();
      return;
    }

    // R = refresh
    if (k === 'r') {
      window.dispatchEvent(new CustomEvent('miau-refresh'));
      return;
    }

    // F = fullscreen
    if (k === 'f') {
      document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
      return;
    }

    // 1-8 = tabs
    if (k >= '1' && k <= '8') {
      e.preventDefault();
      if (k === '8') {
        window.dispatchEvent(new CustomEvent('miau-show-all'));
      } else {
        const layers = Object.keys(TAB_KEYS);
        for (const l of layers) {
          if (TAB_KEYS[l] === parseInt(k)) {
            window.dispatchEvent(new CustomEvent('miau-focus-layer', { detail: l }));
            return;
          }
        }
      }
    }

    // ? = help
    if (k === '?' && !e.ctrlKey && !e.metaKey) {
      document.getElementById('help-overlay')?.classList.toggle('show');
    }

    // Escape = close modals/palettes
    if (k === 'escape') {
      document.getElementById('cmd-palette')?.classList.remove('show');
      document.getElementById('help-overlay')?.classList.remove('show');
    }
  });
}
