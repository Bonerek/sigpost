import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ColorValue = "blue" | "green" | "orange" | "purple" | "red" | "cyan" | "pink" | "yellow" | "indigo" | "teal" | "amber" | "lime" | "emerald" | "brown" | "gray" | "slate" | "zinc" | "stone" | "black";

interface TabData {
  id: string;
  name: string;
  color: ColorValue;
}

interface ColorPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectColor: (color: ColorValue, title: string, tabId: string, iframeUrl?: string, iframeRefreshInterval?: number) => void;
  categoryTitle: string;
  currentColor: ColorValue;
  currentTabId: string | null;
  tabs: TabData[];
  currentIframeUrl?: string | null;
  currentIframeRefreshInterval?: number | null;
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

export const ColorPickerDialog = ({ 
  open, 
  onOpenChange, 
  onSelectColor, 
  categoryTitle, 
  currentColor, 
  currentTabId, 
  tabs,
  currentIframeUrl,
  currentIframeRefreshInterval 
}: ColorPickerDialogProps) => {
  const [title, setTitle] = useState(categoryTitle);
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const [selectedTabId, setSelectedTabId] = useState(currentTabId || "");
  const [iframeUrl, setIframeUrl] = useState(currentIframeUrl || "");
  const [iframeRefreshInterval, setIframeRefreshInterval] = useState<string>(
    currentIframeRefreshInterval?.toString() || ""
  );
  const [isIframeMode, setIsIframeMode] = useState(!!currentIframeUrl);

  useEffect(() => {
    setTitle(categoryTitle);
    setSelectedColor(currentColor);
    setSelectedTabId(currentTabId || "");
    setIframeUrl(currentIframeUrl || "");
    setIframeRefreshInterval(currentIframeRefreshInterval?.toString() || "");
    setIsIframeMode(!!currentIframeUrl);
  }, [categoryTitle, currentColor, currentTabId, currentIframeUrl, currentIframeRefreshInterval, open]);

  const handleSave = () => {
    if (title.trim() && selectedTabId) {
      const refreshInterval = iframeRefreshInterval ? parseInt(iframeRefreshInterval, 10) : undefined;
      onSelectColor(
        selectedColor, 
        title.trim(), 
        selectedTabId,
        isIframeMode && iframeUrl.trim() ? iframeUrl.trim() : undefined,
        isIframeMode && refreshInterval ? refreshInterval : undefined
      );
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card">
        <DialogHeader>
          <DialogTitle>Edit category "{categoryTitle}"</DialogTitle>
          <DialogDescription>
            Change the name, color or tab of the category
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="category-title">Category name</Label>
            <Input
              id="category-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Technology"
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
                  onClick={() => setSelectedColor(color.value)}
                  title={color.label}
                  className={`h-10 w-full rounded-lg hover:opacity-90 transition-all ${color.class} ${
                    selectedColor === color.value ? "ring-4 ring-ring ring-offset-2 scale-110" : "hover:scale-110"
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Iframe mode toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="iframe-mode"
              checked={isIframeMode}
              onCheckedChange={setIsIframeMode}
            />
            <Label htmlFor="iframe-mode">Display external page (iframe)</Label>
          </div>
          
          {isIframeMode && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="iframe-url">Page URL</Label>
                <Input
                  id="iframe-url"
                  value={iframeUrl}
                  onChange={(e) => setIframeUrl(e.target.value)}
                  placeholder="https://example.com"
                  type="url"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="iframe-refresh">Refresh interval (seconds, 1-3600)</Label>
                <Input
                  id="iframe-refresh"
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
          <Button onClick={handleSave} disabled={!title.trim() || !selectedTabId}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export type { ColorValue };
