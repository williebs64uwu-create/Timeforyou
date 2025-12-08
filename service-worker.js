const CACHE_NAME = 'ticktick-ultra-v4-supabase';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json'
];

// INSTALACIÓN
self.addEventListener('install', event => {
  console.log('✅ Service Worker instalando v3...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Cache abierto correctamente');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('❌ Error al cachear archivos:', err);
      })
  );
  self.skipWaiting(); // Activar inmediatamente
});

// ACTIVACIÓN
self.addEventListener('activate', event => {
  console.log('✅ Service Worker activado v3');
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
  return self.clients.claim(); // Controlar todas las páginas inmediatamente
});

// FETCH (OFFLINE SUPPORT)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si hay cache, devolver cache
        if (response) {
          console.log('📦 Sirviendo desde cache:', event.request.url);
          return response;
        }

        // Si no hay cache, intentar red
        return fetch(event.request)
          .then(response => {
            // Si la respuesta es válida, cachear para futuro
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });

            return response;
          })
          .catch(() => {
            // Si falla la red y no hay cache, devolver respuesta vacía
            console.log('❌ Sin red ni cache para:', event.request.url);
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// PUSH NOTIFICATIONS
self.addEventListener('push', event => {
  console.log('📬 Push notification recibida');

  let data = { title: 'TickTick Ultra PRO', body: 'Tienes una nueva notificación' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || 'Tienes una nueva notificación',
    icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%236366f1"/%3E%3Cpath d="M30 50 L45 65 L70 35" stroke="white" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/%3E%3C/svg%3E',
    badge: '🔔',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'ticktick-notification',
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'Ver tarea' },
      { action: 'close', title: 'Cerrar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'TickTick Ultra PRO', options)
  );
});

// NOTIFICATION CLICK
self.addEventListener('notificationclick', event => {
  console.log('🔔 Notificación clickeada:', event.action);
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/') // Abrir la app
    );
  }
});

// SYNC (para cuando vuelve internet)
self.addEventListener('sync', event => {
  console.log('🔄 Sincronización en background');
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  }
});

async function syncTasks() {
  console.log('📤 Sincronizando tareas...');
  // Aquí irá la lógica de sincronización con servidor
  // Por ahora solo local storage
}
