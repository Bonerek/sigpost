import { useState } from "react";
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
import type { ColorValue } from "./ColorPickerDialog";

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (category: { title: string; color: ColorValue }) => void;
}

const colors: Array<{ value: ColorValue; label: string; class: string }> = [
  { value: "blue", label: "Modrá", class: "bg-blue-500" },
  { value: "red", label: "Červená", class: "bg-red-500" },
  { value: "green", label: "Zelená", class: "bg-green-500" },
  { value: "purple", label: "Fialová", class: "bg-purple-500" },
  { value: "orange", label: "Oranžová", class: "bg-orange-500" },
  { value: "cyan", label: "Azurová", class: "bg-cyan-500" },
  { value: "pink", label: "Růžová", class: "bg-pink-500" },
  { value: "yellow", label: "Žlutá", class: "bg-yellow-500" },
];

export const AddCategoryDialog = ({ open, onOpenChange, onAdd }: AddCategoryDialogProps) => {
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState<ColorValue>("blue");

  const handleAdd = () => {
    if (title.trim()) {
      onAdd({ title: title.trim(), color: selectedColor });
      setTitle("");
      setSelectedColor("blue");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Přidat novou kategorii</DialogTitle>
          <DialogDescription>
            Vytvořte novou kategorii pro organizaci odkazů.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Název kategorie</Label>
            <Input
              id="title"
              placeholder="např. Sociální sítě"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <div className="grid gap-2">
            <Label>Barva</Label>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`h-10 rounded-md transition-all ${color.class} ${
                    selectedColor === color.value
                      ? "ring-2 ring-primary ring-offset-2 scale-110"
                      : "hover:scale-105"
                  }`}
                  aria-label={color.label}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Zrušit
          </Button>
          <Button onClick={handleAdd} disabled={!title.trim()}>
            Přidat kategorii
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
