// ===================================
// AI ASSISTANT (TimeBot) LOGIC
// ===================================

console.log('🤖 TimeBot AI loaded');

function toggleAssistant() {
    const chat = document.getElementById('aiAssistantChat');
    const trigger = document.getElementById('aiAssistantTrigger');

    if (!chat || !trigger) return;

    if (chat.style.display === 'none' || !chat.style.display || chat.style.display === '') {
        chat.style.display = 'flex';
        trigger.style.transform = 'scale(0)';

        // Focus input after transition
        setTimeout(() => {
            const input = document.getElementById('chatInput');
            if (input) input.focus();
        }, 100);
    } else {
        chat.style.display = 'none';
        trigger.style.transform = 'scale(1)';
    }
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    // Add User Message
    addMessage(text, 'user');
    input.value = '';

    // Simulate AI Processing
    const dotsId = addTypingIndicator();

    setTimeout(() => {
        removeTypingIndicator(dotsId);
        processCommand(text);
    }, 800);
}

function addMessage(text, sender) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const div = document.createElement('div');
    const isUser = sender === 'user';

    // Style directly to ensure it works without external CSS file
    div.style.alignSelf = isUser ? 'flex-end' : 'flex-start';
    div.style.background = isUser ? 'var(--primary)' : 'var(--bg-primary)';
    div.style.color = isUser ? '#1a1a1a' : 'var(--text-primary)';
    div.style.padding = '10px 15px';
    div.style.borderRadius = isUser ? '12px 12px 0 12px' : '12px 12px 12px 0';
    div.style.maxWidth = '80%';
    div.style.fontSize = '13px';
    div.style.fontWeight = isUser ? '600' : '400';
    div.style.border = isUser ? 'none' : '1px solid var(--border)';
    div.style.marginBottom = '10px';

    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function addTypingIndicator() {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const div = document.createElement('div');
    div.id = 'typing-' + Date.now();
    div.style.alignSelf = 'flex-start';
    div.style.background = 'var(--bg-primary)';
    div.style.border = '1px solid var(--border)';
    div.style.padding = '10px 15px';
    div.style.borderRadius = '12px 12px 12px 0';
    div.style.marginBottom = '10px';
    div.innerHTML = `<span style="animation: pulse 1s infinite">...</span>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div.id;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

// 🧠 BRAIN: Advanced NLP Command Processor
function processCommand(text) {
    if (!text) return;
    const lower = text.toLowerCase().trim();

    // 1. EXCEPCIONES: Comandos NO relacionados a tareas
    // Citas
    if (lower.includes('cita') || lower.includes('reserva') || (lower.includes('solicitud') && lower.includes('ver'))) {
        addMessage("Abriendo panel de solicitudes de citas.", 'bot');
        if (typeof changeView === 'function') changeView('requests');
        return;
    }
    // Exportar
    if (lower.includes('exportar') || lower.includes('foto') || (lower.includes('horario') && lower.includes('descargar'))) {
        addMessage("Generando imagen de tu horario...", 'bot');
        if (typeof exportSchedule === 'function') {
            exportSchedule();
        } else {
            addMessage("Función de exportar no disponible.", 'bot');
        }
        return;
    }
    // Saludos
    if (lower === 'hola' || lower === 'buenas' || lower === 'timebot') {
        addMessage("¡Hola! Dime qué tarea quieres agregar. Ejemplo: 'Mañana examen de matemáticas a las 10am'.", 'bot');
        return;
    }

    // 2. INTELLIGENT TASK PARSING (Default)
    // Asumimos que todo lo demás es una tarea/recordatorio.
    // Parsing avanzado de Fecha y Hora en Español.

    let cleanTitle = text;
    let detectedDate = '';
    let detectedTime = '';

    // A. DETECTAR HORA (Regex mejorado)
    // Formatos: "a las 10:30", "a las 10", "10pm", "10:30 am", "de la noche", "mediodía"

    // Normalizar frases de tiempo
    cleanTitle = cleanTitle.replace(/de la mañana/gi, 'am');
    cleanTitle = cleanTitle.replace(/de la tarde/gi, 'pm');
    cleanTitle = cleanTitle.replace(/de la noche/gi, 'pm');
    cleanTitle = cleanTitle.replace(/mediodía/gi, '12:00 pm');
    cleanTitle = cleanTitle.replace(/medianoche/gi, '12:00 am');

    // Regex hora
    const timeRegex = /(\d{1,2})(:(\d{2}))?\s?(am|pm|hrs|horas)?/i;
    // Buscar "a las X" o al final
    const timeMatch = cleanTitle.match(/(?:a las\s|a la\s)?(\d{1,2}(?::\d{2})?\s?(?:am|pm)?)/i);

    if (timeMatch) {
        // Extraer hora bruta
        let rawTime = timeMatch[1] || timeMatch[0];
        // Validar que parece hora
        if (rawTime.match(/\d/)) {
            // Intentar convertir a HH:mm 24h
            detectedTime = convertTo24Hour(rawTime);
            // Remover del título solo si se detectó
            if (detectedTime) {
                cleanTitle = cleanTitle.replace(timeMatch[0], ''); // Remove full match "a las 10pm"
            }
        }
    }

    // B. DETECTAR FECHA
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (cleanTitle.match(/\bho(?:y)\b/i)) {
        detectedDate = today.toISOString().split('T')[0];
        cleanTitle = cleanTitle.replace(/\bho(?:y)\b/i, '');
    } else if (cleanTitle.match(/\bmañana\b/i)) {
        detectedDate = tomorrow.toISOString().split('T')[0];
        cleanTitle = cleanTitle.replace(/\bmañana\b/i, '');
    } else if (cleanTitle.match(/\bpasado mañana\b/i)) {
        const afterTom = new Date(today);
        afterTom.setDate(today.getDate() + 2);
        detectedDate = afterTom.toISOString().split('T')[0];
        cleanTitle = cleanTitle.replace(/\bpasado mañana\b/i, '');
    } else {
        // Detectar días semana: "el lunes", "el viernes"
        const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const dayRegex = new RegExp(`\\b(?:el\\s)?(${days.join('|')})\\b`, 'i');
        const dayMatch = cleanTitle.match(dayRegex);

        if (dayMatch) {
            const dayName = dayMatch[1].toLowerCase();
            const targetDay = days.indexOf(dayName);
            const currentDay = today.getDay();
            let daysToAdd = targetDay - currentDay;
            if (daysToAdd <= 0) daysToAdd += 7; // Próximo X

            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + daysToAdd);
            detectedDate = targetDate.toISOString().split('T')[0];
            cleanTitle = cleanTitle.replace(dayMatch[0], '');
        }
    }

    // C. LIMPIEZA FINAL DEL TÍTULO
    // Remover palabras de "comando" sobrantes
    cleanTitle = cleanTitle.replace(/^(agendar|crear|nueva|nuevo|recordar|añadir|hacer|poner|tengo|hay) (tarea|evento|recordatorio|examen|que)?/i, '');
    // Remover preposiciones iniciales sobrantes
    cleanTitle = cleanTitle.replace(/^(que|un|una|el|la|de|para)\s/i, '');
    // Trim
    cleanTitle = cleanTitle.trim();
    // Capitalizar
    if (cleanTitle) cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

    // Fallback title
    if (!cleanTitle) cleanTitle = "Nueva Tarea";

    // Format time for display (AM/PM)
    let displayTime = detectedTime;
    if (detectedTime) {
        const [h, m] = detectedTime.split(':').map(Number);
        const ampm = h >= 12 ? 'pm' : 'am';
        const h12 = h % 12 || 12;
        displayTime = `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
    }

    addMessage(`📅 Agendando: "${cleanTitle}" para ${detectedDate || 'Hoy'} ${displayTime ? '@ ' + displayTime : ''}`, 'bot');

    if (typeof openModal === 'function') {
        openModal(cleanTitle, detectedDate, detectedTime); // Keep 24h for logic
    } else {
        addMessage("Error: Función openModal no disponible.", 'bot');
    }
}

// Helper: Convert time string to HH:mm
function convertTo24Hour(timeStr) {
    // Basic parser. 
    // Inputs: "5pm", "10:30 am", "18:00", "9"
    try {
        const lower = timeStr.toLowerCase().replace(/\s/g, '');
        let [str, hours, minutes] = lower.match(/(\d{1,2})(?::(\d{2}))?/) || [];
        if (!hours) return '';

        hours = parseInt(hours);
        minutes = minutes ? parseInt(minutes) : 0;

        if (lower.includes('pm') && hours < 12) hours += 12;
        if (lower.includes('am') && hours === 12) hours = 0;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (e) {
        return '';
    }
}

// 🎤 VOICE RECOGNITION
let assistantRecognition;
let isListening = false;

function initVoice() {
    if ('webkitSpeechRecognition' in window) {
        // eslint-disable-next-line
        assistantRecognition = new webkitSpeechRecognition();
        assistantRecognition.continuous = false; // Stop after silence
        assistantRecognition.interimResults = true; // Show text WHILE speaking
        assistantRecognition.lang = 'es-ES';

        assistantRecognition.onstart = () => {
            isListening = true; // ✅ Mark as started
            console.log('🎤 Voice started');

            const btn = document.getElementById('micBtn');
            const overlay = document.getElementById('listeningOverlay');
            const overlayText = document.getElementById('listeningText');

            if (btn) {
                btn.style.color = '#ef4444'; // Red for recording
                btn.style.borderColor = '#ef4444';
                btn.classList.add('pulse-animation');
            }

            if (overlay && overlay.style.display !== 'none') {
                if (overlayText) overlayText.textContent = "Escuchando...";
            }

            const input = document.getElementById('chatInput');
            if (input) input.placeholder = "Escuchando...";
        };

        assistantRecognition.onend = () => {
            isListening = false; // ✅ Mark as stopped
            console.log('🎤 Voice ended');

            const btn = document.getElementById('micBtn');
            const overlay = document.getElementById('listeningOverlay');

            if (btn) {
                btn.style.color = 'var(--text-secondary)';
                btn.style.borderColor = 'var(--border)';
                btn.classList.remove('pulse-animation');
            }

            const input = document.getElementById('chatInput');
            if (input) {
                input.placeholder = "Escribe o dicta...";
                input.focus();
            }

            // AUTO-PROCESS Logic
            if (overlay && overlay.style.display !== 'none') {
                // Check text content - Final Check
                setTimeout(() => {
                    const finalVal = document.getElementById('listeningText').textContent;
                    if (finalVal && finalVal !== 'Escuchando...' && finalVal !== '...') {
                        console.log('🧠 Auto-processing:', finalVal);
                        processCommand(finalVal);
                        toggleVoice(); // Close overlay (safely)
                    } else {
                        overlay.style.display = 'none'; // Close if nothing said
                    }
                }, 500);
            }
        };

        assistantRecognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            const input = document.getElementById('chatInput');
            const overlayText = document.getElementById('listeningText');

            const displayText = finalTranscript || interimTranscript;

            if (input && displayText) input.value = displayText;
            if (overlayText && displayText) overlayText.textContent = displayText;
        };

        assistantRecognition.onerror = (event) => {
            console.error("Speech Error", event.error);
            isListening = false;
            const input = document.getElementById('chatInput');
            if (input) input.placeholder = "Error en micrófono";

            // Handle no-speech
            if (event.error === 'no-speech') {
                const overlayText = document.getElementById('listeningText');
                if (overlayText) overlayText.textContent = "No escuché nada...";
            }
        };
    }
}

function toggleVoice() {
    if (!assistantRecognition) initVoice();

    // Toggle Overlay immediately for visual feedback
    const overlay = document.getElementById('listeningOverlay');

    // Safety check for stopping
    if (isListening) {
        if (assistantRecognition) assistantRecognition.stop();
        if (overlay) overlay.style.display = 'none';
        return;
    }

    // Start Logic
    if (overlay) {
        if (overlay.style.display === 'none' || !overlay.style.display) {
            overlay.style.display = 'flex';
            // Start Recognition
            try {
                if (assistantRecognition) assistantRecognition.start();
            } catch (e) {
                console.warn("Retrying voice start...", e);
                isListening = false;
                if (assistantRecognition) assistantRecognition.start();
            }
        } else {
            // If overlay is already open but we weren't "listening" per flag?
            // Or user clicked cancel
            overlay.style.display = 'none';
        }
    }
}

// Bind Enter Key
document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && document.activeElement && document.activeElement.id === 'chatInput') {
        sendChatMessage();
    }
});
