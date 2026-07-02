// Minimal service worker: caches only this app's own static assets (icons,
// manifest, logo, offline fallback, /_next/static bundles) so repeat visits
// install faster. Everything else -- pages, API routes, server actions --
// always goes to the network. RGAP is a DB-backed grants browser where
// fresh data matters more than offline support, so page/data content is
// never cached here; the only offline behavior is falling back to a static
// offline.html for navigations when the network is unreachable and nothing
// was cached, which can never show stale grant data since it's not a copy
// of any real page.
const CACHE_NAME = 'rgap-static-v2';
const OFFLINE_URL = '/offline.html';
const STATIC_ASSETS = [
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/icons/icon-512-maskable.png',
    '/logo.png',
    '/favicon.ico',
    '/manifest.webmanifest',
    OFFLINE_URL,
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
    if (event.request.method !== 'GET') {
        return;
    }

    // Page navigations always go to the network first (never serve a cached
    // page -- that would risk stale grant data). Only when the network is
    // truly unreachable do we fall back to the static offline page.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(OFFLINE_URL))
        );
        return;
    }

    const url = new URL(event.request.url);
    const isOwnStaticAsset =
        url.origin === self.location.origin &&
        (STATIC_ASSETS.includes(url.pathname) || url.pathname.startsWith('/_next/static/'));

    if (!isOwnStaticAsset) {
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
