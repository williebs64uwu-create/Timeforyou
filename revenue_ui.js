// Render Revenue Management View
function renderRevenue(content) {
    const summary = calculatePaymentSummary(payments);

    content.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <div>
                    <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 8px 0;">
                        <i class="ri-money-dollar-circle-line" style="color: var(--primary);"></i>
                        Ingresos
                    </h1>
                    <p style="color: var(--text-secondary); margin: 0;">Gestiona tus pagos y servicios</p>
                </div>
                <button class="btn btn-primary" onclick="openPaymentModal()">
                    <i class="ri-add-line"></i> Nuevo Pago
                </button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div style="background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 12px; padding: 20px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                        <div style="width: 40px; height: 40px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            <i class="ri-money-dollar-circle-fill" style="font-size: 20px; color: var(--primary);"></i>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: var(--text-secondary);">Total USD</div>
                            <div style="font-size: 24px; font-weight: 700; color: var(--primary);">$${summary.usd.net}</div>
                        </div>
                    </div>
                    <div style="font-size: 13px; color: var(--text-secondary);">
                        Bruto: $${summary.usd.gross} • Comisión: $${summary.usd.commission}
                    </div>
                </div>

                <div style="background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 12px; padding: 20px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                        <div style="width: 40px; height: 40px; background: rgba(16, 185, 129, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            <i class="ri-money-dollar-circle-fill" style="font-size: 20px; color: var(--success);"></i>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: var(--text-secondary);">Total PEN</div>
                            <div style="font-size: 24px; font-weight: 700; color: var(--success);">S/. ${summary.pen.net}</div>
                        </div>
                    </div>
                    <div style="font-size: 13px; color: var(--text-secondary);">
                        Bruto: S/. ${summary.pen.gross} • Comisión: S/. ${summary.pen.commission}
                    </div>
                </div>

                <div style="background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); border-radius: 12px; padding: 20px; color: white;">
                    <div style="font-size: 12px; opacity: 0.9; margin-bottom: 8px;">Total Convertido</div>
                    <div style="font-size: 28px; font-weight: 700; margin-bottom: 4px;">$${summary.totals.usd}</div>
                    <div style="font-size: 14px; opacity: 0.8;">≈ S/. ${summary.totals.pen}</div>
                </div>
            </div>

            <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
                <select id="filterStatus" onchange="filterPayments()" style="padding: 8px 12px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); cursor: pointer;">
                    <option value="all">Todos los estados</option>
                    <option value="pagado">Pagado</option>
                    <option value="en_curso">En Curso</option>
                    <option value="pagado100">Pagado 100</option>
                    <option value="pendiente">Pendiente</option>
                </select>

                <select id="filterMethod" onchange="filterPayments()" style="padding: 8px 12px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); cursor: pointer;">
                    <option value="all">Todos los métodos</option>
                    <option value="paypal">PayPal</option>
                    <option value="western union">Western Union</option>
                    <option value="yape">Yape</option>
                    <option value="payhip">Payhip</option>
                    <option value="offszn">offszn</option>
                </select>

                <select id="filterCurrency" onchange="filterPayments()" style="padding: 8px 12px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); cursor: pointer;">
                    <option value="all">Todas las monedas</option>
                    <option value="USD">USD</option>
                    <option value="PEN">PEN</option>
                </select>
            </div>

            <div id="paymentsList"></div>
        </div>
    `;

    renderPaymentsList();
}

function renderPaymentsList() {
    const listContainer = document.getElementById('paymentsList');
    if (!listContainer) return;

    const statusFilter = document.getElementById('filterStatus')?.value || 'all';
    const methodFilter = document.getElementById('filterMethod')?.value || 'all';
    const currencyFilter = document.getElementById('filterCurrency')?.value || 'all';

    let filtered = payments;
    if (statusFilter !== 'all') filtered = filtered.filter(p => p.status === statusFilter);
    if (methodFilter !== 'all') filtered = filtered.filter(p => p.payment_method === methodFilter);
    if (currencyFilter !== 'all') filtered = filtered.filter(p => p.currency === currencyFilter);

    if (filtered.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                <i class="ri-inbox-line" style="font-size: 48px; opacity: 0.5; display: block; margin-bottom: 16px;"></i>
                <div style="font-size: 16px;">No hay pagos registrados</div>
                <div style="font-size: 14px; margin-top: 8px;">Agrega tu primer pago para comenzar</div>
            </div>
        `;
        return;
    }

    const statusColors = {
        'pagado': 'var(--success)',
        'en_curso': 'var(--warning)',
        'pagado100': 'var(--primary)',
        'pendiente': 'var(--danger)'
    };

    const statusLabels = {
        'pagado': 'Pagado',
        'en_curso': 'En Curso',
        'pagado100': 'Pagado 100',
        'pendiente': 'Pendiente'
    };

    listContainer.innerHTML = filtered.map(payment => `
        <div style="background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 12px; transition: all 0.2s;" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border)'">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                        <div style="font-size: 16px; font-weight: 600; color: var(--text-primary);">${payment.service_type}</div>
                        <span style="padding: 4px 12px; background: ${statusColors[payment.status]}20; color: ${statusColors[payment.status]}; border-radius: 12px; font-size: 12px; font-weight: 600;">
                            ${statusLabels[payment.status]}
                        </span>
                    </div>
                    <div style="color: var(--text-secondary); font-size: 14px;">
                        <i class="ri-user-line"></i> ${payment.client_name}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 20px; font-weight: 700; color: var(--primary);">
                        ${payment.currency === 'USD' ? '$' : 'S/.'} ${payment.net_amount}
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary);">
                        Bruto: ${payment.currency === 'USD' ? '$' : 'S/.'} ${payment.gross_amount}
                    </div>
                </div>
            </div>

            <div style="display: flex; gap: 20px; font-size: 13px; color: var(--text-secondary); padding-top: 12px; border-top: 1px solid var(--border);">
                <div><i class="ri-bank-card-line"></i> ${payment.payment_method}</div>
                <div><i class="ri-calendar-line"></i> ${new Date(payment.payment_date).toLocaleDateString('es-ES')}</div>
                ${payment.commission_amount > 0 ? `<div style="color: var(--danger);"><i class="ri-arrow-down-line"></i> Comisión: ${payment.currency === 'USD' ? '$' : 'S/.'} ${payment.commission_amount}</div>` : ''}
            </div>

            ${payment.notes ? `<div style="margin-top: 12px; padding: 8px 12px; background: var(--bg-tertiary); border-radius: 6px; font-size: 13px; color: var(--text-secondary);"><i class="ri-sticky-note-line"></i> ${payment.notes}</div>` : ''}
        </div>
    `).join('');
}

function filterPayments() {
    renderPaymentsList();
}

console.log('✅ Revenue UI rendering loaded');

