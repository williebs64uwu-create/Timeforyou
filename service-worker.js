const CACHE_NAME = 'ticktick-ultra-v6-network-first';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './ai_voice.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css'
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

// FETCH (NETWORK FIRST, THEN CACHE)
self.addEventListener('fetch', event => {
  // Ignorar peticiones que no sean GET (como POST a DeepSeek)
  if (event.request.method !== 'GET') return;

  // Ignorar APIs externas específicas si es necesario
  if (event.request.url.includes('api.deepseek.com')) return;

  // Ignorar chrome-extension y otras URLs no HTTP
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la red responde bien, actualizamos la caché y devolvemos la respuesta fresca
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
        // SI falla la red (Offline), entonces buscamos en caché
        console.log('⚠️ Network fail, falling back to cache:', event.request.url);
        return caches.match(event.request);
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
