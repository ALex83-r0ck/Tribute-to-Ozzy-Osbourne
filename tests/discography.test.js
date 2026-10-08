// tests/discography.test.js – Diskografie
const fs = require('fs');
const path = require('path');

global.OzzyUtils = require('../js/utils.js');
const D = require('../js/discography.js');

const htmlContent = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

describe('discography – Daten', () => {
  test('Alben haben eindeutige IDs und vollständige Felder', () => {
    const ids = new Set();
    D.ALBUMS.forEach((a) => {
      expect(ids.has(a.id)).toBe(false);
      ids.add(a.id);
      expect(['sabbath', 'solo']).toContain(a.era);
      expect(a.year).toBeGreaterThanOrEqual(1970);
      expect(a.tracks.length).toBeGreaterThan(0);
      expect(a.colors).toHaveLength(2);
      expect(a.fact.length).toBeGreaterThan(10);
    });
  });

  test('Bekannte Meilensteine sind korrekt datiert', () => {
    const year = (id) => D.ALBUMS.find((a) => a.id === id).year;
    expect(year('paranoid')).toBe(1970);
    expect(year('blizzard-of-ozz')).toBe(1980);
    expect(year('no-more-tears')).toBe(1991);
    expect(year('13')).toBe(2013);
  });
});

describe('discography – filterAlbums', () => {
  test('Era-Filter', () => {
    const sab = D.filterAlbums(D.ALBUMS, { era: 'sabbath' });
    expect(sab.every((r) => r.album.era === 'sabbath')).toBe(true);
    expect(sab.length + D.filterAlbums(D.ALBUMS, { era: 'solo' }).length).toBe(D.ALBUMS.length);
  });

  test('Suche findet Songs und markiert den Treffer', () => {
    const res = D.filterAlbums(D.ALBUMS, { query: 'iron man' });
    expect(res).toHaveLength(1);
    expect(res[0].album.id).toBe('paranoid');
    expect(res[0].matchedTrack).toBe('Iron Man');
  });

  test('Suche nach Gitarrist und ohne Sonderzeichen', () => {
    expect(D.filterAlbums(D.ALBUMS, { query: 'rhoads' }).map((r) => r.album.id)).toEqual(['blizzard-of-ozz', 'diary-of-a-madman']);
    expect(D.filterAlbums(D.ALBUMS, { query: 'mama im coming' })[0].album.id).toBe('no-more-tears');
  });

  test('Favoriten-Filter und Sortierung', () => {
    const res = D.filterAlbums(D.ALBUMS, { era: 'fav', favorites: ['scream', 'paranoid'], desc: true });
    expect(res.map((r) => r.album.id)).toEqual(['scream', 'paranoid']);
  });

  test('toggleFavorite mutiert nicht', () => {
    const a = new Set(['x']);
    const b = D.toggleFavorite(a, 'y');
    expect([...a]).toEqual(['x']);
    expect([...b]).toEqual(['x', 'y']);
    expect([...D.toggleFavorite(b, 'x')]).toEqual(['y']);
  });

  test('stats', () => {
    const s = D.stats(D.ALBUMS);
    expect(s.albums).toBe(D.ALBUMS.length);
    expect(s.sabbath + s.solo).toBe(s.albums);
    expect(s.span).toBe(2022 - 1970);
  });
});

describe('discography – UI', () => {
  let ui;
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.innerHTML = htmlContent;
    ui = D.init();
  });

  test('rendert alle Alben', () => {
    expect(document.querySelectorAll('#albumGrid .album')).toHaveLength(D.ALBUMS.length);
  });

  test('Cover umdrehen und Auflegen startet Plattenspieler + vinyl-Event', () => {
    const spy = jest.fn();
    document.addEventListener('ozzy:action', spy);
    const album = document.querySelector('.album[data-id="paranoid"]');
    album.querySelector('.album__front').click();
    expect(album.classList.contains('is-flipped')).toBe(true);
    album.querySelector('[data-action="play"]').click();
    expect(document.getElementById('turntableTitle').textContent).toBe('Paranoid');
    expect(document.getElementById('vinyl').classList.contains('is-spinning')).toBe(true);
    expect(document.querySelector('.album[data-id="paranoid"]').classList.contains('is-playing')).toBe(true);
    expect(spy.mock.calls.map((c) => c[0].detail)).toEqual(
      expect.arrayContaining([{ type: 'albumFlip', id: 'paranoid' }, { type: 'vinyl', id: 'paranoid' }])
    );
    document.getElementById('turntableStop').click();
    expect(document.getElementById('vinyl').classList.contains('is-spinning')).toBe(false);
    document.removeEventListener('ozzy:action', spy);
  });

  test('Favorit wird gespeichert und Filter zeigt nur Favoriten', () => {
    document.querySelector('.album[data-id="scream"] [data-action="fav"]').click();
    expect(JSON.parse(localStorage.getItem(D.FAV_KEY))).toEqual(['scream']);
    document.querySelector('.disco-filter [data-era="fav"]').click();
    expect([...document.querySelectorAll('#albumGrid .album')].map((a) => a.dataset.id)).toEqual(['scream']);
  });

  test('Leeres Suchergebnis zeigt Hinweis', () => {
    ui.state.query = 'gibtsnicht';
    ui.render();
    expect(document.getElementById('discoEmpty').hidden).toBe(false);
  });
});
