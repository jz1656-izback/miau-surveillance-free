// Safe DOM helpers — never crash on missing elements
import { logger } from './logger';

export function $(id: string): HTMLElement | null {
  return document.getElementById(id);
}

export function $$(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) {
    logger.warn('DOM', `Missing element: #${id}`);
    // Return a dummy div that silently absorbs operations
    const dummy = document.createElement('div');
    dummy.id = id + '-dummy';
    dummy.style.display = 'none';
    document.body.appendChild(dummy);
    return dummy;
  }
  return el;
}

export function safeText(id: string, text: string) {
  const el = $(id);
  if (el) el.textContent = text;
}

export function safeHTML(id: string, html: string) {
  const el = $(id);
  if (el) el.innerHTML = html;
}

export function safeOnClick(id: string, fn: () => void) {
  const el = $(id);
  if (el) el.addEventListener('click', fn);
}
