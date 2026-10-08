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

describe('discography – eigene Platte (nur lokale Dateien)', () => {
  const file = (name, type) => new File(['x'], name, { type: type == null ? 'audio/mpeg' : type });

  test('buildPlaylist filtert Nicht-Audio, sortiert natürlich und säubert Titel', () => {
    const list = D.buildPlaylist([
      file('10 - Shot in the Dark.mp3'),
      file('cover.jpg', 'image/jpeg'),
      file('02_Crazy_Train.flac', ''),
      file('1. I Don\'t Know.m4a', 'audio/mp4'),
      file('notes.txt', 'text/plain'),
    ]);
    expect(list.map((t) => t.title)).toEqual(["I Don't Know", 'Crazy Train', 'Shot in the Dark']);
  });

  test('buildPlaylist mit leerer Eingabe', () => {
    expect(D.buildPlaylist(null)).toEqual([]);
  });

  describe('UI', () => {
    let ui;
    let playSpy;
    beforeEach(() => {
      localStorage.clear();
      document.documentElement.innerHTML = htmlContent;
      global.URL.createObjectURL = jest.fn(() => 'blob:local-1');
      global.URL.revokeObjectURL = jest.fn();
      playSpy = jest.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
      jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
      ui = D.init();
    });
    afterEach(() => jest.restoreAllMocks());

    function chooseFiles(files) {
      const input = document.getElementById('ownAlbumInput');
      Object.defineProperty(input, 'files', { value: files, configurable: true });
      input.dispatchEvent(new Event('change'));
    }

    test('Bereich ist nur sichtbar, wenn eine Platte aufliegt', () => {
      const panel = document.getElementById('turntableOwn');
      expect(panel.hidden).toBe(true);
      ui.play('blizzard-of-ozz');
      expect(panel.hidden).toBe(false);
      ui.play(null);
      expect(panel.hidden).toBe(true);
    });

    test('Eigene Dateien werden lokal per Object-URL abgespielt, nichts wird gespeichert', () => {
      const fetchSpy = jest.fn();
      global.fetch = fetchSpy;
      ui.play('blizzard-of-ozz');
      const before = { ...localStorage };
      chooseFiles([file('02 Crazy Train.mp3'), file('01 I Don\'t Know.mp3')]);
      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(document.getElementById('turntableAudio').getAttribute('src')).toBe('blob:local-1');
      expect(playSpy).toHaveBeenCalled();
      expect(document.getElementById('ownNowPlaying').textContent).toContain("1/2: I Don't Know");
      expect(fetchSpy).not.toHaveBeenCalled();
      expect({ ...localStorage }).toEqual(before);
      delete global.fetch;
    });

    test('Nächster Titel und Stopp geben die Object-URL wieder frei', () => {
      ui.play('paranoid');
      chooseFiles([file('01 War Pigs.mp3'), file('02 Paranoid.mp3')]);
      document.getElementById('ownNext').click();
      expect(document.getElementById('ownNowPlaying').textContent).toContain('2/2: Paranoid');
      expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
      document.getElementById('turntableStop').click();
      expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
      expect(document.getElementById('turntableAudio').hasAttribute('src')).toBe(false);
      expect(ui.own.list).toEqual([]);
    });

    test('Albumwechsel stoppt die eigene Platte', () => {
      ui.play('paranoid');
      chooseFiles([file('01 War Pigs.mp3')]);
      ui.play('scream');
      expect(ui.own.index).toBe(-1);
      expect(document.getElementById('ownNowPlaying').textContent).toContain('Noch keine eigene Datei');
    });

    test('Nur Nicht-Audio gewählt → Hinweis, nichts wird abgespielt', () => {
      ui.play('paranoid');
      chooseFiles([file('cover.jpg', 'image/jpeg')]);
      expect(playSpy).not.toHaveBeenCalled();
      expect(document.getElementById('ownNowPlaying').textContent).toContain('Keine Audiodateien');
    });
  });
});
