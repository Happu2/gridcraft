import { CellData, CellRange, SheetData } from './dataTypes';
import { getCellByReference, getCellsInRange, parseRangeReference } from './spreadsheetUtils';

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
    } else if (expression.toUpperCase().startsWith('CONCATENATE(')) {
      return evaluateConcatenate(expression, sheetData);
    } else if (expression.toUpperCase().startsWith('IF(')) {
      return evaluateIf(expression, sheetData);
    } else if (expression.toUpperCase().startsWith('ROUND(')) {
      return evaluateRound(expression, sheetData);
    } else if (expression.toUpperCase().startsWith('COUNTIF(')) {
      return evaluateCountIf(expression, sheetData);
    } else if (expression.toUpperCase().startsWith('SUMIF(')) {
      return evaluateSumIf(expression, sheetData);
    } else {
      // For simple arithmetic expressions
      return evaluateArithmeticExpression(expression, sheetData);
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

// Get cell value by reference
const getCellValueByReference = (reference: string, sheetData: SheetData): string => {
  const cell = getCellByReference(sheetData, reference);
  return cell ? cell.value : '';
};

// Extract multiple arguments from function
const extractArguments = (functionExpression: string): string[] => {
  const match = functionExpression.match(/\(([^)]+)\)/);
  if (!match) return [];
  
  // Split by comma but respect nested parentheses
  const argsString = match[1];
  const args: string[] = [];
  let currentArg = '';
  let parenthesesCount = 0;
  
  for (let i = 0; i < argsString.length; i++) {
    const char = argsString[i];
    
    if (char === '(') {
      parenthesesCount++;
      currentArg += char;
    } else if (char === ')') {
      parenthesesCount--;
      currentArg += char;
    } else if (char === ',' && parenthesesCount === 0) {
      args.push(currentArg.trim());
      currentArg = '';
    } else {
      currentArg += char;
    }
  }
  
  if (currentArg) {
    args.push(currentArg.trim());
  }
  
  return args;
};

// Evaluate argument which could be a cell reference, a range, or a literal value
const evaluateArgument = (arg: string, sheetData: SheetData): string | number => {
  // Check if it's a formula that needs to be evaluated
  if (arg.startsWith('=')) {
    return evaluateFormula(arg, sheetData);
  }
  
  // Check if it's a cell reference
  const cellRefMatch = arg.match(/^[A-Z]+\d+$/);
  if (cellRefMatch) {
    const cellValue = getCellValueByReference(arg, sheetData);
    // Try to convert to number if possible
    const num = parseFloat(cellValue);
    return isNaN(num) ? cellValue : num;
  }
  
  // Check if it's a range reference (should be handled by the specific function)
  const rangeMatch = arg.match(/^[A-Z]+\d+:[A-Z]+\d+$/);
  if (rangeMatch) {
    return arg; // Return as is, the function should handle it
  }
  
  // Check if it's a number
  const num = parseFloat(arg);
  if (!isNaN(num)) {
    return num;
  }
  
  // Check if it's a string literal (with quotes)
  const stringMatch = arg.match(/^"(.*)"$/);
  if (stringMatch) {
    return stringMatch[1];
  }
  
  // Otherwise, return as is
  return arg;
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

// ROUND function
export const evaluateRound = (expression: string, sheetData: SheetData): number | string => {
  const args = extractArguments(expression);
  if (args.length !== 2) return "#ERROR!";
  
  const value = evaluateArgument(args[0], sheetData);
  const decimals = evaluateArgument(args[1], sheetData);
  
  if (typeof value !== 'number' || typeof decimals !== 'number') {
    return "#ERROR!";
  }
  
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

// COUNTIF function
export const evaluateCountIf = (expression: string, sheetData: SheetData): number | string => {
  const args = extractArguments(expression);
  if (args.length !== 2) return "#ERROR!";
  
  const rangeStr = args[0];
  const criteria = evaluateArgument(args[1], sheetData);
  
  const range = parseRangeReference(rangeStr);
  if (!range) return "#ERROR!";
  
  const cells = getCellsInRange(sheetData, range);
  
  // Count cells that match the criteria
  return cells.filter(cell => {
    if (typeof criteria === 'number') {
      const cellNum = parseFloat(cell.value);
      return !isNaN(cellNum) && cellNum === criteria;
    } else {
      return cell.value === criteria;
    }
  }).length;
};

// SUMIF function
export const evaluateSumIf = (expression: string, sheetData: SheetData): number | string => {
  const args = extractArguments(expression);
  if (args.length < 2 || args.length > 3) return "#ERROR!";
  
  const rangeStr = args[0];
  const criteria = evaluateArgument(args[1], sheetData);
  const sumRangeStr = args.length === 3 ? args[2] : rangeStr;
  
  const range = parseRangeReference(rangeStr);
  const sumRange = parseRangeReference(sumRangeStr);
  
  if (!range || !sumRange) return "#ERROR!";
  
  const cells = getCellsInRange(sheetData, range);
  const sumCells = getCellsInRange(sheetData, sumRange);
  
  // Sum cells that match the criteria
  let sum = 0;
  
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const sumCell = sumCells[i] || { value: '0' };
    
    const matches = (() => {
      if (typeof criteria === 'number') {
        const cellNum = parseFloat(cell.value);
        return !isNaN(cellNum) && cellNum === criteria;
      } else {
        return cell.value === criteria;
      }
    })();
    
    if (matches) {
      const sumValue = parseFloat(sumCell.value);
      if (!isNaN(sumValue)) {
        sum += sumValue;
      }
    }
  }
  
  return sum;
};

// IF function
export const evaluateIf = (expression: string, sheetData: SheetData): string | number => {
  const args = extractArguments(expression);
  if (args.length !== 3) return "#ERROR!";
  
  const condition = args[0];
  const trueResult = evaluateArgument(args[1], sheetData);
  const falseResult = evaluateArgument(args[2], sheetData);
  
  // Evaluate the condition
  const evalCondition = evaluateCondition(condition, sheetData);
  
  return evalCondition ? trueResult : falseResult;
};

// Evaluate a condition expression
const evaluateCondition = (condition: string, sheetData: SheetData): boolean => {
  // Support for various comparison operators
  const operators = ['>=', '<=', '<>', '=', '>', '<'];
  
  for (const op of operators) {
    if (condition.includes(op)) {
      const [left, right] = condition.split(op).map(part => evaluateArgument(part.trim(), sheetData));
      
      switch (op) {
        case '=': return left === right;
        case '<>': return left !== right;
        case '>': return typeof left === 'number' && typeof right === 'number' && left > right;
        case '<': return typeof left === 'number' && typeof right === 'number' && left < right;
        case '>=': return typeof left === 'number' && typeof right === 'number' && left >= right;
        case '<=': return typeof left === 'number' && typeof right === 'number' && left <= right;
      }
    }
  }
  
  // If no operator is found, evaluate as a boolean
  const value = evaluateArgument(condition, sheetData);
  return Boolean(value);
};

// CONCATENATE function
export const evaluateConcatenate = (expression: string, sheetData: SheetData): string => {
  const args = extractArguments(expression);
  if (args.length === 0) return "#ERROR!";
  
  return args.map(arg => String(evaluateArgument(arg, sheetData))).join('');
};

// Simple arithmetic expression evaluation
export const evaluateArithmeticExpression = (expression: string, sheetData: SheetData): number | string => {
  try {
    // Replace cell references with their values
    const processedExpression = expression.replace(/[A-Z]+\d+/g, (match) => {
      const cellValue = getCellValueByReference(match, sheetData);
      const num = parseFloat(cellValue);
      return isNaN(num) ? `"${cellValue}"` : num.toString();
    });
    
    // Use Function constructor to evaluate the expression
    // This is a simple approach for demo purposes
    // In production, a proper parser would be better for security
    const result = new Function(`return ${processedExpression}`)();
    return typeof result === 'number' ? result : String(result);
  } catch (error) {
    console.error("Error evaluating arithmetic expression:", error);
    return "#ERROR!";
  }
};

// Data Quality Functions

// TRIM function
export const evaluateTrim = (expression: string, sheetData: SheetData): string => {
  const match = expression.match(/\(([^)]+)\)/);
  if (!match) return "#ERROR!";
  
  const arg = match[1].trim();
  const value = evaluateArgument(arg, sheetData);
  return typeof value === 'string' ? value.trim() : String(value).trim();
};

// UPPER function
export const evaluateUpper = (expression: string, sheetData: SheetData): string => {
  const match = expression.match(/\(([^)]+)\)/);
  if (!match) return "#ERROR!";
  
  const arg = match[1].trim();
  const value = evaluateArgument(arg, sheetData);
  return String(value).toUpperCase();
};

// LOWER function
export const evaluateLower = (expression: string, sheetData: SheetData): string => {
  const match = expression.match(/\(([^)]+)\)/);
  if (!match) return "#ERROR!";
  
  const arg = match[1].trim();
  const value = evaluateArgument(arg, sheetData);
  return String(value).toLowerCase();
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
