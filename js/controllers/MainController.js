// js/controllers/MainController.js
import { ExpenseModel } from '../models/ExpenseModel.js';
import { FormView } from '../views/FormView.js';
import { TableView } from '../views/TableView.js';
import { SupabaseService } from '../services/SupabaseService.js';
import { exportToExcel } from '../utils/excelExporter.js';

// YOUR SUPABASE CREDENTIALS - REPLACE WITH YOUR ACTUAL VALUES
const SUPABASE_URL = 'https://tatrpnfidwweefgldcix.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publisbable_hqsbgkdnPnNu8GfkPa_A_3-p-o_';

export class MainController {
    constructor() {
        this.model = new ExpenseModel();
        this.service = new SupabaseService(SUPABASE_URL, SUPABASE_ANON_KEY);
        this.view = new FormView('app');
        this.tableView = null;
        this.isConnected = false;
        this.skipNextRender = false;
        
        this.init();
    }

    async init() {
        // Setup callbacks
        this.view.onAddExpense = () => this.handleAddExpense();
        this.view.onRemoveExpense = (index) => this.handleRemoveExpense(index);
        this.view.onUpdateExpense = (index, field, value) => this.handleUpdateExpense(index, field, value);
        this.view.onExport = () => this.handleExport();
        this.view.onSaveToCloud = () => this.handleSaveToCloud();
        this.view.onLoadFromCloud = () => this.handleLoadFromCloud();
        this.view.onSaveLocal = () => this.handleSaveLocal();
        this.view.onLoadLocal = () => this.handleLoadLocal();
        this.view.onReset = () => this.handleReset();
        
        // Model subscription - updates view when data changes
        this.model.addListener((formData) => {
            if (this.skipNextRender) {
                this.skipNextRender = false;
                return;
            }
            const totals = this.model.calculateTotals();
            this.view.render(formData, totals, this.isConnected);
        });
        
        // Initialize Supabase
        const result = await this.service.init();
        this.isConnected = result.success;
        
        // Initial render
        const totals = this.model.calculateTotals();
        this.view.render(this.model.getFormData(), totals, this.isConnected);
        
        // Add initial empty expense
        this.model.addExpense(this.model.getEmptyExpense());
        
        if (this.isConnected) {
            this.view.showMessage('Connected to secure cloud storage', 'success');
        } else {
            this.view.showMessage('Offline mode - using local storage', 'info');
        }
    }

    handleAddExpense() {
        this.model.addExpense(this.model.getEmptyExpense());
        this.view.showMessage('New expense row added', 'info');
    }

    handleRemoveExpense(index) {
        if (confirm('Remove this expense entry?')) {
            this.model.removeExpense(index);
            // Force re-render to update the table
            const formData = this.model.getFormData();
            const totals = this.model.calculateTotals();
            this.view.render(formData, totals, this.isConnected);
            this.view.showMessage('Expense entry removed', 'info');
        }
    }

    handleUpdateExpense(index, field, value) {
        // Directly update the expense in the model
        const expenses = this.model.getExpenses();
        if (expenses[index]) {
            expenses[index][field] = value;
            
            // Update the row total display
            const rowTotal = this.calculateRowTotal(expenses[index]);
            if (this.view && this.view.updateRowTotal) {
                this.view.updateRowTotal(index, rowTotal);
            }
            
            // Update grand total
            const grandTotal = this.calculateGrandTotal(expenses);
            if (this.view && this.view.updateGrandTotal) {
                this.view.updateGrandTotal(grandTotal);
            }
        }
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

    calculateGrandTotal(expenses) {
        let total = 0;
        expenses.forEach(expense => {
            total += this.calculateRowTotal(expense);
        });
        return total;
    }

    async handleSaveToCloud() {
        const errors = this.model.validate();
        if (errors.length > 0) {
            this.view.showMessage('Validation Error: ' + errors.join(', '), 'error');
            return;
        }

        if (!this.isConnected) {
            this.view.showMessage('Offline mode - saving to local backup', 'warning');
            this.handleSaveLocal();
            return;
        }

        this.view.setLoading(true);
        
        const formData = this.view.getFormData();
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
            this.view.showMessage('Data synced to cloud successfully!', 'success');
        } else {
            this.view.showMessage('Sync failed: ' + result.error, 'error');
            this.handleSaveLocal();
        }
        
        this.view.setLoading(false);
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
        } else if (result.success && result.data.length === 0) {
            this.view.showMessage('No records found in cloud', 'info');
        } else {
            this.view.showMessage('Failed to load: ' + result.error, 'error');
        }
        
        this.view.setLoading(false);
    }

    async loadRecord(id) {
        this.view.setLoading(true);
        const result = await this.service.getReportById(id);
        
        if (result.success && result.data) {
            const record = result.data;
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
            this.view.showMessage('Report loaded successfully!', 'success');
        } else {
            this.view.showMessage('Failed to load record', 'error');
        }
        
        this.view.setLoading(false);
    }

    handleExport() {
        const formData = this.view.getFormData();
        const expenses = this.model.getExpenses();
        const totals = this.model.calculateTotals();
        
        if (expenses.length === 0 || (expenses.length === 1 && !expenses[0].projectName && !expenses[0].activityDate)) {
            this.view.showMessage('No expense entries to export!', 'error');
            return;
        }
        
        exportToExcel(formData, expenses, totals);
        this.view.showMessage('Excel report generated successfully!', 'success');
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
            this.view.showMessage('Backup restored successfully!', 'success');
        } else {
            this.view.showMessage('No backup found', 'error');
        }
    }

    handleReset() {
        if (confirm('⚠️ This will clear all unsaved data. Continue?')) {
            this.model.reset();
            this.model.addExpense(this.model.getEmptyExpense());
            this.view.showMessage('Form has been reset', 'info');
        }
    }
}