
import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SheetData } from '@/lib/dataTypes';
import { saveSheetToFile, exportToCSV, loadSheetFromFile } from '@/lib/fileUtils';
import { useToast } from '@/hooks/use-toast';

interface SaveLoadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sheetData: SheetData;
  onLoad: (data: SheetData) => void;
  onNameChange: (name: string) => void;
}

const SaveLoadDialog: React.FC<SaveLoadDialogProps> = ({
  open,
  onOpenChange,
  sheetData,
  onLoad,
  onNameChange,
}) => {
  const [sheetName, setSheetName] = useState(sheetData.name || 'Untitled');
  const [activeTab, setActiveTab] = useState('save');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSheetName(e.target.value);
  };

  const handleSave = () => {
    // Update the sheet name
    onNameChange(sheetName);
    
    // Save with updated name
    const updatedSheetData = { ...sheetData, name: sheetName };
    saveSheetToFile(updatedSheetData);
    
    toast({
      title: 'Sheet Saved',
      description: `"${sheetName}" has been saved to your downloads.`,
    });
    
    onOpenChange(false);
  };

  const handleExportCSV = () => {
    // Update the sheet name
    onNameChange(sheetName);
    
    // Export with updated name
    const updatedSheetData = { ...sheetData, name: sheetName };
    exportToCSV(updatedSheetData);
    
    toast({
      title: 'Sheet Exported',
      description: `"${sheetName}" has been exported as CSV to your downloads.`,
    });
    
    onOpenChange(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const loadedSheet = await loadSheetFromFile(file);
      onLoad(loadedSheet);
      
      toast({
        title: 'Sheet Loaded',
        description: `"${loadedSheet.name}" has been loaded successfully.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error loading file:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to load the file. Please ensure it is a valid GridCraft sheet.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Save or Load Sheet</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="save">Save</TabsTrigger>
            <TabsTrigger value="load">Load</TabsTrigger>
          </TabsList>
          
          <TabsContent value="save" className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sheetName" className="text-right">
                Sheet Name
              </Label>
              <Input
                id="sheetName"
                value={sheetName}
                onChange={handleNameChange}
                className="col-span-3"
                placeholder="My Spreadsheet"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button onClick={handleExportCSV} variant="outline">
                Export as CSV
              </Button>
              <Button onClick={handleSave}>Save as JSON</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="load" className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="loadFile" className="text-right">
                Select File
              </Label>
              <div className="col-span-3">
                <Input
                  id="loadFile"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                />
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground py-2">
              Note: Only GridCraft JSON files are supported for loading.
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SaveLoadDialog;
