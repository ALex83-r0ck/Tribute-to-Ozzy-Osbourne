/**
 * Theme module unit + light DOM integration
 */
const Theme = require('../js/theme.js');

describe('OzzyTheme – normalize & apply', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.className = '';
  });

  test('normalizeTheme defaults invalid values to dark-mode', () => {
    expect(Theme.normalizeTheme('disco')).toBe('dark-mode');
    expect(Theme.normalizeTheme('light-mode')).toBe('light-mode');
    expect(Theme.normalizeTheme('moon-mode')).toBe('moon-mode');
  });

  test('applyTheme light-mode', () => {
    Theme.applyTheme('light-mode');
    expect(document.body.classList.contains('light-mode')).toBe(true);
    expect(document.body.classList.contains('dark-mode')).toBe(false);
  });

  test('applyTheme moon-mode includes dark-mode', () => {
    Theme.applyTheme('moon-mode');
    expect(document.body.classList.contains('moon-mode')).toBe(true);
    expect(document.body.classList.contains('dark-mode')).toBe(true);
  });

  test('save + getSavedTheme roundtrip', () => {
    Theme.saveTheme('light-mode');
    expect(Theme.getSavedTheme()).toBe('light-mode');
  });

  test('initTheme loads from localStorage', () => {
    localStorage.setItem(Theme.THEME_KEY, 'moon-mode');
    Theme.initTheme();
    expect(document.body.classList.contains('moon-mode')).toBe(true);
  });

  test('toggleLightDark switches and persists', () => {
    Theme.applyTheme('dark-mode');
    const next = Theme.toggleLightDark();
    expect(next).toBe('light-mode');
    expect(localStorage.getItem(Theme.THEME_KEY)).toBe('light-mode');
    expect(Theme.toggleLightDark()).toBe('dark-mode');
  });

  test('toggleMoon switches and persists', () => {
    Theme.applyTheme('dark-mode');
    expect(Theme.toggleMoon()).toBe('moon-mode');
    expect(Theme.toggleMoon()).toBe('dark-mode');
  });

  test('toggleDisco persists when requested', () => {
    document.body.className = 'dark-mode';
    const on = Theme.toggleDisco(true);
    expect(on).toBe(true);
    expect(document.body.classList.contains('disco-mode')).toBe(true);
    expect(localStorage.getItem(Theme.DISCO_KEY)).toBe('1');
    Theme.toggleDisco(true);
    expect(localStorage.getItem(Theme.DISCO_KEY)).toBe('0');
  });

  test('initTheme can restore disco', () => {
    localStorage.setItem(Theme.THEME_KEY, 'dark-mode');
    localStorage.setItem(Theme.DISCO_KEY, '1');
    Theme.initTheme({ includeDisco: true });
    expect(document.body.classList.contains('disco-mode')).toBe(true);
  });
});
