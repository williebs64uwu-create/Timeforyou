// ===================================
// TICKTICK ULTRA PRO - FIXED VERSION
// Sistema de notificaciones PERFECTO
// ===================================

let tasks = [];
let classes = [];
let habits = [];
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
let pomodoroTime = 1500;
let pomodoroInterval = null;
let pomodoroRunning = false;

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

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
            badge: '🔔',
            requireInteraction: true, // PERSISTENTE
            silent: false,
            tag: `ticktick-${taskId}-${Date.now()}`,
            vibrate: [200, 100, 200]
        });
        
        notification.onclick = function() {
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

window.onload = function() {
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
    
    console.log('✅ App inicializada correctamente');
};

// ===================================
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
    
    switch(currentView) {
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
        default:
            renderInbox(content);
    }
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

function saveTask(event) {
    event.preventDefault();
    
    const task = {
        id: editingTaskId || Date.now().toString(),
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDesc').value,
        date: document.getElementById('taskDate').value,
        time: document.getElementById('taskTime').value,
        priority: selectedPriority,
        reminders: reminders,
        completed: false
    };
    
    if (editingTaskId) {
        const index = tasks.findIndex(t => t.id === editingTaskId);
        const oldTask = tasks[index];
        task.completed = oldTask.completed;
        tasks[index] = task;
        showToast('✅ Tarea actualizada');
    } else {
        tasks.push(task);
        showToast('✅ Tarea creada');
        
        if (task.date && task.time) {
            showPersistentNotification(
                '📝 Nueva tarea creada',
                `${task.title} - ${task.date} ${task.time}`,
                task.id
            );
        }
    }
    
    saveData();
    closeModal();
    render();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        if (task.completed) {
            showToast('✅ Tarea completada!');
        }
        saveData();
        render();
    }
}

function deleteTask(id) {
    if (confirm('¿Eliminar esta tarea?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveData();
        render();
        showToast('🗑️ Tarea eliminada');
    }
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
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', settings.theme);
}

// Atajos de teclado
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        openTaskModal();
    }
});
