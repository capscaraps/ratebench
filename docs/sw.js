const CACHE = 'ratebench-v2';
const ASSETS = ["./", "index.html", "style.css", "fonts.css", "app.js", "bg-street.jpg", "icon-192.png", "icon-512.png", "icon-maskable.png", "manifest.webmanifest", "fonts/IBMPlexSans-400-cyr.woff2", "fonts/IBMPlexSans-400-lat.woff2", "fonts/JetBrainsMono-400-cyr.woff2", "fonts/JetBrainsMono-400-lat.woff2", "fonts/Oswald-300-cyr.woff2", "fonts/Oswald-300-lat.woff2"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(
    ks.filter(k => k !== CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(c =>
    c.match(e.request).then(hit => {
      const net = fetch(e.request).then(resp => {
        if (resp && resp.status === 200) c.put(e.request, resp.clone());
        return resp;
      }).catch(() => hit || c.match('index.html'));
      return hit || net;
    })
  ));
});
