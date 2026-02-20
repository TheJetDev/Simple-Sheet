// sw.js (Free Version)
const CACHE_NAME = 'simple-sheet-v2.7'; // 

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
  // ① HTML（画面遷移）はNetwork First
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // ★改善: 正常なレスポンス(200 OK等)の時だけキャッシュを更新し、将来の拡張のために event.request をキーにする
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(res => res || caches.match('index.html')))
    );
  } 
  // ② 画像やマニフェストは Stale-While-Revalidate
  else {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // ★改善: 正常な通信の時だけ裏側でキャッシュを上書きする
          if (networkResponse && networkResponse.ok) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        }); // ★不要なcatchを削除
        
        return cached || fetchPromise;
      })
    );
  }
});
