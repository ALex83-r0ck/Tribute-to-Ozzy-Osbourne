// tests/concert.test.js – Live Legacy use cases
const fs = require('fs');
const path = require('path');

const htmlContent = fs.readFileSync(path.resolve(__dirname, '../pages/concert.html'), 'utf8');

// Load scripts once to avoid stacked DOMContentLoaded handlers
global.OzzyUtils = require('../js/utils.js');
global.OzzyTheme = require('../js/theme.js');
require('../js/concert.js');

function loadConcert(storageSeed) {
  localStorage.clear();
  if (storageSeed) {
    Object.entries(storageSeed).forEach(([k, v]) => localStorage.setItem(k, v));
  }
  document.documentElement.innerHTML = htmlContent;
  document.dispatchEvent(new Event('DOMContentLoaded'));
}

describe('concert.js – Theme & Lights', () => {
  beforeEach(() => localStorage.clear());

  test('Theme from storage', () => {
    loadConcert({ ozzyTheme: 'moon-mode' });
    expect(document.body.classList.contains('moon-mode')).toBe(true);
  });

  test('Stage light button sets data-theme', () => {
    loadConcert();
    const blue = document.querySelector('.light-btn.blue');
    blue.click();
    expect(document.body.getAttribute('data-theme')).toBe('blue');
    expect(blue.classList.contains('active')).toBe(true);
    expect(blue.getAttribute('aria-pressed')).toBe('true');
  });
});

describe('concert.js – Voting use cases', () => {
  beforeEach(() => localStorage.clear());

  test('T-17 Vote inkrementiert und speichert, zweiter Klick blockiert', () => {
    loadConcert();
    const card = document.querySelector('.legacy-card[data-tour="blizzard"]');
    const btn = card.querySelector('.vote-btn');
    const countEl = card.querySelector('.vote-count');

    expect(countEl.textContent).toBe('0');
    btn.click();
    expect(countEl.textContent).toBe('1');
    expect(localStorage.getItem('votes_blizzard')).toBe('1');
    expect(localStorage.getItem('votes_done_blizzard')).toBe('1');
    expect(btn.disabled).toBe(true);

    btn.click(); // no double vote
    expect(countEl.textContent).toBe('1');
  });

  test('Vote count restored from storage', () => {
    loadConcert({ votes_ozzfest: '7', votes_done_ozzfest: '1' });
    const card = document.querySelector('.legacy-card[data-tour="ozzfest"]');
    expect(card.querySelector('.vote-count').textContent).toBe('7');
    expect(card.querySelector('.vote-btn').disabled).toBe(true);
  });
});

describe('concert.js – Album modal', () => {
  beforeEach(() => {
    localStorage.clear();
    loadConcert();
  });

  test('Album card opens modal with tracks (safe DOM)', () => {
    const card = document.querySelector('.album-card');
    card.click();
    const modal = document.getElementById('albumModal');
    expect(modal.classList.contains('ozzy-modal--open')).toBe(true);
    const items = document.querySelectorAll('#trackList li');
    expect(items.length).toBeGreaterThan(0);
    expect(document.getElementById('modalTitle').textContent.length).toBeGreaterThan(0);
  });

  test('Escape closes modal', () => {
    document.querySelector('.album-card').click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(
      document.getElementById('albumModal').classList.contains('ozzy-modal--open')
    ).toBe(false);
  });
});
