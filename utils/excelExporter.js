// utils/excelExporter.js
export function exportToExcel(formData, expenses, totals) {
    const worksheetData = [
        ['BASED ALLOWANCE REPLENISHMENT (FSO) - NEXUS 2026', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        [],
        ['Field Engineers Name:', formData.fieldEngineerName, 'Date Coverage:', `${formData.dateCoverageStart} to ${formData.dateCoverageEnd}`, '', '', '', '', '', '', '', '', '', '', '', 'v.2.0'],
        ['Cluster:', formData.cluster, 'Date Filed:', formData.dateFiled, '', '', '', '', '', '', '', '', '', '', '', ''],
        ['Team Lead:', formData.teamLead, '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        [],
        ['Activity Date', 'FP ticket', 'Project Name', 'PO#', 'Launch Point', 'Client Address', 'Distance', 'Transpo', 'Meal', 'Lodging', 'Materials', 'Print', 'Freight', 'Rental', 'Others', 'Total']
    ];
    
    expenses.forEach(expense => {
        const total = (parseFloat(expense.transpo)||0) + (parseFloat(expense.meal)||0) + 
                     (parseFloat(expense.lodging)||0) + (parseFloat(expense.materials)||0) + 
                     (parseFloat(expense.print)||0) + (parseFloat(expense.freight)||0) + 
                     (parseFloat(expense.rental)||0) + (parseFloat(expense.others)||0);
        
        worksheetData.push([
            expense.activityDate || '', expense.fpTicket || '', expense.projectName || '',
            expense.poNumber || '', expense.launchPoint || '', expense.clientAddress || '',
            expense.distance || '', expense.transpo || 0, expense.meal || 0, expense.lodging || 0,
            expense.materials || 0, expense.print || 0, expense.freight || 0,
            expense.rental || 0, expense.others || 0, total
        ]);
    });
    
    worksheetData.push([], ['', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Grand Total', totals.total]);
    
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    ws['!cols'] = [{wch:12}, {wch:15}, {wch:40}, {wch:20}, {wch:15}, {wch:35}, {wch:12}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:12}];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'FSO NEXUS Report');
    XLSX.writeFile(wb, `FSO_NEXUS_${formData.fieldEngineerName}_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.xlsx`);
}