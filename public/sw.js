const CACHE_PREFIX = 'billable-split-';
const VERSION = `${CACHE_PREFIX}v10`;
const SHELL = ['/', '/offline.html', '/manifest.webmanifest', '/asset-manifest.json', '/assets/receipt-split-hero-480-289a1d9c.webp', '/assets/receipt-split-hero-768-64af65b0.webp', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png'];

async function deleteOldCaches() {
  const keys = await caches.keys();
  await Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== VERSION).map((key) => caches.delete(key)));
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    const fresh = async (url) => {
      const target = new URL(url, self.location.origin);
      target.searchParams.set('__precache', VERSION);
      const response = await fetch(new Request(target, { cache: 'no-store' }));
      if (!response.ok) throw new Error(`Could not cache ${url}`);
      await cache.put(url, response.clone());
      return response;
    };
    await Promise.all(SHELL.map(fresh));
    const response = await fresh('/');
    const html = await response.text();
    const bundles = [...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map((match) => match[1]);
    await Promise.all(bundles.map(fresh));
    const assetManifest = await (await caches.match('/asset-manifest.json')).json();
    const builtAssets = [...new Set(Object.values(assetManifest).flatMap((entry) => [entry.file, ...(entry.css || []), ...(entry.assets || [])]).map((path) => `/${path}`))];
    await Promise.all(builtAssets.map(fresh));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(deleteOldCaches().then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.waitUntil(deleteOldCaches());
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(VERSION).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(async () => (await caches.match(event.request)) || (await caches.match('/')) || caches.match('/offline.html')));
    return;
  }
  const cacheKey = url.pathname;
  event.respondWith(caches.match(cacheKey).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) caches.open(VERSION).then((cache) => cache.put(cacheKey, response.clone()));
    return response;
  })));
});
