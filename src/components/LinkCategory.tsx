import { ExternalLink, MoreVertical, Plus, Palette } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ColorValue } from "@/components/ColorPickerDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Link {
  title: string;
  url: string;
  description?: string;
}

interface LinkCategoryProps {
  title: string;
  links: Link[];
  color: ColorValue;
  onAddLink: () => void;
  onChangeColor: () => void;
}

const colorClasses: Record<ColorValue, string> = {
  blue: "bg-category-blue text-category-blue-foreground",
  green: "bg-category-green text-category-green-foreground",
  orange: "bg-category-orange text-category-orange-foreground",
  purple: "bg-category-purple text-category-purple-foreground",
  red: "bg-category-red text-category-red-foreground",
  cyan: "bg-category-cyan text-category-cyan-foreground",
  pink: "bg-category-pink text-category-pink-foreground",
  indigo: "bg-category-indigo text-category-indigo-foreground",
  teal: "bg-category-teal text-category-teal-foreground",
  amber: "bg-category-amber text-category-amber-foreground",
  lime: "bg-category-lime text-category-lime-foreground",
  emerald: "bg-category-emerald text-category-emerald-foreground",
};

export const LinkCategory = ({ title, links, color, onAddLink, onChangeColor }: LinkCategoryProps) => {
  return (
    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className={`${colorClasses[color]} p-6 flex items-center justify-between`}>
        <h2 className="text-2xl font-bold">{title}</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white/20 text-current"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
            <DropdownMenuItem onClick={onAddLink} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Přidat odkaz
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onChangeColor} className="cursor-pointer">
              <Palette className="mr-2 h-4 w-4" />
              Změnit barvu
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="p-6 space-y-3">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors duration-200 group"
          >
            <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                {link.title}
              </h3>
              {link.description && (
                <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
              )}
            </div>
          </a>
        ))}
      </div>
    </Card>
  );
};
