// sw.js (Free Version)
const CACHE_NAME = 'simple-sheet-v2.3'; // 

const urlsToCache = [
  './',
  'index.html',
  'manifest.json',
  'favicon-96x96.png',
  'apple-touch-icon.png',
  'web-app-manifest-192x192.png',
  'web-app-manifest-512x512.png'
];

self.addEventListener('install', event => {
  // ★追加：新しいバージョンが来たら、待機せずにすぐインストール（アクティブ化）を強制する
  self.skipWaiting();
  
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
  
  // ★追加：開いているページのコントロールを、即座に新しいService Workerに奪わせる
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(res => res || fetch(event.request)));
});
