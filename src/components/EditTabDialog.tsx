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

const colors: ColorValue[] = [
  "blue", "green", "orange", "purple", "red", "cyan", "pink", "yellow",
  "indigo", "teal", "amber", "lime", "emerald", "brown", "gray", "slate",
  "zinc", "stone", "black"
];

const colorClasses: Record<ColorValue, string> = {
  blue: "bg-category-blue",
  green: "bg-category-green",
  orange: "bg-category-orange",
  purple: "bg-category-purple",
  red: "bg-category-red",
  cyan: "bg-category-cyan",
  pink: "bg-category-pink",
  yellow: "bg-category-yellow",
  indigo: "bg-category-indigo",
  teal: "bg-category-teal",
  amber: "bg-category-amber",
  lime: "bg-category-lime",
  emerald: "bg-category-emerald",
  brown: "bg-category-brown",
  gray: "bg-category-gray",
  slate: "bg-category-slate",
  zinc: "bg-category-zinc",
  stone: "bg-category-stone",
  black: "bg-category-black",
};

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
                    key={colorOption}
                    type="button"
                    onClick={() => setColor(colorOption)}
                    className={`h-10 rounded-md transition-all ${colorClasses[colorOption]} ${
                      color === colorOption
                        ? "ring-2 ring-primary ring-offset-2"
                        : "hover:scale-110"
                    }`}
                    title={colorOption}
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
