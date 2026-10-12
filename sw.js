// Réseau d'abord (le contenu est toujours à jour), cache en secours hors ligne.
// La liste des fichiers à mettre en cache vient de data/manifest.json (générée par tools/build.js).
const CACHE = 'dcg-revision-v6';

self.addEventListener('install', (e) => {
  e.waitUntil(
    fetch('data/manifest.json', { cache: 'no-cache' })
      .then((r) => r.json())
      .then((m) => caches.open(CACHE).then((c) => c.addAll(['data/manifest.json'].concat(m.shell, m.files))))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
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
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match('index.html')))
  );
});
