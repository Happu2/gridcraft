
import { CellData, CellRange, SheetData } from './dataTypes';
import { getCellsInRange, parseRangeReference } from './spreadsheetUtils';

// Evaluate a cell's formula
export const evaluateFormula = (formula: string, sheetData: SheetData): string | number => {
  if (!formula.startsWith('=')) return formula;
  
  // Remove the '=' prefix
  const expression = formula.substring(1).trim();
  
  try {
    // Check for built-in functions
    if (expression.toUpperCase().startsWith('SUM(')) {
      return evaluateSum(expression, sheetData);
    } else if (expression.toUpperCase().startsWith('AVERAGE(')) {
      return evaluateAverage(expression, sheetData);
    } else if (expression.toUpperCase().startsWith('MAX(')) {
      return evaluateMax(expression, sheetData);
    } else if (expression.toUpperCase().startsWith('MIN(')) {
      return evaluateMin(expression, sheetData);
    } else if (expression.toUpperCase().startsWith('COUNT(')) {
      return evaluateCount(expression, sheetData);
    } else if (expression.toUpperCase().startsWith('TRIM(')) {
      return evaluateTrim(expression, sheetData);
    } else if (expression.toUpperCase().startsWith('UPPER(')) {
      return evaluateUpper(expression, sheetData);
    } else if (expression.toUpperCase().startsWith('LOWER(')) {
      return evaluateLower(expression, sheetData);
    } else {
      // For simple arithmetic expressions (future implementation)
      return "Formula not implemented";
    }
  } catch (error) {
    console.error("Formula evaluation error:", error);
    return "#ERROR!";
  }
};

// Extract range from function argument
const extractRange = (functionExpression: string): CellRange | null => {
  // Extract content between parentheses
  const match = functionExpression.match(/\(([^)]+)\)/);
  if (!match) return null;
  
  const rangeStr = match[1].trim();
  return parseRangeReference(rangeStr);
};

// Get numeric values from a range of cells
const getNumericValuesFromRange = (range: CellRange, sheetData: SheetData): number[] => {
  const cells = getCellsInRange(sheetData, range);
  
  return cells
    .map(cell => {
      const value = cell.value;
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    })
    .filter((num): num is number => num !== null);
};

// Mathematical Functions

// SUM function
export const evaluateSum = (expression: string, sheetData: SheetData): number | string => {
  const range = extractRange(expression);
  if (!range) return "#ERROR!";
  
  const values = getNumericValuesFromRange(range, sheetData);
  return values.reduce((sum, value) => sum + value, 0);
};

// AVERAGE function
export const evaluateAverage = (expression: string, sheetData: SheetData): number | string => {
  const range = extractRange(expression);
  if (!range) return "#ERROR!";
  
  const values = getNumericValuesFromRange(range, sheetData);
  if (values.length === 0) return "#DIV/0!";
  
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
};

// MAX function
export const evaluateMax = (expression: string, sheetData: SheetData): number | string => {
  const range = extractRange(expression);
  if (!range) return "#ERROR!";
  
  const values = getNumericValuesFromRange(range, sheetData);
  if (values.length === 0) return "#N/A";
  
  return Math.max(...values);
};

// MIN function
export const evaluateMin = (expression: string, sheetData: SheetData): number | string => {
  const range = extractRange(expression);
  if (!range) return "#ERROR!";
  
  const values = getNumericValuesFromRange(range, sheetData);
  if (values.length === 0) return "#N/A";
  
  return Math.min(...values);
};

// COUNT function
export const evaluateCount = (expression: string, sheetData: SheetData): number | string => {
  const range = extractRange(expression);
  if (!range) return "#ERROR!";
  
  const values = getNumericValuesFromRange(range, sheetData);
  return values.length;
};

// Data Quality Functions

// TRIM function
export const evaluateTrim = (expression: string, sheetData: SheetData): string => {
  const match = expression.match(/\(([^)]+)\)/);
  if (!match) return "#ERROR!";
  
  const cellRef = match[1].trim();
  const range = parseRangeReference(cellRef);
  
  if (range) {
    // If a range is provided, return error (TRIM works on a single cell)
    return "#ERROR!";
  }
  
  // Assuming it's a single cell reference
  const cells = getCellsInRange(sheetData, {
    start: { row: 0, col: 0 },
    end: { row: 0, col: 0 }
  });
  
  if (cells.length !== 1) return "#ERROR!";
  return cells[0].value.trim();
};

// UPPER function
export const evaluateUpper = (expression: string, sheetData: SheetData): string => {
  const match = expression.match(/\(([^)]+)\)/);
  if (!match) return "#ERROR!";
  
  const cellRef = match[1].trim();
  const range = parseRangeReference(cellRef);
  
  if (range) {
    // If a range is provided, return error (UPPER works on a single cell)
    return "#ERROR!";
  }
  
  // Assuming it's a single cell reference
  const cells = getCellsInRange(sheetData, {
    start: { row: 0, col: 0 },
    end: { row: 0, col: 0 }
  });
  
  if (cells.length !== 1) return "#ERROR!";
  return cells[0].value.toUpperCase();
};

// LOWER function
export const evaluateLower = (expression: string, sheetData: SheetData): string => {
  const match = expression.match(/\(([^)]+)\)/);
  if (!match) return "#ERROR!";
  
  const cellRef = match[1].trim();
  const range = parseRangeReference(cellRef);
  
  if (range) {
    // If a range is provided, return error (LOWER works on a single cell)
    return "#ERROR!";
  }
  
  // Assuming it's a single cell reference
  const cells = getCellsInRange(sheetData, {
    start: { row: 0, col: 0 },
    end: { row: 0, col: 0 }
  });
  
  if (cells.length !== 1) return "#ERROR!";
  return cells[0].value.toLowerCase();
};

// REMOVE_DUPLICATES function (operate directly on sheet data)
export const removeDuplicates = (range: CellRange, sheetData: SheetData): SheetData => {
  // This is a more complex operation that would modify the sheet data
  // Implementation would depend on how we want to handle the transformation
  return sheetData; // Placeholder
};

// FIND_AND_REPLACE function
export const findAndReplace = (range: CellRange, find: string, replace: string, sheetData: SheetData): SheetData => {
  const newSheetData = { ...sheetData };
  const { start, end } = range;
  
  for (let r = start.row; r <= end.row; r++) {
    if (!newSheetData.cells[r]) continue;
    
    for (let c = start.col; c <= end.col; c++) {
      const colLetter = String.fromCharCode(65 + c);
      const cell = newSheetData.cells[r][colLetter];
      
      if (cell && typeof cell.value === 'string') {
        // Replace all occurrences
        const newValue = cell.value.replace(new RegExp(find, 'g'), replace);
        newSheetData.cells[r][colLetter] = {
          ...cell,
          value: newValue
        };
      }
    }
  }
  
  return newSheetData;
};

// Determine cell data type based on content
export const determineCellType = (value: string): 'text' | 'number' | 'date' | 'formula' => {
  if (value.startsWith('=')) {
    return 'formula';
  }
  
  // Check if it's a number
  const number = parseFloat(value);
  if (!isNaN(number) && value.trim() !== '') {
    return 'number';
  }
  
  // Check if it's a date (simple check)
  const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
  if (dateRegex.test(value)) {
    return 'date';
  }
  
  return 'text';
};
