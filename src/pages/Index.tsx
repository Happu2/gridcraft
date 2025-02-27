
import { useState } from "react";
import Spreadsheet from "@/components/Spreadsheet";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

const Index = () => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-cell-border p-2 flex items-center justify-between animate-slide-in">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">GridCraft</h1>
          <span className="text-sm text-muted-foreground">Beta</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={showHelp} onOpenChange={setShowHelp}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Help
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Using GridCraft</DialogTitle>
                <DialogDescription>
                  A Google Sheets-inspired spreadsheet application
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <h3 className="font-semibold">Supported Formulas</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><code>=SUM(A1:A5)</code> - Calculate the sum of values in a range</li>
                  <li><code>=AVERAGE(B1:B10)</code> - Calculate the average of values in a range</li>
                  <li><code>=MAX(C1:C20)</code> - Find the maximum value in a range</li>
                  <li><code>=MIN(D1:D20)</code> - Find the minimum value in a range</li>
                  <li><code>=COUNT(E1:E20)</code> - Count numeric values in a range</li>
                </ul>
                
                <h3 className="font-semibold">Data Quality Functions</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><code>=TRIM(A1)</code> - Remove leading and trailing whitespace</li>
                  <li><code>=UPPER(B1)</code> - Convert text to uppercase</li>
                  <li><code>=LOWER(C1)</code> - Convert text to lowercase</li>
                </ul>
                
                <h3 className="font-semibold">Tips</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Double-click a cell to edit directly</li>
                  <li>Use the toolbar to format cells</li>
                  <li>Add and delete rows/columns from the toolbar</li>
                  <li>Use Find & Replace to update multiple cells</li>
                </ul>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>
      
      {/* Main content - Spreadsheet */}
      <main className="flex-grow overflow-hidden">
        <Spreadsheet />
      </main>
    </div>
  );
};

export default Index;
