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
import { IconType } from "./AddLinkDialog";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Monitor, Laptop, DollarSign, ShoppingCart, Mail, FileText, Calendar, Settings, Home, Globe,
  Github, Code, Book, Terminal, Users, Zap, Star, Briefcase, Lightbulb, Camera, Bookmark,
  Database, Folder, Rocket, Image, Heart, Video, Download, CheckSquare, Trophy, Flag,
  TrendingUp, Gift, Linkedin, Twitter, Instagram, Facebook, Music, Server, ChevronRight,
  LucideIcon
} from "lucide-react";

interface IconOption {
  value: IconType;
  Icon: LucideIcon;
  label: string;
}

interface IconGroup {
  name: string;
  icons: IconOption[];
}

const iconGroups: IconGroup[] = [
  {
    name: "IT & Programování",
    icons: [
      { value: "github", Icon: Github, label: "GitHub" },
      { value: "code", Icon: Code, label: "Kód" },
      { value: "terminal", Icon: Terminal, label: "Terminál" },
      { value: "database", Icon: Database, label: "Databáze" },
      { value: "server", Icon: Server, label: "Server" },
      { value: "zap", Icon: Zap, label: "Rychlost" },
    ]
  },
  {
    name: "Sociální sítě",
    icons: [
      { value: "linkedin", Icon: Linkedin, label: "LinkedIn" },
      { value: "twitter", Icon: Twitter, label: "Twitter" },
      { value: "instagram", Icon: Instagram, label: "Instagram" },
      { value: "facebook", Icon: Facebook, label: "Facebook" },
      { value: "youtube", Icon: Video, label: "YouTube" },
      { value: "users", Icon: Users, label: "Komunita" },
    ]
  },
  {
    name: "Multimedia",
    icons: [
      { value: "camera", Icon: Camera, label: "Fotografie" },
      { value: "video", Icon: Video, label: "Video" },
      { value: "music", Icon: Music, label: "Hudba" },
      { value: "image", Icon: Image, label: "Obrázek" },
    ]
  },
  {
    name: "E-commerce & Finance",
    icons: [
      { value: "shopping-cart", Icon: ShoppingCart, label: "Nákupy" },
      { value: "dollar", Icon: DollarSign, label: "Finance" },
      { value: "trending-up", Icon: TrendingUp, label: "Růst" },
      { value: "gift", Icon: Gift, label: "Dárek" },
    ]
  },
  {
    name: "Kancelář & Produktivita",
    icons: [
      { value: "briefcase", Icon: Briefcase, label: "Práce" },
      { value: "file", Icon: FileText, label: "Soubor" },
      { value: "folder", Icon: Folder, label: "Složka" },
      { value: "calendar", Icon: Calendar, label: "Kalendář" },
      { value: "mail", Icon: Mail, label: "E-mail" },
      { value: "check-square", Icon: CheckSquare, label: "Úkoly" },
    ]
  },
  {
    name: "Ostatní",
    icons: [
      { value: "home", Icon: Home, label: "Domů" },
      { value: "globe", Icon: Globe, label: "Web" },
      { value: "settings", Icon: Settings, label: "Nastavení" },
      { value: "star", Icon: Star, label: "Hvězda" },
      { value: "lightbulb", Icon: Lightbulb, label: "Nápad" },
      { value: "bookmark", Icon: Bookmark, label: "Záložka" },
      { value: "rocket", Icon: Rocket, label: "Start" },
      { value: "heart", Icon: Heart, label: "Oblíbené" },
      { value: "download", Icon: Download, label: "Stažení" },
      { value: "trophy", Icon: Trophy, label: "Úspěch" },
      { value: "flag", Icon: Flag, label: "Vlajka" },
      { value: "monitor", Icon: Monitor, label: "Monitor" },
      { value: "laptop", Icon: Laptop, label: "Laptop" },
      { value: "book", Icon: Book, label: "Kniha" },
    ]
  },
];

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
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {iconGroups.map((group) => (
                <Collapsible key={group.name}>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between hover:bg-accent"
                    >
                      <span className="font-medium">{group.name}</span>
                      <ChevronRight className="h-4 w-4 transition-transform ui-expanded:rotate-90" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <div className="grid grid-cols-6 gap-2 pl-2">
                      {group.icons.map(({ value, Icon, label }) => (
                        <Button
                          key={value}
                          type="button"
                          variant="outline"
                          size="icon"
                          className={cn(
                            "h-12 w-12",
                            selectedIcon === value && "bg-accent text-accent-foreground border-primary"
                          )}
                          onClick={() => setSelectedIcon(selectedIcon === value ? undefined : value)}
                          title={label}
                        >
                          <Icon className="h-5 w-5" />
                        </Button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
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
