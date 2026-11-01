const CACHE = 'khan-v3';
const SHELL = ['./', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Page: network first (always get latest), fall back to cache offline
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => {
      const copy = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); return r;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  // Everything else (icons, Google Fonts): cache first, then network + store
  if (url.origin === location.origin || /(fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net)$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r && (r.ok || r.type === 'opaque')) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return r;
    })));
  }
});
