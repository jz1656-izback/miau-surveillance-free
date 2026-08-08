/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';

describe('Alert System', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '<div id="toast"></div>';
  });

  it('loads default rules', async () => {
    const { getRules } = await import('../ui/alert-system');
    const rules = getRules();
    expect(rules.length).toBeGreaterThanOrEqual(4);
    expect(rules.some(r => r.type === 'quake')).toBe(true);
    expect(rules.some(r => r.type === 'military-flight')).toBe(true);
  });

  it('toggles rule enabled state', async () => {
    const { getRules, toggleRule } = await import('../ui/alert-system');
    const before = getRules().find(r => r.id === 'quake-m5')!;
    const was = before.enabled;
    toggleRule('quake-m5');
    expect(getRules().find(r => r.id === 'quake-m5')!.enabled).toBe(!was);
    toggleRule('quake-m5'); // restore
  });

  it('checkAlert records history', async () => {
    const { checkAlert, getAlertHistory } = await import('../ui/alert-system');
    checkAlert('quake', 6, 'M6.0 near Tokyo');
    const history = getAlertHistory();
    expect(history.length).toBeGreaterThan(0);
    expect(history[0]!.message).toContain('M6.0');
  });
});
