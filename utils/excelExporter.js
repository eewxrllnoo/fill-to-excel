// utils/excelExporter.js - Exact format matching your template
export function exportToExcel(formData, expenses, totals) {
    const worksheetData = [];
    
    // Header Row
    worksheetData.push(['BASED ALLOWANCE REPLENISHMENT (FSO)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    worksheetData.push([]);
    
    // Info Rows
    worksheetData.push([
        'Field Engineers Name:', formData.fieldEngineerName || '', 
        '', '', 'Date Coverage:', `${formData.dateCoverageStart || ''} to ${formData.dateCoverageEnd || ''}`, 
        '', '', '', '', '', '', '', '', '', 'rev. 1.0 10.07.2024'
    ]);
    
    worksheetData.push([
        'Cluster:', formData.cluster || '', 
        '', '', 'Date Filed:', formData.dateFiled || '', 
        '', '', '', '', '', '', '', '', '', ''
    ]);
    
    worksheetData.push([
        'Team Lead:', formData.teamLead || '', 
        '', '', '', '', '', '', '', '', '', '', '', '', '', ''
    ]);
    
    worksheetData.push([]);
    
    // Column Headers
    worksheetData.push([
        'Activity Date', 'FP ticket', 'Project Name', 'Purchase Order (PO#)', 
        'Launch Point', 'Client Address / Onsite Address', 'Distance (KM)', 
        'Transpo', 'Meal', 'Lodging', 'Materials', 'Print', 'Freight', 
        'Rental', 'Others', 'Total'
    ]);
    
    // Data Rows
    expenses.forEach(expense => {
        const total = (parseFloat(expense.transpo) || 0) + 
                     (parseFloat(expense.meal) || 0) + 
                     (parseFloat(expense.lodging) || 0) + 
                     (parseFloat(expense.materials) || 0) + 
                     (parseFloat(expense.print) || 0) + 
                     (parseFloat(expense.freight) || 0) + 
                     (parseFloat(expense.rental) || 0) + 
                     (parseFloat(expense.others) || 0);
        
        worksheetData.push([
            expense.activityDate || '',
            expense.fpTicket || '',
            expense.projectName || '',
            expense.poNumber || '',
            expense.launchPoint || '',
            expense.clientAddress || '',
            expense.distance || '',
            expense.transpo || 0,
            expense.meal || 0,
            expense.lodging || 0,
            expense.materials || 0,
            expense.print || 0,
            expense.freight || 0,
            expense.rental || 0,
            expense.others || 0,
            total
        ]);
    });
    
    // Add empty rows to match template spacing
    for (let i = expenses.length; i < 20; i++) {
        worksheetData.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    }
    
    // Grand Total Row
    worksheetData.push([]);
    worksheetData.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Grand Total', totals.total]);
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    ws['!cols'] = [
        {wch:12},  // Activity Date
        {wch:15},  // FP ticket
        {wch:40},  // Project Name
        {wch:20},  // PO#
        {wch:12},  // Launch Point
        {wch:35},  // Client Address
        {wch:10},  // Distance
        {wch:10},  // Transpo
        {wch:10},  // Meal
        {wch:10},  // Lodging
        {wch:10},  // Materials
        {wch:10},  // Print
        {wch:10},  // Freight
        {wch:10},  // Rental
        {wch:10},  // Others
        {wch:12}   // Total
    ];
    
    // Create workbook and save
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'FSO Expense Report');
    
    const fileName = `FSO_Report_${formData.fieldEngineerName || 'export'}_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
}