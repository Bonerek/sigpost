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
  { value: "blue", label: "Modrá", class: "bg-category-blue" },
  { value: "indigo", label: "Indigo", class: "bg-category-indigo" },
  { value: "purple", label: "Fialová", class: "bg-category-purple" },
  { value: "pink", label: "Růžová", class: "bg-category-pink" },
  { value: "red", label: "Červená", class: "bg-category-red" },
  { value: "orange", label: "Oranžová", class: "bg-category-orange" },
  { value: "amber", label: "Jantarová", class: "bg-category-amber" },
  { value: "lime", label: "Limetková", class: "bg-category-lime" },
  { value: "green", label: "Zelená", class: "bg-category-green" },
  { value: "emerald", label: "Smaragdová", class: "bg-category-emerald" },
  { value: "teal", label: "Tyrkysově modrá", class: "bg-category-teal" },
  { value: "cyan", label: "Tyrkysová", class: "bg-category-cyan" },
  { value: "brown", label: "Hnědá", class: "bg-category-brown" },
  { value: "gray", label: "Šedá", class: "bg-category-gray" },
  { value: "slate", label: "Břidlicová", class: "bg-category-slate" },
  { value: "zinc", label: "Zinková", class: "bg-category-zinc" },
  { value: "stone", label: "Kamenná", class: "bg-category-stone" },
  { value: "black", label: "Černá", class: "bg-category-black" },
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
            <div className="grid grid-cols-6 gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  title={color.label}
                  className={`h-10 rounded-lg hover:opacity-90 transition-all ${color.class} ${
                    selectedColor === color.value
                      ? "ring-4 ring-ring ring-offset-2 scale-110"
                      : "hover:scale-110"
                  }`}
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
