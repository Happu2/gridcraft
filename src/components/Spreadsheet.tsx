import React, { useEffect, useReducer, useRef, useState } from 'react';
import Cell from './Cell';
import FormulaBar from './FormulaBar';
import Toolbar from './Toolbar';
import { ActionType, CellData, CellPosition, CellRange, CellStyle, Selection, SheetData } from '@/lib/dataTypes';
import { 
  createEmptyCell, 
  getCellReference, 
  indexToColumnLetter, 
  initializeSheet,
  parseCellReference 
} from '@/lib/spreadsheetUtils';
import { determineCellType, evaluateFormula } from '@/lib/formulaUtils';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const INITIAL_ROWS = 50;
const INITIAL_COLS = 26; // A-Z

const initialSheet = initializeSheet(INITIAL_ROWS, INITIAL_COLS);

const initialSelection: Selection = {
  current: null,
  range: null,
  dragging: false,
};

const reducer = (state: SheetData, action: ActionType): SheetData => {
  switch (action.type) {
    case 'UPDATE_CELL': {
      const { row, col, data } = action;
      const colLetter = indexToColumnLetter(col);
      
      if (!state.cells[row]) {
        state.cells[row] = {};
      }
      
      const currentCell = state.cells[row][colLetter] || createEmptyCell(row, col);
      
      return {
        ...state,
        cells: {
          ...state.cells,
          [row]: {
            ...state.cells[row],
            [colLetter]: {
              ...currentCell,
              ...data,
            },
          },
        },
      };
    }
    
    case 'ADD_ROW': {
      const { index } = action;
      const newState = { ...state };
      
      // Shift rows down
      for (let r = Object.keys(state.cells).length; r > index; r--) {
        newState.cells[r] = { ...state.cells[r - 1] };
        newState.rowHeights[r] = state.rowHeights[r - 1];
      }
      
      // Create new row
      newState.cells[index] = {};
      newState.rowHeights[index] = 24;
      
      for (let c = 0; c < INITIAL_COLS; c++) {
        const colLetter = indexToColumnLetter(c);
        newState.cells[index][colLetter] = createEmptyCell(index, c);
      }
      
      return newState;
    }
    
    case 'DELETE_ROW': {
      const { index } = action;
      const newState = { ...state };
      
      // Shift rows up
      for (let r = index; r < Object.keys(state.cells).length - 1; r++) {
        newState.cells[r] = { ...state.cells[r + 1] };
        newState.rowHeights[r] = state.rowHeights[r + 1];
      }
      
      // Remove last row
      const lastRow = Object.keys(state.cells).length - 1;
      delete newState.cells[lastRow];
      delete newState.rowHeights[lastRow];
      
      return newState;
    }
    
    case 'ADD_COLUMN': {
      const { index } = action;
      const newState = { ...state };
      
      // Shift columns right
      for (let r = 0; r < Object.keys(state.cells).length; r++) {
        for (let c = INITIAL_COLS - 1; c > index; c--) {
          const colLetter = indexToColumnLetter(c);
          const prevColLetter = indexToColumnLetter(c - 1);
          newState.cells[r][colLetter] = state.cells[r][prevColLetter];
        }
        
        // Create new column
        const colLetter = indexToColumnLetter(index);
        newState.cells[r][colLetter] = createEmptyCell(r, index);
      }
      
      // Update column widths
      for (let c = INITIAL_COLS - 1; c > index; c--) {
        const colLetter = indexToColumnLetter(c);
        const prevColLetter = indexToColumnLetter(c - 1);
        newState.columnWidths[colLetter] = state.columnWidths[prevColLetter];
      }
      
      const colLetter = indexToColumnLetter(index);
      newState.columnWidths[colLetter] = 80;
      
      return newState;
    }
    
    case 'DELETE_COLUMN': {
      const { index } = action;
      const newState = { ...state };
      
      // Shift columns left
      for (let r = 0; r < Object.keys(state.cells).length; r++) {
        for (let c = index; c < INITIAL_COLS - 1; c++) {
          const colLetter = indexToColumnLetter(c);
          const nextColLetter = indexToColumnLetter(c + 1);
          newState.cells[r][colLetter] = state.cells[r][nextColLetter];
        }
        
        // Remove last column
        const lastColLetter = indexToColumnLetter(INITIAL_COLS - 1);
        delete newState.cells[r][lastColLetter];
      }
      
      // Update column widths
      for (let c = index; c < INITIAL_COLS - 1; c++) {
        const colLetter = indexToColumnLetter(c);
        const nextColLetter = indexToColumnLetter(c + 1);
        newState.columnWidths[colLetter] = state.columnWidths[nextColLetter];
      }
      
      const lastColLetter = indexToColumnLetter(INITIAL_COLS - 1);
      delete newState.columnWidths[lastColLetter];
      
      return newState;
    }
    
    case 'RESIZE_COLUMN': {
      const { index, width } = action;
      const colLetter = indexToColumnLetter(index);
      
      return {
        ...state,
        columnWidths: {
          ...state.columnWidths,
          [colLetter]: width,
        },
      };
    }
    
    case 'RESIZE_ROW': {
      const { index, height } = action;
      
      return {
        ...state,
        rowHeights: {
          ...state.rowHeights,
          [index]: height,
        },
      };
    }
    
    case 'FORMAT_CELLS': {
      const { style } = action;
      return state; // Placeholder - will be implemented with selection
    }
    
    case 'FIND_REPLACE': {
      const { find, replace, range } = action;
      return state; // Placeholder - will be implemented with selection
    }
    
    default:
      return state;
  }
};

const Spreadsheet: React.FC = () => {
  const [sheetData, dispatch] = useReducer(reducer, initialSheet);
  const [selection, setSelection] = useState<Selection>(initialSelection);
  const [activeCellPosition, setActiveCellPosition] = useState<CellPosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPosition, setStartDragPosition] = useState<CellPosition | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Helper to update a cell
  const updateCell = (row: number, col: number, data: Partial<CellData>) => {
    dispatch({ type: 'UPDATE_CELL', row, col, data });
  };

  // Handle cell focus
  const handleCellFocus = (position: CellPosition) => {
    setActiveCellPosition(position);
    setSelection({
      current: position,
      range: {
        start: position,
        end: position,
      },
      dragging: false,
    });
    setStartDragPosition(position);
  };

  // Handle cell blur
  const handleCellBlur = () => {
    // Keep selection but remove active state
    // setActiveCellPosition(null);
  };

  // Handle formula change
  const handleFormulaChange = (formula: string) => {
    if (!activeCellPosition) return;
    
    const { row, col } = activeCellPosition;
    const type = determineCellType(formula);
    
    let value = formula;
    if (type === 'formula') {
      // Evaluate the formula
      value = String(evaluateFormula(formula, sheetData));
    }
    
    updateCell(row, col, {
      formula: formula.startsWith('=') ? formula : '',
      value,
      type,
    });
  };

  // Get cell value
  const getActiveCellContent = (): string => {
    if (!activeCellPosition) return '';
    
    const { row, col } = activeCellPosition;
    const colLetter = indexToColumnLetter(col);
    const cell = sheetData.cells[row]?.[colLetter];
    
    return cell?.formula || cell?.value || '';
  };

  // Handle key navigation
  const handleCellKeyDown = (e: React.KeyboardEvent, position: CellPosition) => {
    const { row, col } = position;
    let newRow = row;
    let newCol = col;
    
    switch (e.key) {
      case 'ArrowUp':
        newRow = Math.max(0, row - 1);
        break;
      case 'ArrowDown':
        newRow = Math.min(INITIAL_ROWS - 1, row + 1);
        break;
      case 'ArrowLeft':
        newCol = Math.max(0, col - 1);
        break;
      case 'ArrowRight':
        newCol = Math.min(INITIAL_COLS - 1, col + 1);
        break;
      case 'Tab':
        e.preventDefault();
        newCol = e.shiftKey ? Math.max(0, col - 1) : Math.min(INITIAL_COLS - 1, col + 1);
        break;
      case 'Enter':
        if (!e.isDefaultPrevented()) {
          e.preventDefault();
          newRow = Math.min(INITIAL_ROWS - 1, row + 1);
        }
        break;
      default:
        return;
    }
    
    if (newRow !== row || newCol !== col) {
      e.preventDefault();
      handleCellFocus({ row: newRow, col: newCol });
    }
  };

  // Handle cell value change
  const handleCellChange = (value: string) => {
    if (!activeCellPosition) return;
    
    handleFormulaChange(value);
  };

  // Handle cell double click
  const handleCellDoubleClick = () => {
    // Already handled by the Cell component
  };

  // Check if a cell is in the current selection range
  const isCellInRange = (row: number, col: number): boolean => {
    if (!selection.range) return false;
    
    const { start, end } = selection.range;
    return (
      row >= Math.min(start.row, end.row) &&
      row <= Math.max(start.row, end.row) &&
      col >= Math.min(start.col, end.col) &&
      col <= Math.max(start.col, end.col)
    );
  };

  // Format selected cells
  const handleFormatCells = (style: Partial<CellStyle>) => {
    if (!selection.range) return;
    
    const { start, end } = selection.range;
    
    for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
      for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
        const colLetter = indexToColumnLetter(c);
        const cell = sheetData.cells[r]?.[colLetter] || createEmptyCell(r, c);
        
        updateCell(r, c, {
          style: {
            ...cell.style,
            ...style,
          },
        });
      }
    }
    
    toast({
      title: "Formatting applied",
      description: "The selected cells have been formatted.",
    });
  };

  // Add row
  const handleAddRow = () => {
    const rowIndex = selection.current?.row || 0;
    dispatch({ type: 'ADD_ROW', index: rowIndex });
    
    toast({
      title: "Row added",
      description: `A new row has been added at position ${rowIndex + 1}.`,
    });
  };

  // Delete row
  const handleDeleteRow = () => {
    if (!selection.current) return;
    
    const rowIndex = selection.current.row;
    dispatch({ type: 'DELETE_ROW', index: rowIndex });
    
    toast({
      title: "Row deleted",
      description: `Row ${rowIndex + 1} has been deleted.`,
    });
  };

  // Add column
  const handleAddColumn = () => {
    const colIndex = selection.current?.col || 0;
    dispatch({ type: 'ADD_COLUMN', index: colIndex });
    
    toast({
      title: "Column added",
      description: `A new column has been added at position ${indexToColumnLetter(colIndex)}.`,
    });
  };

  // Delete column
  const handleDeleteColumn = () => {
    if (!selection.current) return;
    
    const colIndex = selection.current.col;
    dispatch({ type: 'DELETE_COLUMN', index: colIndex });
    
    toast({
      title: "Column deleted",
      description: `Column ${indexToColumnLetter(colIndex)} has been deleted.`,
    });
  };

  // Find and replace
  const handleFindReplace = (find: string, replace: string) => {
    if (!selection.range) return;
    
    dispatch({ type: 'FIND_REPLACE', find, replace, range: selection.range });
    
    toast({
      title: "Find and Replace",
      description: `Replaced ${find} with ${replace} in the selected range.`,
    });
  };

  // Render column headers
  const renderColumnHeaders = () => {
    const headers = [];
    for (let col = 0; col < INITIAL_COLS; col++) {
      const colLetter = indexToColumnLetter(col);
      headers.push(
        <div
          key={`header-${col}`}
          className="cell cell-header"
          style={{ width: sheetData.columnWidths[colLetter] }}
        >
          {colLetter}
        </div>
      );
    }
    return headers;
  };

  // Render row headers
  const renderRowHeaders = () => {
    const headers = [];
    for (let row = 0; row < INITIAL_ROWS; row++) {
      headers.push(
        <div
          key={`row-${row}`}
          className="cell row-header"
          style={{ height: sheetData.rowHeights[row] }}
        >
          {row + 1}
        </div>
      );
    }
    return headers;
  };

  // Render cells
  const renderCells = () => {
    const rows = [];
    for (let row = 0; row < INITIAL_ROWS; row++) {
      const cells = [];
      for (let col = 0; col < INITIAL_COLS; col++) {
        const colLetter = indexToColumnLetter(col);
        const cell = sheetData.cells[row]?.[colLetter] || createEmptyCell(row, col);
        const isActive = activeCellPosition?.row === row && activeCellPosition?.col === col;
        const isSelected = selection.current?.row === row && selection.current?.col === col;
        const isInRange = isCellInRange(row, col);
        
        cells.push(
          <Cell
            key={`cell-${row}-${col}`}
            data={cell}
            position={{ row, col }}
            isSelected={isSelected}
            isActive={isActive}
            isInRange={isInRange}
            onFocus={handleCellFocus}
            onBlur={handleCellBlur}
            onChange={handleCellChange}
            onKeyDown={handleCellKeyDown}
            onDoubleClick={handleCellDoubleClick}
          />
        );
      }
      rows.push(
        <div
          key={`row-${row}`}
          className="flex"
          style={{ height: sheetData.rowHeights[row] }}
        >
          {cells}
        </div>
      );
    }
    return rows;
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <Toolbar
        activeCellPosition={activeCellPosition}
        selection={selection.range}
        onFormatCells={handleFormatCells}
        onAddRow={handleAddRow}
        onDeleteRow={handleDeleteRow}
        onAddColumn={handleAddColumn}
        onDeleteColumn={handleDeleteColumn}
        onFindReplace={handleFindReplace}
      />
      
      <FormulaBar
        activeCellPosition={activeCellPosition}
        activeCellContent={getActiveCellContent()}
        onFormulaChange={handleFormulaChange}
      />
      
      <div className="flex-grow overflow-auto">
        <div className="flex">
          {/* Top-left corner */}
          <div className="cell row-header cell-header">&nbsp;</div>
          
          {/* Column headers */}
          <div className="flex">
            {renderColumnHeaders()}
          </div>
        </div>
        
        <div className="flex">
          {/* Row headers */}
          <div className="flex flex-col">
            {renderRowHeaders()}
          </div>
          
          {/* Cells */}
          <div ref={gridRef} className="flex flex-col">
            {renderCells()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Spreadsheet;
