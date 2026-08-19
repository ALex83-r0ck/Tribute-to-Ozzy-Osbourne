const CACHE_NAME = 'ozzy-v1';
const ASSETS = [
  './',
  './index.html',
  './pages/concert.html',
  './pages/quiz.html',
  './pages/impressum.html',
  './pages/datenschutz.html',
  './css/styles.css',
  './css/concert.css',
  './css/quiz.css',
  './js/utils.js',
  './js/theme.js',
  './js/main.js',
  './js/quiz.js',
  './js/quiz-data.js',
  './js/concert.js',
  './assets/images/ozzy-osbourne.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Cache dynamic images or other assets on the fly
          if (event.request.url.includes('/assets/images/')) {
            cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    }).catch(() => {
        // Fallback for offline if needed
    })
  );
});

// Aktivierung & Alte Caches aufräumen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});