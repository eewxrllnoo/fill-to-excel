// js/controllers/MainController.js
import { ExpenseModel } from '../models/ExpenseModel.js';
import { FormView } from '../views/FormView.js';
import { TableView } from '../views/TableView.js';
import { SupabaseService } from '../services/SupabaseService.js';
import { exportToExcel } from '../../utils/excelExporter.js';

// YOUR SUPABASE CREDENTIALS - REPLACE WITH YOUR ACTUAL VALUES
const SUPABASE_URL = 'https://tatrpmfidwweefgldcix.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hqs3bgkdNpNu0GfkPa__-A_3-p-oyjO';

export class MainController {
    constructor() {
        this.model = new ExpenseModel();
        this.service = new SupabaseService(SUPABASE_URL, SUPABASE_ANON_KEY);
        this.view = new FormView('app');
        this.tableView = null;
        this.isConnected = false;
        this.recentRecords = [];
        this.currentEditId = null;
        
        this.init();
    }

    async init() {
        // Setup all callbacks
        this.view.onAddExpense = () => this.handleAddExpense();
        this.view.onRemoveExpense = (index) => this.handleRemoveExpense(index);
        this.view.onUpdateExpense = (index, field, value) => this.handleUpdateExpense(index, field, value);
        this.view.onExport = () => this.handleExport();
        this.view.onSaveToCloud = () => this.handleSaveToCloud();
        this.view.onUpdateRecord = (id) => this.handleUpdateRecord(id);
        this.view.onCancelEdit = () => this.handleCancelEdit();
        this.view.onLoadFromCloud = () => this.handleLoadFromCloud();
        this.view.onSaveLocal = () => this.handleSaveLocal();
        this.view.onLoadLocal = () => this.handleLoadLocal();
        this.view.onReset = () => this.handleReset();
        this.view.onLoadRecord = (id) => this.loadRecord(id);
        this.view.onDeleteRecord = (id) => this.handleDeleteRecord(id);
        
        // Model subscription
        this.model.addListener((formData) => {
            const totals = this.model.calculateTotals();
            this.view.render(formData, totals, this.isConnected, this.recentRecords);
            setTimeout(() => {
                for (let i = 0; i < formData.expenses.length; i++) {
                    this.view.updateRowTotal(i);
                }
                this.view.updateGrandTotal();
            }, 100);
        });
        
        // Initialize Supabase
        const result = await this.service.init();
        this.isConnected = result.success;
        
        // Load recent records
        if (this.isConnected) {
            await this.loadRecentRecords();
        }
        
        // Initial render
        const totals = this.model.calculateTotals();
        this.view.render(this.model.getFormData(), totals, this.isConnected, this.recentRecords);
        
        // Add initial empty expense
        this.model.addExpense(this.model.getEmptyExpense());
        
        if (this.isConnected) {
            this.view.showMessage('Connected to cloud storage', 'success');
        }
    }

    async loadRecentRecords() {
        const result = await this.service.getAllReports();
        if (result.success && result.data.length > 0) {
            this.recentRecords = result.data.slice(0, 5);
        }
    }

    handleAddExpense() {
        this.model.addExpense(this.model.getEmptyExpense());
        this.view.showMessage('New expense row added', 'info');
    }

    handleRemoveExpense(index) {
        if (confirm('Remove this expense entry?')) {
            const expenses = this.model.getExpenses();
            expenses.splice(index, 1);
            this.model.setExpenses(expenses);
            this.view.showMessage('Expense entry removed', 'success');
        }
    }

    handleUpdateExpense(index, field, value) {
        const expenses = this.model.getExpenses();
        if (expenses[index]) {
            expenses[index][field] = value;
            this.view.updateRowTotal(index);
            this.view.updateGrandTotal();
        }
    }

    async handleSaveToCloud() {
        const formData = this.view.getFormData();
        
        this.model.setFormData({
            fieldEngineerName: formData.fieldEngineerName,
            dateCoverageStart: formData.dateCoverageStart,
            dateCoverageEnd: formData.dateCoverageEnd,
            cluster: formData.cluster,
            dateFiled: formData.dateFiled,
            teamLead: formData.teamLead,
            expenses: this.model.getExpenses()
        });
        
        const errors = this.model.validate();
        if (errors.length > 0) {
            this.view.showMessage('Please fill in: ' + errors.join(', '), 'error');
            return;
        }

        if (!this.isConnected) {
            this.view.showMessage('Offline mode - saving to local backup', 'warning');
            this.handleSaveLocal();
            return;
        }

        this.view.setLoading(true);
        
        const reportData = {
            engineer_name: formData.fieldEngineerName,
            coverage_start: formData.dateCoverageStart,
            coverage_end: formData.dateCoverageEnd,
            cluster: formData.cluster,
            date_filed: formData.dateFiled,
            team_lead: formData.teamLead,
            expenses: this.model.getExpenses(),
            totals: this.model.calculateTotals()
        };
        
        const result = await this.service.saveReport(reportData);
        
        if (result.success) {
            this.view.showMessage('Data saved successfully!', 'success');
            await this.loadRecentRecords();
            const totals = this.model.calculateTotals();
            this.view.render(this.model.getFormData(), totals, this.isConnected, this.recentRecords);
        } else {
            this.view.showMessage('Save failed: ' + result.error, 'error');
        }
        
        this.view.setLoading(false);
    }

    async handleUpdateRecord(id) {
        console.log('Updating record with ID:', id);
        
        const formData = this.view.getFormData();
        
        // Remove updated_at - only update existing columns
        const updateData = {
            engineer_name: formData.fieldEngineerName,
            coverage_start: formData.dateCoverageStart,
            coverage_end: formData.dateCoverageEnd,
            cluster: formData.cluster,
            date_filed: formData.dateFiled,
            team_lead: formData.teamLead,
            expenses: this.model.getExpenses(),
            totals: this.model.calculateTotals()
        };
        
        const errors = this.model.validate();
        if (errors.length > 0) {
            this.view.showMessage('Please fill in: ' + errors.join(', '), 'error');
            return;
        }

        if (!this.isConnected) {
            this.view.showMessage('Offline mode - cannot update', 'error');
            return;
        }

        this.view.setLoading(true);
        
        const result = await this.service.updateReport(id, updateData);
        
        if (result.success) {
            this.view.showMessage('Report updated successfully!', 'success');
            this.currentEditId = null;
            await this.loadRecentRecords();
            const totals = this.model.calculateTotals();
            this.view.render(this.model.getFormData(), totals, this.isConnected, this.recentRecords);
        } else {
            this.view.showMessage('Update failed: ' + result.error, 'error');
        }
        
        this.view.setLoading(false);
    }

    handleCancelEdit() {
        this.currentEditId = null;
        this.model.reset();
        this.model.addExpense(this.model.getEmptyExpense());
        this.view.showMessage('Edit cancelled', 'info');
        const totals = this.model.calculateTotals();
        this.view.render(this.model.getFormData(), totals, this.isConnected, this.recentRecords);
    }

    async handleLoadFromCloud() {
        if (!this.isConnected) {
            this.view.showMessage('Offline mode - cannot load from cloud', 'error');
            return;
        }

        this.view.setLoading(true);
        const result = await this.service.getAllReports();
        
        if (result.success && result.data.length > 0) {
            this.tableView = new TableView('app');
            this.tableView.onSelectRecord = async (id) => {
                await this.loadRecord(id);
            };
            this.tableView.onClose = () => {
                this.tableView = null;
            };
            this.tableView.render(result.data);
        } else {
            this.view.showMessage('No records found', 'info');
        }
        
        this.view.setLoading(false);
    }

    async loadRecord(id) {
        console.log('Loading record with ID:', id);
        this.view.setLoading(true);
        const result = await this.service.getReportById(id);
        
        if (result.success && result.data) {
            const record = result.data;
            console.log('Record loaded:', record);
            this.currentEditId = id;
            this.model.setFormData({
                fieldEngineerName: record.engineer_name || '',
                dateCoverageStart: record.coverage_start || '',
                dateCoverageEnd: record.coverage_end || '',
                cluster: record.cluster || '',
                dateFiled: record.date_filed || new Date().toISOString().split('T')[0],
                teamLead: record.team_lead || '',
                expenses: record.expenses || []
            });
            this.model.setExpenses(record.expenses || []);
            this.view.showMessage('Report loaded for editing! Click "Update Report" to save changes.', 'success');
        } else {
            this.view.showMessage('Failed to load record: ' + (result.error || 'Unknown error'), 'error');
        }
        
        this.view.setLoading(false);
    }

    async handleDeleteRecord(id) {
        console.log('Deleting record with ID:', id);
        
        if (!this.isConnected) {
            this.view.showMessage('Offline mode - cannot delete', 'error');
            return;
        }
        
        if (!confirm('Delete this record permanently?')) return;
        
        this.view.setLoading(true);
        const result = await this.service.deleteReport(id);
        
        if (result.success) {
            this.view.showMessage('Record deleted!', 'success');
            await this.loadRecentRecords();
            const totals = this.model.calculateTotals();
            this.view.render(this.model.getFormData(), totals, this.isConnected, this.recentRecords);
        } else {
            this.view.showMessage('Delete failed: ' + result.error, 'error');
        }
        
        this.view.setLoading(false);
    }

    handleExport() {
        const formData = this.view.getFormData();
        const expenses = this.model.getExpenses();
        const totals = this.model.calculateTotals();
        
        if (expenses.length === 0) {
            this.view.showMessage('No expense entries to export!', 'error');
            return;
        }
        
        exportToExcel(formData, expenses, totals);
        this.view.showMessage('Excel report generated!', 'success');
    }

    handleSaveLocal() {
        const formData = this.view.getFormData();
        const saveData = {
            header: formData,
            expenses: this.model.getExpenses(),
            savedAt: new Date().toISOString()
        };
        localStorage.setItem('fso_nexus_backup', JSON.stringify(saveData));
        this.view.showMessage('Local backup created!', 'success');
    }

    handleLoadLocal() {
        const saved = localStorage.getItem('fso_nexus_backup');
        if (saved) {
            const data = JSON.parse(saved);
            this.model.setFormData({
                ...data.header,
                expenses: data.expenses
            });
            this.model.setExpenses(data.expenses);
            this.view.showMessage('Backup restored!', 'success');
        } else {
            this.view.showMessage('No backup found', 'error');
        }
    }

    handleReset() {
        if (confirm('Clear all unsaved data?')) {
            this.model.reset();
            this.model.addExpense(this.model.getEmptyExpense());
            this.currentEditId = null;
            this.view.showMessage('Form reset', 'info');
        }
    }
}