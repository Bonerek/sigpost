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
import { iconOptions, IconType } from "./AddLinkDialog";
import { cn } from "@/lib/utils";

interface EditLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (link: { title: string; url: string; description?: string; icon?: IconType }) => void;
  linkData: {
    title: string;
    url: string;
    description?: string;
    icon?: IconType;
  };
  categoryTitle: string;
}

export const EditLinkDialog = ({ open, onOpenChange, onEdit, linkData, categoryTitle }: EditLinkDialogProps) => {
  const [title, setTitle] = useState(linkData.title);
  const [url, setUrl] = useState(linkData.url);
  const [description, setDescription] = useState(linkData.description || "");
  const [selectedIcon, setSelectedIcon] = useState<IconType | undefined>(linkData.icon);

  // Update local state when linkData changes
  useState(() => {
    setTitle(linkData.title);
    setUrl(linkData.url);
    setDescription(linkData.description || "");
    setSelectedIcon(linkData.icon);
  });

  const handleEdit = () => {
    if (title.trim() && url.trim()) {
      onEdit({
        title: title.trim(),
        url: url.trim(),
        description: description.trim() || undefined,
        icon: selectedIcon,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>Upravit odkaz v kategorii "{categoryTitle}"</DialogTitle>
          <DialogDescription>
            Změň informace o odkazu
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-title">Název odkazu *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="např. Google"
              maxLength={100}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-url">URL adresa *</Label>
            <Input
              id="edit-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.example.com"
              maxLength={500}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-description">Popis (volitelné)</Label>
            <Textarea
              id="edit-description"
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
          <Button onClick={handleEdit} disabled={!title.trim() || !url.trim()}>
            Uložit změny
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
