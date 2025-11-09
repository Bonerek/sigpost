import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { LinkCategory } from "@/components/LinkCategory";
import { AddLinkDialog } from "@/components/AddLinkDialog";
import { EditLinkDialog } from "@/components/EditLinkDialog";
import { DeleteLinkDialog } from "@/components/DeleteLinkDialog";
import { DeleteCategoryDialog } from "@/components/DeleteCategoryDialog";
import { CustomTextDialog } from "@/components/CustomTextDialog";
import { ColorPickerDialog, type ColorValue } from "@/components/ColorPickerDialog";
import { AddCategoryDialog } from "@/components/AddCategoryDialog";
import { InfoDialog } from "@/components/InfoDialog";
import { Compass, GripVertical, Menu, Sun, Moon, Laptop, Grid3x3, Type, Plus, Info, LogOut } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
          className="absolute -top-2 -left-2 z-10 p-2 bg-primary text-primary-foreground rounded-lg cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity shadow-lg touch-none"
        >
          <GripVertical className="w-5 h-5 pointer-events-none" />
        </div>
      )}
      <div className={isDragging ? "pointer-events-none" : ""}>
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [addLinkDialogOpen, setAddLinkDialogOpen] = useState(false);
  const [editLinkDialogOpen, setEditLinkDialogOpen] = useState(false);
  const [deleteLinkDialogOpen, setDeleteLinkDialogOpen] = useState(false);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [colorPickerDialogOpen, setColorPickerDialogOpen] = useState(false);
  const [customTextDialogOpen, setCustomTextDialogOpen] = useState(false);
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [columns, setColumns] = useState<3 | 4 | 5>(3);
  const [editMode, setEditMode] = useState(false);
  const [customText, setCustomText] = useState("");
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);
  const selectedLink = selectedCategory?.links.find((link) => link.id === selectedLinkId);

  // Auth check and session management
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Fetch categories and links from database
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("position");

      if (categoriesError) {
        toast({
          title: "Chyba při načítání kategorií",
          description: categoriesError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Fetch all links
      const categoryIds = categoriesData?.map(c => c.id) || [];
      const { data: linksData, error: linksError } = await supabase
        .from("links")
        .select("*")
        .in("category_id", categoryIds)
        .order("position");

      if (linksError) {
        toast({
          title: "Chyba při načítání odkazů",
          description: linksError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Combine categories with their links
      const categoriesWithLinks: CategoryData[] = (categoriesData || []).map(cat => ({
        id: cat.id,
        title: cat.title,
        color: cat.color as ColorValue,
        columnIndex: cat.column_index,
        links: (linksData || [])
          .filter(link => link.category_id === cat.id)
          .map(link => ({
            id: link.id,
            title: link.title,
            url: link.url,
            description: link.description || undefined,
            icon: link.icon || undefined,
          })),
      }));

      setCategories(categoriesWithLinks);
      setLoading(false);
    };

    fetchData();
  }, [user, toast]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleDeleteCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setDeleteCategoryDialogOpen(true);
  };

  const handleDeleteCategoryConfirm = async () => {
    if (selectedCategoryId) {
      const category = categories.find((cat) => cat.id === selectedCategoryId);
      
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", selectedCategoryId);

      if (error) {
        toast({
          title: "Chyba při mazání kategorie",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // If dropped on a column droppable
    if (overId.startsWith('column-')) {
      const targetColumnIndex = parseInt(overId.replace('column-', ''));
      
      const { error } = await supabase
        .from("categories")
        .update({ column_index: targetColumnIndex })
        .eq("id", activeId);

      if (error) {
        toast({
          title: "Chyba při přesouvání kategorie",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

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
        const updated = reordered.map((item, index) => 
          item.id === activeId 
            ? { ...item, columnIndex: overItem.columnIndex } 
            : item
        );

        // Update position in database
        supabase
          .from("categories")
          .update({ 
            column_index: overItem.columnIndex,
            position: newIndex 
          })
          .eq("id", activeId)
          .then(({ error }) => {
            if (error) {
              toast({
                title: "Chyba při přesouvání kategorie",
                description: error.message,
                variant: "destructive",
              });
            }
          });

        return updated;
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

  const handleAddLinkSubmit = async (link: { title: string; url: string; description?: string }) => {
    if (selectedCategoryId) {
      const { data, error } = await supabase
        .from("links")
        .insert({
          category_id: selectedCategoryId,
          title: link.title,
          url: link.url,
          description: link.description || null,
          position: selectedCategory?.links.length || 0,
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Chyba při přidávání odkazu",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const newLink = {
        id: data.id,
        title: data.title,
        url: data.url,
        description: data.description || undefined,
        icon: data.icon || undefined,
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

  const handleEditLinkSubmit = async (link: { title: string; url: string; description?: string }) => {
    if (selectedCategoryId && selectedLinkId) {
      const { error } = await supabase
        .from("links")
        .update({
          title: link.title,
          url: link.url,
          description: link.description || null,
        })
        .eq("id", selectedLinkId);

      if (error) {
        toast({
          title: "Chyba při upravování odkazu",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

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

  const handleDeleteLinkConfirm = async () => {
    if (selectedCategoryId && selectedLinkId) {
      const link = categories
        .find((cat) => cat.id === selectedCategoryId)
        ?.links.find((l) => l.id === selectedLinkId);
      
      const { error } = await supabase
        .from("links")
        .delete()
        .eq("id", selectedLinkId);

      if (error) {
        toast({
          title: "Chyba při mazání odkazu",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

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

  const handleReorderLinks = async (categoryId: string, newLinks: Array<{id: string; title: string; url: string; description?: string}>) => {
    // Update positions in database
    const updates = newLinks.map((link, index) =>
      supabase
        .from("links")
        .update({ position: index })
        .eq("id", link.id)
    );

    await Promise.all(updates);

    setCategories((prevCategories) =>
      prevCategories.map((cat) =>
        cat.id === categoryId ? { ...cat, links: newLinks } : cat
      )
    );
  };

  const handleColorChange = async (color: ColorValue, title: string) => {
    if (selectedCategoryId) {
      const { error } = await supabase
        .from("categories")
        .update({ color, title })
        .eq("id", selectedCategoryId);

      if (error) {
        toast({
          title: "Chyba při upravování kategorie",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id === selectedCategoryId ? { ...cat, color, title } : cat
        )
      );
      toast({
        title: "Kategorie upravena",
        description: "Kategorie byla úspěšně aktualizována.",
      });
    }
  };

  const handleAddCategory = async (category: { title: string; color: ColorValue }) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: user.id,
        title: category.title,
        color: category.color,
        column_index: 0,
        position: categories.length,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Chyba při přidávání kategorie",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    const newCategory: CategoryData = {
      id: data.id,
      title: data.title,
      color: data.color as ColorValue,
      columnIndex: data.column_index,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Compass className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Načítání...</p>
        </div>
      </div>
    );
  }

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
              {editMode && (
                <Button 
                  onClick={() => setAddCategoryDialogOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Přidat kategorii
                </Button>
              )}

              <div className="flex items-center gap-2">
                <Switch 
                  id="edit-mode" 
                  checked={editMode} 
                  onCheckedChange={setEditMode}
                />
                <Label htmlFor="edit-mode" className="cursor-pointer">
                  Režim úprav
                </Label>
              </div>
              
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
                  <DropdownMenuLabel>Vlastní nastavení</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setCustomTextDialogOpen(true)}>
                    <Type className="mr-2 h-4 w-4" />
                    Název systému
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setInfoDialogOpen(true)}>
                    <Info className="mr-2 h-4 w-4" />
                    Info
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Odhlásit se
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

      <InfoDialog
        open={infoDialogOpen}
        onOpenChange={setInfoDialogOpen}
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
