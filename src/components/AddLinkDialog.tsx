import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Monitor, Laptop, DollarSign, ShoppingCart, Mail, FileText, Calendar, Settings, Home, Globe, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type IconType = "monitor" | "laptop" | "dollar" | "cart" | "mail" | "file" | "calendar" | "settings" | "home" | "globe";

export const iconOptions: { value: IconType; Icon: LucideIcon; label: string }[] = [
  { value: "monitor", Icon: Monitor, label: "Monitor" },
  { value: "laptop", Icon: Laptop, label: "Laptop" },
  { value: "dollar", Icon: DollarSign, label: "Dollar" },
  { value: "cart", Icon: ShoppingCart, label: "Shopping" },
  { value: "mail", Icon: Mail, label: "Mail" },
  { value: "file", Icon: FileText, label: "File" },
  { value: "calendar", Icon: Calendar, label: "Calendar" },
  { value: "settings", Icon: Settings, label: "Settings" },
  { value: "home", Icon: Home, label: "Home" },
  { value: "globe", Icon: Globe, label: "Globe" },
];

interface AddLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (link: { title: string; url: string; description?: string; icon?: IconType }) => void;
  categoryTitle: string;
}

export const AddLinkDialog = ({ open, onOpenChange, onAdd, categoryTitle }: AddLinkDialogProps) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<IconType | undefined>(undefined);

  const handleAdd = () => {
    if (title.trim() && url.trim()) {
      onAdd({
        title: title.trim(),
        url: url.trim(),
        description: description.trim() || undefined,
        icon: selectedIcon,
      });
      // Reset form
      setTitle("");
      setUrl("");
      setDescription("");
      setSelectedIcon(undefined);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>Přidat odkaz do kategorie "{categoryTitle}"</DialogTitle>
          <DialogDescription>
            Vyplň informace o novém odkazu
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Název odkazu *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="např. Google"
              maxLength={100}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="url">URL adresa *</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.example.com"
              maxLength={500}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Popis (volitelné)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Stručný popis odkazu"
              maxLength={200}
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label>Ikona (volitelné)</Label>
            <div className="grid grid-cols-5 gap-2">
              {iconOptions.map(({ value, Icon, label }) => (
                <Button
                  key={value}
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-12 w-12",
                    selectedIcon === value && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => setSelectedIcon(selectedIcon === value ? undefined : value)}
                  title={label}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Zrušit
          </Button>
          <Button onClick={handleAdd} disabled={!title.trim() || !url.trim()}>
            Přidat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
