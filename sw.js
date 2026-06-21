const CACHE = 'snr-edu-v1';
const STATIC_ASSETS = [
    '/css/portal.css',
    '/css/style.css',
    '/js/firebase-config.js',
    '/js/media-loader.js',
    '/js/i18n.js',
    '/js/access-control.js',
    '/js/auth-guard.js',
    '/js/student-auth.js',
    '/js/admin-auth.js',
    '/js/rate-limiter.js',
    '/offline.html'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch(() => {});
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);
    if (e.request.method !== 'GET') return;
    if (!url.origin.includes(self.location.origin) && !url.origin.includes('firebase')) {
        return;
    }
    if (url.pathname.match(/\.(js|css|woff2?|ttf|otf|eot|png|jpg|jpeg|gif|svg|ico|webp)(\?|$)/)) {
        e.respondWith(cacheFirst(e.request));
    } else {
        e.respondWith(networkFirst(e.request));
    }
});

async function cacheFirst(req) {
    const cached = await caches.match(req);
    return cached || fetchAndCache(req);
}

async function networkFirst(req) {
    try {
        const res = await fetch(req);
        if (res.ok) {
            const cache = await caches.open(CACHE);
            cache.put(req, res.clone());
        }
        return res;
    } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (req.mode === 'navigate') {
            return caches.match('/offline.html');
        }
        return new Response('Offline', { status: 503 });
    }
}

async function fetchAndCache(req) {
    const res = await fetch(req);
    if (res.ok) {
        const cache = await caches.open(CACHE);
        cache.put(req, res.clone());
    }
    return res;
}
