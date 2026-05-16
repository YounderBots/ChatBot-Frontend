/**
 * service-worker.js — ChatViq chat widget PWA service worker.
 *
 * Strategy:
 *   - Static widget assets (HTML, JS, CSS, manifest): Cache-first with network fallback.
 *     Versioned cache; old caches purged on activation.
 *   - API calls (/chat/session, /chat/message, /chat/csat): Network-only.
 *     WebSocket connections are NOT interceptable by SW — handled natively.
 *   - Everything else: Network-first with cache fallback (offline graceful degradation).
 */

const CACHE_NAME    = 'chatviq-widget-v1';
const STATIC_ASSETS = [
  '/widget/chat.html',
  '/widget/manifest.json',
  '/widget/service-worker.js',
];

// URLs that must always go to the network (API calls)
const NETWORK_ONLY_PATTERNS = [
  /\/chat\/session/,
  /\/chat\/message/,
  /\/chat\/csat/,
  /\/nlp\//,
  /\/admin\//,
];


// ---------------------------------------------------------------------------
// Install — pre-cache static assets
// ---------------------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache failed (expected in dev):', err);
      });
    }).then(() => self.skipWaiting())
  );
});


// ---------------------------------------------------------------------------
// Activate — purge old caches
// ---------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});


// ---------------------------------------------------------------------------
// Fetch — route requests
// ---------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Pass WebSocket upgrades through (SW cannot intercept them)
  if (request.headers.get('upgrade') === 'websocket') return;

  // Network-only for API calls
  if (NETWORK_ONLY_PATTERNS.some((re) => re.test(url.pathname))) {
    event.respondWith(fetch(request));
    return;
  }

  // Cache-first for known static assets
  if (STATIC_ASSETS.some((a) => url.pathname.endsWith(a) || url.pathname === a)) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached || fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return response;
        })
      )
    );
    return;
  }

  // Network-first with cache fallback for everything else
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});


// ---------------------------------------------------------------------------
// Push notifications (optional — fires if the server sends a push)
// ---------------------------------------------------------------------------
self.addEventListener('push', (event) => {
  let data = { title: 'ChatViq', body: 'You have a new message!' };
  try {
    data = event.data ? event.data.json() : data;
  } catch (e) {
    data.body = event.data ? event.data.text() : data.body;
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'ChatViq', {
      body:    data.body || '',
      icon:    '/widget/icon-192.png',
      badge:   '/widget/icon-192.png',
      tag:     'chatviq-message',
      renotify: true,
      data:    data,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes('/widget/chat') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('/widget/chat.html');
    })
  );
});
