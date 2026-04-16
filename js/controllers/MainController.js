// Controller - Coordinates everything including TableView
import { ExpenseModel } from '../models/ExpenseModel.js';
import { FormView } from '../views/FormView.js';
import { TableView } from '../views/TableView.js';
import { SupabaseService } from '../services/SupabaseService.js';
import { exportToExcel, exportMultipleToExcel } from '../utils/excelExporter.js';

export class MainController {
    constructor(supabaseUrl, supabaseKey) {
        this.model = new ExpenseModel();
        this.service = new SupabaseService(supabaseUrl, supabaseKey);
        this.view = new FormView('app');
        this.tableView = null;
        this.allReports = [];
        this.currentFilter = {
            search: '',
            cluster: '',
            dateFrom: '',
            dateTo: ''
        };
        this.currentSort = {
            field: 'created_at',
            direction: 'desc'
        };
        
        this.init();
    }

    init() {
        // Set up form view callbacks
        this.view.onAddExpense = this.handleAddExpense.bind(this);
        this.view.onRemoveExpense = this.handleRemoveExpense.bind(this);
        this.view.onUpdateExpense = this.handleUpdateExpense.bind(this);
        this.view.onExport = this.handleExport.bind(this);
        this.view.onSaveToDb = this.handleSaveToDb.bind(this);
        this.view.onLoadRecords = this.showTableView.bind(this);
        this.view.onReset = this.handleReset.bind(this);
        
        // Subscribe to model changes
        this.model.addListener(this.updateView.bind(this));
        
        // Initial render
        this.updateView(this.model.getFormData());
    }

    async showTableView() {
        // Load all reports first
        await this.loadAllReports();
        
        // Create table view if it doesn't exist
        if (!this.tableView) {
            // Create a temporary container for the table view
            let tableContainer = document.getElementById('tableViewContainer');
            if (!tableContainer) {
                tableContainer = document.createElement('div');
                tableContainer.id = 'tableViewContainer';
                document.getElementById('app').appendChild(tableContainer);
            }
            
            this.tableView = new TableView('tableViewContainer');
            
            // Set up table view callbacks
            this.tableView.onClose = this.hideTableView.bind(this);
            this.tableView.onViewReport = this.handleViewReport.bind(this);
            this.tableView.onDeleteReport = this.handleDeleteReport.bind(this);
            this.tableView.onExportReport = this.handleExportSingleReport.bind(this);
            this.tableView.onExportAll = this.handleExportAllReports.bind(this);
            this.tableView.onFilterChange = this.handleTableFilter.bind(this);
            this.tableView.onSort = this.handleTableSort.bind(this);
            this.tableView.onPageChange = this.handleTablePageChange.bind(this);
            this.tableView.onRefresh = this.handleTableRefresh.bind(this);
        }
        
        // Filter and sort data
        const filteredData = this.filterReports(this.allReports);
        const sortedData = this.sortReports(filteredData);
        const stats = this.calculateTableStats(sortedData);
        
        // Render table view
        this.tableView.render(sortedData, stats);
        
        // Hide form view and show table view
        document.querySelector('.header').style.display = 'none';
        document.querySelector('.card:first-of-type').style.display = 'none';
        document.getElementById('tableViewContainer').style.display = 'block';
    }

    hideTableView() {
        // Hide table view and show form view
        if (this.tableView) {
            document.getElementById('tableViewContainer').style.display = 'none';
        }
        document.querySelector('.header').style.display = 'block';
        document.querySelector('.card:first-of-type').style.display = 'block';
    }

    async loadAllReports() {
        this.view.setLoading(true);
        const result = await this.service.getAllReports();
        if (result.success) {
            this.allReports = result.data;
        } else {
            this.view.showMessage('Error loading reports: ' + result.error, 'error');
            this.allReports = [];
        }
        this.view.setLoading(false);
    }

    filterReports(reports) {
        return reports.filter(report => {
            // Search filter
            if (this.currentFilter.search) {
                const searchLower = this.currentFilter.search.toLowerCase();
                const matchesSearch = 
                    report.field_engineer_name?.toLowerCase().includes(searchLower) ||
                    report.cluster?.toLowerCase().includes(searchLower) ||
                    report.team_lead?.toLowerCase().includes(searchLower);
                if (!matchesSearch) return false;
            }
            
            // Cluster filter
            if (this.currentFilter.cluster && report.cluster !== this.currentFilter.cluster) {
                return false;
            }
            
            // Date range filter
            if (this.currentFilter.dateFrom) {
                const reportDate = new Date(report.date_coverage_start);
                const fromDate = new Date(this.currentFilter.dateFrom);
                if (reportDate < fromDate) return false;
            }
            
            if (this.currentFilter.dateTo) {
                const reportDate = new Date(report.date_coverage_end);
                const toDate = new Date(this.currentFilter.dateTo);
                if (reportDate > toDate) return false;
            }
            
            return true;
        });
    }

    sortReports(reports) {
        return [...reports].sort((a, b) => {
            let aVal = a[this.currentSort.field];
            let bVal = b[this.currentSort.field];
            
            // Handle special cases
            if (this.currentSort.field === 'total_amount') {
                aVal = a.totals?.total || this.calculateTotalFromExpenses(a.expenses);
                bVal = b.totals?.total || this.calculateTotalFromExpenses(b.expenses);
            } else if (this.currentSort.field === 'date_coverage_start' || 
                       this.currentSort.field === 'date_coverage_end' || 
                       this.currentSort.field === 'date_filed') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }
            
            if (aVal < bVal) return this.currentSort.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    calculateTableStats(reports) {
        const totalAmount = reports.reduce((sum, report) => {
            return sum + (report.totals?.total || this.calculateTotalFromExpenses(report.expenses));
        }, 0);
        
        const uniqueEngineers = new Set(reports.map(r => r.field_engineer_name)).size;
        const uniqueClusters = new Set(reports.map(r => r.cluster)).size;
        
        return {
            total: reports.length,
            totalAmount: totalAmount,
            uniqueEngineers: uniqueEngineers,
            uniqueClusters: uniqueClusters
        };
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

    handleViewReport(report) {
        // Load the selected report into the form
        this.model.setFormData({
            fieldEngineerName: report.field_engineer_name,
            dateCoverageStart: report.date_coverage_start,
            dateCoverageEnd: report.date_coverage_end,
            cluster: report.cluster,
            dateFiled: report.date_filed,
            teamLead: report.team_lead,
            expenses: report.expenses
        });
        
        this.view.showMessage(`Loaded report for ${report.field_engineer_name}`, 'success');
        this.hideTableView();
    }

    async handleDeleteReport(id) {
        this.view.setLoading(true);
        const result = await this.service.deleteReport(id);
        
        if (result.success) {
            this.view.showMessage('Report deleted successfully!', 'success');
            await this.loadAllReports();
            
            // Refresh table view if open
            if (this.tableView && document.getElementById('tableViewContainer').style.display === 'block') {
                const filteredData = this.filterReports(this.allReports);
                const sortedData = this.sortReports(filteredData);
                const stats = this.calculateTableStats(sortedData);
                this.tableView.render(sortedData, stats);
            }
        } else {
            this.view.showMessage('Error deleting report: ' + result.error, 'error');
        }
        
        this.view.setLoading(false);
    }

    handleExportSingleReport(report) {
        const formData = {
            fieldEngineerName: report.field_engineer_name,
            dateCoverageStart: report.date_coverage_start,
            dateCoverageEnd: report.date_coverage_end,
            cluster: report.cluster,
            dateFiled: report.date_filed,
            teamLead: report.team_lead
        };
        
        const totals = {
            transpo: report.totals?.transpo || 0,
            meal: report.totals?.meal || 0,
            lodging: report.totals?.lodging || 0,
            materials: report.totals?.materials || 0,
            print: report.totals?.print || 0,
            freight: report.totals?.freight || 0,
            rental: report.totals?.rental || 0,
            others: report.totals?.others || 0,
            total: report.totals?.total || this.calculateTotalFromExpenses(report.expenses)
        };
        
        exportToExcel(formData, report.expenses, totals);
        this.view.showMessage(`Exported report for ${report.field_engineer_name}`, 'success');
    }

    handleExportAllReports(reports) {
        if (!reports || reports.length === 0) {
            this.view.showMessage('No reports to export!', 'error');
            return;
        }
        
        // Export all reports to a single Excel file with multiple sheets
        exportMultipleToExcel(reports);
        this.view.showMessage(`Exported ${reports.length} reports to Excel!`, 'success');
    }

    handleTableFilter(filters) {
        this.currentFilter = filters;
        this.tableView.resetPage();
        
        const filteredData = this.filterReports(this.allReports);
        const sortedData = this.sortReports(filteredData);
        const stats = this.calculateTableStats(sortedData);
        
        this.tableView.render(sortedData, stats);
    }

    handleTableSort(field) {
        if (this.currentSort.field === field) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.field = field;
            this.currentSort.direction = 'asc';
        }
        
        const filteredData = this.filterReports(this.allReports);
        const sortedData = this.sortReports(filteredData);
        const stats = this.calculateTableStats(sortedData);
        
        this.tableView.render(sortedData, stats);
    }

    handleTablePageChange(page) {
        if (this.tableView) {
            this.tableView.setPage(page);
            const filteredData = this.filterReports(this.allReports);
            const sortedData = this.sortReports(filteredData);
            const stats = this.calculateTableStats(sortedData);
            this.tableView.render(sortedData, stats);
        }
    }

    async handleTableRefresh() {
        await this.loadAllReports();
        
        const filteredData = this.filterReports(this.allReports);
        const sortedData = this.sortReports(filteredData);
        const stats = this.calculateTableStats(sortedData);
        
        if (this.tableView) {
            this.tableView.render(sortedData, stats);
            this.view.showMessage('Table refreshed!', 'success');
        }
    }

    // Existing methods from before...
    handleAddExpense() {
        const newExpense = {
            activityDate: '',
            fpTicket: '',
            projectName: '',
            poNumber: '',
            launchPoint: '',
            clientAddress: '',
            distance: '',
            transpo: 0,
            meal: 0,
            lodging: 0,
            materials: 0,
            print: 0,
            freight: 0,
            rental: 0,
            others: 0
        };
        this.model.addExpense(newExpense);
    }

    handleRemoveExpense(index) {
        this.model.removeExpense(index);
    }

    handleUpdateExpense(index, field, value) {
        const expenses = [...this.model.getFormData().expenses];
        expenses[index][field] = value;
        this.model.setExpenses(expenses);
    }

    async handleSaveToDb() {
        const formData = this.view.getFormData();
        const expenses = this.model.getFormData().expenses;
        const totals = this.model.calculateTotals();
        
        const fullReport = {
            field_engineer_name: formData.fieldEngineerName,
            date_coverage_start: formData.dateCoverageStart,
            date_coverage_end: formData.dateCoverageEnd,
            cluster: formData.cluster,
            date_filed: formData.dateFiled,
            team_lead: formData.teamLead,
            expenses: expenses,
            totals: totals,
            created_at: new Date().toISOString()
        };
        
        const errors = this.model.validate();
        if (errors.length > 0) {
            this.view.showMessage('Validation Error: ' + errors.join(', '), 'error');
            return;
        }
        
        this.view.setLoading(true);
        
        const result = await this.service.saveReport(fullReport);
        
        if (result.success) {
            this.view.showMessage('Report saved successfully to database!', 'success');
            // Refresh the reports list if table view exists
            if (this.tableView) {
                await this.loadAllReports();
            }
        } else {
            this.view.showMessage('Error saving to database: ' + result.error, 'error');
        }
        
        this.view.setLoading(false);
    }

    handleExport() {
        const formData = this.view.getFormData();
        const expenses = this.model.getFormData().expenses;
        const totals = this.model.calculateTotals();
        
        if (expenses.length === 0) {
            this.view.showMessage('No expense entries to export!', 'error');
            return;
        }
        
        exportToExcel(formData, expenses, totals);
        this.view.showMessage('Excel file generated with FSO format!', 'success');
    }

    handleReset() {
        if (confirm('Are you sure you want to reset the form? All unsaved data will be lost.')) {
            this.model.reset();
            this.view.showMessage('Form has been reset', 'success');
        }
    }

    updateView(formData) {
        const totals = this.model.calculateTotals();
        this.view.render(formData, totals);
    }
}