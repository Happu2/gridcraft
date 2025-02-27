
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChartData, ChartType } from '@/lib/dataTypes';

interface ChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (chartData: ChartData) => void;
  existingChart?: ChartData;
}

const ChartDialog: React.FC<ChartDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  existingChart,
}) => {
  const [title, setTitle] = useState(existingChart?.title || '');
  const [chartType, setChartType] = useState<ChartType>(existingChart?.type || 'bar');
  const [dataRange, setDataRange] = useState(existingChart?.dataRange || '');
  const [labelRange, setLabelRange] = useState(existingChart?.labelRange || '');

  const handleSave = () => {
    const chartData: ChartData = {
      id: existingChart?.id || `chart-${Date.now()}`,
      type: chartType,
      title,
      dataRange,
      labelRange,
      options: existingChart?.options || {},
    };
    
    onSave(chartData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {existingChart ? 'Edit Chart' : 'Create Chart'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Chart Title"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Chart Type
            </Label>
            <Select
              value={chartType}
              onValueChange={(value) => setChartType(value as ChartType)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
                <SelectItem value="scatter">Scatter Plot</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dataRange" className="text-right">
              Data Range
            </Label>
            <Input
              id="dataRange"
              value={dataRange}
              onChange={(e) => setDataRange(e.target.value)}
              className="col-span-3"
              placeholder="e.g., B2:B10"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="labelRange" className="text-right">
              Label Range
            </Label>
            <Input
              id="labelRange"
              value={labelRange}
              onChange={(e) => setLabelRange(e.target.value)}
              className="col-span-3"
              placeholder="e.g., A2:A10"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Chart</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChartDialog;
