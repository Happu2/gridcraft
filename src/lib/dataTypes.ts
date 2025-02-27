
export type CellData = {
  value: string;
  formula: string;
  style: CellStyle;
  type: CellType;
  id: string;
};

export type CellStyle = {
  bold: boolean;
  italic: boolean;
  fontSize: number;
  color: string;
  backgroundColor: string;
  horizontalAlign: 'left' | 'center' | 'right';
};

export type CellType = 'text' | 'number' | 'date' | 'formula';

export type CellPosition = {
  row: number;
  col: number;
};

export type CellRange = {
  start: CellPosition;
  end: CellPosition;
};

export type Selection = {
  current: CellPosition | null;
  range: CellRange | null;
  dragging: boolean;
};

export type SheetData = {
  cells: Record<string, Record<string, CellData>>;
  columnWidths: Record<string, number>;
  rowHeights: Record<string, number>;
};

export type ActionType = 
  | { type: 'UPDATE_CELL'; row: number; col: number; data: Partial<CellData> }
  | { type: 'SET_SELECTION'; selection: Selection }
  | { type: 'ADD_ROW'; index: number }
  | { type: 'DELETE_ROW'; index: number }
  | { type: 'ADD_COLUMN'; index: number }
  | { type: 'DELETE_COLUMN'; index: number }
  | { type: 'RESIZE_COLUMN'; index: number; width: number }
  | { type: 'RESIZE_ROW'; index: number; height: number }
  | { type: 'APPLY_FORMULA'; formula: string }
  | { type: 'FORMAT_CELLS'; style: Partial<CellStyle> }
  | { type: 'FIND_REPLACE'; find: string; replace: string; range: CellRange | null };
