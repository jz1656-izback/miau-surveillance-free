const CACHE = 'miau-surv-v3';

self.addEventListener('install', () => {
  (self as any).skipWaiting();
});

self.addEventListener('activate', e => {
  (e as any).waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  (self as any).clients.claim();
});

self.addEventListener('fetch', (e: any) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      }).catch(() => cached || new Response('Offline', { status: 503 }))
    )
  );
});
