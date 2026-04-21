// js/models/ExpenseModel.js
export class ExpenseModel {
    constructor() {
        this.expenses = [];
        this.formData = {
            fieldEngineerName: '',
            dateCoverageStart: '',
            dateCoverageEnd: '',
            cluster: '',
            dateFiled: new Date().toISOString().split('T')[0],
            teamLead: '',
            expenses: []
        };
        this.listeners = [];
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener(this.getFormData()));
    }

    setFormData(data) {
        this.formData = { ...this.formData, ...data };
        if (data.expenses) {
            this.expenses = data.expenses;
        }
        this.notifyListeners();
    }

    setExpenses(expenses) {
        this.formData.expenses = expenses;
        this.expenses = expenses;
        this.notifyListeners();
    }

    addExpense(expense) {
        this.formData.expenses.push(expense);
        this.expenses = this.formData.expenses;
        this.notifyListeners();
    }

    removeExpense(index) {
        this.formData.expenses.splice(index, 1);
        this.expenses = this.formData.expenses;
        this.notifyListeners();
    }

    getFormData() {
        return this.formData;
    }

    getExpenses() {
        return this.formData.expenses;
    }

    calculateTotals() {
        const totals = {
            transpo: 0, meal: 0, lodging: 0, materials: 0,
            print: 0, freight: 0, rental: 0, others: 0, total: 0
        };

        this.formData.expenses.forEach(expense => {
            totals.transpo += parseFloat(expense.transpo) || 0;
            totals.meal += parseFloat(expense.meal) || 0;
            totals.lodging += parseFloat(expense.lodging) || 0;
            totals.materials += parseFloat(expense.materials) || 0;
            totals.print += parseFloat(expense.print) || 0;
            totals.freight += parseFloat(expense.freight) || 0;
            totals.rental += parseFloat(expense.rental) || 0;
            totals.others += parseFloat(expense.others) || 0;
        });

        totals.total = totals.transpo + totals.meal + totals.lodging + 
                      totals.materials + totals.print + totals.freight + 
                      totals.rental + totals.others;

        return totals;
    }

    validate() {
        const errors = [];
        if (!this.formData.fieldEngineerName || this.formData.fieldEngineerName.trim() === '') {
            errors.push('Engineer Name is required');
        }
        if (!this.formData.dateCoverageStart || this.formData.dateCoverageStart.trim() === '') {
            errors.push('Start Date is required');
        }
        if (!this.formData.dateCoverageEnd || this.formData.dateCoverageEnd.trim() === '') {
            errors.push('End Date is required');
        }
        if (!this.formData.cluster || this.formData.cluster.trim() === '') {
            errors.push('Cluster is required');
        }
        if (!this.formData.teamLead || this.formData.teamLead.trim() === '') {
            errors.push('Team Lead is required');
        }
        return errors;
    }

    reset() {
        this.formData = {
            fieldEngineerName: '',
            dateCoverageStart: '',
            dateCoverageEnd: '',
            cluster: '',
            dateFiled: new Date().toISOString().split('T')[0],
            teamLead: '',
            expenses: []
        };
        this.expenses = [];
        this.notifyListeners();
    }

    getEmptyExpense() {
        return {
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
    }
}