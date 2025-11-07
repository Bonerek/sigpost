import { useState } from "react";
import { LinkCategory } from "@/components/LinkCategory";
import { AddLinkDialog } from "@/components/AddLinkDialog";
import { ColorPickerDialog } from "@/components/ColorPickerDialog";
import { Compass, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CategoryData {
  id: string;
  title: string;
  color: "blue" | "green" | "orange" | "purple" | "red" | "cyan";
  links: {
    title: string;
    url: string;
    description?: string;
  }[];
}

interface SortableCategoryProps {
  category: CategoryData;
  onAddLink: () => void;
  onChangeColor: () => void;
}

const SortableCategory = ({ category, onAddLink, onChangeColor }: SortableCategoryProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute -top-2 -left-2 z-10 p-2 bg-primary text-primary-foreground rounded-lg cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      <LinkCategory
        title={category.title}
        color={category.color}
        links={category.links}
        onAddLink={onAddLink}
        onChangeColor={onChangeColor}
      />
    </div>
  );
};

const Index = () => {
  const initialCategories: CategoryData[] = [
    {
      id: "tech",
      title: "Technologie",
      color: "blue" as const,
      links: [
        {
          title: "GitHub",
          url: "https://github.com",
          description: "Platforma pro vývoj a sdílení kódu",
        },
        {
          title: "Stack Overflow",
          url: "https://stackoverflow.com",
          description: "Komunita pro programátory",
        },
        {
          title: "MDN Web Docs",
          url: "https://developer.mozilla.org",
          description: "Dokumentace pro webové technologie",
        },
      ],
    },
    {
      id: "news",
      title: "Zprávy",
      color: "orange" as const,
      links: [
        {
          title: "iDNES.cz",
          url: "https://www.idnes.cz",
          description: "Zpravodajský portál",
        },
        {
          title: "Novinky.cz",
          url: "https://www.novinky.cz",
          description: "Aktuální zprávy ze světa i domova",
        },
        {
          title: "ČT24",
          url: "https://ct24.ceskatelevize.cz",
          description: "Zpravodajství České televize",
        },
      ],
    },
    {
      id: "social",
      title: "Sociální sítě",
      color: "purple" as const,
      links: [
        {
          title: "Facebook",
          url: "https://www.facebook.com",
          description: "Největší sociální síť",
        },
        {
          title: "Twitter / X",
          url: "https://twitter.com",
          description: "Mikroblogovací platforma",
        },
        {
          title: "LinkedIn",
          url: "https://www.linkedin.com",
          description: "Profesní síť",
        },
        {
          title: "Instagram",
          url: "https://www.instagram.com",
          description: "Sdílení fotek a videí",
        },
      ],
    },
    {
      id: "tools",
      title: "Nástroje",
      color: "green" as const,
      links: [
        {
          title: "Google Drive",
          url: "https://drive.google.com",
          description: "Cloudové úložiště",
        },
        {
          title: "Notion",
          url: "https://www.notion.so",
          description: "Nástroj pro produktivitu",
        },
        {
          title: "Figma",
          url: "https://www.figma.com",
          description: "Nástroj pro design",
        },
      ],
    },
    {
      id: "entertainment",
      title: "Zábava",
      color: "red" as const,
      links: [
        {
          title: "YouTube",
          url: "https://www.youtube.com",
          description: "Platforma pro sdílení videí",
        },
        {
          title: "Netflix",
          url: "https://www.netflix.com",
          description: "Streamovací služba",
        },
        {
          title: "Spotify",
          url: "https://www.spotify.com",
          description: "Hudební streaming",
        },
      ],
    },
    {
      id: "eshops",
      title: "E-shopy",
      color: "cyan" as const,
      links: [
        {
          title: "Alza.cz",
          url: "https://www.alza.cz",
          description: "Elektronika a gadgety",
        },
        {
          title: "Mall.cz",
          url: "https://www.mall.cz",
          description: "Největší český e-shop",
        },
        {
          title: "Amazon",
          url: "https://www.amazon.com",
          description: "Mezinárodní e-shop",
        },
      ],
    },
  ];

  const [categories, setCategories] = useState<CategoryData[]>(initialCategories);
  const [addLinkDialogOpen, setAddLinkDialogOpen] = useState(false);
  const [colorPickerDialogOpen, setColorPickerDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { toast } = useToast();

  const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddLink = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setAddLinkDialogOpen(true);
  };

  const handleChangeColor = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setColorPickerDialogOpen(true);
  };

  const handleAddLinkSubmit = (link: { title: string; url: string; description?: string }) => {
    if (selectedCategoryId) {
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id === selectedCategoryId
            ? { ...cat, links: [...cat.links, link] }
            : cat
        )
      );
      toast({
        title: "Odkaz přidán",
        description: `"${link.title}" byl úspěšně přidán.`,
      });
    }
  };

  const handleColorChange = (color: "blue" | "green" | "orange" | "purple" | "red" | "cyan") => {
    if (selectedCategoryId) {
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id === selectedCategoryId ? { ...cat, color } : cat
        )
      );
      toast({
        title: "Barva změněna",
        description: "Barva kategorie byla úspěšně aktualizována.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 justify-center">
            <Compass className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Rozcestník odkazů</h1>
          </div>
          <p className="text-center text-muted-foreground mt-3 text-lg">
            Rychlý přístup k oblíbeným webům • Přetáhni pro změnu pořadí
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories.map((cat) => cat.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <SortableCategory 
                  key={category.id} 
                  category={category}
                  onAddLink={() => handleAddLink(category.id)}
                  onChangeColor={() => handleChangeColor(category.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </main>

      <AddLinkDialog
        open={addLinkDialogOpen}
        onOpenChange={setAddLinkDialogOpen}
        onAdd={handleAddLinkSubmit}
        categoryTitle={selectedCategory?.title || ""}
      />

      <ColorPickerDialog
        open={colorPickerDialogOpen}
        onOpenChange={setColorPickerDialogOpen}
        onSelectColor={handleColorChange}
        categoryTitle={selectedCategory?.title || ""}
        currentColor={selectedCategory?.color || "blue"}
      />

      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>Vytvořeno s pomocí Lovable</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
