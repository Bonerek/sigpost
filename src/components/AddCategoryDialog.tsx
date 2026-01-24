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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ColorValue } from "./ColorPickerDialog";

interface TabData {
  id: string;
  name: string;
  color: ColorValue;
}

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (category: { title: string; color: ColorValue; tabId: string }) => void;
  tabs: TabData[];
  activeTabId: string;
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

export const AddCategoryDialog = ({ open, onOpenChange, onAdd, tabs, activeTabId }: AddCategoryDialogProps) => {
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState<ColorValue>("blue");
  const [selectedTabId, setSelectedTabId] = useState(activeTabId);

  // Reset selected tab when dialog opens or activeTabId changes
  useEffect(() => {
    if (open) {
      setSelectedTabId(activeTabId);
    }
  }, [open, activeTabId]);

  const handleAdd = () => {
    if (title.trim() && selectedTabId) {
      onAdd({ title: title.trim(), color: selectedColor, tabId: selectedTabId });
      setTitle("");
      setSelectedColor("blue");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add new category</DialogTitle>
          <DialogDescription>
            Create a new category to organize your links.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Category name</Label>
            <Input
              id="title"
              placeholder="e.g. Social Media"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tab">Tab</Label>
            <Select value={selectedTabId} onValueChange={setSelectedTabId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a tab" />
              </SelectTrigger>
              <SelectContent>
                {tabs.map((tab) => (
                  <SelectItem key={tab.id} value={tab.id}>
                    {tab.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Color</Label>
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
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!title.trim() || !selectedTabId}>
            Add category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
