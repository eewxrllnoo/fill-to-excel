// js/views/FormView.js
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
                <h1>BASED ALLOWANCE REPLENISHMENT (FSO)</h1>
                <div class="status-badge ${isConnected ? 'status-connected' : 'status-disconnected'}">
                    ${isConnected ? 'Online ●' : '○ Offline Mode'}
                </div>
            </div>

            <!-- Header Info Section -->
            <div class="info-section">
                <div class="info-row">
                    <div class="info-label">Field Engineers Name:</div>
                    <div class="info-value">
                        <input type="text" id="fieldEngineerName" value="${this.escapeHtml(formData.fieldEngineerName)}" placeholder="Enter name">
                    </div>
                    <div class="info-label">Date Coverage:</div>
                    <div class="info-value">
                        <div class="date-range">
                            <input type="date" id="dateCoverageStart" value="${formData.dateCoverageStart}">
                            <span>to</span>
                            <input type="date" id="dateCoverageEnd" value="${formData.dateCoverageEnd}">
                        </div>
                    </div>
                    <div class="rev-text">rev. 1.0 10.07.2024</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Cluster:</div>
                    <div class="info-value">
                        <input type="text" id="cluster" value="${this.escapeHtml(formData.cluster)}" placeholder="Enter cluster">
                    </div>
                    <div class="info-label">Date Filed:</div>
                    <div class="info-value">
                        <input type="date" id="dateFiled" value="${formData.dateFiled}">
                    </div>
                    <div class="rev-text"></div>
                </div>
                <div class="info-row">
                    <div class="info-label">Team Lead:</div>
                    <div class="info-value">
                        <input type="text" id="teamLead" value="${this.escapeHtml(formData.teamLead)}" placeholder="Enter team lead">
                    </div>
                    <div class="info-label"></div>
                    <div class="info-value"></div>
                    <div class="rev-text"></div>
                </div>
            </div>

            <!-- Data Table -->
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Activity Date</th>
                            <th>FP ticket</th>
                            <th>Project Name</th>
                            <th>PO#</th>
                            <th>Launch Point</th>
                            <th>Client Address</th>
                            <th>Distance (KM)</th>
                            <th>Transpo</th>
                            <th>Meal</th>
                            <th>Lodging</th>
                            <th>Materials</th>
                            <th>Print</th>
                            <th>Freight</th>
                            <th>Rental</th>
                            <th>Others</th>
                            <th>Total</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody id="expenseTableBody">
                        ${this.renderExpenseRows(formData.expenses)}
                    </tbody>
                    <tfoot>
                        <tr class="grand-total-row">
                            <td colspan="16" style="text-align: right;"><strong>Grand Total</strong></td>
                            <td id="grandTotalDisplay"><strong>₱ ${totals.total.toFixed(2)}</strong></td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <!-- Add Row Button -->
            <div class="add-row-btn">
                <button type="button" id="addExpenseBtn" class="btn btn-info">+ Add Expense Entry</button>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
                <button type="button" id="exportExcelBtn" class="btn btn-success">📊 Export to Excel</button>
                <button type="button" id="saveToCloudBtn" class="btn btn-primary">☁️ Save to Cloud</button>
                <button type="button" id="loadFromCloudBtn" class="btn btn-info">📋 Load from Cloud</button>
                <button type="button" id="saveLocalBtn" class="btn btn-warning">💾 Save Locally</button>
                <button type="button" id="loadLocalBtn" class="btn btn-info">📂 Load Local</button>
                <button type="button" id="resetBtn" class="btn btn-danger">🔄 Reset Form</button>
            </div>

            <div id="message" class="message"></div>
        `;
        
        this.attachEvents();
        this.attachExpenseEvents();
    }

    renderExpenseRows(expenses) {
        if (!expenses || expenses.length === 0) {
            return `<tr><td colspan="18" style="text-align: center; padding: 30px;">No expense entries. Click "+ Add Expense Entry" to begin.</td></tr>`;
        }

        return expenses.map((expense, index) => {
            const total = this.calculateRowTotal(expense);
            return `
                <tr data-row-index="${index}">
                    <td><input type="date" class="expense-input" data-field="activityDate" data-index="${index}" value="${expense.activityDate || ''}"></td>
                    <td><input type="text" class="expense-input" data-field="fpTicket" data-index="${index}" value="${this.escapeHtml(expense.fpTicket || '')}" placeholder="FP ticket"></td>
                    <td><input type="text" class="expense-input" data-field="projectName" data-index="${index}" value="${this.escapeHtml(expense.projectName || '')}" placeholder="Project name"></td>
                    <td><input type="text" class="expense-input" data-field="poNumber" data-index="${index}" value="${this.escapeHtml(expense.poNumber || '')}" placeholder="PO#"></td>
                    <td><input type="text" class="expense-input" data-field="launchPoint" data-index="${index}" value="${this.escapeHtml(expense.launchPoint || '')}" placeholder="Launch point"></td>
                    <td><input type="text" class="expense-input" data-field="clientAddress" data-index="${index}" value="${this.escapeHtml(expense.clientAddress || '')}" placeholder="Client address"></td>
                    <td><input type="number" step="0.1" class="expense-input" data-field="distance" data-index="${index}" value="${expense.distance || ''}" placeholder="0"></td>
                    <td><input type="number" step="0.01" class="expense-input" data-field="transpo" data-index="${index}" value="${expense.transpo || 0}" placeholder="0"></td>
                    <td><input type="number" step="0.01" class="expense-input" data-field="meal" data-index="${index}" value="${expense.meal || 0}" placeholder="0"></td>
                    <td><input type="number" step="0.01" class="expense-input" data-field="lodging" data-index="${index}" value="${expense.lodging || 0}" placeholder="0"></td>
                    <td><input type="number" step="0.01" class="expense-input" data-field="materials" data-index="${index}" value="${expense.materials || 0}" placeholder="0"></td>
                    <td><input type="number" step="0.01" class="expense-input" data-field="print" data-index="${index}" value="${expense.print || 0}" placeholder="0"></td>
                    <td><input type="number" step="0.01" class="expense-input" data-field="freight" data-index="${index}" value="${expense.freight || 0}" placeholder="0"></td>
                    <td><input type="number" step="0.01" class="expense-input" data-field="rental" data-index="${index}" value="${expense.rental || 0}" placeholder="0"></td>
                    <td><input type="number" step="0.01" class="expense-input" data-field="others" data-index="${index}" value="${expense.others || 0}" placeholder="0"></td>
                    <td class="row-total" data-row-total="${index}">₱ ${total.toFixed(2)}</td>
                    <td><button type="button" class="remove-expense-btn" data-index="${index}">✗ Remove</button></td>
                </tr>
            `;
        }).join('');
    }

    calculateRowTotal(expense) {
        return (parseFloat(expense.transpo) || 0) + 
               (parseFloat(expense.meal) || 0) + 
               (parseFloat(expense.lodging) || 0) + 
               (parseFloat(expense.materials) || 0) + 
               (parseFloat(expense.print) || 0) + 
               (parseFloat(expense.freight) || 0) + 
               (parseFloat(expense.rental) || 0) + 
               (parseFloat(expense.others) || 0);
    }

    updateRowTotalDisplay(index, total) {
        const rowTotalCell = document.querySelector(`.row-total[data-row-total="${index}"]`);
        if (rowTotalCell) {
            rowTotalCell.textContent = `₱ ${total.toFixed(2)}`;
        }
    }

    updateGrandTotalDisplay(total) {
        const grandTotalSpan = document.getElementById('grandTotalDisplay');
        if (grandTotalSpan) {
            grandTotalSpan.innerHTML = `<strong>₱ ${total.toFixed(2)}</strong>`;
        }
    }

    attachExpenseEvents() {
        // Use event delegation for input events
        this.container.addEventListener('input', (e) => {
            const target = e.target;
            if (target.classList && target.classList.contains('expense-input')) {
                const index = parseInt(target.getAttribute('data-index'));
                const field = target.getAttribute('data-field');
                let value = target.value;
                
                // Convert numeric values
                if (target.type === 'number') {
                    value = value === '' ? 0 : parseFloat(value);
                }
                
                if (this.onUpdateExpense) {
                    this.onUpdateExpense(index, field, value);
                }
            }
        });
    }

    attachEvents() {
        // Add Expense Button
        const addBtn = document.getElementById('addExpenseBtn');
        if (addBtn) {
            addBtn.onclick = () => {
                if (this.onAddExpense) this.onAddExpense();
            };
        }

        // Export Button
        const exportBtn = document.getElementById('exportExcelBtn');
        if (exportBtn) {
            exportBtn.onclick = () => {
                if (this.onExport) this.onExport();
            };
        }

        // Save to Cloud Button
        const saveCloudBtn = document.getElementById('saveToCloudBtn');
        if (saveCloudBtn) {
            saveCloudBtn.onclick = () => {
                if (this.onSaveToCloud) this.onSaveToCloud();
            };
        }

        // Load from Cloud Button
        const loadCloudBtn = document.getElementById('loadFromCloudBtn');
        if (loadCloudBtn) {
            loadCloudBtn.onclick = () => {
                if (this.onLoadFromCloud) this.onLoadFromCloud();
            };
        }

        // Save Local Button
        const saveLocalBtn = document.getElementById('saveLocalBtn');
        if (saveLocalBtn) {
            saveLocalBtn.onclick = () => {
                if (this.onSaveLocal) this.onSaveLocal();
            };
        }

        // Load Local Button
        const loadLocalBtn = document.getElementById('loadLocalBtn');
        if (loadLocalBtn) {
            loadLocalBtn.onclick = () => {
                if (this.onLoadLocal) this.onLoadLocal();
            };
        }

        // Reset Button
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.onclick = () => {
                if (this.onReset) this.onReset();
            };
        }

        // Remove expense buttons - event delegation
        this.container.addEventListener('click', (e) => {
            const btn = e.target.closest('.remove-expense-btn');
            if (btn) {
                const index = parseInt(btn.getAttribute('data-index'));
                if (this.onRemoveExpense) {
                    this.onRemoveExpense(index);
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
        const msgDiv = document.getElementById('message');
        if (msgDiv) {
            msgDiv.innerHTML = text;
            msgDiv.className = `message ${type}`;
            setTimeout(() => {
                msgDiv.className = 'message';
            }, 3000);
        }
    }

    setLoading(show) {
        const loadingDiv = document.getElementById('loading');
        if (loadingDiv) {
            if (show) {
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