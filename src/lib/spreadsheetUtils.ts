
import { CellData, CellPosition, CellRange, CellStyle, SheetData } from './dataTypes';

// Create a new empty cell
export const createEmptyCell = (row: number, col: number): CellData => ({
  value: '',
  formula: '',
  style: getDefaultCellStyle(),
  type: 'text',
  id: `${row}-${col}`,
});

// Get default cell style
export const getDefaultCellStyle = (): CellStyle => ({
  bold: false,
  italic: false,
  fontSize: 11,
  color: '#000000',
  backgroundColor: '#ffffff',
  horizontalAlign: 'left',
});

// Convert column index to letter (0 => A, 25 => Z, 26 => AA)
export const indexToColumnLetter = (index: number): string => {
  let columnLetter = '';
  let temp = index;
  
  while (temp >= 0) {
    const remainder = temp % 26;
    columnLetter = String.fromCharCode(65 + remainder) + columnLetter;
    temp = Math.floor(temp / 26) - 1;
  }
  
  return columnLetter;
};

// Convert column letter to index (A => 0, Z => 25, AA => 26)
export const columnLetterToIndex = (letter: string): number => {
  let index = 0;
  for (let i = 0; i < letter.length; i++) {
    index = index * 26 + letter.charCodeAt(i) - 64;
  }
  return index - 1;
};

// Get cell reference as string (e.g., "A1", "B2")
export const getCellReference = (row: number, col: number): string => {
  return `${indexToColumnLetter(col)}${row + 1}`;
};

// Parse cell reference (e.g., "A1" => { row: 0, col: 0 })
export const parseCellReference = (reference: string): CellPosition | null => {
  const match = reference.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;

  const [, colLetter, rowString] = match;
  const row = parseInt(rowString, 10) - 1;
  const col = columnLetterToIndex(colLetter);

  return { row, col };
};

// Get range of cells (e.g., "A1:B2")
export const parseRangeReference = (reference: string): CellRange | null => {
  const parts = reference.split(':');
  if (parts.length !== 2) return null;

  const start = parseCellReference(parts[0]);
  const end = parseCellReference(parts[1]);

  if (!start || !end) return null;
  return { start, end };
};

// Get cell value by reference from the sheet data
export const getCellByReference = (sheetData: SheetData, reference: string): CellData | null => {
  const position = parseCellReference(reference);
  if (!position) return null;

  const { row, col } = position;
  const colLetter = indexToColumnLetter(col);
  
  return sheetData.cells[row]?.[colLetter] || null;
};

// Get range of cells from the sheet data
export const getCellsInRange = (sheetData: SheetData, range: CellRange): CellData[] => {
  const { start, end } = range;
  const cells: CellData[] = [];

  for (let r = start.row; r <= end.row; r++) {
    for (let c = start.col; c <= end.col; c++) {
      const colLetter = indexToColumnLetter(c);
      const cell = sheetData.cells[r]?.[colLetter];
      if (cell) cells.push(cell);
    }
  }

  return cells;
};

// Initialize an empty sheet with specified number of rows and columns
export const initializeSheet = (rows: number, cols: number): SheetData => {
  const cells: Record<string, Record<string, CellData>> = {};
  const columnWidths: Record<string, number> = {};
  const rowHeights: Record<string, number> = {};

  // Initialize cells
  for (let r = 0; r < rows; r++) {
    cells[r] = {};
    rowHeights[r] = 24; // Default row height
    
    for (let c = 0; c < cols; c++) {
      const colLetter = indexToColumnLetter(c);
      cells[r][colLetter] = createEmptyCell(r, c);
      
      // Only set column width once per column
      if (r === 0) {
        columnWidths[colLetter] = 80; // Default column width
      }
    }
  }

  return {
    cells,
    columnWidths,
    rowHeights,
  };
};
