// Service Worker Simplificado - Solo PWA y Notificaciones
const CACHE_NAME = 'timeforyou-v1';

self.addEventListener('install', event => {
    console.log('✅ Service Worker instalado');
    self.skipWaiting(); // Activar inmediatamente
});

self.addEventListener('activate', event => {
    console.log('✅ Service Worker activado');
    event.waitUntil(clients.claim()); // Tomar control inmediato
});

// Fetch: Network-first (siempre intentar red primero)
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => {
            // Si falla la red, intentar cache (solo para navegación)
            if (event.request.mode === 'navigate') {
                return caches.match('/dashboard.html');
            }
        })
    );
});
