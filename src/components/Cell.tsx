
import React, { useEffect, useRef, useState } from 'react';
import { CellData, CellPosition } from '@/lib/dataTypes';
import { cn } from '@/lib/utils';
import { determineCellType } from '@/lib/formulaUtils';

interface CellProps {
  data: CellData;
  position: CellPosition;
  isSelected: boolean;
  isActive: boolean;
  isInRange: boolean;
  onFocus: (position: CellPosition) => void;
  onBlur: () => void;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent, position: CellPosition) => void;
  onDoubleClick: () => void;
}

const Cell: React.FC<CellProps> = ({
  data,
  position,
  isSelected,
  isActive,
  isInRange,
  onFocus,
  onBlur,
  onChange,
  onKeyDown,
  onDoubleClick,
}) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.formula || data.value);
  const cellRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActive && !editing) {
      setEditing(true);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isActive, editing]);

  useEffect(() => {
    if (!isActive && editing) {
      setEditing(false);
    }
  }, [isActive, editing]);

  useEffect(() => {
    setEditValue(data.formula || data.value);
  }, [data.formula, data.value]);

  const handleFocus = () => {
    onFocus(position);
  };

  const handleBlur = () => {
    setEditing(false);
    onBlur();
    
    // Only update if value changed
    if (editValue !== (data.formula || data.value)) {
      onChange(editValue);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleDoubleClick = () => {
    setEditing(true);
    onDoubleClick();
    
    // Need to wait for the input to be rendered
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };

  // Determine the display value and style based on the cell data
  const displayValue = data.formula ? data.value : data.value;
  const { bold, italic, fontSize, color, backgroundColor, horizontalAlign } = data.style;
  const type = data.type || determineCellType(displayValue);

  const cellStyle = {
    fontWeight: bold ? 'bold' : 'normal',
    fontStyle: italic ? 'italic' : 'normal',
    fontSize: `${fontSize}px`,
    color,
    backgroundColor,
    textAlign: horizontalAlign,
  } as React.CSSProperties;

  // Determine numeric alignment
  if (type === 'number' && horizontalAlign === 'left') {
    cellStyle.textAlign = 'right';
  }

  return (
    <div
      ref={cellRef}
      className={cn(
        'cell',
        isSelected && 'cell-selected',
        isInRange && 'bg-blue-50',
        'transition-all duration-150'
      )}
      style={cellStyle}
      onClick={handleFocus}
      onDoubleClick={handleDoubleClick}
      tabIndex={0}
      onKeyDown={(e) => onKeyDown(e, position)}
    >
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          className="w-full h-full bg-transparent border-none outline-none p-0"
          value={editValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleBlur();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              setEditValue(data.formula || data.value);
              setEditing(false);
              onBlur();
            } else {
              onKeyDown(e, position);
            }
          }}
          style={{
            ...cellStyle,
            textAlign: 'left', // Always left align when editing
          }}
        />
      ) : (
        <div className="w-full h-full truncate">{displayValue}</div>
      )}
    </div>
  );
};

export default Cell;
