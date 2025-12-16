# 🚀 INSTRUCCIONES DE DESPLIEGUE - RENDER

## ✅ Pre-requisitos completados:
- [x] Código subido a GitHub
- [x] Tabla `push_subscriptions` creada en Supabase
- [x] Service Key obtenida

---

## 📋 PASO A PASO:

### 1️⃣ Crear cuenta en Render (si no tienes)
- Ve a: https://render.com
- Regístrate con GitHub (gratis)

### 2️⃣ Crear nuevo Web Service
1. En Render Dashboard, click **"New +"** → **"Web Service"**
2. Conecta tu repositorio de GitHub
3. Selecciona el repo: `Timeforyou-main - copia` (o como se llame)

### 3️⃣ Configurar el servicio
- **Name**: `timeforyou-push-backend`
- **Region**: `Oregon (US West)` (o el más cercano)
- **Branch**: `main`
- **Root Directory**: (dejar vacío)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

### 4️⃣ Agregar Variables de Entorno
En la sección **Environment**, click **"Add Environment Variable"** y agrega estas 5:

```
VAPID_PUBLIC_KEY
BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LJgDd53EvJJusaykNdLGPJxQxJWZPB0RYPJzYU7T8diz1c

VAPID_PRIVATE_KEY
UUxESmb1qvaqWYXoW2Uqh7XRCoY0K9DdKhCPdUP6d4s

VAPID_EMAIL
mailto:williebeatsyt@gmail.com

SUPABASE_URL
https://csqvjwvdjzjuvwddewooy.supabase.co

SUPABASE_SERVICE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzcXZqd3ZkanpqdXZ3ZGRld295Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTIxMDgzMiwiZXhwIjoyMDgwNzg2ODMyfQ.HSrszk2fv2eqxUJDouXD6Q9AOrgaFQWzPRLvAG665Ps
```

### 5️⃣ Desplegar
- Click **"Create Web Service"**
- Espera 2-3 minutos mientras Render:
  - Clona tu repo
  - Instala dependencias (`npm install`)
  - Inicia el servicio (`npm start`)

### 6️⃣ Verificar que funciona
En los **Logs** de Render deberías ver:

```
✅ Push Notification Sender initialized
🌐 HTTP Server running on port 10000
🚀 Starting Push Notification Service...
⏰ Checking every 60 seconds
✅ Push Notification Service is running!
```

---

## 🔧 Mantener el servicio activo (IMPORTANTE)

Render Free Tier se "duerme" después de 15 minutos sin actividad.

**Solución**: Usa un servicio de cron para hacer ping cada 10 minutos:

1. Ve a: https://cron-job.org (gratis)
2. Crea cuenta
3. Crea nuevo cron job:
   - **URL**: `https://timeforyou-push-backend.onrender.com/health`
   - **Interval**: Every 10 minutes
   - **Title**: Keep Render Awake

Esto mantendrá tu backend despierto 24/7.

---

## ✅ Listo!

Ahora tu backend está corriendo en la nube y enviará notificaciones automáticamente a las horas programadas.

**Próximo paso**: Probar las notificaciones desde tu celular.
