const CACHE = 'braindump-v2';
const ASSETS = ['/'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  if (url.hostname.includes('fonts.google') || url.hostname.includes('fonts.gstatic')) {
    e.respondWith(
      caches.open(CACHE).then(c =>
        c.match(e.request).then(r =>
          r || fetch(e.request).then(res => { c.put(e.request, res.clone()); return res; })
        )
      )
    );
    return;
  }

  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.open(CACHE).then(c =>
        c.match(e.request).then(r => {
          const fresh = fetch(e.request).then(res => {
            if (res.ok) c.put(e.request, res.clone());
            return res;
          }).catch(() => r);
          return r || fresh;
        })
      )
    );
  }
});
