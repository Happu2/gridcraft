
import { saveAs } from 'file-saver';
import { SheetData } from './dataTypes';
import { initializeSheet } from './spreadsheetUtils';

// Save sheet data to a JSON file
export const saveSheetToFile = (sheetData: SheetData): void => {
  const fileName = `${sheetData.name || 'gridcraft-sheet'}.json`;
  const data = JSON.stringify(sheetData, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  saveAs(blob, fileName);
};

// Export to CSV
export const exportToCSV = (sheetData: SheetData): void => {
  let csvContent = '';
  const rowCount = Object.keys(sheetData.cells).length;
  const colCount = Object.keys(sheetData.columnWidths).length;
  
  // Process each row
  for (let r = 0; r < rowCount; r++) {
    const rowData = [];
    
    // Process each cell in the row
    for (let c = 0; c < colCount; c++) {
      const colLetter = String.fromCharCode(65 + c);
      const cell = sheetData.cells[r]?.[colLetter];
      
      // Format cell value for CSV
      let cellValue = cell?.value || '';
      
      // Quote values with commas
      if (cellValue.includes(',') || cellValue.includes('"') || cellValue.includes('\n')) {
        cellValue = `"${cellValue.replace(/"/g, '""')}"`;
      }
      
      rowData.push(cellValue);
    }
    
    // Add row to CSV content
    csvContent += rowData.join(',') + '\n';
  }
  
  // Save CSV file
  const fileName = `${sheetData.name || 'gridcraft-sheet'}.csv`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, fileName);
};

// Load sheet data from a JSON file
export const loadSheetFromFile = (file: File): Promise<SheetData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content) as SheetData;
        
        // Validate the data structure
        if (!data.cells || !data.columnWidths || !data.rowHeights) {
          throw new Error('Invalid file format');
        }
        
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

// Create a new empty sheet
export const createNewSheet = (name: string = 'Untitled'): SheetData => {
  const sheet = initializeSheet(50, 26);
  sheet.name = name;
  sheet.charts = [];
  return sheet;
};
