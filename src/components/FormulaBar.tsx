
import React, { useEffect, useRef } from 'react';
import { CellPosition } from '@/lib/dataTypes';
import { getCellReference } from '@/lib/spreadsheetUtils';

interface FormulaBarProps {
  activeCellPosition: CellPosition | null;
  activeCellContent: string;
  onFormulaChange: (formula: string) => void;
}

const FormulaBar: React.FC<FormulaBarProps> = ({
  activeCellPosition,
  activeCellContent,
  onFormulaChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [formula, setFormula] = React.useState('');

  useEffect(() => {
    setFormula(activeCellContent);
  }, [activeCellContent, activeCellPosition]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormula(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeCellPosition) {
        onFormulaChange(formula);
      }
    }
  };

  const handleBlur = () => {
    if (activeCellPosition && formula !== activeCellContent) {
      onFormulaChange(formula);
    }
  };

  return (
    <div className="formula-bar animate-slide-in">
      <div className="w-10 flex items-center justify-center font-bold text-gray-500">
        fx
      </div>
      
      <div className="mx-2 px-2 py-1 bg-gray-100 rounded text-sm min-w-[60px] text-gray-700">
        {activeCellPosition ? getCellReference(activeCellPosition.row, activeCellPosition.col) : ''}
      </div>
      
      <input
        ref={inputRef}
        type="text"
        className="flex-1 outline-none border-none text-sm"
        value={formula}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Enter formula or value"
      />
    </div>
  );
};

export default FormulaBar;
