// js/utils/excelExporter.js - Gray/Silver Theme (No spacing changes)
export async function exportToExcel(formData, expenses, totals) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'FSO System';
    workbook.created = new Date();
    
    // ==================== SHEET 1: DETAILED EXPENSES ====================
    const detailSheet = workbook.addWorksheet('FSO', {
        pageSetup: { paperSize: 9, orientation: 'landscape' }
    });
    
    // Define column widths (KEPT SAME)
    detailSheet.columns = [
        { width: 12 }, // Activity Date
        { width: 15 }, // FP ticket
        { width: 35 }, // Project Name
        { width: 20 }, // PO#
        { width: 12 }, // Launch Point
        { width: 35 }, // Client Address
        { width: 10 }, // Distance
        { width: 10 }, // Transpo
        { width: 10 }, // Meal
        { width: 10 }, // Lodging
        { width: 10 }, // Materials
        { width: 10 }, // Print
        { width: 10 }, // Freight
        { width: 10 }, // Rental
        { width: 10 }, // Others
        { width: 12 }  // Total
    ];
    
    let rowNum = 1;
    
    // Title Row (color changed to gray)
    const titleRow = detailSheet.getRow(rowNum);
    titleRow.getCell(1).value = 'BASED ALLOWANCE REPLENISHMENT (FSO)';
    titleRow.getCell(1).font = { size: 14, bold: true, color: { argb: 'FF444444' } };
    detailSheet.mergeCells(rowNum, 1, rowNum, 16);
    rowNum++;
    rowNum++;
    
    // Info Section - Row 1
    detailSheet.getRow(rowNum).getCell(1).value = 'Field Engineers Name:';
    detailSheet.getRow(rowNum).getCell(1).font = { bold: true };
    detailSheet.getRow(rowNum).getCell(2).value = formData.fieldEngineerName || '';
    detailSheet.getRow(rowNum).getCell(7).value = 'Date Coverage:';
    detailSheet.getRow(rowNum).getCell(7).font = { bold: true };
    detailSheet.getRow(rowNum).getCell(8).value = `${formData.dateCoverageStart || ''} to ${formData.dateCoverageEnd || ''}`;
    detailSheet.getRow(rowNum).getCell(16).value = 'rev. 1.0 10.07.2024';
    detailSheet.getRow(rowNum).getCell(16).font = { italic: true, size: 9, color: { argb: 'FF888888' } };
    rowNum++;
    
    // Info Section - Row 2
    detailSheet.getRow(rowNum).getCell(1).value = 'Cluster:';
    detailSheet.getRow(rowNum).getCell(1).font = { bold: true };
    detailSheet.getRow(rowNum).getCell(2).value = formData.cluster || '';
    detailSheet.getRow(rowNum).getCell(7).value = 'Date Filed:';
    detailSheet.getRow(rowNum).getCell(7).font = { bold: true };
    detailSheet.getRow(rowNum).getCell(8).value = formData.dateFiled || '';
    rowNum++;
    
    // Info Section - Row 3
    detailSheet.getRow(rowNum).getCell(1).value = 'Team Lead:';
    detailSheet.getRow(rowNum).getCell(1).font = { bold: true };
    detailSheet.getRow(rowNum).getCell(2).value = formData.teamLead || '';
    rowNum++;
    rowNum++;
    
    // Column Headers - GRAY background (was blue)
    const headers = [
        'Activity Date', 'FP ticket', 'Project Name', 'Purchase Order (PO#)',
        'Launch Point', 'Client Address / Onsite Address', 'Distance (KM)',
        'Transpo', 'Meal', 'Lodging', 'Materials', 'Print', 'Freight',
        'Rental', 'Others', 'Total'
    ];
    
    const headerRow = detailSheet.getRow(rowNum);
    headers.forEach((header, idx) => {
        const cell = headerRow.getCell(idx + 1);
        cell.value = header;
        cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF555555' }  // Changed from blue (#2c5f8a) to gray (#555555)
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
        };
    });
    rowNum++;
    
    // Data rows (no changes)
    expenses.forEach((expense, idx) => {
        const total = (parseFloat(expense.transpo) || 0) + (parseFloat(expense.meal) || 0) +
                     (parseFloat(expense.lodging) || 0) + (parseFloat(expense.materials) || 0) +
                     (parseFloat(expense.print) || 0) + (parseFloat(expense.freight) || 0) +
                     (parseFloat(expense.rental) || 0) + (parseFloat(expense.others) || 0);
        
        const row = detailSheet.getRow(rowNum);
        row.getCell(1).value = expense.activityDate || '';
        row.getCell(2).value = expense.fpTicket || '';
        row.getCell(3).value = expense.projectName || '';
        row.getCell(4).value = expense.poNumber || '';
        row.getCell(5).value = expense.launchPoint || '';
        row.getCell(6).value = expense.clientAddress || '';
        row.getCell(7).value = expense.distance || '';
        row.getCell(8).value = expense.transpo || 0;
        row.getCell(9).value = expense.meal || 0;
        row.getCell(10).value = expense.lodging || 0;
        row.getCell(11).value = expense.materials || 0;
        row.getCell(12).value = expense.print || 0;
        row.getCell(13).value = expense.freight || 0;
        row.getCell(14).value = expense.rental || 0;
        row.getCell(15).value = expense.others || 0;
        row.getCell(16).value = total;
        
        // Apply borders
        for (let i = 1; i <= 16; i++) {
            row.getCell(i).border = {
                top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
            };
            if (i >= 7) {
                row.getCell(i).alignment = { horizontal: 'right' };
            }
        }
        
        rowNum++;
    });
    
    // Grand Total Row (no changes)
    const grandRow = detailSheet.getRow(rowNum);
    grandRow.getCell(15).value = 'Grand Total';
    grandRow.getCell(15).font = { bold: true };
    grandRow.getCell(16).value = totals.total;
    grandRow.getCell(16).font = { bold: true };
    
    for (let i = 1; i <= 16; i++) {
        grandRow.getCell(i).border = {
            top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
        };
    }
    
    // ==================== SHEET 2: PROJECT SUMMARY ====================
    const summarySheet = workbook.addWorksheet('Summary', {
        pageSetup: { paperSize: 9, orientation: 'landscape' }
    });
    
    // Column widths (KEPT SAME)
    summarySheet.columns = [
        { width: 35 }, // Project Name
        { width: 25 }, // PO#
        { width: 12 }, // Transpo
        { width: 10 }, // Meal
        { width: 10 }, // Lodging
        { width: 12 }, // Materials
        { width: 10 }, // Print
        { width: 10 }, // Freight
        { width: 10 }, // Rental
        { width: 10 }, // Others
        { width: 12 }  // Total
    ];
    
    let sRow = 1;
    
    // Title (color changed to gray)
    const summaryTitle = summarySheet.getRow(sRow);
    summaryTitle.getCell(1).value = 'BASED ALLOWANCE REPLENISHMENT (FSO)';
    summaryTitle.getCell(1).font = { size: 14, bold: true, color: { argb: 'FF444444' } };
    summarySheet.mergeCells(sRow, 1, sRow, 11);
    sRow++;
    sRow++;
    
    // Info Section (no changes)
    summarySheet.getRow(sRow).getCell(1).value = 'Field Engineers Name:';
    summarySheet.getRow(sRow).getCell(1).font = { bold: true };
    summarySheet.getRow(sRow).getCell(2).value = formData.fieldEngineerName || '';
    summarySheet.getRow(sRow).getCell(6).value = 'Date Coverage:';
    summarySheet.getRow(sRow).getCell(6).font = { bold: true };
    summarySheet.getRow(sRow).getCell(7).value = `${formData.dateCoverageStart || ''} to ${formData.dateCoverageEnd || ''}`;
    sRow++;
    
    summarySheet.getRow(sRow).getCell(1).value = 'Cluster:';
    summarySheet.getRow(sRow).getCell(1).font = { bold: true };
    summarySheet.getRow(sRow).getCell(2).value = formData.cluster || '';
    summarySheet.getRow(sRow).getCell(6).value = 'Date Filed:';
    summarySheet.getRow(sRow).getCell(6).font = { bold: true };
    summarySheet.getRow(sRow).getCell(7).value = formData.dateFiled || '';
    sRow++;
    
    summarySheet.getRow(sRow).getCell(1).value = 'Team Lead:';
    summarySheet.getRow(sRow).getCell(1).font = { bold: true };
    summarySheet.getRow(sRow).getCell(2).value = formData.teamLead || '';
    sRow++;
    sRow++;
    
    // SUMMARY Header (color changed to gray)
    const summaryHeader = summarySheet.getRow(sRow);
    summaryHeader.getCell(1).value = 'SUMMARY';
    summaryHeader.getCell(1).font = { size: 12, bold: true, color: { argb: 'FF444444' } };
    summarySheet.mergeCells(sRow, 1, sRow, 11);
    sRow++;
    sRow++;
    
    // Column Headers for Summary - GRAY background (was blue)
    const summaryHeaders = [
        'Project Name', 'Purchase Order (PO#)', 'Transpo', 'Meal', 'Lodging',
        'Materials', 'Print', 'Freight', 'Rental', 'Others', 'Total'
    ];
    
    const summaryHeaderRow = summarySheet.getRow(sRow);
    summaryHeaders.forEach((header, idx) => {
        const cell = summaryHeaderRow.getCell(idx + 1);
        cell.value = header;
        cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF555555' }  // Changed from blue to gray
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
        };
    });
    sRow++;
    
    // Group expenses by Project Name and PO# (no changes)
    const projectMap = new Map();
    
    expenses.forEach(expense => {
        if (!expense.projectName) return;
        
        const key = `${expense.projectName}|${expense.poNumber || ''}`;
        if (!projectMap.has(key)) {
            projectMap.set(key, {
                projectName: expense.projectName,
                poNumber: expense.poNumber || '',
                transpo: 0,
                meal: 0,
                lodging: 0,
                materials: 0,
                print: 0,
                freight: 0,
                rental: 0,
                others: 0,
                total: 0
            });
        }
        
        const project = projectMap.get(key);
        project.transpo += parseFloat(expense.transpo) || 0;
        project.meal += parseFloat(expense.meal) || 0;
        project.lodging += parseFloat(expense.lodging) || 0;
        project.materials += parseFloat(expense.materials) || 0;
        project.print += parseFloat(expense.print) || 0;
        project.freight += parseFloat(expense.freight) || 0;
        project.rental += parseFloat(expense.rental) || 0;
        project.others += parseFloat(expense.others) || 0;
        project.total = project.transpo + project.meal + project.lodging + 
                       project.materials + project.print + project.freight + 
                       project.rental + project.others;
    });
    
    // Summary Totals (no changes)
    const summaryTotals = {
        transpo: 0, meal: 0, lodging: 0, materials: 0,
        print: 0, freight: 0, rental: 0, others: 0, total: 0
    };
    
    let rowIndex = 0;
    for (const project of projectMap.values()) {
        const row = summarySheet.getRow(sRow + rowIndex);
        row.getCell(1).value = project.projectName;
        row.getCell(2).value = project.poNumber;
        row.getCell(3).value = project.transpo;
        row.getCell(4).value = project.meal;
        row.getCell(5).value = project.lodging;
        row.getCell(6).value = project.materials;
        row.getCell(7).value = project.print;
        row.getCell(8).value = project.freight;
        row.getCell(9).value = project.rental;
        row.getCell(10).value = project.others;
        row.getCell(11).value = project.total;
        
        // Apply borders and alignment
        for (let i = 1; i <= 11; i++) {
            row.getCell(i).border = {
                top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
            };
            if (i >= 3) {
                row.getCell(i).alignment = { horizontal: 'right' };
            }
        }
        
        summaryTotals.transpo += project.transpo;
        summaryTotals.meal += project.meal;
        summaryTotals.lodging += project.lodging;
        summaryTotals.materials += project.materials;
        summaryTotals.print += project.print;
        summaryTotals.freight += project.freight;
        summaryTotals.rental += project.rental;
        summaryTotals.others += project.others;
        summaryTotals.total += project.total;
        
        rowIndex++;
    }
    
    sRow += rowIndex;
    sRow++;
    
    // Grand Total Row for Summary (no changes)
    const grandTotalRow = summarySheet.getRow(sRow);
    grandTotalRow.getCell(1).value = 'Grand Total';
    grandTotalRow.getCell(1).font = { bold: true };
    grandTotalRow.getCell(3).value = summaryTotals.transpo;
    grandTotalRow.getCell(4).value = summaryTotals.meal;
    grandTotalRow.getCell(5).value = summaryTotals.lodging;
    grandTotalRow.getCell(6).value = summaryTotals.materials;
    grandTotalRow.getCell(7).value = summaryTotals.print;
    grandTotalRow.getCell(8).value = summaryTotals.freight;
    grandTotalRow.getCell(9).value = summaryTotals.rental;
    grandTotalRow.getCell(10).value = summaryTotals.others;
    grandTotalRow.getCell(11).value = summaryTotals.total;
    
    for (let i = 1; i <= 11; i++) {
        grandTotalRow.getCell(i).font = { bold: true };
        grandTotalRow.getCell(i).border = {
            top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
            right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
        };
        if (i >= 3) {
            grandTotalRow.getCell(i).alignment = { horizontal: 'right' };
        }
    }
    
    // ==================== SAVE FILE ====================
    const fileName = `FSO_Report_${formData.fieldEngineerName || 'export'}_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.xlsx`;
    
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
}