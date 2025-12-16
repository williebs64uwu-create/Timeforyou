// CONFIG: Recoger claves de entorno (En producción esto debe ser gestionado con cuidado)
// Por ahora asumimos las mismas del app.js o pedimos al usuario que las configure si es un archivo separado.
// Para este demo, usaremos las globales si están definidas, o las pediremos.

const SUPABASE_URL = 'https://csqvjwvdjzjuvwddewoy.supabase.co'; // REEMPLAZAR
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzcXZqd3ZkanpqdXZ3ZGRld295Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTA4MzIsImV4cCI6MjA4MDc4NjgzMn0.p5g8ESzDJ-aAlq3nSoRX8qS2nBsM9xrK3Et3wWEXmlw'; // REEMPLAZAR

// Inicializar cliente (si no existe window.supabaseClient)
// Nota: En un entorno real de producción, estas claves no deberían estar hardcodeadas así si el repo es público.
// Pero para este prototipo local funcionará.
if (!window.supabaseClient && typeof supabase !== 'undefined') {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Supabase Client Initialized in Public View');
}

// Simulación de Cliente Supabase (Para evitar errores si no están las claves en este archivo nuevo)
let items = []; // Mock booking items

async function init() {
    // 1. Obtener params
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');
    const slug = params.get('u');

    if (!userId && !slug) {
        showError('Perfil no encontrado (Falta ID o Slug)');
        return;
    }

    // 2. Fetch Profile (Real data with better error handling)
    try {
        console.log('🔍 Fetching profile with:', { userId, slug });

        let query = window.supabaseClient.from('profiles').select('*');
        if (slug) query = query.eq('slug', slug);
        else query = query.eq('id', userId);

        const { data, error } = await query.single();

        if (error) {
            console.error('❌ Supabase error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);

            // If it's a permission error (RLS), show specific message
            if (error.code === 'PGRST116' || error.message.includes('RLS')) {
                showError('⚠️ Perfil no accesible. Verifica las políticas RLS en Supabase.');
            } else if (error.code === '406') {
                showError('⚠️ Perfil no encontrado o no público');
            } else {
                showError(`Error al cargar perfil: ${error.message}`);
            }
            return;
        }

        if (!data) {
            console.warn('⚠️ No profile found for:', { userId, slug });
            showError('Perfil no encontrado');
            return;
        }

        console.log('✅ Profile loaded:', data);

        // Set Real Data
        currentProfileId = data.id; // Store for booking
        renderProfile({
            name: data.full_name || data.email || 'Usuario',
            role: data.role || 'Creator',
            bio: data.bio || 'Sin biografía',
            avatar_url: data.avatar_url,
            links: [], // TODO: Add links column to profiles
            socials: [] // TODO: Add socials column
        });

    } catch (err) {
        console.error('💥 Unexpected error:', err);
        showError('Error inesperado al cargar el perfil');
    }
}

function renderProfile(profile) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('profileContent').style.display = 'flex';

    document.title = `${profile.name} | Perfil Público`;

    // Header
    document.getElementById('pName').textContent = profile.name || 'Usuario';
    document.getElementById('pBio').textContent = profile.bio || 'Sin biografía';
    if (profile.role) document.getElementById('pRole').textContent = profile.role;
    else document.getElementById('pRole').style.display = 'none';

    if (profile.avatar_url) {
        document.getElementById('pAvatar').src = profile.avatar_url;
    } else {
        // Premium Dark/Gold Avatar
        document.getElementById('pAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=1a1a1a&color=D4AF37&rounded=true&bold=true&length=2`;
    }

    // Links
    const linksContainer = document.getElementById('linksContainer');
    linksContainer.innerHTML = '';
    if (profile.links) {
        profile.links.forEach(link => {
            const a = document.createElement('a');
            a.className = 'action-btn public-card';
            a.href = link.url;
            a.target = '_blank';
            a.innerHTML = `<i class="${link.icon || 'ri-link'}"></i> ${link.title}`;
            linksContainer.appendChild(a);
        });
    }

    // Socials
    const socialGrid = document.getElementById('socialGrid');
    socialGrid.innerHTML = '';
    if (profile.socials) {
        profile.socials.forEach(social => {
            const a = document.createElement('a');
            a.className = 'social-icon';
            a.href = social.url;
            a.target = '_blank';
            // Map icons
            let iconClass = 'ri-earth-line';
            if (social.platform === 'instagram') iconClass = 'ri-instagram-line';
            if (social.platform === 'twitter') iconClass = 'ri-twitter-x-line';
            if (social.platform === 'youtube') iconClass = 'ri-youtube-fill';
            if (social.platform === 'linkedin') iconClass = 'ri-linkedin-fill';

            a.innerHTML = `<i class="${iconClass}"></i>`;
            socialGrid.appendChild(a);
        });
    }
}

// Modal Logic
const modal = document.getElementById('bookingModal');

window.openBookingModal = function () {
    modal.classList.add('show');
}

window.closeBookingModal = function () {
    modal.classList.remove('show');
}

// Duration Selection
// Duration Selection
window.selectDuration = function (btn, value) {
    document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Handle custom duration
    if (value === 'custom') {
        // Create a temporary input if it doesn't exist
        let customInput = document.getElementById('customDurationInput');
        if (!customInput) {
            const container = btn.parentElement;
            customInput = document.createElement('input');
            customInput.type = 'number';
            customInput.id = 'customDurationInput';
            customInput.placeholder = 'Min';
            customInput.style.width = '60px';
            customInput.style.padding = '8px';
            customInput.style.borderRadius = '8px';
            customInput.style.border = '1px solid var(--primary)';
            customInput.style.background = 'var(--bg-primary)';
            customInput.style.color = 'var(--text-primary)';
            customInput.style.marginLeft = '10px';

            customInput.addEventListener('change', (e) => {
                const val = parseInt(e.target.value);
                if (val > 0) {
                    document.getElementById('selectedDuration').value = val;
                    btn.innerHTML = `<i class="ri-time-line"></i> ${val}`;
                }
            });
            container.appendChild(customInput);
            customInput.focus();
        } else {
            customInput.style.display = 'inline-block';
            customInput.focus();
        }
    } else {
        // Hide custom input if exists
        const customInput = document.getElementById('customDurationInput');
        if (customInput) customInput.style.display = 'none';

        document.getElementById('selectedDuration').value = value;
        // Reset custom button icon
        const customBtn = document.querySelector('.duration-btn[data-duration="custom"]');
        if (customBtn) customBtn.innerHTML = '<i class="ri-settings-3-line"></i>';
    }
}

// TODO: Connect with Supabase 'bookings' table insert
// REAL IMPLEMENTATION
// HANDLE BOOKING FORM
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = bookingForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Enviando...';
        btn.disabled = true;

        const formData = new FormData(e.target);
        const duration = parseInt(formData.get('duration') || '30');
        const bookingData = {
            host_id: new URLSearchParams(window.location.search).get('id') || currentProfileId,
            guest_name: formData.get('guest_name'),
            guest_email: formData.get('guest_email'),
            start_datetime: `${formData.get('date')}T${formData.get('time')}`,
            end_datetime: calculateEndTime(formData.get('date'), formData.get('time'), duration),
            notes: formData.get('notes'),
            status: 'pending'
        };

        if (!bookingData.host_id) {
            showErrorToast('Error: No se encontró el ID del anfitrión');
            btn.textContent = originalText;
            btn.disabled = false;
            return;
        }

        try {
            console.log('🚀 Attempting to insert booking:', bookingData); // DEBUG
            const { error } = await window.supabaseClient
                .from('bookings')
                .insert([bookingData]);

            if (error) throw error;

            // Success styling
            btn.innerHTML = '<i class="ri-check-line"></i> Solicitud Enviada';
            btn.className = 'action-btn success'; // Use CSS class for success state

            // Show Success UI
            const modalBody = document.querySelector('#bookingModal .modal-content');
            const originalContent = modalBody.innerHTML;

            modalBody.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 50px; color: var(--success); margin-bottom: 20px;">
                        <i class="ri-checkbox-circle-fill"></i>
                    </div>
                    <h3 style="margin-bottom: 10px;">¡Solicitud Enviada!</h3>
                    <p style="color: var(--text-secondary);">Te hemos enviado un correo de confirmación.</p>
                    <button onclick="closeBookingModal(); setTimeout(() => location.reload(), 500)" class="action-btn primary" style="margin-top: 20px;">
                        Entendido
                    </button>
                </div>
            `;

        } catch (err) {
            console.error(err);
            btn.textContent = originalText;
            btn.disabled = false;
            showErrorToast('❌ Error al agendar. Verifica tu conexión.');
        }
    });
}

// Simple Toast Helper for Public View
function showErrorToast(msg) {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'var(--danger)';
    toast.style.color = 'white';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '30px';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
    toast.style.zIndex = '10000';
    toast.style.animation = 'fadeInUp 0.3s ease';
    toast.innerHTML = `<i class="ri-error-warning-fill"></i> ${msg}`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}


function calculateEndTime(date, time, durationMinutes) {
    const d = new Date(`${date}T${time}`);
    d.setMinutes(d.getMinutes() + durationMinutes);
    return d.toISOString();
}

// Global variable to store profile ID from fetching
let currentProfileId = null;

function showError(msg) {
    const loadingState = document.getElementById('loadingState');
    loadingState.style.display = 'flex';
    loadingState.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; max-width: 500px;">
            <div style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;">
                <i class="ri-error-warning-line"></i>
            </div>
            <h3 style="color: var(--danger); margin-bottom: 10px;">Error</h3>
            <p style="color: var(--text-secondary); line-height: 1.6;">${msg}</p>
            <button onclick="location.reload()" class="btn btn-secondary" style="margin-top: 20px;">
                Reintentar
            </button>
        </div>
    `;
    document.getElementById('profileContent').style.display = 'none';
}


// ===================================
// SMART SLOTS LOGIC
// ===================================

// ===================================
// CALENDLY-STYLE LOGIC
// ===================================

let visibleDate = new Date(); // Controls the month currently being viewed

async function initCalendar() {
    // DOM Elements
    const calendarTitle = document.getElementById('calendarTitle');
    const calendarGrid = document.getElementById('calendarGrid');
    const dateInput = document.getElementById('selectedDateInput');
    const slotsContainer = document.getElementById('slotsContainer');
    const timeInput = document.getElementById('selectedTimeInput');

    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');

    // Navigation Listeners
    prevBtn.addEventListener('click', () => {
        visibleDate.setMonth(visibleDate.getMonth() - 1);
        renderCalendar();
    });
    nextBtn.addEventListener('click', () => {
        visibleDate.setMonth(visibleDate.getMonth() + 1);
        renderCalendar();
    });

    // 1. RENDER CALENDAR
    const renderCalendar = () => {
        calendarGrid.innerHTML = '';
        const year = visibleDate.getFullYear();
        const month = visibleDate.getMonth();

        // Update Title
        const monthName = visibleDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        calendarTitle.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

        // Day Headers
        const days = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
        days.forEach(d => {
            const h = document.createElement('div');
            h.className = 'calendar-day-header';
            h.textContent = d;
            calendarGrid.appendChild(h);
        });

        // Days Logic
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Empty slots before first day
        for (let i = 0; i < firstDayOfMonth; i++) {
            const empty = document.createElement('div');
            empty.className = 'calendar-day empty';
            calendarGrid.appendChild(empty);
        }

        // Days
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = i;

            const currentDayDate = new Date(year, month, i);

            // Disable past dates
            if (currentDayDate < today) {
                dayEl.classList.add('disabled');
            } else {
                dayEl.onclick = () => selectDate(currentDayDate, dayEl);
            }

            // Highlight selected
            if (dateInput.value === currentDayDate.toISOString().split('T')[0]) {
                dayEl.classList.add('selected');
            }

            calendarGrid.appendChild(dayEl);
        }
    };

    // 2. SELECT DATE
    const selectDate = async (dateObj, el) => {
        // UI
        document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
        el.classList.add('selected');

        // Logic - Construct YYYY-MM-DD manually to avoid UTC shifts
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        console.log('📅 Date selected:', dateStr);

        dateInput.value = dateStr;
        timeInput.value = ''; // Reset time

        // Reset Slots UI
        slotsContainer.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px; color:var(--text-secondary);">Verificando disponibilidad... <i class="ri-loader-4-line ri-spin"></i></div>';

        // Load Slots
        try {
            const blocked = await checkAvailability(dateStr);
            console.log('🚫 Blocked slots for', dateStr, ':', blocked);
            renderSlots(blocked);
        } catch (err) {
            console.error(err);
            slotsContainer.innerHTML = '<div style="color:var(--danger)">Error cargando horarios</div>';
        }
    };

    // 3. RENDER SLOTS
    const renderSlots = (blockedSlots = []) => {
        const slots = [];
        // Generate slots 9am to 10pm (22:00)
        for (let i = 9; i <= 22; i++) {
            slots.push(`${i.toString().padStart(2, '0')}:00`);
            if (i < 22) slots.push(`${i.toString().padStart(2, '0')}:30`);
        }

        slotsContainer.innerHTML = '';

        if (blockedSlots.length >= slots.length) {
            slotsContainer.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:10px; color:var(--text-secondary);">No hay horarios disponibles este día.</div>';
            return;
        }

        slots.forEach(time => {
            const div = document.createElement('div');
            div.className = 'time-slot';
            div.textContent = time;

            if (blockedSlots.includes(time)) {
                div.classList.add('disabled');
                div.title = 'No disponible';
                div.style.opacity = '0.5';
                div.style.cursor = 'not-allowed';
                div.style.background = 'var(--bg-tertiary)';
            } else {
                div.onclick = () => {
                    document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
                    div.classList.add('selected');
                    timeInput.value = time;
                };
            }
            slotsContainer.appendChild(div);
        });
    };

    // Initial Render
    renderCalendar();
}

// Check Availability (Supabase)
async function checkAvailability(dateStr) {
    if (!currentProfileId) return [];

    console.log('🔍 Checking availability for:', dateStr, 'Host:', currentProfileId);

    // Fetch Bookings for this Host on this Date
    // Status: confirmed OR pending (blocked to avoid double booking)
    const { data, error } = await window.supabaseClient
        .from('bookings')
        .select('start_datetime, end_datetime, status') // Fetch status for debug
        .eq('host_id', currentProfileId)
        .or('status.eq.confirmed,status.eq.pending') // Filter accepted statuses
        .gte('start_datetime', `${dateStr}T00:00:00`)
        .lte('start_datetime', `${dateStr}T23:59:59`);

    if (error) {
        console.error('❌ Error fetching availability:', error);
        throw error;
    }

    console.log('✅ Bookings found:', data);

    // Extract all blocked 30-min slots
    const blockedSlots = [];

    data.forEach(booking => {
        const start = new Date(booking.start_datetime);
        const end = new Date(booking.end_datetime);

        // Calculate duration in minutes
        let durationMinutes = 30;
        if (end > start) {
            const diffMs = end - start;
            durationMinutes = Math.round(diffMs / 60000);
        }

        const startTime = booking.start_datetime.split('T')[1].substring(0, 5); // "10:00"

        // Calculate number of 30-min slots to block
        const slotsCount = Math.ceil(durationMinutes / 30);

        let [hours, minutes] = startTime.split(':').map(Number);

        for (let i = 0; i < slotsCount; i++) {
            // Format current slot time
            const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            blockedSlots.push(timeStr);

            // Advance 30 mins
            minutes += 30;
            if (minutes >= 60) {
                minutes = 0;
                hours += 1;
            }
        }
    });

    return blockedSlots;
}

// Helper to calculate end time (Local Time - No UTC conversion)
function calculateEndTime(date, time, durationMinutes) {
    const start = new Date(`${date}T${time}`);
    const end = new Date(start.getTime() + durationMinutes * 60000);

    // Manually format to YYYY-MM-DDTHH:mm to preserve local timezone
    const year = end.getFullYear();
    const month = String(end.getMonth() + 1).padStart(2, '0');
    const day = String(end.getDate()).padStart(2, '0');
    const hours = String(end.getHours()).padStart(2, '0');
    const minutes = String(end.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
}

// Start
document.addEventListener('DOMContentLoaded', () => {
    init();
    initCalendar();
});
