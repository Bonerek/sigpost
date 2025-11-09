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

interface EditTabDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; color: ColorValue }) => void;
  initialName: string;
  initialColor: ColorValue;
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

export const EditTabDialog = ({
  open,
  onOpenChange,
  onSubmit,
  initialName,
  initialColor,
}: EditTabDialogProps) => {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState<ColorValue>(initialColor);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({ name: name.trim(), color });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upravit záložku</DialogTitle>
          <DialogDescription>
            Změňte název nebo barvu záložky.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Název záložky</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Zadejte název záložky..."
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label>Barva</Label>
              <div className="grid grid-cols-6 gap-2">
                {colors.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    type="button"
                    onClick={() => setColor(colorOption.value)}
                    title={colorOption.label}
                    className={`h-10 w-full rounded-lg hover:opacity-90 transition-all ${colorOption.class} ${
                      color === colorOption.value ? "ring-4 ring-ring ring-offset-2 scale-110" : "hover:scale-110"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Zrušit
            </Button>
            <Button type="submit">Uložit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
