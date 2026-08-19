/**
 * Unit tests for OzzyUtils – pure helpers & storage use cases
 */
const U = require('../js/utils.js');

describe('OzzyUtils – sanitizeName', () => {
  test('trims and removes control characters', () => {
    expect(U.sanitizeName('  Ozzy\u0000\n ')).toBe('Ozzy');
  });

  test('enforces max length', () => {
    expect(U.sanitizeName('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)).toBe('ABCDEFGHIJ');
  });

  test('null/undefined → empty string', () => {
    expect(U.sanitizeName(null)).toBe('');
    expect(U.sanitizeName(undefined)).toBe('');
  });
});

describe('OzzyUtils – shuffleArray', () => {
  test('returns same elements, does not mutate original', () => {
    const src = [1, 2, 3, 4, 5];
    const copy = [...src];
    const out = U.shuffleArray(src);
    expect(src).toEqual(copy);
    expect(out).toHaveLength(5);
    expect(out.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  test('handles empty / non-array', () => {
    expect(U.shuffleArray([])).toEqual([]);
    expect(U.shuffleArray(null)).toEqual([]);
  });
});

describe('OzzyUtils – getRanking', () => {
  test('boundaries', () => {
    expect(U.getRanking(0)).toMatch(/Roadie/);
    expect(U.getRanking(3)).toMatch(/Roadie/);
    expect(U.getRanking(4)).toMatch(/Bassist/);
    expect(U.getRanking(7)).toMatch(/Bassist/);
    expect(U.getRanking(8)).toMatch(/Prince of Darkness/);
    expect(U.getRanking(9)).toMatch(/Prince of Darkness/);
    expect(U.getRanking(10)).toMatch(/METAL GOD/);
  });
});

describe('OzzyUtils – highscore storage', () => {
  beforeEach(() => localStorage.clear());

  test('parseHighscore recovers from corrupt data', () => {
    expect(U.parseHighscore('{not json')).toEqual([]);
    expect(U.parseHighscore(null)).toEqual([]);
    expect(U.parseHighscore({ foo: 1 })).toEqual([]);
  });

  test('saveHighscoreEntry sorts, caps at 10, sanitizes name', () => {
    for (let i = 0; i < 12; i++) {
      U.saveHighscoreEntry(`Player${i}`, i);
    }
    const list = U.loadHighscoreFromStorage();
    expect(list).toHaveLength(10);
    expect(list[0].score).toBe(11);
    expect(list[0].name).toBe('Player11');
  });

  test('XSS-ish name strips markup characters', () => {
    const list = U.saveHighscoreEntry('<img src=x onerror=alert(1)>', 5);
    expect(list[0].name).not.toMatch(/[<>]/);
    expect(list[0].name).toBe('img src=x onerror=alert(1)');
    expect(list[0].score).toBe(5);
  });
});

describe('OzzyUtils – candles', () => {
  beforeEach(() => localStorage.clear());

  test('legacy numeric migration', () => {
    localStorage.setItem('ozzyCandles', '3');
    const candles = U.loadCandles();
    expect(candles).toHaveLength(3);
  });

  test('saveCandles caps length', () => {
    const many = Array.from({ length: 250 }, (_, i) => `n${i}`);
    const saved = U.saveCandles(many);
    expect(saved.length).toBeLessThanOrEqual(U.MAX_CANDLES);
    expect(U.loadCandles().length).toBe(saved.length);
  });

  test('corrupt candle JSON falls back', () => {
    localStorage.setItem('ozzyCandleNames', 'not-json');
    expect(U.loadCandles()).toEqual([]);
  });
});

describe('OzzyUtils – safe storage', () => {
  beforeEach(() => localStorage.clear());

  test('safeGetJSON / safeSetJSON roundtrip', () => {
    expect(U.safeSetJSON('k', { a: 1 })).toBe(true);
    expect(U.safeGetJSON('k', null)).toEqual({ a: 1 });
  });

  test('safeGetJSON fallback on bad data', () => {
    localStorage.setItem('bad', '{');
    expect(U.safeGetJSON('bad', [])).toEqual([]);
  });
});

describe('OzzyUtils – prefersReducedMotion', () => {
  test('returns boolean', () => {
    expect(typeof U.prefersReducedMotion()).toBe('boolean');
  });
});
