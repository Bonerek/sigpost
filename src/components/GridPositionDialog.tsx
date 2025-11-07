import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";

interface GridPositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (newRow: boolean, columnStart?: 1 | 2 | 3 | 4 | 5) => void;
  currentNewRow: boolean;
  currentColumnStart?: 1 | 2 | 3 | 4 | 5;
}

export const GridPositionDialog = ({
  open,
  onOpenChange,
  onSave,
  currentNewRow,
  currentColumnStart,
}: GridPositionDialogProps) => {
  const [newRow, setNewRow] = useState(currentNewRow);
  const [columnStart, setColumnStart] = useState<string>(currentColumnStart?.toString() || "auto");

  useEffect(() => {
    setNewRow(currentNewRow);
    setColumnStart(currentColumnStart?.toString() || "auto");
  }, [currentNewRow, currentColumnStart, open]);

  const handleSave = () => {
    const colStart = columnStart === "auto" ? undefined : parseInt(columnStart) as 1 | 2 | 3 | 4 | 5;
    onSave(newRow, colStart);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pozice v mřížce</DialogTitle>
          <DialogDescription>
            Nastavte umístění kategorie v mřížce.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="new-row"
              checked={newRow}
              onChange={(e) => setNewRow(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="new-row">Začít na novém řádku</Label>
          </div>
          
          <div className="grid gap-2">
            <Label>Pozice sloupce</Label>
            <RadioGroup value={columnStart} onValueChange={setColumnStart}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto" id="auto" />
                <Label htmlFor="auto">Automaticky</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="col1" />
                <Label htmlFor="col1">Sloupec 1</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="col2" />
                <Label htmlFor="col2">Sloupec 2</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="col3" />
                <Label htmlFor="col3">Sloupec 3</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Zrušit
          </Button>
          <Button onClick={handleSave}>Uložit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
