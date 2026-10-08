// tests/tribute-wall.test.js – Globale Tribute Wall (lokal + Supabase-Adapter)
const fs = require('fs');
const path = require('path');

global.OzzyUtils = require('../js/utils.js');
const W = require('../js/tribute-wall.js');

const htmlContent = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const flush = () => new Promise((r) => setTimeout(r, 0));

function mount(seed) {
  localStorage.clear();
  Object.entries(seed || {}).forEach(([k, v]) => localStorage.setItem(k, v));
  document.documentElement.innerHTML = htmlContent;
}

function mockResponse(body, headers) {
  return {
    ok: true,
    status: 200,
    json: async () => body,
    headers: { get: (k) => (headers || {})[k.toLowerCase()] || null },
  };
}

describe('tribute-wall – Helfer', () => {
  test('sanitizeMessage kürzt, trimmt und entfernt Steuerzeichen', () => {
    expect(W.sanitizeMessage('  Hallo\n\nOzzy\u0007  ')).toBe('Hallo Ozzy');
    expect(W.sanitizeMessage('x'.repeat(300))).toHaveLength(W.MAX_MESSAGE);
    expect(W.sanitizeMessage(null)).toBe('');
  });

  test('normalizeEntry akzeptiert alte String-Einträge und säubert Namen', () => {
    expect(W.normalizeEntry('Randy')).toMatchObject({ name: 'Randy', message: '' });
    expect(W.normalizeEntry({ name: '<b>Zakk</b>', id: 5 })).toMatchObject({ name: 'bZakk/b', id: '5' });
    expect(W.normalizeEntry(42)).toBeNull();
  });

  test('parseContentRange liest die Gesamtzahl', () => {
    expect(W.parseContentRange('0-59/1234')).toBe(1234);
    expect(W.parseContentRange('*/0')).toBe(0);
    expect(W.parseContentRange(null)).toBeNull();
  });

  test('cooldownLeft rechnet die Restzeit', () => {
    expect(W.cooldownLeft(1000, 6000, 20000)).toBe(15000);
    expect(W.cooldownLeft(0, 999999, 20000)).toBe(0);
  });

  test('createStore wählt Supabase nur mit URL und Key', () => {
    expect(W.createStore({}).mode).toBe('local');
    expect(W.createStore({ supabaseUrl: 'https://x.supabase.co' }).mode).toBe('local');
    expect(W.createStore({ supabaseUrl: 'https://x.supabase.co', supabaseAnonKey: 'k' }).mode).toBe('remote');
  });
});

describe('tribute-wall – Supabase-Adapter', () => {
  test('list() sendet Auth-Header und liest Gesamtzahl', async () => {
    const fetch = jest.fn(async () =>
      mockResponse([{ id: 1, name: 'Sharon', message: 'Love you', created_at: '2026-01-01T00:00:00Z' }], { 'content-range': '0-0/777' })
    );
    const store = W.createSupabaseStore({ url: 'https://x.supabase.co/', key: 'anon', fetch });
    const res = await store.list();
    expect(res.total).toBe(777);
    expect(res.entries[0]).toMatchObject({ id: '1', name: 'Sharon', message: 'Love you' });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toMatch(/^https:\/\/x\.supabase\.co\/rest\/v1\/candles\?select=/);
    expect(init.headers.apikey).toBe('anon');
    expect(init.headers.Authorization).toBe('Bearer anon');
  });

  test('add() postet nur name und message', async () => {
    const fetch = jest.fn(async () => mockResponse([{ id: 9, name: 'Lemmy', message: '', created_at: '2026-01-01T00:00:00Z' }]));
    const store = W.createSupabaseStore({ url: 'https://x.supabase.co', key: 'anon', fetch });
    const saved = await store.add({ name: 'Lemmy', message: '', id: 'hack', created_at: 'x' });
    const init = fetch.mock.calls[0][1];
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ name: 'Lemmy', message: '' });
    expect(saved.id).toBe('9');
  });

  test('Fehlerstatus wirft', async () => {
    const fetch = jest.fn(async () => ({ ok: false, status: 401 }));
    const store = W.createSupabaseStore({ url: 'https://x.supabase.co', key: 'anon', fetch });
    await expect(store.list()).rejects.toThrow('401');
  });
});

describe('tribute-wall – UI (lokaler Modus)', () => {
  test('T-14 Kerze mit Name und Botschaft speichern', async () => {
    mount();
    const wall = W.init({}, { noPoll: true });
    await wall.ready;
    document.getElementById('candleName').value = '  Randy  ';
    document.getElementById('candleMessage').value = 'Forever';
    await wall.submit();
    expect(document.getElementById('candleCount').textContent).toBe('1');
    const stored = JSON.parse(localStorage.getItem(W.ENTRIES_KEY));
    expect(stored[0]).toMatchObject({ name: 'Randy', message: 'Forever' });
    expect(document.querySelectorAll('.candle-emoji').length).toBe(1);
    expect(document.getElementById('wallMode').dataset.mode).toBe('local');
    wall.destroy();
  });

  test('Kerzen aus v3 (nur Namen) werden migriert', async () => {
    mount({ ozzyCandleNames: JSON.stringify(['A', 'B']) });
    const wall = W.init({}, { noPoll: true });
    await wall.ready;
    expect(document.getElementById('candleCount').textContent).toBe('2');
    expect(document.querySelectorAll('.candle-emoji').length).toBe(2);
    wall.destroy();
  });

  test('Klick auf Kerze zeigt Botschaft im Spotlight (als Text, nicht HTML)', async () => {
    mount({ [W.ENTRIES_KEY]: JSON.stringify([{ id: 'x', name: 'Fan', message: '<img src=x onerror=alert(1)>', created_at: new Date().toISOString() }]) });
    const wall = W.init({}, { noPoll: true });
    await wall.ready;
    document.querySelector('.candle-emoji').click();
    const spot = document.getElementById('candleSpotlight');
    expect(spot.textContent).toContain('<img src=x onerror=alert(1)>');
    expect(spot.querySelector('img')).toBeNull();
    wall.destroy();
  });

  test('candle- und candleMessage-Events werden gefeuert', async () => {
    mount();
    const spy = jest.fn();
    document.addEventListener('ozzy:action', spy);
    const wall = W.init({}, { noPoll: true });
    await wall.ready;
    document.getElementById('candleMessage').value = 'Hi';
    await wall.submit();
    const types = spy.mock.calls.map((c) => c[0].detail.type);
    expect(types).toEqual(expect.arrayContaining(['candle', 'candleMessage']));
    document.removeEventListener('ozzy:action', spy);
    wall.destroy();
  });
});

describe('tribute-wall – UI (Supabase)', () => {
  test('Live-Modus lädt, sendet und pollt neue Kerzen', async () => {
    mount();
    let t = Date.parse('2026-10-08T12:00:00Z');
    const calls = [];
    const fetch = jest.fn(async (url, init) => {
      calls.push([url, init]);
      if (init && init.method === 'POST') {
        return mockResponse([{ id: 2, name: 'Me', message: '', created_at: '2026-10-08T12:00:01Z' }]);
      }
      if (url.includes('created_at=gt.')) {
        return mockResponse([{ id: 3, name: 'Tony', message: 'Riff!', created_at: '2026-10-08T12:00:05Z' }]);
      }
      return mockResponse([{ id: 1, name: 'Ozzy', message: '', created_at: '2026-10-08T11:00:00Z' }], { 'content-range': '0-0/41' });
    });
    const wall = W.init({ supabaseUrl: 'https://x.supabase.co', supabaseAnonKey: 'k' }, { fetch, noPoll: true, now: () => t });
    await wall.ready;
    expect(wall.mode).toBe('remote');
    expect(document.getElementById('candleCount').textContent).toBe('41');

    document.getElementById('candleName').value = 'Me';
    await wall.submit();
    expect(document.getElementById('candleCount').textContent).toBe('42');
    expect(JSON.parse(localStorage.getItem(W.MINE_KEY))).toContain('2');
    expect(document.querySelector('.candle-emoji.is-mine')).not.toBeNull();

    // Cooldown blockiert zweite Kerze direkt danach
    t += 1000;
    await wall.submit();
    expect(calls.filter(([, i]) => i && i.method === 'POST')).toHaveLength(1);

    await wall.poll();
    expect(document.getElementById('candleCount').textContent).toBe('43');
    expect(wall.entries[0].name).toBe('Tony');
    wall.destroy();
  });

  test('Fällt bei Serverfehler auf lokalen Modus zurück', async () => {
    mount();
    const fetch = jest.fn(async () => ({ ok: false, status: 500 }));
    const wall = W.init({ supabaseUrl: 'https://x.supabase.co', supabaseAnonKey: 'k' }, { fetch, noPoll: true });
    await wall.ready;
    expect(wall.mode).toBe('local');
    expect(document.getElementById('wallMode').dataset.mode).toBe('offline');
    wall.destroy();
  });
});
