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
import { Switch } from "@/components/ui/switch";
import type { ColorValue } from "./ColorPickerDialog";

interface TabData {
  id: string;
  name: string;
  color: ColorValue;
}

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (category: { title: string; color: ColorValue; tabId: string; iframeUrl?: string; iframeRefreshInterval?: number }) => void;
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
  const [isIframeMode, setIsIframeMode] = useState(false);
  const [iframeUrl, setIframeUrl] = useState("");
  const [iframeRefreshInterval, setIframeRefreshInterval] = useState<string>("");

  // Reset selected tab when dialog opens or activeTabId changes
  useEffect(() => {
    if (open) {
      setSelectedTabId(activeTabId);
      setTitle("");
      setSelectedColor("blue");
      setIsIframeMode(false);
      setIframeUrl("");
      setIframeRefreshInterval("");
    }
  }, [open, activeTabId]);

  const handleAdd = () => {
    if (title.trim() && selectedTabId) {
      const refreshInterval = iframeRefreshInterval ? parseInt(iframeRefreshInterval, 10) : undefined;
      onAdd({ 
        title: title.trim(), 
        color: selectedColor, 
        tabId: selectedTabId,
        iframeUrl: isIframeMode && iframeUrl.trim() ? iframeUrl.trim() : undefined,
        iframeRefreshInterval: isIframeMode && refreshInterval ? refreshInterval : undefined,
      });
      setTitle("");
      setSelectedColor("blue");
      setIsIframeMode(false);
      setIframeUrl("");
      setIframeRefreshInterval("");
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
          
          {/* Iframe mode toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="iframe-mode-add"
              checked={isIframeMode}
              onCheckedChange={setIsIframeMode}
            />
            <Label htmlFor="iframe-mode-add">Display external page (iframe)</Label>
          </div>
          
          {isIframeMode && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="iframe-url-add">Page URL</Label>
                <Input
                  id="iframe-url-add"
                  value={iframeUrl}
                  onChange={(e) => setIframeUrl(e.target.value)}
                  placeholder="https://example.com"
                  type="url"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="iframe-refresh-add">Refresh interval (seconds, 1-3600)</Label>
                <Input
                  id="iframe-refresh-add"
                  value={iframeRefreshInterval}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || (/^\d+$/.test(value) && parseInt(value, 10) >= 0 && parseInt(value, 10) <= 3600)) {
                      setIframeRefreshInterval(value);
                    }
                  }}
                  placeholder="60"
                  type="number"
                  min="1"
                  max="3600"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for no auto-refresh. Range: 1 second to 1 hour.
                </p>
              </div>
            </>
          )}
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
