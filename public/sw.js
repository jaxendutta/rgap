// Minimal service worker: caches only this app's own static assets (icons,
// manifest, logo, /_next/static bundles) so repeat visits install faster.
// Everything else -- pages, API routes, server actions -- always goes to
// the network. RGAP is a DB-backed grants browser where fresh data matters
// more than offline support, so no page/data caching is done here.
const CACHE_NAME = 'rgap-static-v1';
const STATIC_ASSETS = [
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/icons/icon-512-maskable.png',
    '/logo.png',
    '/favicon.ico',
    '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    const isOwnStaticAsset =
        url.origin === self.location.origin &&
        (STATIC_ASSETS.includes(url.pathname) || url.pathname.startsWith('/_next/static/'));

    if (event.request.method !== 'GET' || !isOwnStaticAsset) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                return response;
            });
        })
    );
});
