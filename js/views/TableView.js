// View - Handles historical records display and management
export class TableView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.onViewReport = null;
        this.onDeleteReport = null;
        this.onExportReport = null;
        this.onFilterChange = null;
        this.currentData = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
    }

    render(data, stats) {
        this.currentData = data;
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedData = data.slice(startIndex, endIndex);
        const totalPages = Math.ceil(data.length / this.itemsPerPage);

        this.container.innerHTML = `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2>📋 Historical FSO Reports</h2>
                    <button id="closeTableViewBtn" class="btn btn-danger" style="background: #fc8181;">✖ Close</button>
                </div>
                
                ${this.renderStats(stats)}
                
                <div class="filter-bar">
                    <input type="text" id="tableFilterInput" placeholder="🔍 Filter by engineer name, cluster, or team lead..." autocomplete="off">
                    <select id="filterCluster">
                        <option value="">All Clusters</option>
                        ${this.renderClusterOptions(data)}
                    </select>
                    <input type="date" id="filterDateFrom" placeholder="From Date">
                    <input type="date" id="filterDateTo" placeholder="To Date">
                </div>
                
                <div class="table-container">
                    <table id="historyTable">
                        <thead>
                            <tr>
                                <th data-field="id" class="sortable">ID</th>
                                <th data-field="field_engineer_name" class="sortable">Engineer Name</th>
                                <th data-field="cluster" class="sortable">Cluster</th>
                                <th data-field="team_lead" class="sortable">Team Lead</th>
                                <th data-field="date_coverage_start" class="sortable">Coverage Start</th>
                                <th data-field="date_coverage_end" class="sortable">Coverage End</th>
                                <th data-field="date_filed" class="sortable">Date Filed</th>
                                <th data-field="total_amount" class="sortable">Total Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="historyTableBody">
                            ${this.renderTableBody(paginatedData)}
                        </tbody>
                    </table>
                </div>
                
                ${this.renderPagination(totalPages)}
                
                <div class="action-buttons" style="margin-top: 20px;">
                    <button id="exportAllBtn" class="btn btn-secondary">📊 Export All to Excel</button>
                    <button id="refreshTableBtn" class="btn btn-info">🔄 Refresh</button>
                </div>
            </div>
        `;
        
        this.attachEvents(totalPages);
    }

    renderStats(stats) {
        return `
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-value">${stats.total}</div>
                    <div class="stat-label">Total Reports</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.totalAmount.toFixed(2)}</div>
                    <div class="stat-label">Total Amount (₱)</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.uniqueEngineers}</div>
                    <div class="stat-label">Unique Engineers</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.uniqueClusters}</div>
                    <div class="stat-label">Clusters</div>
                </div>
            </div>
        `;
    }

    renderTableBody(data) {
        if (!data || data.length === 0) {
            return '<tr><td colspan="9" style="text-align: center;">No reports found</td></tr>';
        }
        
        return data.map(report => {
            const totalAmount = report.totals?.total || this.calculateTotalFromExpenses(report.expenses);
            return `
                <tr data-id="${report.id}">
                    <td>${this.escapeHtml(report.id)}</td>
                    <td><strong>${this.escapeHtml(report.field_engineer_name)}</strong></td>
                    <td>${this.escapeHtml(report.cluster)}</td>
                    <td>${this.escapeHtml(report.team_lead)}</td>
                    <td>${this.formatDate(report.date_coverage_start)}</td>
                    <td>${this.formatDate(report.date_coverage_end)}</td>
                    <td>${this.formatDate(report.date_filed)}</td>
                    <td class="amount">₱ ${totalAmount.toFixed(2)}</td>
                    <td class="action-buttons-cell">
                        <button class="view-report-btn btn-small" data-id="${report.id}" title="View Report">👁️ View</button>
                        <button class="export-report-btn btn-small" data-id="${report.id}" title="Export to Excel">📊 Export</button>
                        <button class="delete-report-btn btn-small" data-id="${report.id}" title="Delete Report">🗑️ Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderPagination(totalPages) {
        if (totalPages <= 1) return '';
        
        let paginationHtml = '<div class="pagination">';
        
        // Previous button
        paginationHtml += `
            <button class="page-btn" data-page="prev" ${this.currentPage === 1 ? 'disabled' : ''}>
                ◀ Previous
            </button>
        `;
        
        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        if (startPage > 1) {
            paginationHtml += `<button class="page-btn" data-page="1">1</button>`;
            if (startPage > 2) paginationHtml += `<span class="page-dots">...</span>`;
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `
                <button class="page-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) paginationHtml += `<span class="page-dots">...</span>`;
            paginationHtml += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
        }
        
        // Next button
        paginationHtml += `
            <button class="page-btn" data-page="next" ${this.currentPage === totalPages ? 'disabled' : ''}>
                Next ▶
            </button>
        `;
        
        paginationHtml += '</div>';
        
        return paginationHtml;
    }

    renderClusterOptions(data) {
        const clusters = [...new Set(data.map(r => r.cluster).filter(c => c))];
        return clusters.map(cluster => 
            `<option value="${this.escapeHtml(cluster)}">${this.escapeHtml(cluster)}</option>`
        ).join('');
    }

    attachEvents(totalPages) {
        // Close button
        const closeBtn = document.getElementById('closeTableViewBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (this.onClose) this.onClose();
            });
        }
        
        // Filter input
        const filterInput = document.getElementById('tableFilterInput');
        if (filterInput && this.onFilterChange) {
            filterInput.addEventListener('input', (e) => {
                this.currentPage = 1;
                this.onFilterChange({
                    search: e.target.value,
                    cluster: document.getElementById('filterCluster')?.value || '',
                    dateFrom: document.getElementById('filterDateFrom')?.value || '',
                    dateTo: document.getElementById('filterDateTo')?.value || ''
                });
            });
        }
        
        // Cluster filter
        const clusterFilter = document.getElementById('filterCluster');
        if (clusterFilter && this.onFilterChange) {
            clusterFilter.addEventListener('change', (e) => {
                this.currentPage = 1;
                this.onFilterChange({
                    search: document.getElementById('tableFilterInput')?.value || '',
                    cluster: e.target.value,
                    dateFrom: document.getElementById('filterDateFrom')?.value || '',
                    dateTo: document.getElementById('filterDateTo')?.value || ''
                });
            });
        }
        
        // Date filters
        const dateFrom = document.getElementById('filterDateFrom');
        const dateTo = document.getElementById('filterDateTo');
        if (dateFrom && this.onFilterChange) {
            dateFrom.addEventListener('change', () => {
                this.currentPage = 1;
                this.onFilterChange({
                    search: document.getElementById('tableFilterInput')?.value || '',
                    cluster: document.getElementById('filterCluster')?.value || '',
                    dateFrom: dateFrom.value,
                    dateTo: dateTo?.value || ''
                });
            });
        }
        
        if (dateTo && this.onFilterChange) {
            dateTo.addEventListener('change', () => {
                this.currentPage = 1;
                this.onFilterChange({
                    search: document.getElementById('tableFilterInput')?.value || '',
                    cluster: document.getElementById('filterCluster')?.value || '',
                    dateFrom: dateFrom?.value || '',
                    dateTo: dateTo.value
                });
            });
        }
        
        // Sort functionality
        const sortHeaders = document.querySelectorAll('.sortable');
        sortHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                const field = header.dataset.field;
                if (field && this.onSort) {
                    this.onSort(field);
                }
            });
        });
        
        // Pagination
        const pageButtons = document.querySelectorAll('.page-btn');
        pageButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                if (page === 'prev' && this.currentPage > 1) {
                    this.currentPage--;
                    if (this.onPageChange) this.onPageChange(this.currentPage);
                } else if (page === 'next' && this.currentPage < totalPages) {
                    this.currentPage++;
                    if (this.onPageChange) this.onPageChange(this.currentPage);
                } else if (page !== 'prev' && page !== 'next') {
                    this.currentPage = parseInt(page);
                    if (this.onPageChange) this.onPageChange(this.currentPage);
                }
            });
        });
        
        // Action buttons
        document.querySelectorAll('.view-report-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                const report = this.currentData.find(r => r.id === id);
                if (report && this.onViewReport) {
                    this.onViewReport(report);
                }
            });
        });
        
        document.querySelectorAll('.export-report-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                const report = this.currentData.find(r => r.id === id);
                if (report && this.onExportReport) {
                    this.onExportReport(report);
                }
            });
        });
        
        document.querySelectorAll('.delete-report-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                if (confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
                    if (this.onDeleteReport) {
                        this.onDeleteReport(id);
                    }
                }
            });
        });
        
        // Export all button
        const exportAllBtn = document.getElementById('exportAllBtn');
        if (exportAllBtn && this.onExportAll) {
            exportAllBtn.addEventListener('click', () => {
                if (this.onExportAll) this.onExportAll(this.currentData);
            });
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshTableBtn');
        if (refreshBtn && this.onRefresh) {
            refreshBtn.addEventListener('click', () => {
                if (this.onRefresh) this.onRefresh();
            });
        }
    }

    calculateTotalFromExpenses(expenses) {
        if (!expenses || !Array.isArray(expenses)) return 0;
        
        return expenses.reduce((total, expense) => {
            return total + 
                (parseFloat(expense.transpo) || 0) +
                (parseFloat(expense.meal) || 0) +
                (parseFloat(expense.lodging) || 0) +
                (parseFloat(expense.materials) || 0) +
                (parseFloat(expense.print) || 0) +
                (parseFloat(expense.freight) || 0) +
                (parseFloat(expense.rental) || 0) +
                (parseFloat(expense.others) || 0);
        }, 0);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading(show) {
        const tableBody = document.getElementById('historyTableBody');
        if (tableBody && show) {
            tableBody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Loading...</td></tr>';
        }
    }

    setPage(page) {
        this.currentPage = page;
    }

    resetPage() {
        this.currentPage = 1;
    }
}