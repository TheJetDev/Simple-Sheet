// sw.js (Free Version)
const CACHE_NAME = 'simple-sheet-v2.6'; // 

const urlsToCache = [
  'index.html',
  'manifest.json',
  'favicon-96x96.png',
  'apple-touch-icon.png',
  'web-app-manifest-192x192.png',
  'web-app-manifest-512x512.png'
];

self.addEventListener('install', event => {
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
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // ① HTML（画面遷移）は常にネット優先、ダメならキャッシュ（ルートURL対応済み）
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(new Request('index.html'), clone);
          });
          return response;
        })
        .catch(() => caches.match(event.request)
          .then(res => res || caches.match('index.html')))
    );
  } 
  // ② 画像やマニフェストは「Stale-While-Revalidate」（キャッシュを返しつつ裏で最新化）
  else {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        }).catch(() => {}); // オフライン時のエラーを無視
        
        return cached || fetchPromise;
      })
    );
  }
});
