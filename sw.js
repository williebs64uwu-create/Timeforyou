// Service Worker - PWA + Push Notifications
const CACHE_NAME = 'timeforyou-v1';

self.addEventListener('install', event => {
    console.log('✅ Service Worker instalado');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('✅ Service Worker activado');
    event.waitUntil(clients.claim());
});

// =====================================================
// PUSH NOTIFICATION LISTENER (CRITICAL)
// =====================================================
self.addEventListener('push', event => {
    console.log('📬 Push recibido:', event);

    if (!event.data) {
        console.log('Push sin datos');
        return;
    }

    const data = event.data.json();

    const options = {
        body: data.body || 'Tienes una nueva notificación',
        icon: '/icon-192.png',
        badge: '/icon-72.png',
        tag: data.tag || 'default',
        requireInteraction: false,
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/dashboard.html',
            timestamp: Date.now()
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title || '🔔 TimeForYou', options)
    );
});

// =====================================================
// NOTIFICATION CLICK LISTENER
// =====================================================
self.addEventListener('notificationclick', event => {
    console.log('🖱️ Notificación clickeada');

    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/dashboard.html';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(windowClients => {
                // Si ya hay una ventana abierta, enfócala
                for (let client of windowClients) {
                    if (client.url.includes(urlToOpen) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Si no, abre una nueva
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// =====================================================
// FETCH (Network-first)
// =====================================================
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => {
            if (event.request.mode === 'navigate') {
                return caches.match('/dashboard.html');
            }
        })
    );
});
