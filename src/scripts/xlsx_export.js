const EXCEL_FILE = ".xlsx"

// Create a new workbook
function exportJsonToExcel(data, order = undefined, filename="data.xlsx") {
    if (!filename.endsWith(EXCEL_FILE)){
        filename += EXCEL_FILE
    }

    const workbook = XLSX.utils.book_new();

    var worksheet
    if (order === undefined){
        // Convert JSON data to a worksheet
        worksheet = XLSX.utils.json_to_sheet(data);
    } else {
        worksheet = XLSX.utils.json_to_sheet(data, {header: order});
    }

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Export the workbook as an Excel file
    XLSX.writeFile(workbook, ".xlsx");
}