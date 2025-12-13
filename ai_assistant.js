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

// 🧠 BRAIN: Simple Command Processor
function processCommand(text) {
    const lower = text.toLowerCase();

    // 1. TAREAS
    if (lower.includes('agendar') || lower.includes('nueva tarea') || lower.includes('crear tarea')) {
        addMessage("¡Entendido! Abriendo el creador de tareas...", 'bot');

        if (typeof openModal === 'function') {
            // Try to extract title
            let cleanTitle = text.replace(/agendar|nueva tarea|crear tarea/gi, '').trim();
            if (cleanTitle.length < 2) cleanTitle = ''; // Too short

            // Open Generic Modal (assumed to be Task Modal or needs adjustment)
            openModal(cleanTitle);
        } else {
            addMessage("Error: No encuentro la función 'openModal'.", 'bot');
        }
    }
    // 2. CITAS
    else if (lower.includes('cita') || lower.includes('reserva') || lower.includes('solicitud')) {
        addMessage("Abriendo panel de solicitudes de citas.", 'bot');
        if (typeof changeView === 'function') changeView('requests');
    }
    // 3. EXPORTAR
    else if (lower.includes('exportar') || lower.includes('foto') || lower.includes('horario')) {
        addMessage("Generando imagen de tu horario...", 'bot');
        if (typeof exportSchedule === 'function') {
            exportSchedule();
        } else {
            addMessage("Error: Función de exportar no encontrada.", 'bot');
        }
    }
    // 4. SALUDO
    else if (lower.includes('hola') || lower.includes('buenas')) {
        addMessage("¡Hola Willie! Soy TimeBot. Puedo ayudarte a crear tareas, revisar citas o exportar tu horario.", 'bot');
    }
    // 5. AYUDA / DEFAULT
    else {
        addMessage("No estoy seguro de qué hacer con eso. Prueba decir 'Nueva tarea', 'Ver citas' o 'Exportar horario'.", 'bot');
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
