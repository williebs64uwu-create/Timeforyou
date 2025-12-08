const CACHE_NAME = 'ticktick-ultra-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instalación del Service Worker
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

// Activación del Service Worker
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

// Estrategia de cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // Si falla el fetch, no hacer nada (evita errores 404)
          return new Response('', { status: 200 });
        });
      })
  );
});

// Notificaciones push (ARREGLADO - sin iconos que no existen)
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

// Click en notificación
self.addEventListener('notificationclick', event => {
  console.log('🔔 Notificación clickeada');
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
