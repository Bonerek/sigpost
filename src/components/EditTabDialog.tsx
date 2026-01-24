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
import type { ColorValue } from "./ColorPickerDialog";

interface EditTabDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; color: ColorValue }) => void;
  initialName: string;
  initialColor: ColorValue;
}

const colors: Array<{ value: ColorValue; label: string; class: string }> = [
  { value: "blue", label: "Blue", class: "bg-category-blue" },
  { value: "indigo", label: "Indigo", class: "bg-category-indigo" },
  { value: "purple", label: "Purple", class: "bg-category-purple" },
  { value: "pink", label: "Pink", class: "bg-category-pink" },
  { value: "red", label: "Red", class: "bg-category-red" },
  { value: "orange", label: "Orange", class: "bg-category-orange" },
  { value: "amber", label: "Amber", class: "bg-category-amber" },
  { value: "lime", label: "Lime", class: "bg-category-lime" },
  { value: "green", label: "Green", class: "bg-category-green" },
  { value: "emerald", label: "Emerald", class: "bg-category-emerald" },
  { value: "teal", label: "Teal", class: "bg-category-teal" },
  { value: "cyan", label: "Cyan", class: "bg-category-cyan" },
  { value: "brown", label: "Brown", class: "bg-category-brown" },
  { value: "gray", label: "Gray", class: "bg-category-gray" },
  { value: "slate", label: "Slate", class: "bg-category-slate" },
  { value: "zinc", label: "Zinc", class: "bg-category-zinc" },
  { value: "stone", label: "Stone", class: "bg-category-stone" },
  { value: "black", label: "Black", class: "bg-category-black" },
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

  useEffect(() => {
    if (open) {
      setName(initialName);
      setColor(initialColor);
    }
  }, [open, initialName, initialColor]);

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
          <DialogTitle>Edit tab</DialogTitle>
          <DialogDescription>
            Change the name or color of the tab.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tab name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter tab name..."
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label>Color</Label>
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
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
