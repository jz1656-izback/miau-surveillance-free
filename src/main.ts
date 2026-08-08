import { initApp } from './ui/app';
import { initErrorHandlers, logger } from './utils/logger';
import './style.css';

// Global error handlers
initErrorHandlers();
logger.info('BOOT', 'Miau Surveillance starting...');

// Error recovery overlay
window.addEventListener('error', () => {
  const recovery = document.getElementById('error-recovery');
  if (recovery) recovery.style.display = 'flex';
});

// On DOM ready, start the app
async function boot() {
  try {
    await initApp();
    logger.info('BOOT', 'App initialized successfully');
  } catch (e) {
    logger.error('BOOT', 'Fatal startup error', e);
    const recovery = document.getElementById('error-recovery');
    if (recovery) {
      recovery.style.display = 'flex';
      (document.getElementById('err-msg') as HTMLElement).textContent = String(e);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
