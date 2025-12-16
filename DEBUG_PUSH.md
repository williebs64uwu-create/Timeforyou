# 🔍 DEBUG: Push Notifications No Funcionan

## Problema:
- ❌ No aparece toast "Notificaciones activadas"
- ❌ No se crea registro en `push_subscriptions`
- ❌ Permisos de notificaciones ya estaban activados

---

## ✅ CHECKLIST DE DEBUG:

### 1️⃣ Verificar que el código esté desplegado

**En tu celular:**
1. Abre Chrome
2. Ve a: `https://timeforyou.onrender.com`
3. Haz login
4. Abre la consola del navegador:
   - Chrome Android: `chrome://inspect` en PC + conectar celular
   - O usa Chrome DevTools remoto

**Busca en la consola:**
```
✅ Service Worker registrado
✅ Service Worker listo
🔔 Permiso de notificaciones: granted
```

Si NO ves esos mensajes = el código no se cargó.

---

### 2️⃣ Verificar que push-subscription.js se cargue

**En la consola del navegador:**
```javascript
typeof initPushNotifications
```

**Resultado esperado:** `"function"`  
**Si dice:** `"undefined"` = El archivo no se cargó

---

### 3️⃣ Forzar la suscripción manualmente

**En la consola del navegador, ejecuta:**
```javascript
subscribeToPushNotifications()
```

**Deberías ver:**
```
✅ Service Worker listo
🔔 Permiso de notificaciones: granted
📝 Creando nueva suscripción...
✅ Suscripción obtenida: https://...
✅ Suscripción guardada en Supabase
```

**Si ves errores, cópialos y pégalos aquí.**

---

### 4️⃣ Verificar Service Worker

**En Chrome (PC o celular):**
1. Ve a: `chrome://serviceworker-internals/`
2. Busca: `timeforyou.onrender.com`
3. Debería aparecer con estado: **"ACTIVATED"**

---

### 5️⃣ Verificar que el frontend tenga el código actualizado

**Problema común:** Render cachea archivos viejos.

**Solución:**
1. En Render → `timeforyou` (frontend)
2. Click **"Manual Deploy"** → **"Clear build cache & deploy"**
3. Espera 2-3 minutos
4. Recarga la página en el celular con **Ctrl+Shift+R** (o borra caché)

---

## 🚨 ERRORES COMUNES:

### Error 1: "showToast is not defined"
**Causa:** La función `showToast` no existe en `app.js`  
**Solución:** Verificar que `app.js` tenga la función `showToast`

### Error 2: "currentUser is null"
**Causa:** El usuario no está autenticado cuando se ejecuta `initPushNotifications`  
**Solución:** Verificar que `currentUser` esté definido después del login

### Error 3: "Failed to subscribe: NotAllowedError"
**Causa:** Permisos de notificaciones bloqueados  
**Solución:** Ir a configuración del navegador → Notificaciones → Permitir para timeforyou.onrender.com

---

## 🔧 SOLUCIÓN RÁPIDA:

Si nada funciona, ejecuta esto en la consola del navegador:

```javascript
// 1. Verificar usuario
console.log('Usuario:', currentUser);

// 2. Verificar Service Worker
navigator.serviceWorker.getRegistration().then(reg => {
    console.log('SW registrado:', !!reg);
});

// 3. Verificar permisos
console.log('Permiso notificaciones:', Notification.permission);

// 4. Intentar suscribir
subscribeToPushNotifications().then(result => {
    console.log('Suscripción exitosa:', result);
}).catch(err => {
    console.error('Error suscripción:', err);
});
```

**Copia y pega el resultado completo aquí.**
