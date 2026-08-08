// Central logging system — console + visual panel + history

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
interface LogEntry { time: number; level: LogLevel; tag: string; msg: string; }

const history: LogEntry[] = [];
const MAX_LOG = 200;
let logPanel: HTMLElement | null = null;
let logVisible = false;

const COLORS: Record<LogLevel, string> = {
  DEBUG: '#888', INFO: '#0c0', WARN: '#fa0', ERROR: '#f44',
};

function log(level: LogLevel, tag: string, msg: string, err?: any) {
  const entry: LogEntry = { time: Date.now(), level, tag, msg: msg + (err ? ' ' + String(err.message || err) : '') };
  history.push(entry);
  if (history.length > MAX_LOG) history.shift();

  // Console
  const c = COLORS[level];
  const ts = new Date(entry.time).toLocaleTimeString();
  if (level === 'ERROR') console.error(`%c[${ts}] ${tag}: ${msg}`, `color:${c}`, err || '');
  else if (level === 'WARN') console.warn(`%c[${ts}] ${tag}: ${msg}`, `color:${c}`);
  else console.log(`%c[${ts}] ${tag}: ${msg}`, `color:${c}`);

  // Visual panel
  updatePanel();
}

function updatePanel() {
  if (!logPanel) return;
  const recent = history.slice(-15).reverse();
  logPanel.innerHTML = recent.map(e =>
    `<div class="log-entry" style="color:${COLORS[e.level]};font-size:8px;padding:1px 4px;border-bottom:1px solid rgba(0,255,0,0.03)">
      <span style="opacity:0.5">${new Date(e.time).toLocaleTimeString()}</span>
      <b>${e.tag}</b> ${e.msg}
    </div>`
  ).join('');
}

export const logger = {
  debug: (tag: string, msg: string) => log('DEBUG', tag, msg),
  info: (tag: string, msg: string) => log('INFO', tag, msg),
  warn: (tag: string, msg: string, err?: any) => log('WARN', tag, msg, err),
  error: (tag: string, msg: string, err?: any) => log('ERROR', tag, msg, err),
  getHistory: () => [...history],
  getErrors: () => history.filter(e => e.level === 'ERROR'),
};

export function initLogPanel() {
  logPanel = document.getElementById('log-panel');
  if (logPanel) {
    // Toggle with tilde key
    window.addEventListener('keydown', e => {
      if (e.key === '`' || e.key === '^') {
        logVisible = !logVisible;
        document.getElementById('log-overlay')!.style.display = logVisible ? 'flex' : 'none';
      }
    });
    updatePanel();
  }
}

// Global error handlers
export function initErrorHandlers() {
  window.onerror = (msg, src, line) => {
    logger.error('GLOBAL', `Unhandled error at ${src}:${line}`, msg);
    return false;
  };
  window.onunhandledrejection = (e) => {
    logger.error('PROMISE', 'Unhandled rejection', e.reason);
  };
}
