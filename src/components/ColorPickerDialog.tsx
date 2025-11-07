import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ColorPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectColor: (color: "blue" | "green" | "orange" | "purple" | "red" | "cyan") => void;
  categoryTitle: string;
  currentColor: "blue" | "green" | "orange" | "purple" | "red" | "cyan";
}

const colors: Array<{ value: "blue" | "green" | "orange" | "purple" | "red" | "cyan"; label: string; class: string }> = [
  { value: "blue", label: "Modrá", class: "bg-category-blue" },
  { value: "green", label: "Zelená", class: "bg-category-green" },
  { value: "orange", label: "Oranžová", class: "bg-category-orange" },
  { value: "purple", label: "Fialová", class: "bg-category-purple" },
  { value: "red", label: "Červená", class: "bg-category-red" },
  { value: "cyan", label: "Tyrkysová", class: "bg-category-cyan" },
];

export const ColorPickerDialog = ({ open, onOpenChange, onSelectColor, categoryTitle, currentColor }: ColorPickerDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>Změnit barvu kategorie "{categoryTitle}"</DialogTitle>
          <DialogDescription>
            Vyber novou barvu pro hlavičku kategorie
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-4">
          {colors.map((color) => (
            <Button
              key={color.value}
              onClick={() => {
                onSelectColor(color.value);
                onOpenChange(false);
              }}
              variant="outline"
              className={`h-20 text-white hover:text-white hover:opacity-90 ${color.class} ${
                currentColor === color.value ? "ring-4 ring-ring ring-offset-2" : ""
              }`}
            >
              <span className="font-semibold text-lg">{color.label}</span>
            </Button>
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
