// =============================================
// REVENUE MANAGEMENT SYSTEM - Core Logic
// =============================================

// Commission rates by payment method
const COMMISSION_RATES = {
    'paypal': 0.066,      // 6.6%
    'payhip': 0.066,      // 6.6%
    'offszn': 0.066,  // 6.6%
    'western union': 0,   // Sin comisión
    'yape': 0             // Sin comisión
};

// Service types (from Excel)
const SERVICE_TYPES = [
    'mezcla + master',
    'beat wav',
    'beat mp3',
    'beat exclusivo',
    'MÁS DE 1 TEMA',
    'PLANTILLA PERSONALIZADA'
];

// Payment methods
const PAYMENT_METHODS = [
    'paypal',
    'western union',
    'yape',
    'payhip',
    'offszn'
];

// Payment statuses
const PAYMENT_STATUSES = [
    { value: 'pagado', label: 'Pagado', color: '#10B981' },
    { value: 'en_curso', label: 'En Curso', color: '#F59E0B' },
    { value: 'pagado100', label: 'Pagado 100', color: '#3B82F6' },
    { value: 'pendiente', label: 'Pendiente', color: '#EF4444' }
];

// Exchange rate (actualizable)
const EXCHANGE_RATE = 3.75; // USD to PEN

// Calculate net amount after commission
function calculateNetAmount(grossAmount, paymentMethod, currency) {
    const rate = COMMISSION_RATES[paymentMethod] || 0;
    const commission = grossAmount * rate;
    const net = grossAmount - commission;

    return {
        net: parseFloat(net.toFixed(2)),
        commission: parseFloat(commission.toFixed(2)),
        rate: rate * 100 // Percentage
    };
}

// Convert to USD for totals
function convertToUSD(amount, currency) {
    if (currency === 'USD') return amount;
    return amount / EXCHANGE_RATE;
}

// Get unique clients from payments
async function getSavedClients() {
    try {
        const { data, error } = await window.supabaseClient
            .from('payments')
            .select('client_name')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Get unique names
        const uniqueClients = [...new Set(data.map(p => p.client_name))];
        return uniqueClients;
    } catch (err) {
        logError('Error loading clients:', err);
        return [];
    }
}

// Load all payments
async function loadPayments() {
    try {
        const { data, error } = await window.supabaseClient
            .from('payments')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('payment_date', { ascending: false });

        if (error) throw error;

        return data || [];
    } catch (err) {
        logError('Error loading payments:', err);
        return [];
    }
}

// Create new payment
async function createPayment(paymentData) {
    try {
        // Calculate commission
        const { net, commission } = calculateNetAmount(
            paymentData.gross_amount,
            paymentData.payment_method,
            paymentData.currency
        );

        const { data, error } = await window.supabaseClient
            .from('payments')
            .insert([{
                user_id: currentUser.id,
                service_type: paymentData.service_type,
                client_name: paymentData.client_name,
                payment_method: paymentData.payment_method,
                currency: paymentData.currency,
                gross_amount: paymentData.gross_amount,
                net_amount: net,
                commission_amount: commission,
                status: paymentData.status,
                payment_date: paymentData.payment_date,
                notes: paymentData.notes || null
            }])
            .select()
            .single();

        if (error) throw error;

        console.log('✅ Payment created:', data);
        return data;
    } catch (err) {
        logError('Error creating payment:', err);
        throw err;
    }
}

// Update payment
async function updatePayment(paymentId, updates) {
    try {
        // Recalculate commission if amount or method changed
        if (updates.gross_amount || updates.payment_method) {
            const payment = await window.supabaseClient
                .from('payments')
                .select('*')
                .eq('id', paymentId)
                .single();

            const gross = updates.gross_amount || payment.data.gross_amount;
            const method = updates.payment_method || payment.data.payment_method;
            const currency = updates.currency || payment.data.currency;

            const { net, commission } = calculateNetAmount(gross, method, currency);
            updates.net_amount = net;
            updates.commission_amount = commission;
        }

        const { data, error } = await window.supabaseClient
            .from('payments')
            .update(updates)
            .eq('id', paymentId)
            .select()
            .single();

        if (error) throw error;

        return data;
    } catch (err) {
        logError('Error updating payment:', err);
        throw err;
    }
}

// Delete payment
async function deletePayment(paymentId) {
    try {
        const { error } = await window.supabaseClient
            .from('payments')
            .delete()
            .eq('id', paymentId);

        if (error) throw error;

        console.log('✅ Payment deleted');
    } catch (err) {
        logError('Error deleting payment:', err);
        throw err;
    }
}

// Calculate summary totals
function calculatePaymentSummary(payments) {
    const usdPayments = payments.filter(p => p.currency === 'USD');
    const penPayments = payments.filter(p => p.currency === 'PEN');

    const sum = (arr, field) => arr.reduce((acc, p) => acc + parseFloat(p[field] || 0), 0);

    const usdGross = sum(usdPayments, 'gross_amount');
    const usdNet = sum(usdPayments, 'net_amount');
    const usdCommission = sum(usdPayments, 'commission_amount');

    const penGross = sum(penPayments, 'gross_amount');
    const penNet = sum(penPayments, 'net_amount');
    const penCommission = sum(penPayments, 'commission_amount');

    // Convert all to USD for total
    const totalUSD = usdNet + convertToUSD(penNet, 'PEN');
    const totalPEN = penNet + (usdNet * EXCHANGE_RATE);

    return {
        usd: {
            gross: usdGross.toFixed(2),
            net: usdNet.toFixed(2),
            commission: usdCommission.toFixed(2)
        },
        pen: {
            gross: penGross.toFixed(2),
            net: penNet.toFixed(2),
            commission: penCommission.toFixed(2)
        },
        totals: {
            usd: totalUSD.toFixed(2),
            pen: totalPEN.toFixed(2)
        }
    };
}

console.log('✅ Revenue Management System loaded');

// UI RENDERING FUNCTIONS


