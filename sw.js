const CACHE_NAME = 'court-report-v5';
const urlsToCache = [
  './',
  './index.html',  
  './manifest.json',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://html2canvas.hertzen.com/dist/html2canvas.min.js',
  'https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700&family=Noto+Sans+TC:wght@300;400;500;700&display=swap'
];
// 安裝階段：強制跳過等待，立即啟用
self.addEventListener('install', event => {
  self.skipWaiting(); // 關鍵：讓新的 Service Worker 立刻取代舊的
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 啟用階段：立即接管所有頁面，並清除舊的快取
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // 關鍵：立即控制當前頁面，不用等重新整理
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('刪除舊快取:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// 攔截請求階段：採用「網路優先 (Network First)」策略
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // 1. 如果網路有通，抓到了新檔案
        // 2. 順便把新檔案存入快取 (以便下次斷網時能用)
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
