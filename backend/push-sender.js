// =====================================================
// PUSH NOTIFICATION SENDER - BACKEND
// =====================================================
// This runs on Render 24/7 and sends push notifications
// to users at their scheduled times

const http = require('http');
const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

// =====================================================
// HTTP SERVER (Keep Render awake)
// =====================================================
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            service: 'Push Notification Sender',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        }));
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`🌐 HTTP Server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// =====================================================
// CONFIGURATION
// =====================================================
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:williebeatsyt@gmail.com';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Validate environment variables
if (!VAPID_PUBLIC || !VAPID_PRIVATE || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing environment variables!');
    console.error('Required: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY');
    process.exit(1);
}

// Configure web-push
webpush.setVapidDetails(
    VAPID_EMAIL,
    VAPID_PUBLIC,
    VAPID_PRIVATE
);

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('✅ Push Notification Sender initialized');
console.log('📧 VAPID Email:', VAPID_EMAIL);
console.log('🔗 Supabase URL:', SUPABASE_URL);

// =====================================================
// MAIN NOTIFICATION LOGIC
// =====================================================
async function checkAndSendNotifications() {
    // FIX: Manual UTC-5 calculation for Colombia/Peru
    // We treat the Date object as a data container, shifting it by -5 hours
    const now = new Date();
    const offset = -5; // UTC-5
    const localTime = new Date(now.getTime() + (offset * 60 * 60 * 1000));

    // Extract components from the shifted time (treating it as if it were UTC)
    const isoStr = localTime.toISOString(); // "2025-12-15T23:40:00.000Z"
    const currentDate = isoStr.split('T')[0];
    const currentTime = isoStr.split('T')[1].slice(0, 5);
    const dayIndex = localTime.getUTCDay();
    const currentDay = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][dayIndex];

    console.log(`\n⏰ [${now.toISOString()}] Checking notifications...`);
    console.log(`📅 Local (UTC-5): ${currentDay}, Time: ${currentTime}, Date: ${currentDate}`);

    try {
        // =====================================================
        // 1. CHECK CLASSES
        // =====================================================
        const { data: classes, error: classError } = await supabase
            .from('classes')
            .select('*')
            .eq('day', currentDay);

        if (classError) {
            console.error('❌ Error fetching classes:', classError);
        } else {
            console.log(`📚 Found ${classes?.length || 0} classes for ${currentDay}`);

            for (const cls of classes || []) {
                let notifyTime = cls.startTime;
                let message = `Tu clase de ${cls.startTime} está por comenzar`;

                // Special case: English classes notify 20 min early
                if (cls.subject.toLowerCase().includes('english') ||
                    cls.subject.toLowerCase().includes('inglés')) {
                    const [h, m] = cls.startTime.split(':');
                    const date = new Date();
                    date.setHours(parseInt(h), parseInt(m) - 20);
                    notifyTime = date.toTimeString().slice(0, 5);
                    message = `Tu clase de inglés comienza en 20 minutos (${cls.startTime})`;
                }

                if (notifyTime === currentTime) {
                    console.log(`🔔 Sending notification for class: ${cls.subject}`);
                    await sendPushToUser(cls.user_id, {
                        title: `🎓 ${cls.subject}`,
                        body: message,
                        tag: `class-${cls.id}`,
                        url: '/dashboard.html'
                    });
                }
            }
        }

        // =====================================================
        // 2. CHECK HABITS
        // =====================================================
        const { data: habits, error: habitError } = await supabase
            .from('habits')
            .select('*');

        if (habitError) {
            console.error('❌ Error fetching habits:', habitError);
        } else {
            console.log(`✅ Found ${habits?.length || 0} habits`);

            for (const habit of habits || []) {
                // Parse time from habit title
                let habitTime = '00:00';

                if (habit.title.toLowerCase().includes('reflex')) {
                    habitTime = '22:30';
                } else {
                    const timeMatch = habit.title.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)?/);
                    if (timeMatch) {
                        let hours = parseInt(timeMatch[1]);
                        const minutes = timeMatch[2] || '00';
                        const modifier = timeMatch[3]?.toUpperCase();

                        if (modifier === 'PM' && hours < 12) hours += 12;
                        if (modifier === 'AM' && hours === 12) hours = 0;

                        habitTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
                    }
                }

                if (habitTime === currentTime && habitTime !== '00:00') {
                    console.log(`🔔 Sending notification for habit: ${habit.title}`);
                    await sendPushToUser(habit.user_id, {
                        title: `⏰ ${habit.title.split(' ')[0]} ${habit.title.split(' ')[1] || ''}`,
                        body: 'Es hora de completar este hábito',
                        tag: `habit-${habit.id}`,
                        url: '/dashboard.html'
                    });
                }
            }
        }

        // =====================================================
        // 3. CHECK TASKS (NEW!)
        // =====================================================
        const { data: tasks, error: taskError } = await supabase
            .from('tasks')
            .select('*')
            .eq('date', currentDate)
            .eq('completed', false);

        if (taskError) {
            console.error('❌ Error fetching tasks:', taskError);
        } else {
            for (const task of tasks || []) {
                if (!task.time) continue; // Skip tasks without time

                let notifyTime = task.time;
                let message = `Tu tarea programada para ${task.time}`;

                // If task has reminder, notify X minutes before
                if (task.reminder && task.reminder > 0) {
                    const [h, m] = task.time.split(':');
                    const taskDate = new Date();
                    taskDate.setHours(parseInt(h), parseInt(m) - task.reminder);
                    notifyTime = taskDate.toTimeString().slice(0, 5);
                    message = `Recordatorio: ${task.title} en ${task.reminder} minutos (${task.time})`;
                }

                if (notifyTime === currentTime) {
                    console.log(`🔔 Sending notification for task: ${task.title}`);
                    await sendPushToUser(task.user_id, {
                        title: `📋 ${task.title}`,
                        body: message,
                        tag: `task-${task.id}`,
                        url: '/dashboard.html'
                    });
                }
            }
        }

    } catch (error) {
        console.error('❌ Error in checkAndSendNotifications:', error);
    }
}

// =====================================================
// SEND PUSH TO SPECIFIC USER
// =====================================================
async function sendPushToUser(userId, payload) {
    try {
        // Get all subscriptions for this user
        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error(`❌ Error fetching subscriptions for user ${userId}:`, error);
            return;
        }

        if (!subscriptions || subscriptions.length === 0) {
            console.log(`⚠️ No subscriptions found for user ${userId}`);
            return;
        }

        console.log(`📤 Sending to ${subscriptions.length} device(s) for user ${userId}`);

        // Send to all user's devices
        for (const sub of subscriptions) {
            try {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                };
                const payloadString = JSON.stringify(payload);

                await webpush.sendNotification(pushSubscription, payloadString);
                console.log(`✅ Push sent to device ${sub.id}`);

            } catch (err) {
                console.error(`❌ Error sending push to ${sub.id}:`, err.message);
                if (err.statusCode) console.error(`   Status: ${err.statusCode}`);

                if (err.statusCode === 410 || err.statusCode === 404) {
                    console.log(`🗑️ Removing expired subscription: ${sub.id}`);
                    await supabase
                        .from('push_subscriptions')
                        .delete()
                        .eq('id', sub.id);
                }
            }
        } // End for loop

    } catch (error) {
        console.error('❌ Error in sendPushToUser:', error);
    }
}

// =====================================================
// START THE SERVICE
// =====================================================
console.log('🚀 Starting Push Notification Service...');
console.log('⏰ Checking every 60 seconds');

// Run immediately on start
checkAndSendNotifications();

// Then run every 60 seconds
setInterval(checkAndSendNotifications, 60000);

// Keep the process alive
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('👋 SIGINT received, shutting down gracefully...');
    process.exit(0);
});

console.log('✅ Push Notification Service is running!');
