// =============================================
// PAYMENT MODAL - UI & LOGIC
// =============================================

let currentPaymentEdit = null;

// Open Payment Modal (GLOBAL)
window.openPaymentModal = function (paymentId = null) {
    console.log('📝 Opening payment modal:', paymentId);
    currentPaymentEdit = paymentId;
    const modal = document.getElementById('paymentModal');
    const form = document.getElementById('paymentForm');

    if (paymentId) {
        // Edit mode
        const payment = payments.find(p => p.id === paymentId);
        if (payment) {
            document.getElementById('modalTitle').textContent = 'Editar Pago';
            document.getElementById('serviceType').value = payment.service_type;
            document.getElementById('clientName').value = payment.client_name;
            document.getElementById('paymentMethod').value = payment.payment_method;
            document.getElementById('currency').value = payment.currency;
            document.getElementById('grossAmount').value = payment.gross_amount;
            document.getElementById('paymentStatus').value = payment.status;
            document.getElementById('paymentDate').value = payment.payment_date;
            document.getElementById('paymentNotes').value = payment.notes || '';

            // Calculate and show net amount
            updateNetAmountPreview();
        }
    } else {
        // New payment mode
        document.getElementById('modalTitle').textContent = 'Nuevo Pago';
        form.reset();
        document.getElementById('paymentDate').valueAsDate = new Date();
        document.getElementById('netAmountPreview').textContent = '$0.00';
    }

    modal.classList.add('show');
};

// Close Payment Modal (GLOBAL)
window.closePaymentModal = function () {
    console.log('❌ Closing payment modal');
    const modal = document.getElementById('paymentModal');
    modal.classList.remove('show');
    currentPaymentEdit = null;
};

// Update Net Amount Preview (GLOBAL)
window.updateNetAmountPreview = function () {
    const grossAmount = parseFloat(document.getElementById('grossAmount').value) || 0;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const currency = document.getElementById('currency').value;

    const { net, commission } = calculateNetAmount(grossAmount, paymentMethod, currency);

    const symbol = currency === 'USD' ? '$' : 'S/.';
    document.getElementById('netAmountPreview').textContent = `${symbol}${net}`;

    if (commission > 0) {
        document.getElementById('commissionInfo').textContent = `Comisión: ${symbol}${commission}`;
        document.getElementById('commissionInfo').style.display = 'block';
    } else {
        document.getElementById('commissionInfo').style.display = 'none';
    }
};

// Save Payment (GLOBAL)
window.savePayment = async function (event) {
    event.preventDefault();

    const paymentData = {
        service_type: document.getElementById('serviceType').value,
        client_name: document.getElementById('clientName').value,
        payment_method: document.getElementById('paymentMethod').value,
        currency: document.getElementById('currency').value,
        gross_amount: parseFloat(document.getElementById('grossAmount').value),
        status: document.getElementById('paymentStatus').value,
        payment_date: document.getElementById('paymentDate').value,
        notes: document.getElementById('paymentNotes').value
    };

    try {
        if (currentPaymentEdit) {
            // Update existing
            await updatePayment(currentPaymentEdit, paymentData);
        } else {
            // Create new
            await createPayment(paymentData);
        }

        // Reload payments
        await loadPayments();

        // Re-render UI
        if (currentView === 'revenue') {
            const content = document.querySelector('.content');
            renderRevenue(content);
        }

        closePaymentModal();
    } catch (error) {
        console.error('Error saving payment:', error);
        alert('Error al guardar el pago. Por favor intenta de nuevo.');
    }
}

// Delete Payment
async function deletePayment(paymentId) {
    if (!confirm('¿Estás seguro de eliminar este pago?')) return;

    try {
        const { error } = await window.supabaseClient
            .from('payments')
            .delete()
            .eq('id', paymentId);

        if (error) throw error;

        // Reload
        await loadPayments();

        // Re-render
        if (currentView === 'revenue') {
            const content = document.querySelector('.content');
            renderRevenue(content);
        }
    } catch (error) {
        console.error('Error deleting payment:', error);
        alert('Error al eliminar el pago.');
    }
}

// Load Payments on App Start
async function loadPayments() {
    if (!currentUser) return;

    try {
        const { data, error } = await window.supabaseClient
            .from('payments')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('payment_date', { ascending: false });

        if (error) throw error;

        payments = data || [];
        console.log(`✅ Loaded ${payments.length} payments`);
    } catch (error) {
        console.error('Error loading payments:', error);
    }
}

console.log('✅ Payment modal logic loaded');

// Auto-lock currency based on payment method (GLOBAL)
window.handlePaymentMethodChange = function() {
    const method = document.getElementById('paymentMethod').value;
    const currencySelect = document.getElementById('currency');
    
    if (!method) {
        currencySelect.disabled = true;
        currencySelect.value = 'USD';
        return;
    }
    
    // Always disabled (auto-selected based on method)
    currencySelect.disabled = true;
    
    if (method === 'yape') {
        currencySelect.value = 'PEN';
    } else {
        // PayPal, Payhip, offszn, Western Union ? USD
        currencySelect.value = 'USD';
    }
    
    updateNetAmountPreview();
};

// Make deletePayment global
window.deletePayment = async function(paymentId) {
    if (!confirm('�Est�s seguro de eliminar este pago?')) return;
    
    try {
        const { error } = await window.supabaseClient
            .from('payments')
            .delete()
            .eq('id', paymentId);
        
        if (error) throw error;
        
        // Reload
        const { data } = await window.supabaseClient
            .from('payments')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('payment_date', { ascending: false });
        
        payments = data || [];
        
        // Re-render
        if (window.currentView === 'revenue') {
            const content = document.querySelector('.content');
            if (content && typeof renderRevenue === 'function') {
                renderRevenue(content);
            }
        }
        
        console.log('? Payment deleted');
    } catch (error) {
        console.error('? Error deleting payment:', error);
        alert('Error al eliminar el pago.');
    }
};

console.log('? Payment modal functions loaded');
