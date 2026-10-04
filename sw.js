// Réseau d'abord (le contenu est toujours à jour), cache en secours hors ligne.
const CACHE = 'dcg-revision-v5';
const FILES = ['./', 'index.html', 'css/style.css', 'js/data.js', 'js/ue2.js', 'js/ue4.js', 'js/ue6.js', 'js/ue7.js', 'js/ue10.js', 'js/ue11.js', 'js/f2.js', 'js/f4.js', 'js/f6.js', 'js/f7.js', 'js/f10.js', 'js/f11.js', 'js/x10.js', 'js/x4.js', 'js/x6.js', 'js/x11.js', 'js/x2.js', 'js/x7.js', 'js/app.js', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match('index.html')))
  );
});
