// tests/interactive.test.js – Erfolge, Konami, Meter, Timeline-Filter, Riff-Maschine
const fs = require('fs');
const path = require('path');

global.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  beginPath: jest.fn(),
  createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
  createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
  arc: jest.fn(),
  fill: jest.fn(),
  fillRect: jest.fn(),
}));

global.OzzyUtils = require('../js/utils.js');
global.OzzyTheme = require('../js/theme.js');
const I = require('../js/interactive.js');

const htmlContent = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

describe('interactive.js – Achievement-Logik (pure)', () => {
  test('recordAction schaltet Einmal-Erfolg frei', () => {
    const { state, unlocked } = I.recordAction(I.emptyState(), 'candle');
    expect(unlocked.map((a) => a.id)).toEqual(['candle']);
    expect(state.unlocked.candle).toBeTruthy();
    expect(I.countUnlocked(state)).toBe(1);
  });

  test('Zähl-Erfolg braucht das Ziel (Orakel: 5 Zitate)', () => {
    let state = I.emptyState();
    for (let i = 0; i < 4; i++) state = I.recordAction(state, 'quote').state;
    expect(state.unlocked.oracle).toBeUndefined();
    const res = I.recordAction(state, 'quote');
    expect(res.unlocked.map((a) => a.id)).toContain('oracle');
  });

  test('Unique-Erfolg zählt nur verschiedene Gaben', () => {
    let state = I.emptyState();
    ['bier', 'bier', 'bier', 'blood', 'bat', 'crazy', 'iron'].forEach((id) => {
      state = I.recordAction(state, 'offering', { id }).state;
    });
    expect(state.unlocked.priest).toBeUndefined();
    const res = I.recordAction(state, 'offering', { id: 'headbang' });
    expect(res.unlocked.map((a) => a.id)).toContain('priest');
  });

  test('Bereits freigeschaltete Erfolge werden nicht erneut gemeldet', () => {
    let state = I.recordAction(I.emptyState(), 'bat').state;
    const res = I.recordAction(state, 'bat');
    expect(res.unlocked).toEqual([]);
  });

  test('recordAction mutiert den Eingabe-State nicht', () => {
    const prev = I.emptyState();
    I.recordAction(prev, 'candle');
    expect(prev.counts).toEqual({});
  });

  test('normalizeState ist robust gegen korrupte Daten', () => {
    expect(I.normalizeState('kaputt')).toEqual(I.emptyState());
    const s = I.normalizeState({ counts: { quote: 'x' }, unlocked: { fake: 'x', bat: '2026' } });
    expect(s.counts.quote).toBe(0);
    expect(s.unlocked.fake).toBeUndefined();
    expect(s.unlocked.bat).toBe('2026');
  });
});

describe('interactive.js – Helfer', () => {
  test('Konami-Matcher erkennt die Sequenz (auch Großbuchstaben)', () => {
    const match = I.createSequenceMatcher(I.KONAMI);
    const keys = [...I.KONAMI.slice(0, -2), 'B', 'A'];
    const results = keys.map((k) => match(k));
    expect(results.slice(0, -1).every((r) => r === false)).toBe(true);
    expect(results[results.length - 1]).toBe(true);
  });

  test('Konami-Matcher setzt bei Fehler zurück', () => {
    const match = I.createSequenceMatcher(['a', 'b']);
    expect(match('a')).toBe(false);
    expect(match('x')).toBe(false);
    expect(match('b')).toBe(false);
    expect(match('a')).toBe(false);
    expect(match('b')).toBe(true);
  });

  test('Headbang-Meter ist auf 0..100 begrenzt', () => {
    const m = I.createMeter(40, 30);
    m.hit(); m.hit(); m.hit();
    expect(m.value).toBe(100);
    m.tick(); m.tick(); m.tick(); m.tick();
    expect(m.value).toBe(0);
  });

  test('Demo-Riff nutzt nur bekannte Noten', () => {
    I.DEMO_RIFF.forEach(([note]) => {
      expect(note === 'squeal' || I.NOTES[note] > 0).toBe(true);
    });
  });
});

describe('interactive.js – DOM-Integration', () => {
  beforeAll(() => {
    localStorage.clear();
    document.documentElement.innerHTML = htmlContent;
    I.init();
  });

  test('Timeline-Filter dimmt nicht passende Einträge', () => {
    const chip = document.querySelector('.filter-chip[data-filter="cult"]');
    chip.click();
    const items = [...document.querySelectorAll('.timeline-v2-item')];
    const visible = items.filter((it) => !it.classList.contains('is-dimmed'));
    expect(visible.length).toBe(1);
    expect(visible[0].querySelector('.badge-cult')).not.toBeNull();
    expect(chip.getAttribute('aria-pressed')).toBe('true');

    document.querySelector('.filter-chip[data-filter="all"]').click();
    expect(document.querySelectorAll('.timeline-v2-item.is-dimmed').length).toBe(0);
  });

  test('ozzy:action Event schaltet Erfolg frei, speichert und zeigt Popup', () => {
    document.dispatchEvent(new CustomEvent('ozzy:action', { detail: { type: 'ghost' } }));
    const stored = JSON.parse(localStorage.getItem(I.ACHIEVEMENT_KEY));
    expect(stored.unlocked.ghost).toBeTruthy();
    expect(document.getElementById('achievementCount').textContent).not.toBe('0');
    expect(document.querySelector('.achievement-pop')).not.toBeNull();
  });

  test('Erfolge-Panel öffnet und schließt per Escape', () => {
    const panel = document.getElementById('achievementsPanel');
    document.getElementById('achievementsToggle').click();
    expect(panel.hidden).toBe(false);
    expect(document.querySelectorAll('.achievement').length).toBe(I.ACHIEVEMENTS.length);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(panel.hidden).toBe(true);
  });

  test('Geheime Erfolge bleiben verborgen bis freigeschaltet', () => {
    document.getElementById('achievementsToggle').click();
    const konami = document.querySelector('.achievement[data-id="konami"]');
    expect(konami.textContent).toContain('Geheimer Erfolg');
    const ghost = document.querySelector('.achievement[data-id="ghost"]');
    expect(ghost.textContent).toContain('Geisterjäger');
  });

  test('Riff-Pad per Taste löst riff-Action aus', () => {
    const spy = jest.fn();
    document.addEventListener('ozzy:action', spy);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0].detail).toMatchObject({ type: 'riff', note: 'E' });
    document.removeEventListener('ozzy:action', spy);
  });
});
