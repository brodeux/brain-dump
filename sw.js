const CACHE = 'braindump-v4';
const ASSETS = ['/', '/sw.js'];

// Install: cache core assets
self.addEventListener('install', e => {
  self.skipWaiting(); // activate immediately
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

// Activate: delete ALL old caches, claim clients immediately
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // take control of all open tabs
  );
});

// Fetch: network-first, fall back to cache
// This ensures users always get the latest version
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});