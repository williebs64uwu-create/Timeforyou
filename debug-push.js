// =====================================================
// DEBUG SCRIPT - Test Push Notifications
// =====================================================
// Add this temporarily to test push subscription

async function testPushSubscription() {
    console.log('🔍 === INICIANDO DEBUG DE PUSH NOTIFICATIONS ===');

    // 1. Verificar usuario
    console.log('1️⃣ Usuario actual:', currentUser ? currentUser.email : '❌ NO AUTENTICADO');

    if (!currentUser) {
        alert('❌ Debes estar logueado para suscribirte');
        return;
    }

    // 2. Verificar Service Worker
    if (!('serviceWorker' in navigator)) {
        console.log('❌ Service Worker NO soportado');
        alert('❌ Tu navegador no soporta Service Workers');
        return;
    }
    console.log('✅ Service Worker soportado');

    // 3. Verificar Push API
    if (!('PushManager' in window)) {
        console.log('❌ Push API NO soportada');
        alert('❌ Tu navegador no soporta Push Notifications');
        return;
    }
    console.log('✅ Push API soportada');

    // 4. Verificar permisos
    console.log('2️⃣ Permiso actual:', Notification.permission);

    if (Notification.permission === 'denied') {
        alert('❌ Notificaciones bloqueadas. Ve a configuración del navegador y permite notificaciones para este sitio.');
        return;
    }

    // 5. Verificar Service Worker registrado
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        console.log('3️⃣ Service Worker registrado:', !!registration);

        if (!registration) {
            console.log('❌ Service Worker NO registrado');
            alert('❌ Service Worker no está registrado. Recarga la página.');
            return;
        }

        console.log('✅ Service Worker activo:', registration.active ? 'SÍ' : 'NO');

    } catch (error) {
        console.error('❌ Error verificando Service Worker:', error);
        alert('❌ Error: ' + error.message);
        return;
    }

    // 6. Intentar suscripción (FORZAR RENOVACIÓN)
    console.log('4️⃣ Intentando suscribir (Renovando llaves)...');

    try {
        const reg = await navigator.serviceWorker.getRegistration();
        const existingSub = await reg.pushManager.getSubscription();
        if (existingSub) {
            console.log('🗑️ Eliminando suscripción antigua para actualizar llaves...');
            await existingSub.unsubscribe();
        }

        const result = await subscribeToPushNotifications();

        if (result) {
            console.log('✅ SUSCRIPCIÓN EXITOSA!');
            alert('✅ ¡Suscripción exitosa! Revisa la tabla push_subscriptions en Supabase.');
        } else {
            console.log('❌ Suscripción falló (ver logs arriba)');
            alert('❌ La suscripción falló. Revisa la consola para más detalles.');
        }

    } catch (error) {
        console.error('❌ Error en suscripción:', error);
        alert('❌ Error: ' + error.message);
    }

    console.log('🔍 === FIN DEBUG ===');
}

// =====================================================
// DEBUG: CHECK DB TASK
// =====================================================
async function checkLatestTask() {
    console.log('🔍 Buscando última tarea en Supabase...');

    try {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await window.supabaseClient
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) {
            alert('❌ Error leyendo Supabase: ' + error.message);
            console.error(error);
            return;
        }

        if (!data || data.length === 0) {
            alert('❌ No se encontraron tareas en Supabase. ¿Se guardó correctamente?');
            return;
        }

        const task = data[0];
        console.log('📋 Última Tarea:', task);

        let msg = `📋 Última Tarea Guardada:\n`;
        msg += `Título: ${task.title}\n`;
        msg += `Fecha: ${task.date} (Backend busca: ${today})\n`;
        msg += `Hora: ${task.time}\n`;
        msg += `Completada: ${task.completed}\n`;
        msg += `ID Usuario: ${task.user_id}`;

        alert(msg);

    } catch (err) {
        console.error(err);
        alert('❌ Error: ' + err.message);
    }
}

// Agregar botón de debug al DOM
function addDebugButton() {
    // Container
    const container = document.createElement('div');
    container.style.cssText = 'position: fixed; top: 100px; left: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; opacity: 0.8;';

    // Push Button
    const btnPush = document.createElement('button');
    btnPush.textContent = '🔔 TEST SUSCRIPCIÓN';
    btnPush.onclick = testPushSubscription;
    styleBtn(btnPush);

    // DB Button
    const btnDB = document.createElement('button');
    btnDB.textContent = '🔍 VER ÚLTIMA TAREA';
    btnDB.onclick = checkLatestTask;
    styleBtn(btnDB, '#2d3748');

    // Check Devices Button
    const btnCheck = document.createElement('button');
    btnCheck.textContent = '📱 VER DISPOSITIVOS';
    btnCheck.onclick = async () => {
        try {
            const { count, error } = await window.supabaseClient
                .from('push_subscriptions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', currentUser.id);

            if (error) throw error;
            alert(`📱 Tienes ${count} dispositivo(s) registrados para recibir alertas.`);
        } catch (e) {
            alert('Error revisando dispositivos: ' + e.message);
        }
    };
    styleBtn(btnCheck, '#007bff');

    container.appendChild(btnDB);
    container.appendChild(btnPush);
    container.appendChild(btnCheck);
    document.body.appendChild(container);

    console.log('✅ Botones de debug agregados');
}

function styleBtn(btn, bg = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)') {
    btn.style.cssText = `
        padding: 10px 20px;
        background: ${bg};
        color: white;
        border: none;
        border-radius: 50px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
}

// Auto-ejecutar cuando cargue la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addDebugButton);
} else {
    addDebugButton();
}

console.log('🔧 Debug script cargado. Busca el botón "🔔 TEST PUSH" abajo a la derecha.');
