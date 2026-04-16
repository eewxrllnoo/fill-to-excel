// Add this function to your existing excelExporter.js

export function exportMultipleToExcel(reports) {
    const wb = XLSX.utils.book_new();
    
    reports.forEach((report, index) => {
        // Prepare form data
        const formData = {
            fieldEngineerName: report.field_engineer_name,
            dateCoverageStart: report.date_coverage_start,
            dateCoverageEnd: report.date_coverage_end,
            cluster: report.cluster,
            dateFiled: report.date_filed,
            teamLead: report.team_lead
        };
        
        // Calculate totals if not present
        const totals = report.totals || {
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
        
        // Create worksheet for this report
        const worksheetData = [];
        
        // Header
        worksheetData.push(['BASED ALLOWANCE REPLENISHMENT (FSO)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
        worksheetData.push([]);
        worksheetData.push(['Field Engineers Name:', formData.fieldEngineerName, 'Date Coverage:', `${formData.dateCoverageStart} to ${formData.dateCoverageEnd}`, '', '', '', '', '', '', '', '', '', '', '', `rev. 1.0 10.07.2024`]);
        worksheetData.push(['Cluster:', formData.cluster, 'Date Filed:', formData.dateFiled, '', '', '', '', '', '', '', '', '', '', '', '']);
        worksheetData.push(['Team Lead:', formData.teamLead, '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
        worksheetData.push([]);
        
        // Column Headers
        worksheetData.push([
            'Activity Date', 'FP ticket', 'Project Name', 'Purchase Order (PO#)', 'Launch Point', 
            'Client Address / Onsite Address', 'Distance (KM)', 'Transpo', 'Meal', 'Lodging', 
            'Materials', 'Print', 'Freight', 'Rental', 'Others', 'Total'
        ]);
        
        // Data Rows
        report.expenses.forEach(expense => {
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
        
        // Grand Total Row
        worksheetData.push([]);
        worksheetData.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Grand Total', totals.total]);
        worksheetData.push(['', '', '', '', '', '', '', totals.transpo, totals.meal, totals.lodging, totals.materials, totals.print, totals.freight, totals.rental, totals.others, totals.total]);
        
        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(worksheetData);
        
        // Set column widths
        ws['!cols'] = [
            {wch:12}, {wch:15}, {wch:40}, {wch:20}, {wch:15}, 
            {wch:35}, {wch:12}, {wch:10}, {wch:10}, {wch:10}, 
            {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:12}
        ];
        
        // Add worksheet to workbook
        const sheetName = `${report.field_engineer_name}_${new Date(report.date_coverage_start).toLocaleDateString()}`.substring(0, 31);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });
    
    // Export file
    const fileName = `FSO_Reports_Export_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
}