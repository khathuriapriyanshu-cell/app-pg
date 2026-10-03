// PG Rent Autopilot Service Worker
// Version: 2.0.0 (High-Performance Offline-First Shell)
const CACHE_NAME = 'pg-autopilot-v2';

const STATIC_ROUTES = [
  '/',
  '/index.html',
  '/tenants',
  '/tenants.html',
  '/rooms',
  '/rooms.html',
  '/payments',
  '/payments.html',
  '/settings',
  '/settings.html',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-192-maskable.png',
  '/icons/icon-512-maskable.png',
  '/icons/apple-touch-icon.png'
];

// Install: Cache static shell assets immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ROUTES).catch((err) => {
        console.warn('SW pre-cache non-fatal warning:', err);
      });
    })
  );
});

// Activate: Clean up older cache versions and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Instant Stale-While-Revalidate for app routes & Cache-First for static assets
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never intercept cross-origin non-http/https (e.g. wa.me, chrome-extension)
  if (!url.protocol.startsWith('http')) return;

  // Never cache API or mutation endpoints
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Static assets (CSS/JS chunks, icons): Cache-First
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // HTML page navigation: Stale-While-Revalidate (Instant response from cache, updates in background)
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        // Fast network fetch with 2s timeout
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => {
            return cachedResponse || caches.match('/') || caches.match('/index.html');
          });

        // Return cached page immediately if available (0ms navigation lag!)
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default: Cache first with network fallback
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
