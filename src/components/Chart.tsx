
import React, { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  Line,
  Pie,
  Scatter,
  Area,
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartData, SheetData } from '@/lib/dataTypes';
import { parseRangeReference, getCellsInRange } from '@/lib/spreadsheetUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, X } from 'lucide-react';

interface ChartProps {
  chartData: ChartData;
  sheetData: SheetData;
  onEdit: (chart: ChartData) => void;
  onDelete: (chartId: string) => void;
}

const Chart: React.FC<ChartProps> = ({
  chartData,
  sheetData,
  onEdit,
  onDelete,
}) => {
  const { type, title, dataRange, labelRange } = chartData;
  
  const chartDataPoints = useMemo(() => {
    // Parse ranges
    const dataRangeObj = parseRangeReference(dataRange);
    const labelRangeObj = parseRangeReference(labelRange);
    
    if (!dataRangeObj || !labelRangeObj) {
      return [];
    }
    
    // Get cells from ranges
    const dataCells = getCellsInRange(sheetData, dataRangeObj);
    const labelCells = getCellsInRange(sheetData, labelRangeObj);
    
    // Create data points
    return labelCells.map((labelCell, index) => {
      const dataCell = dataCells[index];
      const value = dataCell ? parseFloat(dataCell.value) : 0;
      
      return {
        name: labelCell.value,
        value: isNaN(value) ? 0 : value,
      };
    });
  }, [dataRange, labelRange, sheetData]);

  // Render the appropriate chart type
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartDataPoints}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartDataPoints}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartDataPoints}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartDataPoints}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="value" fill="#8884d8" stroke="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" type="category" />
              <YAxis dataKey="value" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name={title} data={chartDataPoints} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <Card className="w-full my-4">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(chartData)}
            className="h-8 w-8"
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(chartData.id)}
            className="h-8 w-8"
          >
            <X size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
};

export default Chart;
