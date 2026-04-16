// View - Handles UI rendering
export class FormView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.onAddExpense = null;
        this.onRemoveExpense = null;
        this.onUpdateExpense = null;
        this.onExport = null;
        this.onSaveToCloud = null;
        this.onLoadFromCloud = null;
        this.onSaveLocal = null;
        this.onLoadLocal = null;
        this.onReset = null;
    }

    render(formData, totals, isConnected) {
        this.container.innerHTML = `
            <div class="header">
                <h1><i class="fas fa-chart-line"></i> Reimbursement 2026</h1>
                <p> ALS - Based Allowance Replenishment System</p>
                <div class="status-badge ${isConnected ? 'status-connected' : 'status-disconnected'}">
                    <i class="fas ${isConnected ? 'fa-shield-alt' : 'fa-cloud-slash'}"></i>
                    ${isConnected ? 'Secure Cloud Active' : 'Offline Mode'}
                </div>
            </div>

            <div class="card">
                <form id="mainForm">
                    <div class="form-grid">
                        <div class="form-group">
                            <label><i class="fas fa-user"></i> Field Engineers Name *</label>
                            <input type="text" id="fieldEngineerName" value="${this.escapeHtml(formData.fieldEngineerName)}" placeholder="Enter engineer name">
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-calendar"></i> Date Coverage (Start) *</label>
                            <input type="date" id="dateCoverageStart" value="${formData.dateCoverageStart}">
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-calendar"></i> Date Coverage (End) *</label>
                            <input type="date" id="dateCoverageEnd" value="${formData.dateCoverageEnd}">
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-network-wired"></i> Cluster *</label>
                            <input type="text" id="cluster" value="${this.escapeHtml(formData.cluster)}" placeholder="Enter cluster">
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-clock"></i> Date Filed</label>
                            <input type="date" id="dateFiled" value="${formData.dateFiled}" readonly>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-users"></i> Team Lead *</label>
                            <input type="text" id="teamLead" value="${this.escapeHtml(formData.teamLead)}" placeholder="Enter team lead">
                        </div>
                    </div>

                    <div style="margin: 24px 0;">
                        <h3><i class="fas fa-receipt"></i> Expense Entries</h3>
                        <button type="button" id="addExpenseBtn" class="btn btn-info" style="margin-top: 12px;">
                            <i class="fas fa-plus"></i> Add Expense Entry
                        </button>
                    </div>

                    <div id="expensesContainer">${this.renderExpenses(formData.expenses)}</div>
                    ${this.renderSummary(totals)}

                    <div class="action-buttons">
                        <button type="button" id="saveToCloudBtn" class="btn btn-primary">
                            <i class="fas fa-cloud-upload-alt"></i> Sync to Cloud
                        </button>
                        <button type="button" id="loadFromCloudBtn" class="btn btn-info">
                            <i class="fas fa-cloud-download-alt"></i> Load from Cloud
                        </button>
                        <button type="button" id="exportExcelBtn" class="btn btn-secondary">
                            <i class="fas fa-file-excel"></i> Export to Excel
                        </button>
                        <button type="button" id="saveLocalBtn" class="btn btn-warning">
                            <i class="fas fa-save"></i> Local Backup
                        </button>
                        <button type="button" id="loadLocalBtn" class="btn btn-info">
                            <i class="fas fa-folder-open"></i> Restore Backup
                        </button>
                        <button type="button" id="resetBtn" class="btn btn-danger">
                            <i class="fas fa-trash-alt"></i> Reset Form
                        </button>
                    </div>
                </form>
                <div id="message" class="message"></div>
            </div>
        `;
        this.attachEvents();
    }

    renderExpenses(expenses) {
        if (!expenses || expenses.length === 0) {
            return '<div style="text-align: center; padding: 60px; color: var(--gray);"><i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>No expense entries yet.</div>';
        }

        return expenses.map((expense, index) => `
            <div class="expense-row" data-index="${index}">
                <div class="expense-header">
                    <span class="expense-title"><i class="fas fa-receipt"></i> Entry #${index + 1}</span>
                    <button type="button" class="remove-expense" data-index="${index}">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
                <div class="expense-fields">
                    <input type="date" class="activity-date" placeholder="Activity Date" value="${expense.activityDate || ''}" data-index="${index}">
                    <input type="text" class="fp-ticket" placeholder="FP Ticket" value="${this.escapeHtml(expense.fpTicket || '')}" data-index="${index}">
                    <input type="text" class="project-name" placeholder="Project Name *" value="${this.escapeHtml(expense.projectName || '')}" data-index="${index}">
                    <input type="text" class="po-number" placeholder="PO Number" value="${this.escapeHtml(expense.poNumber || '')}" data-index="${index}">
                    <input type="text" class="launch-point" placeholder="Launch Point" value="${this.escapeHtml(expense.launchPoint || '')}" data-index="${index}">
                    <input type="text" class="client-address" placeholder="Client Address" value="${this.escapeHtml(expense.clientAddress || '')}" data-index="${index}">
                    <input type="number" step="0.1" class="distance" placeholder="Distance (KM)" value="${expense.distance || ''}" data-index="${index}">
                    <input type="number" step="0.01" class="transpo" placeholder="Transpo (₱)" value="${expense.transpo || 0}" data-index="${index}">
                    <input type="number" step="0.01" class="meal" placeholder="Meal (₱)" value="${expense.meal || 0}" data-index="${index}">
                    <input type="number" step="0.01" class="lodging" placeholder="Lodging (₱)" value="${expense.lodging || 0}" data-index="${index}">
                    <input type="number" step="0.01" class="materials" placeholder="Materials (₱)" value="${expense.materials || 0}" data-index="${index}">
                    <input type="number" step="0.01" class="print" placeholder="Print (₱)" value="${expense.print || 0}" data-index="${index}">
                    <input type="number" step="0.01" class="freight" placeholder="Freight (₱)" value="${expense.freight || 0}" data-index="${index}">
                    <input type="number" step="0.01" class="rental" placeholder="Rental (₱)" value="${expense.rental || 0}" data-index="${index}">
                    <input type="number" step="0.01" class="others" placeholder="Others (₱)" value="${expense.others || 0}" data-index="${index}">
                </div>
            </div>
        `).join('');
    }

    renderSummary(totals) {
        return `
            <div class="summary">
                <h3><i class="fas fa-chart-pie"></i> Financial Summary</h3>
                <div class="summary-grid">
                    <div class="summary-item"><div class="summary-value">₱ ${totals.transpo.toFixed(2)}</div><div><i class="fas fa-car"></i> Transpo</div></div>
                    <div class="summary-item"><div class="summary-value">₱ ${totals.meal.toFixed(2)}</div><div><i class="fas fa-utensils"></i> Meal</div></div>
                    <div class="summary-item"><div class="summary-value">₱ ${totals.lodging.toFixed(2)}</div><div><i class="fas fa-hotel"></i> Lodging</div></div>
                    <div class="summary-item"><div class="summary-value">₱ ${totals.materials.toFixed(2)}</div><div><i class="fas fa-boxes"></i> Materials</div></div>
                    <div class="summary-item"><div class="summary-value">₱ ${totals.print.toFixed(2)}</div><div><i class="fas fa-print"></i> Print</div></div>
                    <div class="summary-item"><div class="summary-value">₱ ${totals.freight.toFixed(2)}</div><div><i class="fas fa-truck"></i> Freight</div></div>
                    <div class="summary-item"><div class="summary-value">₱ ${totals.rental.toFixed(2)}</div><div><i class="fas fa-building"></i> Rental</div></div>
                    <div class="summary-item"><div class="summary-value">₱ ${totals.others.toFixed(2)}</div><div><i class="fas fa-ellipsis-h"></i> Others</div></div>
                    <div class="summary-item"><div class="summary-value" style="font-size: 28px;">₱ ${totals.total.toFixed(2)}</div><div><i class="fas fa-crown"></i> GRAND TOTAL</div></div>
                </div>
            </div>
        `;
    }

    attachEvents() {
        document.getElementById('addExpenseBtn')?.addEventListener('click', () => this.onAddExpense?.());
        document.getElementById('exportExcelBtn')?.addEventListener('click', () => this.onExport?.());
        document.getElementById('saveToCloudBtn')?.addEventListener('click', () => this.onSaveToCloud?.());
        document.getElementById('loadFromCloudBtn')?.addEventListener('click', () => this.onLoadFromCloud?.());
        document.getElementById('saveLocalBtn')?.addEventListener('click', () => this.onSaveLocal?.());
        document.getElementById('loadLocalBtn')?.addEventListener('click', () => this.onLoadLocal?.());
        document.getElementById('resetBtn')?.addEventListener('click', () => this.onReset?.());

        this.container.addEventListener('input', (e) => {
            const index = e.target.dataset.index;
            if (index !== undefined && this.onUpdateExpense) {
                const field = e.target.className.split(' ')[0];
                this.onUpdateExpense(parseInt(index), field, e.target.value);
            }
        });

        this.container.addEventListener('click', (e) => {
            if (e.target.classList?.contains('remove-expense')) {
                const index = e.target.dataset.index;
                if (index !== undefined) this.onRemoveExpense?.(parseInt(index));
            }
        });
    }

    getFormData() {
        return {
            fieldEngineerName: document.getElementById('fieldEngineerName')?.value || '',
            dateCoverageStart: document.getElementById('dateCoverageStart')?.value || '',
            dateCoverageEnd: document.getElementById('dateCoverageEnd')?.value || '',
            cluster: document.getElementById('cluster')?.value || '',
            dateFiled: document.getElementById('dateFiled')?.value || new Date().toISOString().split('T')[0],
            teamLead: document.getElementById('teamLead')?.value || ''
        };
    }

    showMessage(text, type) {
        const msgDiv = document.getElementById('message');
        if (msgDiv) {
            msgDiv.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i> ${text}`;
            msgDiv.className = `message ${type}`;
            setTimeout(() => { msgDiv.className = 'message'; }, 3000);
        }
    }

    setLoading(show) {
        const loadingDiv = document.getElementById('loading');
        if (loadingDiv) {
            if (show) loadingDiv.classList.add('active');
            else loadingDiv.classList.remove('active');
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}