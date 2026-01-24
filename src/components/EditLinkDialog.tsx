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
  LucideIcon, Wifi, Network, Radio, Cable
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
    name: "IT & Programming",
    icons: [
      { value: "github", Icon: Github, label: "GitHub" },
      { value: "code", Icon: Code, label: "Code" },
      { value: "terminal", Icon: Terminal, label: "Terminal/SSH" },
      { value: "database", Icon: Database, label: "Database" },
      { value: "server", Icon: Server, label: "Server" },
      { value: "monitor", Icon: Monitor, label: "Monitor/VNC/RDP" },
      { value: "wifi", Icon: Wifi, label: "WiFi/Remote" },
      { value: "network", Icon: Network, label: "Network" },
      { value: "radio", Icon: Radio, label: "Wireless" },
      { value: "cable", Icon: Cable, label: "Cable" },
      { value: "zap", Icon: Zap, label: "Speed" },
    ]
  },
  {
    name: "Social Media",
    icons: [
      { value: "linkedin", Icon: Linkedin, label: "LinkedIn" },
      { value: "twitter", Icon: Twitter, label: "Twitter" },
      { value: "instagram", Icon: Instagram, label: "Instagram" },
      { value: "facebook", Icon: Facebook, label: "Facebook" },
      { value: "youtube", Icon: Video, label: "YouTube" },
      { value: "users", Icon: Users, label: "Community" },
    ]
  },
  {
    name: "Multimedia",
    icons: [
      { value: "camera", Icon: Camera, label: "Photography" },
      { value: "video", Icon: Video, label: "Video" },
      { value: "music", Icon: Music, label: "Music" },
      { value: "image", Icon: Image, label: "Image" },
    ]
  },
  {
    name: "E-commerce & Finance",
    icons: [
      { value: "shopping-cart", Icon: ShoppingCart, label: "Shopping" },
      { value: "dollar", Icon: DollarSign, label: "Finance" },
      { value: "trending-up", Icon: TrendingUp, label: "Growth" },
      { value: "gift", Icon: Gift, label: "Gift" },
    ]
  },
  {
    name: "Office & Productivity",
    icons: [
      { value: "briefcase", Icon: Briefcase, label: "Work" },
      { value: "file", Icon: FileText, label: "File" },
      { value: "folder", Icon: Folder, label: "Folder" },
      { value: "calendar", Icon: Calendar, label: "Calendar" },
      { value: "mail", Icon: Mail, label: "Email" },
      { value: "check-square", Icon: CheckSquare, label: "Tasks" },
    ]
  },
  {
    name: "Other",
    icons: [
      { value: "home", Icon: Home, label: "Home" },
      { value: "globe", Icon: Globe, label: "Web" },
      { value: "settings", Icon: Settings, label: "Settings" },
      { value: "star", Icon: Star, label: "Star" },
      { value: "lightbulb", Icon: Lightbulb, label: "Idea" },
      { value: "bookmark", Icon: Bookmark, label: "Bookmark" },
      { value: "rocket", Icon: Rocket, label: "Launch" },
      { value: "heart", Icon: Heart, label: "Favorites" },
      { value: "download", Icon: Download, label: "Download" },
      { value: "trophy", Icon: Trophy, label: "Achievement" },
      { value: "flag", Icon: Flag, label: "Flag" },
      { value: "laptop", Icon: Laptop, label: "Laptop" },
      { value: "book", Icon: Book, label: "Book" },
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
          <DialogTitle>Edit link in "{categoryTitle}"</DialogTitle>
          <DialogDescription>
            Update the link information
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-title">Link name *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Google"
              maxLength={100}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-url">URL address *</Label>
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
            <Label htmlFor="edit-description">Description (optional)</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the link"
              maxLength={200}
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label>Icon (optional)</Label>
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
            Cancel
          </Button>
          <Button onClick={handleEdit} disabled={!title.trim() || !url.trim()}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
