
import React from 'react';
import { CellPosition, CellRange, CellStyle } from '@/lib/dataTypes';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Bold, Italic, AlignLeft, AlignCenter, AlignRight, Plus, Trash2, Search, 
  PaintBucket, Type
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  activeCellPosition: CellPosition | null;
  selection: CellRange | null;
  onFormatCells: (style: Partial<CellStyle>) => void;
  onAddRow: () => void;
  onDeleteRow: () => void;
  onAddColumn: () => void;
  onDeleteColumn: () => void;
  onFindReplace: (find: string, replace: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  activeCellPosition,
  selection,
  onFormatCells,
  onAddRow,
  onDeleteRow,
  onAddColumn,
  onDeleteColumn,
  onFindReplace,
}) => {
  const [fontColor, setFontColor] = React.useState('#000000');
  const [bgColor, setBgColor] = React.useState('#ffffff');
  const [fontSize, setFontSize] = React.useState('11');
  const [findText, setFindText] = React.useState('');
  const [replaceText, setReplaceText] = React.useState('');
  const [showFindReplace, setShowFindReplace] = React.useState(false);

  const handleBoldClick = () => {
    onFormatCells({ bold: true });
  };

  const handleItalicClick = () => {
    onFormatCells({ italic: true });
  };

  const handleFontSizeChange = (value: string) => {
    setFontSize(value);
    onFormatCells({ fontSize: parseInt(value, 10) });
  };

  const handleFontColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setFontColor(newColor);
    onFormatCells({ color: newColor });
  };

  const handleBgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setBgColor(newColor);
    onFormatCells({ backgroundColor: newColor });
  };

  const handleAlignmentChange = (alignment: 'left' | 'center' | 'right') => {
    onFormatCells({ horizontalAlign: alignment });
  };

  const handleFindReplaceSubmit = () => {
    onFindReplace(findText, replaceText);
    setShowFindReplace(false);
  };

  const isEnabled = activeCellPosition !== null || selection !== null;

  return (
    <div className="bg-toolbar-bg border-b border-cell-border p-1 flex items-center gap-2 animate-slide-in">
      <div className="flex gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="toolbar-button" 
          onClick={handleBoldClick}
          disabled={!isEnabled}
        >
          <Bold size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="toolbar-button" 
          onClick={handleItalicClick}
          disabled={!isEnabled}
        >
          <Italic size={16} />
        </Button>
      </div>

      <div className="h-6 w-px bg-gray-300 mx-1" />

      <div className="flex items-center gap-1">
        <Select onValueChange={handleFontSizeChange} defaultValue={fontSize} disabled={!isEnabled}>
          <SelectTrigger className="w-16 h-8">
            <SelectValue placeholder="11" />
          </SelectTrigger>
          <SelectContent>
            {[8, 9, 10, 11, 12, 14, 16, 18, 24, 36].map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="h-6 w-px bg-gray-300 mx-1" />

      <div className="flex items-center gap-1">
        <Popover>
          <PopoverTrigger asChild disabled={!isEnabled}>
            <Button variant="ghost" size="icon" className="toolbar-button">
              <Type size={16} style={{ color: fontColor }} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="font-color">Text Color</Label>
              <Input
                id="font-color"
                type="color"
                value={fontColor}
                onChange={handleFontColorChange}
              />
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild disabled={!isEnabled}>
            <Button variant="ghost" size="icon" className="toolbar-button">
              <PaintBucket size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="bg-color">Background Color</Label>
              <Input
                id="bg-color"
                type="color"
                value={bgColor}
                onChange={handleBgColorChange}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="h-6 w-px bg-gray-300 mx-1" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="toolbar-button"
          onClick={() => handleAlignmentChange('left')}
          disabled={!isEnabled}
        >
          <AlignLeft size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="toolbar-button"
          onClick={() => handleAlignmentChange('center')}
          disabled={!isEnabled}
        >
          <AlignCenter size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="toolbar-button"
          onClick={() => handleAlignmentChange('right')}
          disabled={!isEnabled}
        >
          <AlignRight size={16} />
        </Button>
      </div>

      <div className="h-6 w-px bg-gray-300 mx-1" />

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="toolbar-button" onClick={onAddRow}>
          <Plus size={16} />
          <span className="sr-only">Add Row</span>
        </Button>
        <Button variant="ghost" size="icon" className="toolbar-button" onClick={onDeleteRow} disabled={!isEnabled}>
          <Trash2 size={16} />
          <span className="sr-only">Delete Row</span>
        </Button>
      </div>

      <div className="h-6 w-px bg-gray-300 mx-1" />

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="toolbar-button" onClick={onAddColumn}>
          <Plus size={16} className="rotate-90" />
          <span className="sr-only">Add Column</span>
        </Button>
        <Button variant="ghost" size="icon" className="toolbar-button" onClick={onDeleteColumn} disabled={!isEnabled}>
          <Trash2 size={16} className="rotate-90" />
          <span className="sr-only">Delete Column</span>
        </Button>
      </div>

      <div className="h-6 w-px bg-gray-300 mx-1" />

      <Dialog open={showFindReplace} onOpenChange={setShowFindReplace}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="toolbar-button" disabled={!isEnabled}>
            <Search size={16} />
            <span className="sr-only">Find & Replace</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Find and Replace</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="find" className="text-right">Find</Label>
              <Input
                id="find"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="replace" className="text-right">Replace with</Label>
              <Input
                id="replace"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleFindReplaceSubmit}>Replace All</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Toolbar;
