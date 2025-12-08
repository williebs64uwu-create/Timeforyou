const CACHE_NAME = 'ticktick-ultra-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  console.log('✅ Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('❌ Error al cachear:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('✅ Service Worker activado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Borrando cache viejo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          return new Response('', { status: 200 });
        });
      })
  );
});

self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Tienes una nueva notificación',
    vibrate: [200, 100, 200],
    tag: 'ticktick-notification',
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification('TickTick Ultra PRO', options)
  );
});

self.addEventListener('notificationclick', event => {
  console.log('🔔 Notificación clickeada');
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
