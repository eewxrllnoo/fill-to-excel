// js/views/FormView.js
export class FormView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.onAddExpense = null;
        this.onRemoveExpense = null;
        this.onUpdateExpense = null;
        this.onExport = null;
        this.onSaveToCloud = null;
        this.onUpdateRecord = null;
        this.onCancelEdit = null;
        this.onLoadFromCloud = null;
        this.onSaveLocal = null;
        this.onLoadLocal = null;
        this.onReset = null;
        this.onLoadRecord = null;
        this.onDeleteRecord = null;
        this.currentEditId = null;
    }

    render(formData, totals, isConnected, recentRecords = []) {
        this.container.innerHTML = `
            <div class="header">
    <div class="logo-container">
        <h1>
            Based Allowance Replenishment 
            <span class="company-name">(Company: 
                <img src="/assets/logo.png" alt="ALS" class="inline-logo" onerror="this.style.display='none'">
            )</span>
        </h1>
    </div>
</div>


            ${this.renderRecentRecords(recentRecords)}

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

            ${this.currentEditId ? `<div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 8px 16px; margin-bottom: 16px; text-align: center;">
                <i class="fas fa-edit"></i> Editing Report #${this.currentEditId} - Make your changes and click "Update Report"
            </div>` : ''}

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
                        </td>
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

            <div class="add-row-btn">
                <button type="button" id="addExpenseBtn" class="btn btn-info">+ Add Expense Entry</button>
            </div>

            <div class="action-buttons">
                <button type="button" id="exportExcelBtn" class="btn btn-success">📊 Export to Excel</button>
                ${this.currentEditId ? 
                    `<button type="button" id="updateRecordBtn" class="btn btn-primary">✏️ Update Report</button>
                     <button type="button" id="cancelEditBtn" class="btn btn-warning">❌ Cancel Edit</button>` :
                    `<button type="button" id="saveToCloudBtn" class="btn btn-primary">☁️ Save</button>`
                }
                <button type="button" id="loadFromCloudBtn" class="btn btn-info">📋 View All</button>
                <button type="button" id="saveLocalBtn" class="btn btn-warning">💾 Save Locally</button>
                <button type="button" id="loadLocalBtn" class="btn btn-info">📂 Load Local</button>
                <button type="button" id="resetBtn" class="btn btn-danger">🔄 Reset Form</button>
            </div>

            <div id="message" class="message"></div>
        `;
        
        this.attachEvents();
    }

    renderRecentRecords(records) {
        if (!records || records.length === 0) {
            return `
                <div class="recent-records-panel">
                    <div class="recent-records-header">
                        <div>
                            <i class="fas fa-database"></i>
                            <strong>Recent Saved Reports</strong>
                            <span style="font-size: 12px; color: #666;">(0 entries)</span>
                        </div>
                        <button type="button" id="refreshRecordsBtn" class="refresh-btn">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                    <div style="text-align: center; padding: 20px; color: #666;">
                        <i class="fas fa-info-circle"></i> No saved records yet. Create your first report!
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="recent-records-panel">
                <div class="recent-records-header">
                    <div>
                        <i class="fas fa-database"></i>
                        <strong>Recent Saved Reports</strong>
                        <span style="font-size: 12px; color: #666;">(Last ${records.length} entries)</span>
                    </div>
                    <button type="button" id="refreshRecordsBtn" class="refresh-btn">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
                <div class="recent-records-list">
                    ${records.map(record => `
                        <div class="record-card" data-id="${record.id}">
                            <div class="record-info">
                                <div class="record-name">
                                    <i class="fas fa-user-circle"></i> 
                                    <strong>${this.escapeHtml(record.engineer_name || 'Unknown')}</strong>
                                </div>
                                <div class="record-details">
                                    <span><i class="fas fa-calendar"></i> ${record.coverage_start || 'N/A'} → ${record.coverage_end || 'N/A'}</span>
                                    <span><i class="fas fa-map-marker-alt"></i> ${this.escapeHtml(record.cluster || 'N/A')}</span>
                                    <span><i class="fas fa-users"></i> ${this.escapeHtml(record.team_lead || 'N/A')}</span>
                                </div>
                                <div class="record-details">
                                    <span><i class="fas fa-chart-line"></i> Total: ₱ ${record.totals?.total || 0}</span>
                                    <span><i class="fas fa-clock"></i> ${record.created_at ? new Date(record.created_at).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                            <div class="record-actions">
                                <button class="record-view-btn" data-id="${record.id}">View</button>
                                <button class="record-edit-btn" data-id="${record.id}">Edit</button>
                                <button class="record-delete-btn" data-id="${record.id}">Delete</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderExpenseRows(expenses) {
        if (!expenses || expenses.length === 0) {
            return `<tr><td colspan="18" style="text-align: center; padding: 30px;">No expense entries. Click "+ Add Expense Entry" to begin.</span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span> </span>`;
        }

        return expenses.map((expense, index) => {
            const total = this.calculateRowTotal(expense);
            return `
                <tr data-row-index="${index}">
                    <td><input type="date" class="expense-input" data-field="activityDate" data-row="${index}" value="${expense.activityDate || ''}"></span></span>
                    <td><input type="text" class="expense-input" data-field="fpTicket" data-row="${index}" value="${this.escapeHtml(expense.fpTicket || '')}" placeholder="FP ticket"></span></span>
                    <td><input type="text" class="expense-input" data-field="projectName" data-row="${index}" value="${this.escapeHtml(expense.projectName || '')}" placeholder="Project name"></span></span>
                    <td><input type="text" class="expense-input" data-field="poNumber" data-row="${index}" value="${this.escapeHtml(expense.poNumber || '')}" placeholder="PO#"></span></span>
                    <td><input type="text" class="expense-input" data-field="launchPoint" data-row="${index}" value="${this.escapeHtml(expense.launchPoint || '')}" placeholder="Launch point"></span></span>
                    <td><input type="text" class="expense-input" data-field="clientAddress" data-row="${index}" value="${this.escapeHtml(expense.clientAddress || '')}" placeholder="Client address"></span></span>
                    <td><input type="number" step="0.1" class="expense-input" data-field="distance" data-row="${index}" value="${expense.distance || ''}" placeholder="0"></span></span>
                    <td><input type="number" step="0.01" class="expense-input" data-field="transpo" data-row="${index}" value="${expense.transpo || 0}" placeholder="0"></span></span>
                    <td><input type="number" step="0.01" class="expense-input" data-field="meal" data-row="${index}" value="${expense.meal || 0}" placeholder="0"></span></span>
                    <td><input type="number" step="0.01" class="expense-input" data-field="lodging" data-row="${index}" value="${expense.lodging || 0}" placeholder="0"></span></span>
                    <td><input type="number" step="0.01" class="expense-input" data-field="materials" data-row="${index}" value="${expense.materials || 0}" placeholder="0"></span></span>
                    <td><input type="number" step="0.01" class="expense-input" data-field="print" data-row="${index}" value="${expense.print || 0}" placeholder="0"></span></span>
                    <td><input type="number" step="0.01" class="expense-input" data-field="freight" data-row="${index}" value="${expense.freight || 0}" placeholder="0"></span></span>
                    <td><input type="number" step="0.01" class="expense-input" data-field="rental" data-row="${index}" value="${expense.rental || 0}" placeholder="0"></span></span>
                    <td><input type="number" step="0.01" class="expense-input" data-field="others" data-row="${index}" value="${expense.others || 0}" placeholder="0"></span></span>
                    <td class="row-total" data-row-total="${index}">₱ ${total.toFixed(2)}</span></span>
                    <td><button type="button" class="remove-expense-btn" data-row="${index}">✗ Remove</button></span></span>
                </tr>
            `;
        }).join('');
    }

    calculateRowTotal(expense) {
        const transpo = parseFloat(expense.transpo) || 0;
        const meal = parseFloat(expense.meal) || 0;
        const lodging = parseFloat(expense.lodging) || 0;
        const materials = parseFloat(expense.materials) || 0;
        const print = parseFloat(expense.print) || 0;
        const freight = parseFloat(expense.freight) || 0;
        const rental = parseFloat(expense.rental) || 0;
        const others = parseFloat(expense.others) || 0;
        
        return transpo + meal + lodging + materials + print + freight + rental + others;
    }

    updateRowTotal(rowIndex) {
        const row = document.querySelector(`tr[data-row-index="${rowIndex}"]`);
        if (!row) return;
        
        const transpoInput = row.querySelector('input[data-field="transpo"]');
        const mealInput = row.querySelector('input[data-field="meal"]');
        const lodgingInput = row.querySelector('input[data-field="lodging"]');
        const materialsInput = row.querySelector('input[data-field="materials"]');
        const printInput = row.querySelector('input[data-field="print"]');
        const freightInput = row.querySelector('input[data-field="freight"]');
        const rentalInput = row.querySelector('input[data-field="rental"]');
        const othersInput = row.querySelector('input[data-field="others"]');
        
        const transpo = parseFloat(transpoInput?.value) || 0;
        const meal = parseFloat(mealInput?.value) || 0;
        const lodging = parseFloat(lodgingInput?.value) || 0;
        const materials = parseFloat(materialsInput?.value) || 0;
        const print = parseFloat(printInput?.value) || 0;
        const freight = parseFloat(freightInput?.value) || 0;
        const rental = parseFloat(rentalInput?.value) || 0;
        const others = parseFloat(othersInput?.value) || 0;
        
        const total = transpo + meal + lodging + materials + print + freight + rental + others;
        
        const totalCell = row.querySelector('.row-total');
        if (totalCell) {
            totalCell.textContent = `₱ ${total.toFixed(2)}`;
        }
        
        return total;
    }

    updateGrandTotal() {
        let grandTotal = 0;
        const rows = document.querySelectorAll('#expenseTableBody tr');
        rows.forEach(row => {
            const totalCell = row.querySelector('.row-total');
            if (totalCell) {
                const totalText = totalCell.textContent.replace('₱', '').replace(',', '').trim();
                const total = parseFloat(totalText) || 0;
                grandTotal += total;
            }
        });
        
        const grandTotalSpan = document.getElementById('grandTotalDisplay');
        if (grandTotalSpan) {
            grandTotalSpan.innerHTML = `<strong>₱ ${grandTotal.toFixed(2)}</strong>`;
        }
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

        // Save Button (Create new)
        const saveBtn = document.getElementById('saveToCloudBtn');
        if (saveBtn) {
            saveBtn.onclick = () => {
                if (this.onSaveToCloud) this.onSaveToCloud();
            };
        }

        // Update Button (Edit existing)
        const updateBtn = document.getElementById('updateRecordBtn');
        if (updateBtn) {
            updateBtn.onclick = () => {
                console.log('Update button clicked, currentEditId:', this.currentEditId);
                if (this.onUpdateRecord && this.currentEditId) {
                    this.onUpdateRecord(this.currentEditId);
                } else {
                    console.log('onUpdateRecord not set or no currentEditId');
                }
            };
        }

        // Cancel Edit Button
        const cancelBtn = document.getElementById('cancelEditBtn');
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                this.currentEditId = null;
                if (this.onCancelEdit) {
                    this.onCancelEdit();
                }
            };
        }

        // View All Button
        const viewAllBtn = document.getElementById('loadFromCloudBtn');
        if (viewAllBtn) {
            viewAllBtn.onclick = () => {
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

        // Input events for expense fields
        const expenseInputs = document.querySelectorAll('.expense-input');
        expenseInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                e.stopPropagation();
                const rowIndex = parseInt(input.getAttribute('data-row'));
                const field = input.getAttribute('data-field');
                let value = input.value;
                
                if (input.type === 'number') {
                    value = value === '' ? 0 : parseFloat(value);
                }
                
                if (this.onUpdateExpense) {
                    this.onUpdateExpense(rowIndex, field, value);
                }
                
                this.updateRowTotal(rowIndex);
                this.updateGrandTotal();
            });
        });

        // Remove expense buttons
        const removeButtons = document.querySelectorAll('.remove-expense-btn');
        removeButtons.forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const rowIndex = parseInt(btn.getAttribute('data-row'));
                if (!isNaN(rowIndex) && this.onRemoveExpense) {
                    this.onRemoveExpense(rowIndex);
                }
            };
        });

        // Record View buttons
        const viewBtns = document.querySelectorAll('.record-view-btn');
        viewBtns.forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                if (id && this.onLoadRecord) {
                    this.onLoadRecord(id);
                }
            };
        });

        // Record Edit buttons
        const editBtns = document.querySelectorAll('.record-edit-btn');
        editBtns.forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                if (id && this.onLoadRecord) {
                    this.currentEditId = id;
                    this.onLoadRecord(id);
                }
            };
        });

        // Record Delete buttons
        const deleteBtns = document.querySelectorAll('.record-delete-btn');
        deleteBtns.forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                if (id && this.onDeleteRecord) {
                    this.onDeleteRecord(id);
                }
            };
        });

        // Refresh button
        const refreshBtn = document.getElementById('refreshRecordsBtn');
        if (refreshBtn) {
            refreshBtn.onclick = () => {
                if (this.onLoadFromCloud) {
                    this.onLoadFromCloud();
                }
            };
        }
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