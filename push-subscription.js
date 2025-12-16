// =====================================================
// PUSH NOTIFICATIONS - VAPID & SUBSCRIPTION
// =====================================================

const VAPID_PUBLIC_KEY = 'BM_O3_iXeEGnOZHRn4ndRbleuYUcrZBTkUhywZfTEkgW4nDrce0UQocEEwUKcgXsQByouHaR6hFR7FdmjQLM58o';

// Convertir VAPID key de base64 a Uint8Array
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

// Suscribir usuario a Push Notifications
async function subscribeToPushNotifications() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('❌ Push API no soportado en este navegador');
        return false;
    }

    if (!currentUser) {
        console.log('⚠️ Usuario no autenticado');
        return false;
    }

    try {
        // 1. Esperar a que el Service Worker esté listo
        const registration = await navigator.serviceWorker.ready;
        console.log('✅ Service Worker listo');

        // 2. Pedir permiso de notificaciones
        const permission = await Notification.requestPermission();
        console.log('🔔 Permiso de notificaciones:', permission);

        if (permission !== 'granted') {
            showToast('❌ Necesitas permitir notificaciones', 'error');
            return false;
        }

        // 3. Verificar si ya existe una suscripción
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            // 4. Crear nueva suscripción
            console.log('📝 Creando nueva suscripción...');
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
        }

        console.log('✅ Suscripción obtenida:', subscription.endpoint);

        // 5. Extraer keys de la suscripción
        const p256dh = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh'))));
        const auth = btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))));

        // 6. Guardar en Supabase
        const { error } = await window.supabaseClient
            .from('push_subscriptions')
            .upsert({
                user_id: currentUser.id,
                endpoint: subscription.endpoint,
                p256dh: p256dh,
                auth: auth
            }, {
                onConflict: 'user_id,endpoint'
            });

        if (error) {
            console.error('❌ Error guardando suscripción:', error);
            showToast('❌ Error al guardar suscripción', 'error');
            return false;
        }

        console.log('✅ Suscripción guardada en Supabase');
        showToast('✅ Notificaciones activadas!', 'success');
        return true;

    } catch (error) {
        console.error('❌ Error en suscripción Push:', error);
        showToast('❌ Error al activar notificaciones', 'error');
        return false;
    }
}

// Desuscribir de Push Notifications (opcional - para logout)
async function unsubscribeFromPush() {
    if (!('serviceWorker' in navigator)) return;

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            await subscription.unsubscribe();

            // Eliminar de Supabase
            if (currentUser) {
                await window.supabaseClient
                    .from('push_subscriptions')
                    .delete()
                    .eq('user_id', currentUser.id)
                    .eq('endpoint', subscription.endpoint);
            }

            console.log('✅ Desuscrito de Push');
        }
    } catch (error) {
        console.error('❌ Error al desuscribir:', error);
    }
}

// AUTO-SUSCRIBIR después del login
// Llamar esto después de que el usuario se autentique
async function initPushNotifications() {
    if (!currentUser) return;

    // Esperar 2 segundos después del login para no abrumar al usuario
    setTimeout(async () => {
        const subscribed = await subscribeToPushNotifications();
        if (subscribed) {
            console.log('🔔 Usuario suscrito a notificaciones Push');
        }
    }, 2000);
}
