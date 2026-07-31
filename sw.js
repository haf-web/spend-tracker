const CACHE = 'spend-v1';
const ASSETS = ['./', './index.html', './manifest.json', './icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return; // don't intercept POSTs to Apps Script
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
