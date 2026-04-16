// View - Handles form rendering and user input
export class FormView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.onSubmit = null;
        this.onAddExpense = null;
        this.onRemoveExpense = null;
        this.onUpdateExpense = null;
        this.onExport = null;
        this.onSaveToDb = null;
        this.onLoadRecords = null;
        this.onReset = null;
    }

    render(formData, totals) {
        this.container.innerHTML = `
            <div class="header">
                <h1>BASED ALLOWANCE REPLENISHMENT (FSO)</h1>
                <p class="subtitle">Field Service Office - Expense Reimbursement System</p>
            </div>

            <div class="card">
                <form id="mainForm">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Field Engineers Name *</label>
                            <input type="text" id="fieldEngineerName" value="${this.escapeHtml(formData.fieldEngineerName)}" required>
                        </div>
                        <div class="form-group">
                            <label>Date Coverage (Start) *</label>
                            <input type="date" id="dateCoverageStart" value="${formData.dateCoverageStart}" required>
                        </div>
                        <div class="form-group">
                            <label>Date Coverage (End) *</label>
                            <input type="date" id="dateCoverageEnd" value="${formData.dateCoverageEnd}" required>
                        </div>
                        <div class="form-group">
                            <label>Cluster *</label>
                            <input type="text" id="cluster" value="${this.escapeHtml(formData.cluster)}" required>
                        </div>
                        <div class="form-group">
                            <label>Date Filed</label>
                            <input type="date" id="dateFiled" value="${formData.dateFiled || new Date().toISOString().split('T')[0]}" readonly style="background: #f7fafc;">
                        </div>
                        <div class="form-group">
                            <label>Team Lead *</label>
                            <input type="text" id="teamLead" value="${this.escapeHtml(formData.teamLead)}" required>
                        </div>
                    </div>

                    <div style="margin: 20px 0;">
                        <h3>Expense Entries</h3>
                        <button type="button" id="addExpenseBtn" class="btn btn-info" style="margin-top: 10px;">+ Add Expense Entry</button>
                    </div>

                    <div id="expensesContainer" class="expenses-list">
                        ${this.renderExpenses(formData.expenses)}
                    </div>

                    ${this.renderSummary(totals)}

                    <div class="action-buttons">
                        <button type="submit" class="btn btn-primary">💾 Save to Database</button>
                        <button type="button" id="exportExcelBtn" class="btn btn-secondary">📊 Export to Excel (FSO Format)</button>
                        <button type="button" id="loadRecordsBtn" class="btn btn-info">📋 Load Previous Records</button>
                        <button type="button" id="resetBtn" class="btn btn-danger">🔄 Reset Form</button>
                    </div>
                </form>

                <div id="message" class="message"></div>
            </div>
        `;

        this.attachEvents();
    }

    renderExpenses(expenses) {
        if (!expenses || expenses.length === 0) {
            return '<div style="text-align: center; padding: 40px; color: #a0aec0;">No expense entries yet. Click "Add Expense Entry" to begin.</div>';
        }

        return expenses.map((expense, index) => `
            <div class="expense-row" data-index="${index}">
                <div class="expense-header">
                    <span class="expense-title">Expense Entry #${index + 1}</span>
                    <button type="button" class="remove-expense" data-index="${index}">Remove</button>
                </div>
                <div class="expense-fields">
                    <div class="form-group">
                        <label>Activity Date *</label>
                        <input type="date" class="activity-date" value="${expense.activityDate || ''}" data-index="${index}">
                    </div>
                    <div class="form-group">
                        <label>FP Ticket</label>
                        <input type="text" class="fp-ticket" value="${this.escapeHtml(expense.fpTicket || '')}" data-index="${index}">
                    </div>
                    <div class="form-group">
                        <label>Project Name *</label>
                        <input type="text" class="project-name" value="${this.escapeHtml(expense.projectName || '')}" data-index="${index}">
                    </div>
                    <div class="form-group">
                        <label>Purchase Order (PO#)</label>
                        <input type="text" class="po-number" value="${this.escapeHtml(expense.poNumber || '')}" data-index="${index}">
                    </div>
                    <div class="form-group">
                        <label>Launch Point</label>
                        <input type="text" class="launch-point" value="${this.escapeHtml(expense.launchPoint || '')}" data-index="${index}">
                    </div>
                    <div class="form-group">
                        <label>Client Address / Onsite Address</label>
                        <input type="text" class="client-address" value="${this.escapeHtml(expense.clientAddress || '')}" data-index="${index}">
                    </div>
                    <div class="form-group">
                        <label>Distance (KM)</label>
                        <input type="number" step="0.1" class="distance" value="${expense.distance || ''}" data-index="${index}">
                    </div>
                    <div class="form-group">
                        <label>Transpo (₱)</label>
                        <input type="number" step="0.01" class="transpo" value="${expense.transpo || 0}" data-index="${index}">
                    </div>
                    <div class="form-group">
                        <label>Meal (₱)</label>
                        <input type="number" step="0.01" class="meal" value="${expense.meal || 0}" data-index="${index}">
                    </div>
                    <div class="form-group">
                        <label>Lodging (₱)</label>
                        <input type="number" step="0.01" class="lodging" value="${expense.lodging || 0}" data-index="${index}">
                    </div>
                    <div class="form-group">
                        <label>Materials (₱)</label>
                        <input type="number" step="0.01" class="materials" value="${expense.materials || 0}" data-index="${index}">
                    </div>
                    <div class="form-group">
                        <label>Print (₱)</label>
                        <input type="number" step="0.01" class="print" value="${expense.print || 0}" data-index="${index}">
                    </div>
                    <div class="form-group">
                        <label>Freight (₱)</label>
                        <input type="number" step="0.01" class="freight" value="${expense.freight || 0}" data-index="${index}">
                    </div>
                    <div class="form-group">
                        <label>Rental (₱)</label>
                        <input type="number" step="0.01" class="rental" value="${expense.rental || 0}" data-index="${index}">
                    </div>
                    <div class="form-group">
                        <label>Others (₱)</label>
                        <input type="number" step="0.01" class="others" value="${expense.others || 0}" data-index="${index}">
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderSummary(totals) {
        return `
            <div class="summary">
                <h3>Summary</h3>
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-label">Total Transpo</div>
                        <div class="summary-value">₱ ${totals.transpo.toFixed(2)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total Meal</div>
                        <div class="summary-value">₱ ${totals.meal.toFixed(2)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total Lodging</div>
                        <div class="summary-value">₱ ${totals.lodging.toFixed(2)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total Materials</div>
                        <div class="summary-value">₱ ${totals.materials.toFixed(2)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total Print</div>
                        <div class="summary-value">₱ ${totals.print.toFixed(2)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total Freight</div>
                        <div class="summary-value">₱ ${totals.freight.toFixed(2)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total Rental</div>
                        <div class="summary-value">₱ ${totals.rental.toFixed(2)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total Others</div>
                        <div class="summary-value">₱ ${totals.others.toFixed(2)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label"><strong>GRAND TOTAL</strong></div>
                        <div class="summary-value"><strong>₱ ${totals.total.toFixed(2)}</strong></div>
                    </div>
                </div>
            </div>
        `;
    }

    attachEvents() {
        const form = document.getElementById('mainForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.onSaveToDb) this.onSaveToDb();
            });
        }

        const addBtn = document.getElementById('addExpenseBtn');
        if (addBtn && this.onAddExpense) {
            addBtn.addEventListener('click', () => this.onAddExpense());
        }

        const exportBtn = document.getElementById('exportExcelBtn');
        if (exportBtn && this.onExport) {
            exportBtn.addEventListener('click', () => this.onExport());
        }

        const loadBtn = document.getElementById('loadRecordsBtn');
        if (loadBtn && this.onLoadRecords) {
            loadBtn.addEventListener('click', () => this.onLoadRecords());
        }

        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn && this.onReset) {
            resetBtn.addEventListener('click', () => this.onReset());
        }

        // Delegate events for dynamic expense fields
        this.container.addEventListener('input', (e) => {
            if (e.target.classList && this.onUpdateExpense) {
                const index = e.target.dataset.index;
                if (index !== undefined) {
                    const field = e.target.className.split(' ')[0];
                    const value = e.target.value;
                    this.onUpdateExpense(parseInt(index), field, value);
                }
            }
        });

        this.container.addEventListener('click', (e) => {
            if (e.target.classList && e.target.classList.contains('remove-expense') && this.onRemoveExpense) {
                const index = e.target.dataset.index;
                if (index !== undefined) {
                    this.onRemoveExpense(parseInt(index));
                }
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
        const messageDiv = document.getElementById('message');
        if (messageDiv) {
            messageDiv.textContent = text;
            messageDiv.className = `message ${type}`;
            setTimeout(() => {
                messageDiv.className = 'message';
            }, 5000);
        }
    }

    setLoading(isLoading) {
        const loadingDiv = document.getElementById('loading');
        if (loadingDiv) {
            if (isLoading) {
                loadingDiv.classList.add('active');
            } else {
                loadingDiv.classList.remove('active');
            }
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}