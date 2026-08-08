/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { logger, initLogPanel } from '../utils/logger';

describe('Logger', () => {
  it('records entries in history', () => {
    logger.info('TEST', 'test message');
    const history = logger.getHistory();
    expect(history.length).toBeGreaterThan(0);
    const last = history[history.length - 1]!;
    expect(last.tag).toBe('TEST');
    expect(last.level).toBe('INFO');
    expect(last.msg).toContain('test message');
  });

  it('records errors', () => {
    const before = logger.getHistory().length;
    logger.error('ERR', 'something broke', new Error('boom'));
    const after = logger.getHistory().length;
    expect(after).toBeGreaterThan(before);
    const err = logger.getErrors();
    expect(err.length).toBeGreaterThan(0);
  });

  it('caps history at 200 entries', () => {
    for (let i = 0; i < 250; i++) logger.debug('FILL', `msg ${i}`);
    expect(logger.getHistory().length).toBeLessThanOrEqual(200);
  });

  it('getErrors returns only errors', () => {
    logger.info('X', 'info');
    logger.error('X', 'error1');
    logger.warn('X', 'warn');
    logger.error('X', 'error2');
    const errors = logger.getErrors();
    expect(errors.every(e => e.level === 'ERROR')).toBe(true);
  });

  it('initLogPanel creates panel if element exists', () => {
    document.body.innerHTML = '<div id="log-panel"></div><div id="log-overlay"></div>';
    expect(() => initLogPanel()).not.toThrow();
  });
});

/** @vitest-environment jsdom */
describe('DOM Helpers', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="test-el">hello</div>';
  });

  it('$ returns element', async () => {
    const { $ } = await import('../utils/dom');
    expect($('test-el')).not.toBeNull();
    expect($('missing')).toBeNull();
  });

  it('$$ returns dummy for missing element', async () => {
    const { $$ } = await import('../utils/dom');
    const el = $$('missing-el');
    expect(el).toBeDefined();
    expect(el.id).toContain('dummy');
    expect(() => el.textContent = 'test').not.toThrow();
  });

  it('safeText sets text safely', async () => {
    const { safeText } = await import('../utils/dom');
    safeText('test-el', 'updated');
    safeText('missing', 'nope'); // should not throw
    expect(document.getElementById('test-el')!.textContent).toBe('updated');
  });

  it('safeHTML works for existing and missing', async () => {
    const { safeHTML } = await import('../utils/dom');
    safeHTML('test-el', '<b>bold</b>');
    safeHTML('missing', 'nope'); // should not throw
    expect(document.getElementById('test-el')!.innerHTML).toBe('<b>bold</b>');
  });

  it('safeOnClick handles missing element', async () => {
    const { safeOnClick } = await import('../utils/dom');
    let clicked = false;
    safeOnClick('test-el', () => { clicked = true; });
    safeOnClick('missing', () => {}); // should not throw
    document.getElementById('test-el')!.click();
    expect(clicked).toBe(true);
  });
});
