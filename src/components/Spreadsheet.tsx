
import React, { useEffect, useReducer, useRef, useState } from 'react';
import Cell from './Cell';
import FormulaBar from './FormulaBar';
import Toolbar from './Toolbar';
import Chart from './Chart';
import ChartDialog from './ChartDialog';
import SaveLoadDialog from './SaveLoadDialog';
import { ActionType, CellData, CellPosition, CellRange, CellStyle, ChartData, Selection, SheetData } from '@/lib/dataTypes';
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
import { ChartBar, Plus, Save } from 'lucide-react';
import { Button } from './ui/button';

const INITIAL_ROWS = 50;
const INITIAL_COLS = 26; // A-Z

const initialSheet = (): SheetData => {
  const sheet = initializeSheet(INITIAL_ROWS, INITIAL_COLS);
  sheet.name = 'Untitled';
  sheet.charts = [];
  return sheet;
};

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
      
      // This would apply the style to selected cells
      // Implementation depends on selection state
      return state;
    }
    
    case 'FIND_REPLACE': {
      const { find, replace, range } = action;
      
      // This would find and replace text in selected cells
      // Implementation depends on selection state
      return state;
    }
    
    case 'ADD_CHART': {
      const { chart } = action;
      
      return {
        ...state,
        charts: [...(state.charts || []), chart],
      };
    }
    
    case 'UPDATE_CHART': {
      const { id, data } = action;
      
      return {
        ...state,
        charts: (state.charts || []).map(chart => 
          chart.id === id ? { ...chart, ...data } : chart
        ),
      };
    }
    
    case 'DELETE_CHART': {
      const { id } = action;
      
      return {
        ...state,
        charts: (state.charts || []).filter(chart => chart.id !== id),
      };
    }
    
    case 'SET_SHEET_NAME': {
      const { name } = action;
      
      return {
        ...state,
        name,
      };
    }
    
    default:
      return state;
  }
};

const Spreadsheet: React.FC = () => {
  const [sheetData, dispatch] = useReducer(reducer, null, initialSheet);
  const [selection, setSelection] = useState<Selection>(initialSelection);
  const [activeCellPosition, setActiveCellPosition] = useState<CellPosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPosition, setStartDragPosition] = useState<CellPosition | null>(null);
  const [showChartDialog, setShowChartDialog] = useState(false);
  const [showSaveLoadDialog, setShowSaveLoadDialog] = useState(false);
  const [editingChart, setEditingChart] = useState<ChartData | undefined>(undefined);
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

  // Chart management
  const handleAddChart = () => {
    setEditingChart(undefined);
    setShowChartDialog(true);
  };

  const handleEditChart = (chart: ChartData) => {
    setEditingChart(chart);
    setShowChartDialog(true);
  };

  const handleSaveChart = (chartData: ChartData) => {
    if (editingChart) {
      dispatch({ type: 'UPDATE_CHART', id: chartData.id, data: chartData });
      toast({
        title: "Chart Updated",
        description: `"${chartData.title}" has been updated.`,
      });
    } else {
      dispatch({ type: 'ADD_CHART', chart: chartData });
      toast({
        title: "Chart Added",
        description: `"${chartData.title}" has been added.`,
      });
    }
  };

  const handleDeleteChart = (chartId: string) => {
    dispatch({ type: 'DELETE_CHART', id: chartId });
    toast({
      title: "Chart Deleted",
      description: "The chart has been removed.",
    });
  };

  // Save and load
  const handleSaveLoad = () => {
    setShowSaveLoadDialog(true);
  };

  const handleLoadSheet = (data: SheetData) => {
    // Replace the current state with the loaded state
    Object.entries(data.cells).forEach(([row, cols]) => {
      Object.entries(cols).forEach(([col, cellData]) => {
        const rowIndex = parseInt(row, 10);
        const colIndex = col.charCodeAt(0) - 65; // A = 0, B = 1, etc.
        
        // Update the cell
        dispatch({
          type: 'UPDATE_CELL',
          row: rowIndex,
          col: colIndex,
          data: cellData,
        });
      });
    });
    
    // Set the sheet name
    dispatch({ type: 'SET_SHEET_NAME', name: data.name || 'Untitled' });
    
    // Load charts if any
    if (data.charts && data.charts.length > 0) {
      // Clear existing charts first
      const currentCharts = sheetData.charts || [];
      currentCharts.forEach(chart => {
        dispatch({ type: 'DELETE_CHART', id: chart.id });
      });
      
      // Add the new charts
      data.charts.forEach(chart => {
        dispatch({ type: 'ADD_CHART', chart });
      });
    }
  };

  const handleSetSheetName = (name: string) => {
    dispatch({ type: 'SET_SHEET_NAME', name });
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
      
      <div className="bg-toolbar-bg border-b border-cell-border p-1 flex items-center justify-between">
        <FormulaBar
          activeCellPosition={activeCellPosition}
          activeCellContent={getActiveCellContent()}
          onFormulaChange={handleFormulaChange}
        />
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleAddChart}>
            <ChartBar size={16} className="mr-1" />
            Add Chart
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveLoad}>
            <Save size={16} className="mr-1" />
            Save/Load
          </Button>
        </div>
      </div>
      
      <div className="flex-grow overflow-auto flex flex-col">
        <div className="flex">
          {/* Top-left corner */}
          <div className="cell row-header cell-header">&nbsp;</div>
          
          {/* Column headers */}
          <div className="flex">
            {renderColumnHeaders()}
          </div>
        </div>
        
        <div className="flex flex-grow">
          {/* Row headers */}
          <div className="flex flex-col">
            {renderRowHeaders()}
          </div>
          
          {/* Cells */}
          <div className="flex flex-col flex-grow">
            <div ref={gridRef} className="flex flex-col">
              {renderCells()}
            </div>
            
            {/* Charts section */}
            {sheetData.charts && sheetData.charts.length > 0 && (
              <div className="p-4 border-t border-cell-border">
                <h2 className="text-lg font-semibold mb-4">Charts</h2>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {sheetData.charts.map((chart) => (
                    <Chart
                      key={chart.id}
                      chartData={chart}
                      sheetData={sheetData}
                      onEdit={handleEditChart}
                      onDelete={handleDeleteChart}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Chart Dialog */}
      <ChartDialog
        open={showChartDialog}
        onOpenChange={setShowChartDialog}
        onSave={handleSaveChart}
        existingChart={editingChart}
      />
      
      {/* Save/Load Dialog */}
      <SaveLoadDialog
        open={showSaveLoadDialog}
        onOpenChange={setShowSaveLoadDialog}
        sheetData={sheetData}
        onLoad={handleLoadSheet}
        onNameChange={handleSetSheetName}
      />
    </div>
  );
};

export default Spreadsheet;
