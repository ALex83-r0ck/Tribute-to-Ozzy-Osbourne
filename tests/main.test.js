// tests/main.test.js – Dashboard integration use cases
const fs = require('fs');
const path = require('path');

global.IntersectionObserver = class {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock canvas for jsdom
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  beginPath: jest.fn(),
  createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
  arc: jest.fn(),
  fill: jest.fn(),
}));

const htmlContent = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

// Load scripts once – avoids stacking multiple DOMContentLoaded handlers
global.OzzyUtils = require('../js/utils.js');
global.OzzyTheme = require('../js/theme.js');
require('../js/main.js');

function loadDashboard(storageSeed) {
  localStorage.clear();
  if (storageSeed) {
    Object.entries(storageSeed).forEach(([k, v]) => localStorage.setItem(k, v));
  }
  document.documentElement.innerHTML = htmlContent;
  document.dispatchEvent(new Event('DOMContentLoaded'));
}

describe('main.js – Theme use cases', () => {
  test('T-01 Standardmäßig wird dark-mode geladen', () => {
    loadDashboard();
    expect(document.body.classList.contains('dark-mode')).toBe(true);
    expect(document.body.classList.contains('light-mode')).toBe(false);
  });

  test('T-02 Light-Mode wird aus localStorage geladen', () => {
    loadDashboard({ ozzyTheme: 'light-mode' });
    expect(document.body.classList.contains('light-mode')).toBe(true);
  });

  test('T-03 ThemeToggle wechselt und speichert', () => {
    loadDashboard();
    const themeToggle = document.getElementById('themeToggle');
    expect(themeToggle).not.toBeNull();
    themeToggle.click();
    expect(document.body.classList.contains('light-mode')).toBe(true);
    expect(localStorage.getItem('ozzyTheme')).toBe('light-mode');
    themeToggle.click();
    expect(document.body.classList.contains('dark-mode')).toBe(true);
  });

  test('T-04 Moon-Mode Toggle', () => {
    loadDashboard();
    document.getElementById('moonToggle').click();
    expect(document.body.classList.contains('moon-mode')).toBe(true);
    expect(localStorage.getItem('ozzyTheme')).toBe('moon-mode');
  });

  test('Disco Toggle persists', () => {
    loadDashboard();
    document.getElementById('discoToggle').click();
    expect(document.body.classList.contains('disco-mode')).toBe(true);
    expect(localStorage.getItem('ozzyDisco')).toBe('1');
  });
});

describe('main.js – Timeline & Gallery markup', () => {
  beforeEach(() => loadDashboard());

  test('Timeline Items exist and are prepared for reveal', () => {
    const items = document.querySelectorAll('.timeline-v2-item');
    expect(items.length).toBeGreaterThan(0);
    const opacity = items[0].style.opacity;
    expect(['0', '1', '']).toContain(opacity);
  });

  test('Gallery data-full points to own asset (no wrong stage image on memorial)', () => {
    const cards = [...document.querySelectorAll('.gallery-card img')];
    const memorial = cards.find((img) =>
      (img.getAttribute('src') || '').includes('Rest')
    );
    expect(memorial).toBeTruthy();
    expect(memorial.dataset.full).toContain('Rest');
    expect(memorial.dataset.full).not.toContain('gothic_rock_stage');
  });

  test('Stage RIP image uses sanitized filename', () => {
    const stage = [...document.querySelectorAll('.galleryImage')].find((img) =>
      (img.getAttribute('src') || '').includes('on-stage')
    );
    expect(stage).toBeTruthy();
    expect(stage.getAttribute('src')).not.toMatch(/ /);
  });
});

describe('main.js – Tribute Wall use case', () => {
  test('T-14 Kerze mit Name speichern', () => {
    loadDashboard();
    const input = document.getElementById('candleName');
    const btn = document.getElementById('lightCandle');
    input.value = '  Randy  ';
    btn.click();
    expect(document.getElementById('candleCount').textContent).toBe('1');
    const stored = JSON.parse(localStorage.getItem('ozzyCandleNames'));
    expect(stored).toContain('Randy');
    expect(document.querySelectorAll('.candle-emoji').length).toBe(1);
  });

  test('Kerzen werden beim Load wiederhergestellt', () => {
    loadDashboard({ ozzyCandleNames: JSON.stringify(['A', 'B']) });
    expect(document.getElementById('candleCount').textContent).toBe('2');
    expect(document.querySelectorAll('.candle-emoji').length).toBe(2);
  });
});

describe('main.js – navigation improvements', () => {
  test('mobile navigation toggle exists and toggles the nav state', () => {
    loadDashboard();
    const navToggle = document.getElementById('mobileNavToggle');
    const nav = document.getElementById('mainHeaderNav');

    expect(navToggle).not.toBeNull();
    expect(nav).not.toBeNull();
    expect(navToggle.getAttribute('aria-expanded')).toBe('false');

    navToggle.click();
    expect(nav.classList.contains('nav-open')).toBe(true);
    expect(navToggle.getAttribute('aria-expanded')).toBe('true');

    navToggle.click();
    expect(nav.classList.contains('nav-open')).toBe(false);
    expect(navToggle.getAttribute('aria-expanded')).toBe('false');
  });

  test('Back-to-top button scrolls to the top when clicked', () => {
    loadDashboard();
    const backToTop = document.getElementById('backToTop');
    const scrollSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});

    expect(backToTop).not.toBeNull();
    backToTop.click();

    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    scrollSpy.mockRestore();
  });
});
