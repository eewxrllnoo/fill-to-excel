// Model - Manages expense data and business logic
export class ExpenseModel {
    constructor() {
        this.expenses = [];
        this.formData = {
            fieldEngineerName: '',
            dateCoverageStart: '',
            dateCoverageEnd: '',
            cluster: '',
            dateFiled: '',
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
        this.notifyListeners();
    }

    setExpenses(expenses) {
        this.formData.expenses = expenses;
        this.notifyListeners();
    }

    addExpense(expense) {
        this.formData.expenses.push(expense);
        this.notifyListeners();
    }

    updateExpense(index, expense) {
        this.formData.expenses[index] = expense;
        this.notifyListeners();
    }

    removeExpense(index) {
        this.formData.expenses.splice(index, 1);
        this.notifyListeners();
    }

    getFormData() {
        return this.formData;
    }

    calculateTotals() {
        const totals = {
            transpo: 0,
            meal: 0,
            lodging: 0,
            materials: 0,
            print: 0,
            freight: 0,
            rental: 0,
            others: 0,
            total: 0
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
        if (!this.formData.fieldEngineerName) errors.push('Field Engineer Name is required');
        if (!this.formData.dateCoverageStart) errors.push('Date Coverage Start is required');
        if (!this.formData.dateCoverageEnd) errors.push('Date Coverage End is required');
        if (!this.formData.cluster) errors.push('Cluster is required');
        if (!this.formData.teamLead) errors.push('Team Lead is required');
        if (this.formData.expenses.length === 0) errors.push('At least one expense entry is required');
        
        this.formData.expenses.forEach((expense, index) => {
            if (!expense.activityDate) errors.push(`Expense ${index + 1}: Activity Date is required`);
            if (!expense.projectName) errors.push(`Expense ${index + 1}: Project Name is required`);
        });
        
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
        this.notifyListeners();
    }
}