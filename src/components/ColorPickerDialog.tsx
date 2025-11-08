import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ColorValue = "blue" | "green" | "orange" | "purple" | "red" | "cyan" | "pink" | "yellow" | "indigo" | "teal" | "amber" | "lime" | "emerald" | "brown" | "gray" | "slate" | "zinc" | "stone" | "black";

interface ColorPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectColor: (color: ColorValue) => void;
  categoryTitle: string;
  currentColor: ColorValue;
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

export const ColorPickerDialog = ({ open, onOpenChange, onSelectColor, categoryTitle, currentColor }: ColorPickerDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card">
        <DialogHeader>
          <DialogTitle>Změnit barvu kategorie "{categoryTitle}"</DialogTitle>
          <DialogDescription>
            Vyber novou barvu pro hlavičku kategorie
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-6 gap-2 py-4">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => {
                onSelectColor(color.value);
                onOpenChange(false);
              }}
              title={color.label}
              className={`h-10 w-full rounded-lg hover:opacity-90 transition-all ${color.class} ${
                currentColor === color.value ? "ring-4 ring-ring ring-offset-2 scale-110" : "hover:scale-110"
              }`}
            />
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Zrušit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export type { ColorValue };
