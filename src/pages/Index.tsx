import { useState } from "react";
import { LinkCategory } from "@/components/LinkCategory";
import { AddLinkDialog } from "@/components/AddLinkDialog";
import { EditLinkDialog } from "@/components/EditLinkDialog";
import { DeleteLinkDialog } from "@/components/DeleteLinkDialog";
import { DeleteCategoryDialog } from "@/components/DeleteCategoryDialog";
import { CustomTextDialog } from "@/components/CustomTextDialog";
import { ColorPickerDialog, type ColorValue } from "@/components/ColorPickerDialog";
import { AddCategoryDialog } from "@/components/AddCategoryDialog";
import { Compass, GripVertical, Menu, Sun, Moon, Laptop, Grid3x3, Edit, Type, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CategoryData {
  id: string;
  title: string;
  color: ColorValue;
  columnIndex: number; // Track which column this category belongs to
  links: Array<{
    id: string;
    title: string;
    url: string;
    description?: string;
  }>;
}

interface SortableCategoryProps {
  category: CategoryData;
  onAddLink: () => void;
  onChangeColor: () => void;
  onReorderLinks: (newLinks: Array<{id: string; title: string; url: string; description?: string}>) => void;
  onEditLink: (linkId: string) => void;
  onDeleteLink: (linkId: string) => void;
  onDeleteCategory: () => void;
  editMode: boolean;
}

const SortableCategory = ({ category, onAddLink, onChangeColor, onReorderLinks, onEditLink, onDeleteLink, onDeleteCategory, editMode }: SortableCategoryProps) => {
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
      {editMode && (
        <div
          {...attributes}
          {...listeners}
          className="absolute -top-2 -left-2 z-10 p-2 bg-primary text-primary-foreground rounded-lg cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
        >
          <GripVertical className="w-5 h-5" />
        </div>
      )}
      <LinkCategory
        title={category.title}
        color={category.color}
        links={category.links}
        onAddLink={onAddLink}
        onChangeColor={onChangeColor}
        onReorderLinks={onReorderLinks}
        onEditLink={onEditLink}
        onDeleteLink={onDeleteLink}
        onDeleteCategory={onDeleteCategory}
        editMode={editMode}
      />
    </div>
  );
};

interface DroppableColumnProps {
  columnIndex: number;
  categories: CategoryData[];
  editMode: boolean;
  onAddLink: (categoryId: string) => void;
  onChangeColor: (categoryId: string) => void;
  onReorderLinks: (categoryId: string, newLinks: Array<{id: string; title: string; url: string; description?: string}>) => void;
  onEditLink: (categoryId: string, linkId: string) => void;
  onDeleteLink: (categoryId: string, linkId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
}

const DroppableColumn = ({ 
  columnIndex, 
  categories, 
  editMode,
  onAddLink,
  onChangeColor,
  onReorderLinks,
  onEditLink,
  onDeleteLink,
  onDeleteCategory 
}: DroppableColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${columnIndex}`,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-col gap-6 min-h-[200px] p-4 rounded-lg transition-colors ${
        isOver && editMode ? 'bg-accent/20 border-2 border-dashed border-primary' : 'bg-transparent'
      }`}
    >
      <SortableContext
        items={categories.map((cat) => cat.id)}
        strategy={verticalListSortingStrategy}
      >
        {categories.map((category) => (
          editMode ? (
            <SortableCategory 
              key={category.id}
              category={category}
              onAddLink={() => onAddLink(category.id)}
              onChangeColor={() => onChangeColor(category.id)}
              onReorderLinks={(newLinks) => onReorderLinks(category.id, newLinks)}
              onEditLink={(linkId) => onEditLink(category.id, linkId)}
              onDeleteLink={(linkId) => onDeleteLink(category.id, linkId)}
              onDeleteCategory={() => onDeleteCategory(category.id)}
              editMode={editMode}
            />
          ) : (
            <LinkCategory
              key={category.id}
              title={category.title}
              color={category.color}
              links={category.links}
              onAddLink={() => onAddLink(category.id)}
              onChangeColor={() => onChangeColor(category.id)}
              onReorderLinks={(newLinks) => onReorderLinks(category.id, newLinks)}
              onEditLink={(linkId) => onEditLink(category.id, linkId)}
              onDeleteLink={(linkId) => onDeleteLink(category.id, linkId)}
              onDeleteCategory={() => onDeleteCategory(category.id)}
              editMode={editMode}
            />
          )
        ))}
      </SortableContext>
    </div>
  );
};

const Index = () => {
  const initialCategories: CategoryData[] = [
    {
      id: "tech",
      title: "Technologie",
      color: "blue" as const,
      columnIndex: 0,
      links: [
        {
          id: "github",
          title: "GitHub",
          url: "https://github.com",
          description: "Platforma pro vývoj a sdílení kódu",
        },
        {
          id: "stackoverflow",
          title: "Stack Overflow",
          url: "https://stackoverflow.com",
          description: "Komunita pro programátory",
        },
        {
          id: "mdn",
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
      columnIndex: 1,
      links: [
        {
          id: "idnes",
          title: "iDNES.cz",
          url: "https://www.idnes.cz",
          description: "Zpravodajský portál",
        },
        {
          id: "novinky",
          title: "Novinky.cz",
          url: "https://www.novinky.cz",
          description: "Aktuální zprávy ze světa i domova",
        },
        {
          id: "ct24",
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
      columnIndex: 2,
      links: [
        {
          id: "facebook",
          title: "Facebook",
          url: "https://www.facebook.com",
          description: "Největší sociální síť",
        },
        {
          id: "twitter",
          title: "Twitter / X",
          url: "https://twitter.com",
          description: "Mikroblogovací platforma",
        },
        {
          id: "linkedin",
          title: "LinkedIn",
          url: "https://www.linkedin.com",
          description: "Profesní síť",
        },
        {
          id: "instagram",
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
      columnIndex: 0,
      links: [
        {
          id: "gdrive",
          title: "Google Drive",
          url: "https://drive.google.com",
          description: "Cloudové úložiště",
        },
        {
          id: "notion",
          title: "Notion",
          url: "https://www.notion.so",
          description: "Nástroj pro produktivitu",
        },
        {
          id: "figma",
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
      columnIndex: 1,
      links: [
        {
          id: "youtube",
          title: "YouTube",
          url: "https://www.youtube.com",
          description: "Platforma pro sdílení videí",
        },
        {
          id: "netflix",
          title: "Netflix",
          url: "https://www.netflix.com",
          description: "Streamovací služba",
        },
        {
          id: "spotify",
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
      columnIndex: 2,
      links: [
        {
          id: "alza",
          title: "Alza.cz",
          url: "https://www.alza.cz",
          description: "Elektronika a gadgety",
        },
        {
          id: "mall",
          title: "Mall.cz",
          url: "https://www.mall.cz",
          description: "Největší český e-shop",
        },
        {
          id: "amazon",
          title: "Amazon",
          url: "https://www.amazon.com",
          description: "Mezinárodní e-shop",
        },
      ],
    },
  ];

  const [categories, setCategories] = useState<CategoryData[]>(initialCategories);
  const [addLinkDialogOpen, setAddLinkDialogOpen] = useState(false);
  const [editLinkDialogOpen, setEditLinkDialogOpen] = useState(false);
  const [deleteLinkDialogOpen, setDeleteLinkDialogOpen] = useState(false);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [colorPickerDialogOpen, setColorPickerDialogOpen] = useState(false);
  const [customTextDialogOpen, setCustomTextDialogOpen] = useState(false);
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [columns, setColumns] = useState<3 | 4 | 5>(3);
  const [editMode, setEditMode] = useState(false);
  const [customText, setCustomText] = useState("");
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);
  const selectedLink = selectedCategory?.links.find((link) => link.id === selectedLinkId);

  const handleDeleteCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setDeleteCategoryDialogOpen(true);
  };

  const handleDeleteCategoryConfirm = () => {
    if (selectedCategoryId) {
      const category = categories.find((cat) => cat.id === selectedCategoryId);
      
      setCategories((prevCategories) =>
        prevCategories.filter((cat) => cat.id !== selectedCategoryId)
      );
      toast({
        title: "Kategorie smazána",
        description: `Kategorie "${category?.title}" byla úspěšně smazána.`,
      });
    }
  };


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // If dropped on a column droppable
    if (overId.startsWith('column-')) {
      const targetColumnIndex = parseInt(overId.replace('column-', ''));
      setCategories((items) => 
        items.map((item) => 
          item.id === activeId ? { ...item, columnIndex: targetColumnIndex } : item
        )
      );
      return;
    }

    // If dropped on another category (reordering within or between columns)
    if (activeId !== overId) {
      setCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === activeId);
        const newIndex = items.findIndex((item) => item.id === overId);
        
        const activeItem = items[oldIndex];
        const overItem = items[newIndex];
        
        // Update the active item's column to match the over item's column
        const reordered = arrayMove(items, oldIndex, newIndex);
        return reordered.map((item) => 
          item.id === activeId ? { ...item, columnIndex: overItem.columnIndex } : item
        );
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
      const newLink = {
        ...link,
        id: `${selectedCategoryId}-${Date.now()}`,
      };
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id === selectedCategoryId
            ? { ...cat, links: [...cat.links, newLink] }
            : cat
        )
      );
      toast({
        title: "Odkaz přidán",
        description: `"${link.title}" byl úspěšně přidán.`,
      });
    }
  };

  const handleEditLink = (categoryId: string, linkId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedLinkId(linkId);
    setEditLinkDialogOpen(true);
  };

  const handleEditLinkSubmit = (link: { title: string; url: string; description?: string }) => {
    if (selectedCategoryId && selectedLinkId) {
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id === selectedCategoryId
            ? {
                ...cat,
                links: cat.links.map((l) =>
                  l.id === selectedLinkId ? { ...l, ...link } : l
                ),
              }
            : cat
        )
      );
      toast({
        title: "Odkaz upraven",
        description: `"${link.title}" byl úspěšně upraven.`,
      });
    }
  };

  const handleDeleteLink = (categoryId: string, linkId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedLinkId(linkId);
    setDeleteLinkDialogOpen(true);
  };

  const handleDeleteLinkConfirm = () => {
    if (selectedCategoryId && selectedLinkId) {
      const link = categories
        .find((cat) => cat.id === selectedCategoryId)
        ?.links.find((l) => l.id === selectedLinkId);
      
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id === selectedCategoryId
            ? {
                ...cat,
                links: cat.links.filter((l) => l.id !== selectedLinkId),
              }
            : cat
        )
      );
      toast({
        title: "Odkaz smazán",
        description: `"${link?.title}" byl úspěšně smazán.`,
      });
    }
  };

  const handleReorderLinks = (categoryId: string, newLinks: Array<{id: string; title: string; url: string; description?: string}>) => {
    setCategories((prevCategories) =>
      prevCategories.map((cat) =>
        cat.id === categoryId ? { ...cat, links: newLinks } : cat
      )
    );
  };

  const handleColorChange = (color: ColorValue) => {
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

  const handleAddCategory = (category: { title: string; color: ColorValue }) => {
    const newCategory: CategoryData = {
      id: `category-${Date.now()}`,
      title: category.title,
      color: category.color,
      columnIndex: 0,
      links: [],
    };
    setCategories((prevCategories) => [...prevCategories, newCategory]);
    toast({
      title: "Kategorie přidána",
      description: `Kategorie "${category.title}" byla úspěšně vytvořena.`,
    });
  };

  const getCategoriesByColumn = (columnIndex: number) => {
    return categories.filter(cat => cat.columnIndex === columnIndex);
  };

  const getGridCols = () => {
    if (columns === 3) return "grid-cols-1 md:grid-cols-3";
    if (columns === 4) return "grid-cols-1 md:grid-cols-4";
    return "grid-cols-1 md:grid-cols-5";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Compass className="w-8 h-8 text-primary" />
              {customText && (
                <h1 className="text-3xl font-bold text-foreground">{customText}</h1>
              )}
              <h1 className="text-3xl font-bold text-foreground">Signpost</h1>
            </div>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card">
                  <DropdownMenuLabel>Motiv</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    Světlý
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    Tmavý
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Laptop className="mr-2 h-4 w-4" />
                    Systémový
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Počet sloupců</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setColumns(3)}>
                    <Grid3x3 className="mr-2 h-4 w-4" />
                    3 sloupce
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setColumns(4)}>
                    <Grid3x3 className="mr-2 h-4 w-4" />
                    4 sloupce
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setColumns(5)}>
                    <Grid3x3 className="mr-2 h-4 w-4" />
                    5 sloupců
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Režim úprav</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setEditMode(!editMode)}>
                    <Edit className="mr-2 h-4 w-4" />
                    {editMode ? "Vypnout režim úprav" : "Zapnout režim úprav"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Správa kategorií</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setAddCategoryDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Přidat kategorii
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Vlastní nastavení</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setCustomTextDialogOpen(true)}>
                    <Type className="mr-2 h-4 w-4" />
                    Upravit vlastní text
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-12">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className={`grid ${getGridCols()} gap-6`}>
            {Array.from({ length: columns }, (_, colIndex) => (
              <DroppableColumn
                key={colIndex}
                columnIndex={colIndex}
                categories={getCategoriesByColumn(colIndex)}
                editMode={editMode}
                onAddLink={handleAddLink}
                onChangeColor={handleChangeColor}
                onReorderLinks={handleReorderLinks}
                onEditLink={handleEditLink}
                onDeleteLink={handleDeleteLink}
                onDeleteCategory={handleDeleteCategory}
              />
            ))}
          </div>
        </DndContext>
      </main>

      <AddLinkDialog
        open={addLinkDialogOpen}
        onOpenChange={setAddLinkDialogOpen}
        onAdd={handleAddLinkSubmit}
        categoryTitle={selectedCategory?.title || ""}
      />

      <EditLinkDialog
        open={editLinkDialogOpen}
        onOpenChange={setEditLinkDialogOpen}
        onEdit={handleEditLinkSubmit}
        linkData={selectedLink || { title: "", url: "", description: "" }}
        categoryTitle={selectedCategory?.title || ""}
      />

      <DeleteLinkDialog
        open={deleteLinkDialogOpen}
        onOpenChange={setDeleteLinkDialogOpen}
        onConfirm={handleDeleteLinkConfirm}
        linkTitle={selectedLink?.title || ""}
      />

      <DeleteCategoryDialog
        open={deleteCategoryDialogOpen}
        onOpenChange={setDeleteCategoryDialogOpen}
        onConfirm={handleDeleteCategoryConfirm}
        categoryTitle={selectedCategory?.title || ""}
        linkCount={selectedCategory?.links.length || 0}
      />

      <ColorPickerDialog
        open={colorPickerDialogOpen}
        onOpenChange={setColorPickerDialogOpen}
        onSelectColor={handleColorChange}
        categoryTitle={selectedCategory?.title || ""}
        currentColor={selectedCategory?.color || "blue"}
      />

      <CustomTextDialog
        open={customTextDialogOpen}
        onOpenChange={setCustomTextDialogOpen}
        onSave={setCustomText}
        currentText={customText}
      />

      <AddCategoryDialog
        open={addCategoryDialogOpen}
        onOpenChange={setAddCategoryDialogOpen}
        onAdd={handleAddCategory}
      />

      <footer className="bg-card border-t border-border mt-16">
        <div className="px-4 py-6 text-center text-muted-foreground">
          <p>Vytvořeno s pomocí Lovable</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
