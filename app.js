// ===================================
// TICKTICK ULTRA PRO - FIXED VERSION
// Sistema de notificaciones PERFECTO
// ===================================

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

let tasks = [];
let classes = []; // Horario
let habits = []; // Hábitos
let exams = []; // Exámenes
let settings = {
    theme: 'dark',
    sound: true,
    notifications: true,
    language: 'es'
};
let currentView = 'inbox';
let currentDate = new Date();
let editingTaskId = null;
let selectedPriority = 'none';
let reminders = [];

// 🔥 NUEVAS VARIABLES DE ESTADO
let projects = []; // Producción Musical
let socialContent = []; // Redes Sociales
let currentUser = null; // Usuario de Firebase
let unsubscribeListeners = []; // Para limpiar listeners al salir



// ===================================
// SISTEMA DE NOTIFICACIONES MEJORADO
// Chequea cada 5 SEGUNDOS (no 10)
// ===================================

let notificationChecker = null;
let lastCheckTime = 0;

function startReminderChecker() {
    console.log('🚀 Iniciando sistema de recordatorios MEJORADO');
    console.log('⏱️ Frecuencia: cada 5 segundos');
    console.log('🔔 Notificaciones persistentes activadas');

    // Chequear inmediatamente
    checkAllReminders();

    // Chequear cada 5 segundos
    notificationChecker = setInterval(() => {
        const now = Date.now();
        const timeSinceLastCheck = now - lastCheckTime;
        console.log(`🔄 Chequeo automático (${timeSinceLastCheck}ms desde último check)`);
        checkAllReminders();
        lastCheckTime = now;
    }, 5000); // 5 SEGUNDOS

    lastCheckTime = Date.now();
}

function checkAllReminders() {
    const now = new Date();
    const nowStr = now.toISOString();

    console.log(`⏰ [${now.toLocaleTimeString('es-PE')}] Chequeando ${tasks.length} tareas...`);

    let notificationsTriggered = 0;

    tasks.forEach((task, index) => {
        if (task.completed || !task.date || !task.time) return;

        const taskDateTime = new Date(`${task.date}T${task.time}`);
        const diffMs = taskDateTime - now;
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);

        // NOTIFICACIÓN EN EL MOMENTO EXACTO (±20 segundos de ventana)
        if (diffSeconds >= -20 && diffSeconds <= 20) {
            if (!task.notifiedExact) {
                console.log(`🔴 NOTIFICACIÓN EXACTA: "${task.title}" (diff: ${diffSeconds}s)`);

                showPersistentNotification(
                    `⏰ ¡ES HORA! ${task.title}`,
                    `Tu tarea programada para ${task.time}`,
                    task.id
                );

                task.notifiedExact = true;
                notificationsTriggered++;
                saveData();
            }
        }

        // RECORDATORIOS ANTES (ventana de ±30 segundos)
        if (task.reminders && task.reminders.length > 0) {
            task.reminders.forEach(reminder => {
                const reminderKey = `notified_${reminder.minutes}`;

                if (!task[reminderKey]) {
                    const targetSeconds = reminder.minutes * 60;

                    // Ventana de ±30 segundos para capturar el recordatorio
                    if (diffSeconds >= targetSeconds - 30 && diffSeconds <= targetSeconds + 30) {
                        console.log(`🟡 RECORDATORIO ${reminder.minutes}min: "${task.title}" (diff: ${diffMinutes}min)`);

                        showPersistentNotification(
                            `🔔 Recordatorio: ${task.title}`,
                            reminder.label,
                            task.id
                        );

                        task[reminderKey] = true;
                        notificationsTriggered++;
                        saveData();
                    }
                }
            });
        }

        // DEBUG: Mostrar tareas próximas
        if (diffMinutes >= 0 && diffMinutes <= 60 && !task.notifiedExact) {
            console.log(`⏳ Próxima: "${task.title}" en ${diffMinutes} minutos`);
        }
    });

    if (notificationsTriggered > 0) {
        console.log(`✅ ${notificationsTriggered} notificaciones enviadas`);
    }
}

// NOTIFICACIÓN PERSISTENTE (suena hasta que la veas)
function showPersistentNotification(title, body, taskId) {
    console.log('📢 Creando notificación persistente:', title);

    // Vibración personalizada (móvil)
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
    }

    // Sonido (si está activado)
    if (settings.sound) {
        playAlertSound();
    }

    // Notificación del navegador
    if (settings.notifications && Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body,
            icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%236366f1"/%3E%3Cpath d="M30 50 L45 65 L70 35" stroke="white" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/%3E%3C/svg%3E',
            // badge: retirado para evitar error 404 (requiere URL de imagen)
            requireInteraction: true, // PERSISTENTE
            silent: false,
            tag: `ticktick-${taskId}-${Date.now()}`,
            vibrate: [200, 100, 200]
        });

        notification.onclick = function () {
            window.focus();
            goToTask(taskId);
            this.close();
        };
    }

    // Banner visual en la app
    showNotificationBanner(title, body);

    // Toast rápido
    showToast(title);
}

function playAlertSound() {
    // Sonido de alerta más fuerte
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzSJ0/LTgjMGHm7A7+OZURE=');
    audio.volume = 1.0;
    audio.play().catch(err => console.log('No se pudo reproducir sonido:', err));
}

function showNotificationBanner(title, body) {
    const banner = document.createElement('div');
    banner.className = 'notification-banner';
    banner.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-secondary);
        border: 3px solid var(--primary);
        border-radius: 16px;
        padding: 20px;
        max-width: 400px;
        box-shadow: 0 8px 30px var(--shadow);
        z-index: 1002;
        animation: slideInRight 0.5s ease, pulse 2s infinite;
    `;
    banner.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px; display: flex; align-items: center; gap: 10px;">
            🔔 ${title}
        </div>
        <div style="font-size: 14px; color: var(--text-secondary);">${body}</div>
        <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 8px 16px; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer;">
            Cerrar
        </button>
    `;
    document.body.appendChild(banner);

    // Auto-cerrar después de 10 segundos
    setTimeout(() => {
        if (banner.parentElement) {
            banner.style.animation = 'slideInRight 0.5s ease reverse';
            setTimeout(() => banner.remove(), 500);
        }
    }, 10000);
}

function goToTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.date) {
        currentDate = new Date(task.date);
        changeView('today');
    }
}

// ===================================
// PERMISOS DE NOTIFICACIONES
// ===================================

function requestNotificationPermission() {
    console.log('🔐 Solicitando permisos de notificación...');

    if ('Notification' in window) {
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log('Permiso:', permission);

                if (permission === 'granted') {
                    showToast('✅ Notificaciones activadas correctamente');
                    showTestNotification();
                } else {
                    showToast('⚠️ Notificaciones bloqueadas. Actívalas en configuración del navegador');
                }
            });
        } else if (Notification.permission === 'granted') {
            showToast('✅ Notificaciones ya estaban activadas');
            showTestNotification();
        } else {
            showToast('❌ Notificaciones bloqueadas. Ve a configuración del navegador');
        }
    } else {
        showToast('❌ Tu navegador no soporta notificaciones');
    }
}

function showTestNotification() {
    setTimeout(() => {
        showPersistentNotification(
            'TickTick Ultra PRO',
            '¡Sistema de notificaciones funcionando perfectamente! 🎉',
            'test'
        );
    }, 2000);
}

// ===================================
// SISTEMA DE RECORDATORIOS INTELIGENTE
// ===================================

function updateReminderOptions() {
    const dateInput = document.getElementById('taskDate').value;
    const timeInput = document.getElementById('taskTime').value;
    const select = document.getElementById('reminderSelect');
    const warning = document.getElementById('reminderWarning');

    if (!dateInput || !timeInput) {
        select.innerHTML = '<option value="">⚠️ Selecciona fecha y hora primero</option>';
        warning.style.display = 'block';
        return;
    }

    warning.style.display = 'none';

    const taskDateTime = new Date(`${dateInput}T${timeInput}`);
    const now = new Date();
    const diffMs = taskDateTime - now;
    const diffMinutes = Math.floor(diffMs / 60000);

    const allOptions = [
        { value: 5, label: '5 minutos antes', minutes: 5 },
        { value: 15, label: '15 minutos antes', minutes: 15 },
        { value: 30, label: '30 minutos antes', minutes: 30 },
        { value: 60, label: '1 hora antes', minutes: 60 },
        { value: 120, label: '2 horas antes', minutes: 120 },
        { value: 1440, label: '1 día antes', minutes: 1440 }
    ];

    const validOptions = allOptions.filter(opt => diffMinutes > opt.minutes + 1);

    select.innerHTML = '<option value="">Seleccionar...</option>';

    if (validOptions.length === 0) {
        select.innerHTML += '<option value="" disabled>⚠️ La tarea es muy pronto</option>';
    } else {
        validOptions.forEach(opt => {
            select.innerHTML += `<option value="${opt.value}">${opt.label}</option>`;
        });
    }

    console.log(`⏱️ Tiempo hasta tarea: ${diffMinutes} minutos | Opciones: ${validOptions.length}`);
}

function addReminder(minutes) {
    if (!minutes) return;
    const select = document.getElementById('reminderSelect');
    const option = select.options[select.selectedIndex];

    const minutesInt = parseInt(minutes);

    // Evitar duplicados
    if (reminders.some(r => r.minutes === minutesInt)) {
        showToast('⚠️ Ya existe ese recordatorio');
        return;
    }

    reminders.push({ minutes: minutesInt, label: option.text });
    renderReminders();
    select.value = '';

    showToast(`✅ Recordatorio agregado: ${option.text}`);
}

function renderReminders() {
    const container = document.getElementById('remindersContainer');
    container.innerHTML = reminders.map((r, i) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--bg-tertiary); border-radius: 8px; margin-bottom: 8px;">
            <span>🔔 ${r.label}</span>
            <button type="button" class="btn btn-danger btn-small" onclick="removeReminder(${i})">×</button>
        </div>
    `).join('');
}

function removeReminder(index) {
    reminders.splice(index, 1);
    renderReminders();
    showToast('🗑️ Recordatorio eliminado');
}

// ===================================
// INICIALIZACIÓN
// ===================================

window.onload = function () {
    console.log('🚀 Iniciando TickTick Ultra PRO...');

    loadData();
    setMinDate();
    render();
    applyTheme();

    // Solicitar permisos de notificación
    requestNotificationPermission();

    // Iniciar sistema de recordatorios (5 segundos)
    startReminderChecker();

    // Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('✅ Service Worker registrado:', reg.scope))
            .catch(err => console.log('❌ Error SW:', err));
    }

    // 🔥 Iniciar Auth Listener
    initAuth();

    console.log('✅ App inicializada correctamente');
};

// ===================================
// ===================================
// SUPABASE AUTH & SYNC
// ===================================

function initAuth() {
    // 1. Verificar sesión al cargar
    window.supabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            currentUser = session.user;
            console.log('👤 Usuario conectado:', currentUser.email);
            updateUserProfileUI(currentUser);
            syncData();
        }
    });

    // 2. Escuchar cambios (Login/Logout)
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('⚡ Supabase Auth Event:', event);

        if (session) {
            currentUser = session.user;
            updateUserProfileUI(currentUser);
            // Si es un login nuevo, syncData se activará
            if (event === 'SIGNED_IN') syncData();
        } else {
            currentUser = null;
            console.log('👤 Usuario desconectado');
            updateUserProfileUI(null);
            // Limpiar datos visuales
            tasks = []; projects = []; socialContent = []; habits = []; classes = []; exams = [];
            render();
        }
    });
}

// ===================================
// UI DE LOGIN MEJORADA
// ===================================

function openLoginModal() {
    document.getElementById('loginModal').classList.add('active');
    setTimeout(() => document.getElementById('loginEmail').focus(), 100);
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const btn = event.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    if (!email) return;

    btn.disabled = true;
    btn.innerHTML = '⏳ Enviando...';

    try {
        const { error } = await window.supabaseClient.auth.signInWithOtp({
            email: email,
            options: { emailRedirectTo: window.location.href }
        });

        if (error) throw error;

        closeLoginModal();
        alert(`✅ ¡Enlace enviado a ${email}!\n\nRevisa tu bandeja de entrada (y spam) para entrar.`);
    } catch (error) {
        console.error('Login Error:', error);
        alert('❌ Error: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// Reemplazo de la función antigua
function loginWithEmail() {
    openLoginModal();
}

async function logout() {
    try {
        const { error } = await window.supabaseClient.auth.signOut();
        if (error) throw error;
        window.location.reload();
    } catch (error) {
        console.error('Logout Error:', error);
    }
}

function updateUserProfileUI(user) {
    const profileDiv = document.getElementById('userProfile');
    const loginBtn = document.getElementById('loginBtn');
    const avatar = document.getElementById('userAvatar');
    const name = document.getElementById('userName');

    if (user) {
        profileDiv.style.display = 'flex';
        loginBtn.style.display = 'none';
        // Avatar generado con iniciales
        avatar.src = `https://ui-avatars.com/api/?name=${user.email}&background=6366f1&color=fff&bold=true`;
        name.textContent = user.email.split('@')[0];
    } else {
        profileDiv.style.display = 'none';
        loginBtn.style.display = 'flex';
        loginBtn.onclick = openLoginModal;
        loginBtn.innerHTML = '<span style="margin-right: 5px;">⚡</span> Iniciar Sesión';
    }
}

// -----------------------------------
// SINCRONIZACIÓN DE DATOS (REALTIME)
// -----------------------------------

function syncData() {
    if (!currentUser) return;

    console.log('🔄 Sincronizando datos desde Supabase...');
    const tables = ['tasks', 'projects', 'social', 'habits', 'classes', 'exams'];

    tables.forEach(table => {
        // 1. Carga inicial
        window.supabaseClient
            .from(table)
            .select('*')
            .order('created_at', { ascending: true })
            .then(({ data, error }) => {
                if (error) {
                    console.error(`Error cargando ${table}:`, error);
                    return;
                }

                // Actualizar arrays locales
                updateLocalArray(table, data);
            });

        // 2. Suscripción a cambios
        const channel = window.supabaseClient
            .channel(`public:${table}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: table, filter: `user_id=eq.${currentUser.id}` }, payload => {
                console.log(`🔔 Cambio en ${table}:`, payload);
                handleRealtimeUpdate(table, payload);
            })
            .subscribe();

        unsubscribeListeners.push(() => window.supabaseClient.removeChannel(channel));
    });
}

function updateLocalArray(table, data) {
    switch (table) {
        case 'tasks': tasks = data; startReminderChecker(); break;
        case 'projects': projects = data; break;
        case 'social': socialContent = data; break;
        case 'habits': habits = data; break;
        case 'classes': classes = data; break;
        case 'exams': exams = data; break;
    }
    render();
}

function handleRealtimeUpdate(table, payload) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    let targetArray;

    // Referencia al array correcto
    switch (table) {
        case 'tasks': targetArray = tasks; break;
        case 'projects': targetArray = projects; break;
        case 'social': targetArray = socialContent; break;
        case 'habits': targetArray = habits; break;
        case 'classes': targetArray = classes; break;
        case 'exams': targetArray = exams; break;
    }

    if (!targetArray) return;

    if (eventType === 'INSERT') {
        targetArray.push(newRecord);
        if (table === 'tasks') {
            showPersistentNotification('📝 Nueva tarea sincronizada', `${newRecord.title}`);
            startReminderChecker();
        }
    } else if (eventType === 'UPDATE') {
        const index = targetArray.findIndex(item => item.id === newRecord.id);
        if (index !== -1) targetArray[index] = newRecord;
    } else if (eventType === 'DELETE') {
        const index = targetArray.findIndex(item => item.id === oldRecord.id);
        if (index !== -1) targetArray.splice(index, 1);
    }

    render();
}

// GESTIÓN DE DATOS
// ===================================

function loadData() {
    const savedTasks = localStorage.getItem('ticktick-tasks');
    const savedSettings = localStorage.getItem('ticktick-settings');
    const savedClasses = localStorage.getItem('ticktick-classes');
    const savedHabits = localStorage.getItem('ticktick-habits');

    if (savedTasks) tasks = JSON.parse(savedTasks);
    if (savedSettings) settings = JSON.parse(savedSettings);
    if (savedClasses) classes = JSON.parse(savedClasses);
    if (savedHabits) habits = JSON.parse(savedHabits);

    console.log(`📊 Datos cargados: ${tasks.length} tareas, ${habits.length} hábitos, ${classes.length} clases`);
}

function saveData() {
    localStorage.setItem('ticktick-tasks', JSON.stringify(tasks));
    localStorage.setItem('ticktick-settings', JSON.stringify(settings));
    localStorage.setItem('ticktick-classes', JSON.stringify(classes));
    localStorage.setItem('ticktick-habits', JSON.stringify(habits));
}

function setMinDate() {
    const yyyy = TODAY.getFullYear();
    const mm = String(TODAY.getMonth() + 1).padStart(2, '0');
    const dd = String(TODAY.getDate()).padStart(2, '0');
    document.getElementById('taskDate').value = `${yyyy}-${mm}-${dd}`;
}

// ===================================
// UI Y NAVEGACIÓN
// ===================================

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function changeView(view) {
    currentView = view;
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
    event.target.classList.add('active');

    const titles = {
        'inbox': 'Inbox',
        'today': 'Hoy',
        'week': 'Esta Semana',
        'month': 'Este Mes',
        'schedule': 'Horario de Clases',
        'exams': 'Exámenes y Entregas',
        'music': 'Producción Musical 🎹',
        'social': 'Redes Sociales 📱',
        'habits': 'Rastreador de Hábitos',
        'pomodoro': 'Pomodoro Timer',
        'stats': 'Estadísticas',
        'settings': 'Configuración'
    };

    document.getElementById('viewTitle').textContent = titles[view] || view;

    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('open');
    }

    render();
}

function render() {
    updateInboxCount();
    const content = document.getElementById('mainContent');

    switch (currentView) {
        case 'inbox':
            renderInbox(content);
            break;
        case 'today':
            renderToday(content);
            break;
        case 'settings':
            renderSettings(content);
            break;
        case 'stats':
            renderStats(content);
            break;
        case 'music':
            renderMusic(content);
            break;
        case 'social':
            renderSocial(content);
            break;
        case 'habits':
            renderHabits(content);
            break;
        case 'schedule':
            renderSchedule(content);
            break;
        case 'exams':
            renderExams(content);
            break;
        case 'pomodoro':
            renderPomodoro(content);
            break;
        default:
            renderInbox(content);
    }
}

// ===================================
// ESTUDIO & PRODUCTIVIDAD (ESTILO PRO)
// ===================================

let pomodoroInterval;
let timeLeft = 25 * 60;
let isTimerRunning = false;
let timerMode = 'focus'; // focus, short, long

function renderPomodoro(content) {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');

    // Calcular progreso para el círculo (svg stroke-dasharray)
    // 283 es approx 2 * PI * r (r=45)
    // focus = 1500s, short = 300s, long = 900s
    const totalTime = timerMode === 'focus' ? 1500 : timerMode === 'short' ? 300 : 900;
    const progress = ((totalTime - timeLeft) / totalTime) * 283;

    content.innerHTML = `
    <div style="max-width: 400px; margin: 0 auto; text-align: center;">
        <h2 style="margin-bottom: 20px;">⏱️ Pomodoro Timer</h2>
        
        <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 30px;">
            <button class="btn ${timerMode === 'focus' ? 'btn-primary' : 'btn-secondary'}" onclick="setTimerMode('focus')">Focus (25m)</button>
            <button class="btn ${timerMode === 'short' ? 'btn-primary' : 'btn-secondary'}" onclick="setTimerMode('short')">Corto (5m)</button>
            <button class="btn ${timerMode === 'long' ? 'btn-primary' : 'btn-secondary'}" onclick="setTimerMode('long')">Largo (15m)</button>
        </div>

        <div style="position: relative; width: 250px; height: 250px; margin: 0 auto;">
            <svg viewBox="0 0 100 100" style="transform: rotate(-90deg); width: 100%; height: 100%;">
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg-tertiary)" stroke-width="5" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--primary)" stroke-width="5"
                    stroke-dasharray="283" stroke-dashoffset="${283 - progress}"
                    style="transition: stroke-dashoffset 1s linear;" />
            </svg>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 50px; font-weight: bold; font-family: monospace;">
                ${minutes}:${seconds}
            </div>
        </div>

        <div style="margin-top: 30px; display: flex; justify-content: center; gap: 15px;">
            <button class="btn btn-primary" style="width: 120px; font-size: 18px;" onclick="toggleTimer()">
                ${isTimerRunning ? '⏸️ Pausa' : '▶️ Iniciar'}
            </button>
            <button class="btn btn-secondary" onclick="resetTimer()" title="Reiniciar">🔄</button>
        </div>
        
        <p style="margin-top: 20px; color: var(--text-secondary); font-size: 14px;">
            ${isTimerRunning ? '¡Mantén el enfoque! 🔥' : 'Listo para producir.'}
        </p>
    </div>
    `;
}

function setTimerMode(mode) {
    timerMode = mode;
    isTimerRunning = false;
    clearInterval(pomodoroInterval);
    if (mode === 'focus') timeLeft = 25 * 60;
    if (mode === 'short') timeLeft = 5 * 60;
    if (mode === 'long') timeLeft = 15 * 60;
    render();
}

function toggleTimer() {
    isTimerRunning = !isTimerRunning;
    if (isTimerRunning) {
        pomodoroInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                render(); // Re-render simple para actualizar UI (idealmente optimizar)
            } else {
                isTimerRunning = false;
                clearInterval(pomodoroInterval);
                showPersistentNotification('🚨 Pomodoro Terminado', '¡Hora del descanso!');
                new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(e => { });
                render();
            }
        }, 1000);
    } else {
        clearInterval(pomodoroInterval);
    }
    render();
}

function resetTimer() {
    isTimerRunning = false;
    clearInterval(pomodoroInterval);
    if (timerMode === 'focus') timeLeft = 25 * 60;
    if (timerMode === 'short') timeLeft = 5 * 60;
    if (timerMode === 'long') timeLeft = 15 * 60;
    render();
}

// ------------------------------

function renderSchedule(content) {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const icons = ['📘', '📙', '📗', '📕', '📓', '📒'];
    const scheduleImage = localStorage.getItem('ticktick-schedule-image');

    let html = `
        <div style="margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h2 style="margin:0;">📚 Horario de Clases</h2>
                <p style="color:var(--text-secondary); margin:5px 0 0 0; font-size:14px;">Organiza tus materias y aulas.</p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-secondary" onclick="document.getElementById('scheduleImageInput').click()">🖼️ Imagen</button>
                <input type="file" id="scheduleImageInput" hidden accept="image/*" onchange="uploadScheduleImage(this)">
                <button class="btn btn-primary" onclick="promptNewClass()">+ Añadir Clase</button>
            </div>
        </div>
    `;

    if (scheduleImage) {
        html += `
            <div style="margin-bottom: 25px; position: relative; border-radius: 12px; overflow: hidden; border: 2px solid var(--border);">
                <img src="${scheduleImage}" style="width: 100%; display: block;">
                <button onclick="removeScheduleImage()" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; border: none; padding: 5px 10px; border-radius: 6px; cursor: pointer;">🗑️ Eliminar Imagen</button>
            </div>
        `;
    }

    html += '<div style="display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">';

    days.forEach((day, index) => {
        const dayClasses = classes.filter(c => c.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
        if (dayClasses.length > 0) {
            html += `
                <div class="task-card" style="padding: 0; overflow: hidden; border: none; background: var(--bg-secondary);">
                    <div style="background: var(--bg-tertiary); padding: 12px 15px; font-weight: bold; color: var(--primary); border-bottom: 1px solid var(--border); display: flex; justify-content: space-between;">
                        <span>${day}</span>
                        <span>${dayClasses.length} clases</span>
                    </div>
                    <div style="padding: 10px;">
                        ${dayClasses.map(c => `
                            <div style="display: flex; align-items: center; padding: 12px; margin-bottom: 8px; background: var(--bg-primary); border-radius: 8px; border-left: 3px solid var(--primary);">
                                <div style="font-size: 24px; margin-right: 12px;">${icons[index % icons.length]}</div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 700;">${c.subject}</div>
                                    <div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">
                                        ⏰ ${c.startTime} - ${c.endTime}
                                    </div>
                                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                                        📍 ${c.room || 'Aula Virtual'}
                                    </div>
                                </div>
                                <button class="btn btn-danger btn-small" onclick="deleteClass('${c.id}')" style="opacity: 0.6; hover:opacity:1;">×</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    });

    if (classes.length === 0 && !scheduleImage) {
        html += `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
            <div style="font-size: 40px; margin-bottom: 10px;">🎓</div>
            <h3>Sin clases registradas</h3>
            <p>Sube una imagen de tu horario o añade clases manualmente.</p>
        </div>
       `;
    }

    html += '</div>';
    content.innerHTML = html;
}

function uploadScheduleImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            // Comprimir o limitar tamaño sería ideal, pero por ahora directo
            try {
                localStorage.setItem('ticktick-schedule-image', e.target.result);
                render();
                showToast('✅ Imagen guardada');
            } catch (err) {
                alert('❌ La imagen es muy grande para guardar localmente. Intenta con una más pequeña.');
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function removeScheduleImage() {
    if (confirm('¿Eliminar la imagen del horario?')) {
        localStorage.removeItem('ticktick-schedule-image');
        render();
    }
}

function renderExams(content) {
    const sortedExams = exams.sort((a, b) => new Date(a.date) - new Date(b.date));

    content.innerHTML = `
         <div style="margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h2 style="margin:0;">📝 Exámenes y Entregas</h2>
                <p style="color:var(--text-secondary); margin:5px 0 0 0; font-size:14px;">No dejes que se te pase nada.</p>
            </div>
            <button class="btn btn-primary" onclick="promptNewExam()">+ Nuevo Examen</button>
        </div>
        <div style="display: grid; gap: 15px; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
            ${sortedExams.length === 0 ? `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
                    <div style="font-size: 40px; margin-bottom: 10px;">🏆</div>
                    <h3>¡Todo limpio!</h3>
                    <p>No tienes exámenes próximos.</p>
                </div>
            ` : sortedExams.map(e => {
        const daysLeft = Math.ceil((new Date(e.date) - new Date()) / (1000 * 60 * 60 * 24));
        const urgencyColor = daysLeft <= 2 ? '#ef4444' : daysLeft <= 7 ? '#f59e0b' : '#10b981';

        return `
                <div class="task-card" style="border-top: 4px solid ${urgencyColor}; position: relative;">
                    <div style="position: absolute; top: 10px; right: 10px; background: ${urgencyColor}20; color: ${urgencyColor}; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">
                        ${daysLeft < 0 ? 'Vencido' : daysLeft === 0 ? 'HOY' : daysLeft + ' días'}
                    </div>
                    
                    <div style="margin-top: 5px;">
                        <div style="font-weight: 800; font-size: 18px; margin-bottom: 5px;">${e.subject}</div>
                        <div style="font-size: 14px; color: var(--text-primary); margin-bottom: 10px;">${e.topic || 'Evaluación'}</div>
                        
                        <div style="display: flex; gap: 10px; font-size: 13px; color: var(--text-secondary); background: var(--bg-tertiary); padding: 8px; border-radius: 6px;">
                            <span>📅 ${e.date}</span>
                            <span>⏰ ${e.time || '--:--'}</span>
                        </div>
                    </div>

                    <div style="margin-top: 15px; display: flex; justify-content: flex-end;">
                        <button class="btn btn-danger btn-small" onclick="deleteExam('${e.id}')">🗑️ Eliminar</button>
                    </div>
                </div>
            `}).join('')}
        </div>
    `;
}

// ===================================
// VISTAS PERSONALIZADAS (ESTILO PRO)
// ===================================

function renderMusic(content) {
    content.innerHTML = `
    <div style="margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center;">
        <div>
            <h2 style="margin:0;">🎹 Producción Musical</h2>
            <p style="color:var(--text-secondary); margin:5px 0 0 0; font-size:14px;">Gestiona tus beats, mezclas y lanzamientos.</p>
        </div>
        <button class="btn btn-primary" onclick="promptNewProject()">
            <span style="font-size:18px; margin-right:5px;">+</span> Nuevo Proyecto
        </button>
    </div>

    <div class="grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
        ${projects.length === 0 ? renderEmptyState('music') : projects.map(p => `
            <div class="task-card" style="border-top: 4px solid ${getMusicColor(p.type)}; position: relative; overflow: hidden;">
                <div style="position: absolute; top: 10px; right: 10px; opacity: 0.1; font-size: 60px;">🎹</div>
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <div>
                        <div style="font-weight: 800; font-size: 20px; letter-spacing: -0.5px;">${p.title}</div>
                        <div style="font-size: 13px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-top: 5px; font-weight: 600;">
                            ${p.type || 'Beat'} ${p.bpm ? '• ' + p.bpm + ' BPM' : ''}
                        </div>
                    </div>
                </div>

                <div style="background: var(--bg-tertiary); padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
                        <span style="color: var(--text-secondary);">Estado:</span>
                        <span class="badge" style="background: ${getStatusColor(p.status)}; color: white;">
                            ${formatStatus(p.status)}
                        </span>
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <!-- Simulando controles de reproductor -->
                    <button class="btn btn-secondary btn-small" title="Reproducir Demo">▶️</button>
                    <button class="btn btn-secondary btn-small" onclick="deleteProject('${p.id}')" title="Eliminar">🗑️</button>
                </div>
            </div>
        `).join('')}
    </div>
    `;
}

function renderSocial(content) {
    content.innerHTML = `
    <div style="margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center;">
        <div>
            <h2 style="margin:0;">📱 Redes & Contenido</h2>
            <p style="color:var(--text-secondary); margin:5px 0 0 0; font-size:14px;">Planificador de posts para TikTok, IG y YouTube.</p>
        </div>
        <button class="btn btn-primary" onclick="promptNewSocial()">
            <span style="font-size:18px; margin-right:5px;">+</span> Nueva Idea
        </button>
    </div>

    <div class="grid-container" style="display: flex; flex-direction: column; gap: 12px;">
        ${socialContent.length === 0 ? renderEmptyState('social') : socialContent.map(post => `
            <div class="task-card" style="display: grid; grid-template-columns: auto 1fr auto; gap: 15px; align-items: center;">
                
                <div style="width: 50px; height: 50px; background: var(--bg-tertiary); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                    ${getPlatformIcon(post.platform)}
                </div>

                <div>
                    <div style="font-weight: 700; font-size: 16px;">${post.idea}</div>
                    <div style="display: flex; gap: 10px; margin-top: 5px; font-size: 12px; color: var(--text-secondary);">
                        <span>📅 ${post.date || 'Sin fecha'}</span>
                        <span>•</span>
                        <span style="text-transform: capitalize;">${post.platform}</span>
                    </div>
                </div>

                <div style="display: flex; gap: 10px; align-items: center;">
                    <select onchange="updateSocialStatus('${post.id}', this.value)" 
                        style="padding: 6px 12px; border-radius: 20px; background: var(--bg-primary); color: white; border: 1px solid var(--border); font-size: 12px; cursor: pointer;">
                        <option value="idea" ${post.status === 'idea' ? 'selected' : ''}>💡 Idea</option>
                        <option value="scripting" ${post.status === 'scripting' ? 'selected' : ''}>📝 Guion</option>
                        <option value="filming" ${post.status === 'filming' ? 'selected' : ''}>🎥 Grabando</option>
                        <option value="editing" ${post.status === 'editing' ? 'selected' : ''}>✂️ Editando</option>
                        <option value="posted" ${post.status === 'posted' ? 'selected' : ''}>✅ Publicado</option>
                    </select>
                    <button class="btn btn-danger btn-small" onclick="deleteSocial('${post.id}')" style="border-radius: 50%; width: 30px; height: 30px; padding: 0; display: flex; align-items: center; justify-content: center;">×</button>
                </div>
            </div>
        `).join('')}
    </div>
    `;
}

// Helpers Visuales
function renderEmptyState(type) {
    if (type === 'music') {
        return `
        <div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: var(--text-secondary); background: var(--bg-secondary); border-radius: 16px; border: 2px dashed var(--border);">
            <div style="font-size: 40px; margin-bottom: 10px;">🎹</div>
            <h3>Tu estudio está vacío</h3>
            <p>¡El mundo necesita tu música! Empieza creando un nuevo proyecto.</p>
        </div>`;
    }
    if (type === 'social') {
        return `
        <div style="text-align: center; padding: 50px; color: var(--text-secondary); background: var(--bg-secondary); border-radius: 16px; border: 2px dashed var(--border);">
            <div style="font-size: 40px; margin-bottom: 10px;">📱</div>
            <h3>Sin contenido programado</h3>
            <p>La constancia es clave. ¡Anota tu próxima idea viral!</p>
        </div>`;
    }
}

function getMusicColor(type) {
    // Colores tipo FL Studio / Ableton
    if (type === 'Beat') return '#f59e0b'; // Naranja
    if (type === 'Canción') return '#ef4444'; // Rojo
    if (type === 'Remix') return '#8b5cf6'; // Violeta
    return '#6366f1'; // Indigo por defecto
}

function formatStatus(status) {
    const map = {
        'idea': '💡 Idea',
        'recording': '🎙️ Grabando',
        'mixing': '🎚️ Mezclando',
        'mastering': '🔊 Mastering',
        'done': '✅ Terminado'
    };
    return map[status] || status;
}

// Helpers para vistas
function getStatusColor(status) {
    const colors = { 'idea': '#6366f1', 'recording': '#ef4444', 'mixing': '#f59e0b', 'mastering': '#10b981', 'done': '#059669' };
    return colors[status] || '#6366f1';
}

function getPlatformIcon(platform) {
    const icons = { 'instagram': '📸', 'tiktok': '🎵', 'youtube': '▶️', 'twitter': '🐦' };
    return icons[platform] || '📱';
}

// ===================================
// CUSTOM INPUT MODAL
// ===================================

function openInputModal(title, fields, onSubmit) {
    document.getElementById('inputModalTitle').textContent = title;
    const container = document.getElementById('inputModalFields');
    container.innerHTML = '';

    fields.forEach(field => {
        const div = document.createElement('div');
        div.style.marginBottom = '15px';

        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = field.label;
        div.appendChild(label);

        let input;
        if (field.type === 'select') {
            input = document.createElement('select');
            input.className = 'form-input';
            field.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.label;
                if (opt.selected) option.selected = true;
                input.appendChild(option);
            });
        } else {
            input = document.createElement('input');
            input.className = 'form-input';
            input.type = field.type || 'text';
            if (field.value) input.value = field.value;
            if (field.placeholder) input.placeholder = field.placeholder;
        }
        input.name = field.name;
        div.appendChild(input);
        container.appendChild(div);
    });

    const modal = document.getElementById('inputModal');
    modal.classList.add('show');

    const form = document.getElementById('inputModalForm');
    form.onsubmit = (e) => {
        e.preventDefault();
        const formData = {};
        fields.forEach(field => {
            formData[field.name] = form.elements[field.name].value;
        });
        onSubmit(formData);
        closeInputModal();
    };
}

function closeInputModal() {
    document.getElementById('inputModal').classList.remove('show');
}

// ===================================
// LIFESTYLE FUNCTIONS (Updated)
// ===================================

function promptNewProject() {
    openInputModal('Nuevo Proyecto Musical', [
        { label: 'Nombre del Proyecto', name: 'title', placeholder: 'Ej. Trap Beat Vol. 1' },
        {
            label: 'Tipo', name: 'type', type: 'select', options: [
                { value: 'Beat', label: '🎹 Beat' },
                { value: 'Canción', label: '🎙️ Canción' },
                { value: 'Remix', label: '🎧 Remix' },
                { value: 'Idea', label: '💡 Idea' }
            ]
        }
    ], (data) => {
        if (data.title) {
            addProject({
                title: data.title,
                type: data.type,
                status: 'idea',
                created_at: new Date().toISOString()
            });
        }
    });
}

function promptNewSocial() {
    openInputModal('Nueva Idea de Contenido', [
        { label: 'Idea del Post', name: 'idea', placeholder: 'Ej. Vlog diario...' },
        {
            label: 'Plataforma', name: 'platform', type: 'select', options: [
                { value: 'instagram', label: '📸 Instagram' },
                { value: 'tiktok', label: '🎵 TikTok' },
                { value: 'youtube', label: '▶️ YouTube' }
            ]
        }
    ], (data) => {
        if (data.idea) {
            addSocial({
                idea: data.idea,
                platform: data.platform,
                status: 'idea',
                date: new Date().toISOString().split('T')[0],
                created_at: new Date().toISOString()
            });
        }
    });
}

// --- LOGICA DE ACTUALIZACIÓN DE DATOS (Interina) ---
async function addProject(data) {
    if (currentUser) {
        // Guardar en Supabase
        const { error } = await window.supabaseClient
            .from('projects')
            .insert([{ ...data, user_id: currentUser.id }]);

        if (error) {
            console.error(error);
            showToast('❌ Error al crear proyecto');
        } else {
            showToast('✅ Proyecto creado');
        }
    } else {
        // Local
        projects.push({ id: Date.now().toString(), ...data });
        renderMusic(document.getElementById('mainContent'));
    }
}

async function deleteProject(id) {
    if (confirm('¿Borrar proyecto?')) {
        if (currentUser) {
            const { error } = await window.supabaseClient
                .from('projects')
                .delete()
                .eq('id', id);

            if (error) console.error(error);
            else showToast('🗑️ Proyecto eliminado');
        } else {
            projects = projects.filter(p => p.id !== id);
            renderMusic(document.getElementById('mainContent'));
        }
    }
}

async function addSocial(data) {
    if (currentUser) {
        const { error } = await window.supabaseClient
            .from('social')
            .insert([{ ...data, user_id: currentUser.id }]);

        if (error) console.error(error);
        else showToast('✅ Idea guardada');
    } else {
        socialContent.push({ id: Date.now().toString(), ...data });
        renderSocial(document.getElementById('mainContent'));
    }
}

async function deleteSocial(id) {
    if (currentUser) {
        const { error } = await window.supabaseClient
            .from('social')
            .delete()
            .eq('id', id);
    } else {
        socialContent = socialContent.filter(s => s.id !== id);
        renderSocial(document.getElementById('mainContent'));
    }
}

function renderHabits(content) {
    const todayStr = formatDate(new Date());

    content.innerHTML = `
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <h3>💪 Mis Hábitos</h3>
            <button class="btn btn-primary btn-small" onclick="promptNewHabit()">+ Nuevo Hábito</button>
        </div>
        <div class="grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;">
            ${habits.length === 0 ? '<p>No hay hábitos aún.</p>' : habits.map(h => {
        const completedToday = h.completedDates && h.completedDates.includes(todayStr);
        return `
                <div class="task-card" style="border-left: 4px solid var(--success);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <div style="font-weight: bold; font-size: 18px;">${h.title}</div>
                            <div style="font-size: 13px; color: var(--text-secondary); margin-top: 5px;">🔥 Racha: ${calculateStreak(h.completedDates)} días</div>
                        </div>
                        <button class="btn btn-small ${completedToday ? 'btn-success' : 'btn-secondary'}" onclick="toggleHabit('${h.id}')" ${completedToday ? 'disabled' : ''}>
                            ${completedToday ? '✅ Completado' : 'Marcar Hoy'}
                        </button>
                    </div>
                </div>`;
    }).join('')}
        </div>
    `;
}

function renderSchedule(content) {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    let html = `
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <h3>📚 Horario de Clases</h3>
            <button class="btn btn-primary btn-small" onclick="promptNewClass()">+ Añadir Clase</button>
        </div>
        <div style="display: grid; gap: 20px;">
    `;

    days.forEach(day => {
        const dayClasses = classes.filter(c => c.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
        if (dayClasses.length > 0) {
            html += `
                <div style="background: var(--bg-tertiary); padding: 15px; border-radius: 12px;">
                    <h4 style="margin-bottom: 10px; color: var(--primary);">${day}</h4>
                    <div style="display: grid; gap: 10px;">
                        ${dayClasses.map(c => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--bg-primary); border-radius: 8px;">
                                <div>
                                    <div style="font-weight: bold;">${c.subject}</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">⏰ ${c.startTime} - ${c.endTime} | 📍 ${c.room || 'Virtual'}</div>
                                </div>
                                <button class="btn btn-danger btn-small" onclick="deleteClass('${c.id}')">🗑️</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    });

    html += '</div>';
    content.innerHTML = html;
}

function renderExams(content) {
    const sortedExams = exams.sort((a, b) => new Date(a.date) - new Date(b.date));

    content.innerHTML = `
         <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <h3>📝 Exámenes y Entregas</h3>
            <button class="btn btn-primary btn-small" onclick="promptNewExam()">+ Nuevo Examen</button>
        </div>
        <div style="display: grid; gap: 15px;">
            ${sortedExams.length === 0 ? '<p>No hay exámenes programados.</p>' : sortedExams.map(e => `
                <div class="task-card" style="border-left: 4px solid var(--warning);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: bold; font-size: 18px;">${e.subject}</div>
                            <div style="font-size: 14px; margin: 5px 0;">${e.topic || 'Examen'}</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">📅 ${e.date} | ⏰ ${e.time || '--:--'}</div>
                        </div>
                        <button class="btn btn-danger btn-small" onclick="deleteExam('${e.id}')">🗑️</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}



async function updateSocialStatus(id, newStatus) {
    if (currentUser) {
        const { error } = await window.supabaseClient
            .from('social')
            .update({ status: newStatus })
            .eq('id', id);
    } else {
        const post = socialContent.find(s => s.id === id);
        if (post) post.status = newStatus;
    }
}

// Lógica de Hábitos - Updated
function promptNewHabit() {
    openInputModal('Nuevo Hábito', [
        { label: '¿Qué hábito quieres formar?', name: 'title', placeholder: 'Ej. Leer 20 mins' }
    ], (data) => {
        if (data.title) {
            if (currentUser) {
                window.supabaseClient
                    .from('habits')
                    .insert([{ title: data.title, completed_dates: [], created_at: new Date().toISOString(), user_id: currentUser.id }])
                    .then(({ error }) => {
                        if (error) console.error(error);
                        else showToast('✅ Hábito creado');
                    });
            } else {
                habits.push({ id: Date.now().toString(), title: data.title, completedDates: [] });
                saveData();
                render();
                showToast('✅ Hábito creado (Local)');
            }
        }
    });
}

async function toggleHabit(id) {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const todayStr = formatDate(new Date());
    let dates = habit.completed_dates || []; // Usar snake_case para DB, pero mi app usa camelCase? 
    // Supabase devuelve snake_case por defecto si no se mapea. 
    // En syncData no hice mapeo, asi que `habits` tendrá snake_case `completed_dates`.
    // Ajustemos: `habit.completed_dates || habit.completedDates` por si acaso.

    // Mejor estandarizar a snake_case en el local array si Supabase es la fuente.
    // Pero el renderHabits usa `completedDates` (camel).
    // Voy a forzar camelCase en el frontend para consistencia.
    // O mejor: guardar snake_case en DB y usarlo.

    if (dates.includes(todayStr)) return;

    dates.push(todayStr);

    if (currentUser) {
        const { error } = await window.supabaseClient
            .from('habits')
            .update({ completed_dates: dates })
            .eq('id', id);

        if (error) console.error(error);
        else showToast('🔥 Hábito completado hoy');
    }
}

// Lógica de Clases - Updated
function promptNewClass() {
    openInputModal('Añadir Clase', [
        { label: 'Materia', name: 'subject', placeholder: 'Ej. Matemáticas' },
        {
            label: 'Día', name: 'day', type: 'select', options: [
                { value: 'Lunes', label: 'Lunes' },
                { value: 'Martes', label: 'Martes' },
                { value: 'Miércoles', label: 'Miércoles' },
                { value: 'Jueves', label: 'Jueves' },
                { value: 'Viernes', label: 'Viernes' },
                { value: 'Sábado', label: 'Sábado' }
            ]
        },
        { label: 'Hora Inicio', name: 'startTime', type: 'time' },
        { label: 'Hora Fin', name: 'endTime', type: 'time' },
        { label: 'Aula / Link', name: 'room', placeholder: 'Ej. A-102' }
    ], (data) => {
        if (data.subject && data.startTime) {
            if (currentUser) {
                window.supabaseClient
                    .from('classes')
                    .insert([{
                        subject: data.subject,
                        day: data.day,
                        start_time: data.startTime,
                        end_time: data.endTime,
                        room: data.room,
                        created_at: new Date().toISOString(),
                        user_id: currentUser.id
                    }])
                    .then(({ error }) => { if (error) console.error(error); });
            } else {
                classes.push({
                    id: Date.now().toString(),
                    subject: data.subject, day: data.day, startTime: data.startTime, endTime: data.endTime, room: data.room
                });
                saveData();
                render();
            }
        }
    });
}

async function deleteClass(id) {
    if (confirm('¿Eliminar clase?')) {
        if (currentUser) {
            await window.supabaseClient.from('classes').delete().eq('id', id);
        }
    }
}

// Lógica de Exámenes
function promptNewExam() {
    const subject = prompt('Materia:');
    const topic = prompt('Tema/Entregable:');
    const date = prompt('Fecha (YYYY-MM-DD):');
    const time = prompt('Hora:');

    if (subject && date) {
        if (currentUser) {
            window.supabaseClient
                .from('exams')
                .insert([{
                    subject, topic, date, time,
                    created_at: new Date().toISOString(), user_id: currentUser.id
                }])
                .then(({ error }) => { if (error) console.error(error); });
        }
    }
}

async function deleteExam(id) {
    if (confirm('¿Eliminar examen?')) {
        if (currentUser) {
            await window.supabaseClient.from('exams').delete().eq('id', id);
        }
    }
}

function calculateStreak(dates) {
    if (!dates || dates.length === 0) return 0;
    // Logica simple de racha: idealmente calcular días consecutivos
    return dates.length;
}

function renderHabits(content) {
    const todayStr = formatDate(new Date());

    content.innerHTML = `
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <h3>💪 Mis Hábitos</h3>
            <button class="btn btn-primary btn-small" onclick="promptNewHabit()">+ Nuevo Hábito</button>
        </div>
        <div class="grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;">
            ${habits.length === 0 ? '<p>No hay hábitos aún.</p>' : habits.map(h => {
        const dates = h.completed_dates || h.completedDates || [];
        const completedToday = dates.includes(todayStr);
        return `
                <div class="task-card" style="border-left: 4px solid var(--success);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <div style="font-weight: bold; font-size: 18px;">${h.title}</div>
                            <div style="font-size: 13px; color: var(--text-secondary); margin-top: 5px;">🔥 Racha: ${calculateStreak(dates)} días</div>
                        </div>
                        <button class="btn btn-small ${completedToday ? 'btn-success' : 'btn-secondary'}" onclick="toggleHabit('${h.id}')" ${completedToday ? 'disabled' : ''}>
                            ${completedToday ? '✅ Completado' : 'Marcar Hoy'}
                        </button>
                    </div>
                </div>`;
    }).join('')}
        </div>
    `;
}

function renderSchedule(content) {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    let html = `
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <h3>📚 Horario de Clases</h3>
            <button class="btn btn-primary btn-small" onclick="promptNewClass()">+ Añadir Clase</button>
        </div>
        <div style="display: grid; gap: 20px;">
    `;

    days.forEach(day => {
        const dayClasses = classes.filter(c => c.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
        if (dayClasses.length > 0) {
            html += `
                <div style="background: var(--bg-tertiary); padding: 15px; border-radius: 12px;">
                    <h4 style="margin-bottom: 10px; color: var(--primary);">${day}</h4>
                    <div style="display: grid; gap: 10px;">
                        ${dayClasses.map(c => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--bg-primary); border-radius: 8px;">
                                <div>
                                    <div style="font-weight: bold;">${c.subject}</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">⏰ ${c.startTime} - ${c.endTime} | 📍 ${c.room || 'Virtual'}</div>
                                </div>
                                <button class="btn btn-danger btn-small" onclick="deleteClass('${c.id}')">🗑️</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    });

    html += '</div>';
    content.innerHTML = html;
}

function renderExams(content) {
    const sortedExams = exams.sort((a, b) => new Date(a.date) - new Date(b.date));

    content.innerHTML = `
         <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
            <h3>📝 Exámenes y Entregas</h3>
            <button class="btn btn-primary btn-small" onclick="promptNewExam()">+ Nuevo Examen</button>
        </div>
        <div style="display: grid; gap: 15px;">
            ${sortedExams.length === 0 ? '<p>No hay exámenes programados.</p>' : sortedExams.map(e => `
                <div class="task-card" style="border-left: 4px solid var(--warning);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: bold; font-size: 18px;">${e.subject}</div>
                            <div style="font-size: 14px; margin: 5px 0;">${e.topic || 'Examen'}</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">📅 ${e.date} | ⏰ ${e.time || '--:--'}</div>
                        </div>
                        <button class="btn btn-danger btn-small" onclick="deleteExam('${e.id}')">🗑️</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}







// Lógica de Hábitos
function promptNewHabit() {
    openInputModal('Nuevo Hábito', [
        { label: '¿Qué hábito quieres formar?', name: 'title', placeholder: 'Ej. Leer 20 mins' }
    ], (data) => {
        if (data.title) {
            if (currentUser) {
                window.supabaseClient
                    .from('habits')
                    .insert([{ title: data.title, completed_dates: [], created_at: new Date().toISOString(), user_id: currentUser.id }])
                    .then(({ error }) => {
                        if (error) console.error(error);
                        else showToast('✅ Hábito creado');
                    });
            } else {
                habits.push({ id: Date.now().toString(), title: data.title, completedDates: [] });
                saveData();
                render();
                showToast('✅ Hábito creado (Local)');
            }
        }
    });
}

async function toggleHabit(id) {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const todayStr = formatDate(new Date());
    let dates = habit.completed_dates || habit.completedDates || [];

    if (dates.includes(todayStr)) return;

    dates.push(todayStr);

    if (currentUser) {
        const { error } = await window.supabaseClient
            .from('habits')
            .update({ completed_dates: dates })
            .eq('id', id);

        if (error) console.error(error);
        else showToast('🔥 Hábito completado hoy');
    } else {
        habit.completedDates = dates;
        if (!habit.completed_dates) habit.completed_dates = dates;
        saveData();
        render();
        showToast('🔥 Hábito completado hoy');
    }
}

function calculateStreak(dates) {
    if (!dates || dates.length === 0) return 0;
    return dates.length;
}

// Lógica de Clases - Updated
function promptNewClass() {
    openInputModal('Añadir Clase', [
        { label: 'Materia', name: 'subject', placeholder: 'Ej. Matemáticas' },
        {
            label: 'Día', name: 'day', type: 'select', options: [
                { value: 'Lunes', label: 'Lunes' },
                { value: 'Martes', label: 'Martes' },
                { value: 'Miércoles', label: 'Miércoles' },
                { value: 'Jueves', label: 'Jueves' },
                { value: 'Viernes', label: 'Viernes' },
                { value: 'Sábado', label: 'Sábado' }
            ]
        },
        { label: 'Hora Inicio', name: 'startTime', type: 'time' },
        { label: 'Hora Fin', name: 'endTime', type: 'time' },
        { label: 'Aula / Link', name: 'room', placeholder: 'Ej. A-201 o Zoom' }
    ], (data) => {
        if (data.subject && data.day) {
            if (currentUser) {
                window.supabaseClient
                    .from('classes')
                    .insert([{
                        subject: data.subject,
                        day: data.day,
                        startTime: data.startTime,
                        endTime: data.endTime,
                        room: data.room,
                        created_at: new Date().toISOString(),
                        user_id: currentUser.id
                    }])
                    .then(({ error }) => { if (error) console.error(error); });
            } else {
                classes.push({
                    id: Date.now().toString(),
                    subject: data.subject, day: data.day, startTime: data.startTime, endTime: data.endTime, room: data.room
                });
                saveData();
                render();
            }
        }
    });
}

function deleteClass(id) {
    openConfirmModal('¿Eliminar Clase?', 'Se borrará permanentemente de tu horario.', async () => {
        if (currentUser) {
            await window.supabaseClient.from('classes').delete().eq('id', id);
        } else {
            classes = classes.filter(c => c.id !== id);
            saveData();
            render();
        }
    });
}

// Lógica de Exámenes - Updated
function promptNewExam() {
    openInputModal('Nuevo Examen / Entrega', [
        { label: 'Materia', name: 'subject', placeholder: 'Ej. Historia' },
        { label: 'Descripción', name: 'topic', placeholder: 'Ej. Examen Parcial' },
        { label: 'Fecha', name: 'date', type: 'date' },
        { label: 'Hora', name: 'time', type: 'time' }
    ], (data) => {
        if (data.subject && data.date) {
            if (currentUser) {
                window.supabaseClient
                    .from('exams')
                    .insert([{
                        subject: data.subject,
                        topic: data.topic,
                        date: data.date,
                        time: data.time,
                        created_at: new Date().toISOString(),
                        user_id: currentUser.id
                    }])
                    .then(({ error }) => { if (error) console.error(error); });
            } else {
                exams.push({
                    id: Date.now().toString(),
                    subject: data.subject, topic: data.topic, date: data.date, time: data.time
                });
                saveData();
                render();
            }
        }
    });
}

function deleteExam(id) {
    openConfirmModal('¿Eliminar Examen?', 'Esta entrega se borrará de tu lista.', async () => {
        if (currentUser) {
            await window.supabaseClient.from('exams').delete().eq('id', id);
        } else {
            exams = exams.filter(e => e.id !== id);
            saveData();
            render();
        }
    });
}



function updateInboxCount() {
    const count = tasks.filter(t => !t.completed).length;
    document.getElementById('inboxCount').textContent = count;
}

function renderInbox(content) {
    const inboxTasks = tasks.filter(t => !t.completed);

    if (inboxTasks.length === 0) {
        content.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📥</div>
                <h2>Tu inbox está vacío</h2>
                <p>¡Perfecto! Estás al día con tus tareas</p>
            </div>
        `;
    } else {
        content.innerHTML = inboxTasks.map(task => renderTaskCard(task)).join('');
    }
}

function renderToday(content) {
    const todayStr = formatDate(TODAY);
    const todayTasks = tasks.filter(t => t.date === todayStr);

    content.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h3 style="font-size: 20px; margin-bottom: 15px;">📅 ${formatDateFull(TODAY)}</h3>
        </div>
        ${todayTasks.length === 0 ?
            '<div class="empty-state"><div class="empty-icon">✨</div><p>No hay tareas para hoy</p></div>' :
            todayTasks.map(task => renderTaskCard(task)).join('')
        }
    `;
}

function renderSettings(content) {
    content.innerHTML = `
        <div style="display: grid; gap: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; background: var(--bg-tertiary); border-radius: 16px; border: 1px solid var(--border);">
                <div>
                    <div style="font-weight: bold; margin-bottom: 5px;">🔔 Notificaciones</div>
                    <div style="font-size: 13px; color: var(--text-secondary);">
                        Estado: ${Notification.permission === 'granted' ? '✅ Activadas' :
            Notification.permission === 'denied' ? '❌ Bloqueadas' :
                '⚠️ Pendiente'}
                    </div>
                </div>
                <button class="btn btn-primary btn-small" onclick="requestNotificationPermission()">
                    Verificar
                </button>
            </div>
            
            <div style="padding: 25px; background: var(--bg-tertiary); border-radius: 16px; border: 1px solid var(--border);">
                <h3 style="margin-bottom: 15px;">ℹ️ Info del Sistema</h3>
                <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.8;">
                    • Checker: <strong style="color: var(--success);">Cada 5 segundos ⚡</strong><br>
                    • Notificaciones: <strong style="color: var(--success);">Persistentes</strong><br>
                    • Tareas: <strong>${tasks.length}</strong><br>
                    • Permisos: <strong>${Notification.permission}</strong>
                </p>
            </div>
        </div>
    `;
}

function renderStats(content) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const todayTasks = tasks.filter(t => t.date === formatDate(TODAY)).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    content.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Tareas</div>
                <div class="stat-value">${totalTasks}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Completadas</div>
                <div class="stat-value">${completedTasks}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Hoy</div>
                <div class="stat-value">${todayTasks}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Tasa Completado</div>
                <div class="stat-value">${completionRate}%</div>
            </div>
        </div>
    `;
}

function renderTaskCard(task) {
    return `
        <div class="task-card ${task.completed ? 'completed' : ''} priority-${task.priority || 'none'}">
            <div class="task-header">
                <div class="checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask('${task.id}')">
                    ${task.completed ? '✓' : ''}
                </div>
                <div style="flex: 1;">
                    <div class="task-title ${task.completed ? 'completed' : ''}">${task.title}</div>
                    ${task.description ? `<div style="font-size: 13px; color: var(--text-secondary); margin-top: 5px;">${task.description}</div>` : ''}
                </div>
            </div>
            <div class="task-meta">
                ${task.time ? `<span class="task-tag">🕐 ${task.time}</span>` : ''}
                ${task.date ? `<span class="task-tag">📅 ${task.date}</span>` : ''}
                ${task.reminders && task.reminders.length > 0 ? `<span class="task-tag">🔔 ${task.reminders.length} recordatorios</span>` : ''}
            </div>
            <div style="display: flex; gap: 8px; margin-top: 15px;">
                <button class="btn btn-small btn-secondary" onclick="editTask('${task.id}')">✏️</button>
                <button class="btn btn-small btn-danger" onclick="deleteTask('${task.id}')">🗑️</button>
            </div>
        </div>
    `;
}

// ===================================
// GESTIÓN DE TAREAS
// ===================================

function openTaskModal() {
    editingTaskId = null;
    reminders = [];
    document.getElementById('modalTitle').textContent = 'Nueva Tarea';
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDesc').value = '';
    setMinDate();
    document.getElementById('taskTime').value = '';
    document.getElementById('remindersContainer').innerHTML = '';

    selectedPriority = 'none';
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.priority === 'none');
    });

    updateReminderOptions();
    document.getElementById('taskModal').classList.add('show');
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('show'));
}

function selectPriority(priority) {
    selectedPriority = priority;
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.priority === priority);
    });
}

async function saveTask(event) {
    event.preventDefault();

    const task = {
        // Si es nuevo en Supabase, el ID lo genera la DB (uuid), pero para local usamos Date.now
        // Si estamos editando, usamos el ID existente
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDesc').value,
        date: document.getElementById('taskDate').value,
        time: document.getElementById('taskTime').value,
        priority: selectedPriority,
        reminders: reminders,
        completed: false
    };

    if (currentUser) {
        // ⚡ SUPABASE SAVE
        const { user_id } = currentUser; // Auth ya provee el ID

        // Preparar objeto para Supabase (Snake Case si es necesario, pero definimos tablas con mismos nombres mayormente)
        const payload = {
            user_id: currentUser.id,
            title: task.title,
            description: task.description,
            date: task.date,
            time: task.time,
            priority: task.priority,
            reminders: task.reminders,
            completed: false
        };

        if (editingTaskId) {
            // UPDATE
            const { error } = await window.supabaseClient
                .from('tasks')
                .update({
                    title: task.title,
                    description: task.description,
                    date: task.date,
                    time: task.time,
                    priority: task.priority,
                    reminders: task.reminders
                })
                .eq('id', editingTaskId);

            if (error) {
                console.error(error);
                showToast('❌ Error al actualizar');
            } else {
                showToast('✅ Tarea actualizada (Nube)');
            }
        } else {
            // INSERT
            const { data, error } = await window.supabaseClient
                .from('tasks')
                .insert([payload])
                .select();

            if (error) {
                console.error(error);
                showToast('❌ Error al crear tarea');
            } else {
                showToast('✅ Tarea creada (Nube)');
                // Notificación local inmediata
                if (task.date && task.time) {
                    showPersistentNotification('📝 Nueva tarea', `${task.title}`);
                }
            }
        }
        closeModal();
    } else {
        // 💾 LOCAL STORAGE SAVE (Igual que antes)
        const localTask = { ...task, id: editingTaskId || Date.now().toString() };

        if (editingTaskId) {
            const index = tasks.findIndex(t => t.id === editingTaskId);
            const oldTask = tasks[index];
            localTask.completed = oldTask.completed;
            tasks[index] = localTask;
            showToast('✅ Tarea actualizada');
        } else {
            tasks.push(localTask);
            showToast('✅ Tarea creada');
            if (localTask.date && localTask.time) {
                showPersistentNotification('📝 Nueva tarea', `${localTask.title}`);
            }
        }

        saveData();
        closeModal();
        render();
    }
}

async function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        const newStatus = !task.completed;

        if (currentUser) {
            // Optimistic UI Update (opcional, pero render se encarga via subscription)
            // await...
            const { error } = await window.supabaseClient
                .from('tasks')
                .update({ completed: newStatus })
                .eq('id', id);

            if (error) console.error(error);
            else {
                if (newStatus) showToast('✅ Tarea completada!');
            }
        } else {
            task.completed = newStatus;
            saveData();
            render();
            if (newStatus) showToast('✅ Tarea completada!');
        }
    }
}

function deleteTask(id) {
    openConfirmModal('¿Eliminar Tarea?', '¿Seguro que quieres borrarla?', async () => {
        if (currentUser) {
            const { error } = await window.supabaseClient
                .from('tasks')
                .delete()
                .eq('id', id);

            if (error) {
                console.error(error);
                showToast('❌ Error al eliminar');
            } else {
                showToast('🗑️ Tarea eliminada');
            }
        } else {
            tasks = tasks.filter(t => t.id !== id);
            saveData();
            render();
            showToast('🗑️ Tarea eliminada');
        }
    });
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editingTaskId = id;
    document.getElementById('modalTitle').textContent = 'Editar Tarea';
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDesc').value = task.description || '';
    document.getElementById('taskDate').value = task.date || '';
    document.getElementById('taskTime').value = task.time || '';

    selectedPriority = task.priority || 'none';
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.priority === selectedPriority);
    });

    reminders = task.reminders || [];
    updateReminderOptions();
    renderReminders();

    document.getElementById('taskModal').classList.add('show');
}

// ===================================
// UTILIDADES
// ===================================

function goToToday() {
    currentDate = new Date();
    changeView('today');
}

function formatDate(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function formatDateFull(date) {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function showToast(message) {
    // Eliminar toast anterior si existe para evitar spam visual
    const oldToast = document.querySelector('.toast-premium');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-premium';
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 20px;">ℹ️</span>
            <span style="font-weight: 500;">${message}</span>
        </div>
        <div style="height: 3px; background: rgba(255,255,255,0.3); width: 100%; position: absolute; bottom: 0; left: 0;">
            <div style="height: 100%; background: white; width: 0%; animation: progress 3s linear forwards;"></div>
        </div>
    `;

    // Inline styles for Premium Look
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: rgba(30, 30, 30, 0.95);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        border: 1px solid rgba(255,255,255,0.1);
        backdrop-filter: blur(10px);
        z-index: 9999;
        min-width: 300px;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        overflow: hidden;
        text-align: center;
    `;

    // Animation Keyframes injection
    if (!document.getElementById('toast-style')) {
        const style = document.createElement('style');
        style.id = 'toast-style';
        style.textContent = `
            @keyframes progress { to { width: 100%; } }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', settings.theme);
}

// Atajos de teclado
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        openTaskModal();
    }
});
