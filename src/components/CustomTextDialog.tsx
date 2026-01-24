import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomTextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (text: string) => void;
  currentText: string;
}

export const CustomTextDialog = ({
  open,
  onOpenChange,
  onSave,
  currentText,
}: CustomTextDialogProps) => {
  const [text, setText] = useState(currentText);

  useEffect(() => {
    setText(currentText);
  }, [currentText, open]);

  const handleSave = () => {
    onSave(text);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Custom text</DialogTitle>
          <DialogDescription>
            Enter the text to display in the header.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="custom-text">Text</Label>
            <Input
              id="custom-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
