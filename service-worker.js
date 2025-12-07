const CACHE_NAME = 'ticktick-ultra-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estrategia de cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Notificaciones push
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Tienes una nueva notificación',
    icon: '/icon.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200],
    tag: 'ticktick-notification',
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'Ver' },
      { action: 'dismiss', title: 'Cerrar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('TickTick Ultra PRO', options)
  );
});

// Click en notificación
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
```

---

## 🚀 **CÓMO SUBIR A RENDER (GRATIS)**

### **Paso 1: Preparar tus archivos**

Crea una carpeta en tu computadora con estos 3 archivos:
```
mi-ticktick/
├── index.html
├── manifest.json
└── service-worker.js
```

### **Paso 2: Subir a GitHub**

1. Ve a [github.com](https://github.com) y crea una cuenta (si no tienes)
2. Crea un nuevo repositorio llamado `ticktick-ultra-pro`
3. Sube los 3 archivos a ese repositorio

### **Paso 3: Conectar con Render**

1. Ve a [render.com](https://render.com) y crea una cuenta
2. Click en **"New +"** → **"Static Site"**
3. Conecta tu cuenta de GitHub
4. Selecciona el repositorio `ticktick-ultra-pro`
5. Configuración:
   - **Name**: `ticktick-ultra-pro`
   - **Branch**: `main`
   - **Build Command**: (déjalo vacío)
   - **Publish Directory**: `.` (punto)
6. Click en **"Create Static Site"**

### **Paso 4: ¡Listo!**

En 2-3 minutos tendrás tu URL:
```
https://ticktick-ultra-pro.onrender.com
