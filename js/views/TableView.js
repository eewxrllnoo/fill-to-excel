// View - Handles records modal
export class TableView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.onSelectRecord = null;
        this.onClose = null;
    }

    render(records) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-history"></i> Cloud Archive</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="records-list">
                    ${this.renderRecords(records)}
                </div>
            </div>
        `;
        
        this.container.appendChild(modal);
        
        modal.querySelector('.close-modal')?.addEventListener('click', () => {
            modal.remove();
            this.onClose?.();
        });
        
        modal.querySelectorAll('.record-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                this.onSelectRecord?.(id);
                modal.remove();
            });
        });
    }

    renderRecords(records) {
        if (!records || records.length === 0) {
            return '<div style="text-align: center; padding: 40px;">No records found</div>';
        }
        
        return records.map(record => `
            <div class="record-item" data-id="${record.id}">
                <strong><i class="fas fa-user"></i> ${this.escapeHtml(record.engineer_name)}</strong><br>
                <i class="fas fa-calendar"></i> ${record.coverage_start} → ${record.coverage_end}<br>
                <i class="fas fa-network-wired"></i> ${this.escapeHtml(record.cluster)} | <i class="fas fa-users"></i> ${this.escapeHtml(record.team_lead)}<br>
                <i class="fas fa-chart-line"></i> ₱ ${record.totals?.total || 0} | <i class="fas fa-clock"></i> ${new Date(record.created_at).toLocaleDateString()}
            </div>
        `).join('');
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}