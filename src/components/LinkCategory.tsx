import { ExternalLink, MoreVertical, Plus, Palette, GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ColorValue } from "@/components/ColorPickerDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, Trash2 } from "lucide-react";

interface Link {
  id: string;
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
  onReorderLinks: (links: Link[]) => void;
  onEditLink: (linkId: string) => void;
  onDeleteLink: (linkId: string) => void;
  editMode: boolean;
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
  brown: "bg-category-brown text-category-brown-foreground",
  gray: "bg-category-gray text-category-gray-foreground",
  slate: "bg-category-slate text-category-slate-foreground",
  zinc: "bg-category-zinc text-category-zinc-foreground",
  stone: "bg-category-stone text-category-stone-foreground",
  black: "bg-category-black text-category-black-foreground",
};

interface SortableLinkProps {
  link: Link;
  onEdit: () => void;
  onDelete: () => void;
  editMode: boolean;
}

const SortableLink = ({ link, onEdit, onDelete, editMode }: SortableLinkProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/link">
      <div className="flex items-start gap-2 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors duration-200">
        {editMode && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 opacity-0 group-hover/link:opacity-100 transition-opacity"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 flex-1 min-w-0 group/anchor"
        >
          <ExternalLink className="w-5 h-5 text-muted-foreground group-hover/anchor:text-foreground transition-colors mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover/anchor:text-accent transition-colors">
              {link.title}
            </h3>
            {link.description && (
              <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
            )}
          </div>
        </a>

        {editMode && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover/link:opacity-100 transition-opacity flex-shrink-0"
                onClick={(e) => e.preventDefault()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-popover z-50">
              <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                <Pencil className="mr-2 h-4 w-4" />
                Upravit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onDelete} 
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Smazat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export const LinkCategory = ({ 
  title, 
  links, 
  color, 
  onAddLink, 
  onChangeColor, 
  onReorderLinks,
  onEditLink,
  onDeleteLink,
  editMode
}: LinkCategoryProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((link) => link.id === active.id);
      const newIndex = links.findIndex((link) => link.id === over.id);
      const newLinks = arrayMove(links, oldIndex, newIndex);
      onReorderLinks(newLinks);
    }
  };

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
        {editMode ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={links.map((link) => link.id)}
              strategy={verticalListSortingStrategy}
            >
              {links.map((link) => (
                <SortableLink
                  key={link.id}
                  link={link}
                  onEdit={() => onEditLink(link.id)}
                  onDelete={() => onDeleteLink(link.id)}
                  editMode={editMode}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors duration-200 group/anchor"
            >
              <ExternalLink className="w-5 h-5 text-muted-foreground group-hover/anchor:text-foreground transition-colors mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground group-hover/anchor:text-accent transition-colors">
                  {link.title}
                </h3>
                {link.description && (
                  <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
                )}
              </div>
            </a>
          ))
        )}
      </div>
    </Card>
  );
};
