// sw.js (Free Version)
const CACHE_NAME = 'simple-sheet-v2.1';
const urlsToCache = [
  './',
  'index.html',
  'manifest.json',
  'favicon-96x96.png', // 修正: .ico から実際の .png に変更
  'apple-touch-icon.png',
'web-app-manifest-192x192.png',
  'web-app-manifest-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(res => res || fetch(event.request)));
});













