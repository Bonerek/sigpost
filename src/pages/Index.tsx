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
import { ShareDialog } from "@/components/ShareDialog";
import { EditTabDialog } from "@/components/EditTabDialog";
import { Compass, GripVertical, Menu, Sun, Moon, Laptop, Grid3x3, Type, Plus, Info, LogOut, Shield, Share2, X, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

interface TabData {
  id: string;
  name: string;
  color: ColorValue;
  position: number;
}

interface CategoryData {
  id: string;
  title: string;
  color: ColorValue;
  columnIndex: number; // Track which column this category belongs to
  tabId: string | null; // Track which tab this category belongs to
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

interface SortableTabTriggerProps {
  tab: { id: string; name: string; color: ColorValue };
  colorClasses: Record<ColorValue, string>;
  editMode: boolean;
  onEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

const SortableTabTrigger = ({ tab, colorClasses, editMode, onEdit, onDelete, canDelete }: SortableTabTriggerProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group flex items-center">
      {editMode && (
        <div
          {...attributes}
          {...listeners}
          className="absolute -top-1 -left-1 z-10 p-1 bg-primary text-primary-foreground rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity shadow-md touch-none"
        >
          <GripVertical className="w-3 h-3 pointer-events-none" />
        </div>
      )}
      <TabsTrigger 
        value={tab.id} 
        className={`px-4 py-2 pr-8 text-2xl font-bold shadow-md hover:shadow-lg transition-all ${colorClasses[tab.color]} ${isDragging ? 'opacity-50' : ''}`}
      >
        {tab.name}
      </TabsTrigger>
      {editMode && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-popover z-50">
            <DropdownMenuItem 
              onClick={onEdit}
              className="cursor-pointer"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Upravit záložku
            </DropdownMenuItem>
            {canDelete && (
              <DropdownMenuItem 
                onClick={onDelete}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Smazat záložku
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

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
      className={`space-y-6 ${
        isOver && editMode ? 'bg-accent/20 p-4 rounded-lg border-2 border-dashed border-primary' : ''
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
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [columns, setColumns] = useState<3 | 4 | 5>(3);
  const [editMode, setEditMode] = useState(false);
  const [customText, setCustomText] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [shareEnabled, setShareEnabled] = useState(false);
  
  // Tabs state from database
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [newTabName, setNewTabName] = useState("");
  const [isAddingTab, setIsAddingTab] = useState(false);
  const [editTabDialogOpen, setEditTabDialogOpen] = useState(false);
  const [selectedTabId, setSelectedTabId] = useState<string | null>(null);
  const [deleteTabDialogOpen, setDeleteTabDialogOpen] = useState(false);
  
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

  // Fetch tabs, categories, links, and user settings from database
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      
      // Check if user is admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      setIsAdmin(!!roleData);
      
      // Fetch user settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (settingsError) {
        toast({
          title: "Chyba při načítání nastavení",
          description: settingsError.message,
          variant: "destructive",
        });
      } else if (settingsData) {
        setColumns(settingsData.column_count as 3 | 4 | 5);
        setCustomText(settingsData.custom_text || "");
        setShareToken(settingsData.share_token);
        setShareEnabled(settingsData.share_enabled || false);
      }
      
      // Fetch tabs
      let { data: tabsData, error: tabsError } = await supabase
        .from("tabs")
        .select("*")
        .eq("user_id", user.id)
        .order("position");

      if (tabsError) {
        toast({
          title: "Chyba při načítání záložek",
          description: tabsError.message,
          variant: "destructive",
        });
      }

      // If no tabs exist, create a default "IP" tab
      if (!tabsData || tabsData.length === 0) {
        const { data: newTab, error: createTabError } = await supabase
          .from("tabs")
          .insert({
            user_id: user.id,
            name: "IP",
            color: "blue",
            position: 0,
          })
          .select()
          .single();

        if (createTabError) {
          toast({
            title: "Chyba při vytváření výchozí záložky",
            description: createTabError.message,
            variant: "destructive",
          });
        } else {
          tabsData = [newTab];
        }
      }

      const loadedTabs: TabData[] = (tabsData || []).map(tab => ({
        id: tab.id,
        name: tab.name,
        color: tab.color as ColorValue,
        position: tab.position,
      }));
      
      setTabs(loadedTabs);
      if (loadedTabs.length > 0 && !activeTab) {
        setActiveTab(loadedTabs[0].id);
      }
      
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

      // If there are categories without tab_id, assign them to the first tab
      const categoriesWithoutTab = (categoriesData || []).filter(cat => !cat.tab_id);
      if (categoriesWithoutTab.length > 0 && loadedTabs.length > 0) {
        const firstTabId = loadedTabs[0].id;
        for (const cat of categoriesWithoutTab) {
          await supabase
            .from("categories")
            .update({ tab_id: firstTabId })
            .eq("id", cat.id);
        }
      }

      // Fetch all links
      const categoryIds = categoriesData?.map(c => c.id) || [];
      let linksData: any[] = [];
      if (categoryIds.length > 0) {
        const { data: links, error: linksError } = await supabase
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
        linksData = links || [];
      }

      // Combine categories with their links
      const categoriesWithLinks: CategoryData[] = (categoriesData || []).map(cat => ({
        id: cat.id,
        title: cat.title,
        color: cat.color as ColorValue,
        columnIndex: cat.column_index,
        tabId: cat.tab_id || (loadedTabs.length > 0 ? loadedTabs[0].id : null),
        links: linksData
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

  const handleTabDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tabs.findIndex((item) => item.id === active.id);
    const newIndex = tabs.findIndex((item) => item.id === over.id);
    
    const reorderedTabs = arrayMove(tabs, oldIndex, newIndex);
    setTabs(reorderedTabs);

    // Update positions in database
    for (let i = 0; i < reorderedTabs.length; i++) {
      await supabase
        .from("tabs")
        .update({ position: i })
        .eq("id", reorderedTabs[i].id);
    }

    toast({
      title: "Záložky přesunuty",
      description: "Pořadí záložek bylo změněno.",
    });
  };

  const handleDeleteTab = async (tabId: string, tabName: string) => {
    const categoriesInTab = getCategoriesCountForTab(tabId);
    
    if (categoriesInTab > 0) {
      toast({
        title: "Nelze smazat záložku",
        description: `Záložka "${tabName}" obsahuje ${categoriesInTab} ${categoriesInTab === 1 ? 'kategorii' : categoriesInTab < 5 ? 'kategorie' : 'kategorií'}. Nejdříve je smažte.`,
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("tabs")
      .delete()
      .eq("id", tabId);

    if (error) {
      toast({
        title: "Chyba při mazání záložky",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setTabs(tabs.filter(t => t.id !== tabId));
    if (activeTab === tabId) {
      const remainingTabs = tabs.filter(t => t.id !== tabId);
      if (remainingTabs.length > 0) {
        setActiveTab(remainingTabs[0].id);
      }
    }
    toast({
      title: "Záložka smazána",
      description: `Záložka "${tabName}" byla odstraněna.`,
    });
  };

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

  const handleColorChange = async (color: ColorValue, title: string, tabId: string) => {
    if (selectedCategoryId) {
      const { error } = await supabase
        .from("categories")
        .update({ color, title, tab_id: tabId })
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
          cat.id === selectedCategoryId ? { ...cat, color, title, tabId } : cat
        )
      );
      toast({
        title: "Kategorie upravena",
        description: "Kategorie byla úspěšně aktualizována.",
      });
    }
  };

  const handleAddCategory = async (category: { title: string; color: ColorValue; tabId: string }) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: user.id,
        title: category.title,
        color: category.color,
        column_index: 0,
        position: categories.filter(c => c.tabId === category.tabId).length,
        tab_id: category.tabId,
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
      tabId: data.tab_id,
      links: [],
    };
    setCategories((prevCategories) => [...prevCategories, newCategory]);
    toast({
      title: "Kategorie přidána",
      description: `Kategorie "${category.title}" byla úspěšně vytvořena.`,
    });
  };

  const handleColumnsChange = async (newColumns: 3 | 4 | 5) => {
    setColumns(newColumns);
    await saveUserSettings(newColumns, customText);
  };

  const handleCustomTextSave = async (text: string) => {
    setCustomText(text);
    await saveUserSettings(columns, text);
  };

  const saveUserSettings = async (columnCount: number, text: string) => {
    if (!user) return;

    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from("user_settings")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingSettings) {
      // Update existing settings
      const { error } = await supabase
        .from("user_settings")
        .update({
          column_count: columnCount,
          custom_text: text || null,
        })
        .eq("user_id", user.id);

      if (error) {
        toast({
          title: "Chyba při ukládání nastavení",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      // Insert new settings
      const { error } = await supabase
        .from("user_settings")
        .insert({
          user_id: user.id,
          column_count: columnCount,
          custom_text: text || null,
        });

      if (error) {
        toast({
          title: "Chyba při ukládání nastavení",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const getCategoriesByColumn = (columnIndex: number, tabId: string) => {
    return categories.filter(cat => cat.columnIndex === columnIndex && cat.tabId === tabId);
  };

  const getCategoriesCountForTab = (tabId: string) => {
    return categories.filter(cat => cat.tabId === tabId).length;
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
    <div className="min-h-screen bg-background flex flex-col">
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
                  <DropdownMenuItem onClick={() => handleColumnsChange(3)}>
                    <Grid3x3 className="mr-2 h-4 w-4" />
                    3 sloupce
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleColumnsChange(4)}>
                    <Grid3x3 className="mr-2 h-4 w-4" />
                    4 sloupce
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleColumnsChange(5)}>
                    <Grid3x3 className="mr-2 h-4 w-4" />
                    5 sloupců
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Sdílet stránku
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setInfoDialogOpen(true)}>
                    <Info className="mr-2 h-4 w-4" />
                    Info
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Shield className="mr-2 h-4 w-4" />
                        Administrace
                      </DropdownMenuItem>
                    </>
                  )}
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

      <main className="flex-1 px-4 py-4">
        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleTabDragEnd}
            >
              <TabsList className="justify-start">
                <SortableContext
                  items={tabs.map((tab) => tab.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {tabs.map((tab) => {
                    const colorClasses: Record<ColorValue, string> = {
                      blue: "bg-category-blue/70 text-category-blue-foreground data-[state=active]:bg-category-blue data-[state=active]:text-category-blue-foreground data-[state=active]:ring-4 data-[state=active]:ring-category-blue/40 data-[state=active]:shadow-xl",
                      green: "bg-category-green/70 text-category-green-foreground data-[state=active]:bg-category-green data-[state=active]:text-category-green-foreground data-[state=active]:ring-4 data-[state=active]:ring-category-green/40 data-[state=active]:shadow-xl",
                      orange: "bg-category-orange/70 text-category-orange-foreground data-[state=active]:bg-category-orange data-[state=active]:text-category-orange-foreground data-[state=active]:ring-4 data-[state=active]:ring-category-orange/40 data-[state=active]:shadow-xl",
                      purple: "bg-category-purple/70 text-category-purple-foreground data-[state=active]:bg-category-purple data-[state=active]:text-category-purple-foreground data-[state=active]:ring-4 data-[state=active]:ring-category-purple/40 data-[state=active]:shadow-xl",
                      red: "bg-category-red/70 text-category-red-foreground data-[state=active]:bg-category-red data-[state=active]:text-category-red-foreground data-[state=active]:ring-4 data-[state=active]:ring-category-red/40 data-[state=active]:shadow-xl",
                      cyan: "bg-category-cyan/70 text-category-cyan-foreground data-[state=active]:bg-category-cyan data-[state=active]:text-category-cyan-foreground data-[state=active]:ring-4 data-[state=active]:ring-category-cyan/40 data-[state=active]:shadow-xl",
                      pink: "bg-category-pink/70 text-category-pink-foreground data-[state=active]:bg-category-pink data-[state=active]:text-category-pink-foreground data-[state=active]:ring-4 data-[state=active]:ring-category-pink/40 data-[state=active]:shadow-xl",
                      yellow: "bg-category-yellow/70 text-category-yellow-foreground data-[state=active]:bg-category-yellow data-[state=active]:text-category-yellow-foreground data-[state=active]:ring-4 data-[state=active]:ring-category-yellow/40 data-[state=active]:shadow-xl",
                      indigo: "bg-category-indigo/70 text-category-indigo-foreground data-[state=active]:bg-category-indigo data-[state=active]:text-category-indigo-foreground data-[state=active]:ring-4 data-[state=active]:ring-category-indigo/40 data-[state=active]:shadow-xl",
                      teal: "bg-category-teal/70 text-category-teal-foreground data-[state=active]:bg-category-teal data-[state=active]:text-category-teal-foreground data-[state=active]:ring-4 data-[state=active]:ring-category-teal/40 data-[state=active]:shadow-xl",
                      amber: "bg-category-amber/70 text-category-amber-foreground data-[state=active]:bg-category-amber data-[state=active]:text-category-amber-foreground data-[state=active]:ring-4 data-[state=active]:ring-category-amber/40 data-[state=active]:shadow-xl",
                      lime: "bg-category-lime/70 text-category-lime-foreground data-[state=active]:bg-category-lime data-[state=active]:text-category-lime-foreground data-[state=active]:ring-4 data-[state=active]:ring-category-lime/40 data-[state=active]:shadow-xl",
                      emerald: "bg-category-emerald/70 text-category-emerald-foreground data-[state=active]:bg-category-emerald data-[state=active]:text-category-emerald-foreground data-[state=active]:ring-4 data-[state=active]:ring-category-emerald/40 data-[state=active]:shadow-xl",
                      brown: "bg-category-brown/70 text-category-brown-foreground data-[state=active]:bg-category-brown data-[state=active]:text-category-brown-foreground data-[state=active]:ring-4 data-[state=active]:ring-category-brown/40 data-[state=active]:shadow-xl",
                      gray: "bg-category-gray/70 text-category-gray-foreground data-[state=active]:bg-category-gray data-[state=active]:text-category-gray-foreground data-[state=active]:ring-4 data-[state=active]:ring-category-gray/40 data-[state=active]:shadow-xl",
                      slate: "bg-category-slate/70 text-category-slate-foreground data-[state=active]:bg-category-slate data-[state=active]:text-category-slate-foreground data-[state=active]:ring-4 data-[state=active]:ring-category-slate/40 data-[state=active]:shadow-xl",
                      zinc: "bg-category-zinc/70 text-category-zinc-foreground data-[state=active]:bg-category-zinc data-[state=active]:text-category-zinc-foreground data-[state=active]:ring-4 data-[state=active]:ring-category-zinc/40 data-[state=active]:shadow-xl",
                      stone: "bg-category-stone/70 text-category-stone-foreground data-[state=active]:bg-category-stone data-[state=active]:text-category-stone-foreground data-[state=active]:ring-4 data-[state=active]:ring-category-stone/40 data-[state=active]:shadow-xl",
                      black: "bg-category-black/70 text-category-black-foreground data-[state=active]:bg-category-black data-[state=active]:text-category-black-foreground data-[state=active]:ring-4 data-[state=active]:ring-category-black/40 data-[state=active]:shadow-xl",
                    };
                
                    return (
                      <SortableTabTrigger
                        key={tab.id}
                        tab={tab}
                        colorClasses={colorClasses}
                        editMode={editMode}
                        onEdit={() => {
                          setSelectedTabId(tab.id);
                          setEditTabDialogOpen(true);
                        }}
                        onDelete={() => handleDeleteTab(tab.id, tab.name)}
                        canDelete={tabs.length > 1 && getCategoriesCountForTab(tab.id) === 0}
                      />
                    );
                  })}
                </SortableContext>
              </TabsList>
            </DndContext>
            
            {editMode && (
              isAddingTab ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTabName}
                    onChange={(e) => setNewTabName(e.target.value)}
                    placeholder="Název záložky..."
                    className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    autoFocus
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter' && newTabName.trim() && user) {
                        const availableColors: ColorValue[] = ["blue", "green", "orange", "purple", "red", "cyan", "pink", "yellow", "indigo", "teal"];
                        const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
                        
                        const { data: newTabData, error } = await supabase
                          .from("tabs")
                          .insert({
                            user_id: user.id,
                            name: newTabName.trim(),
                            color: randomColor,
                            position: tabs.length,
                          })
                          .select()
                          .single();
                        
                        if (error) {
                          toast({
                            title: "Chyba při přidávání záložky",
                            description: error.message,
                            variant: "destructive",
                          });
                          return;
                        }

                        const newTab: TabData = {
                          id: newTabData.id,
                          name: newTabData.name,
                          color: newTabData.color as ColorValue,
                          position: newTabData.position,
                        };
                        setTabs([...tabs, newTab]);
                        setNewTabName("");
                        setIsAddingTab(false);
                        setActiveTab(newTab.id);
                        toast({
                          title: "Záložka přidána",
                          description: `Záložka "${newTab.name}" byla vytvořena.`,
                        });
                      } else if (e.key === 'Escape') {
                        setIsAddingTab(false);
                        setNewTabName("");
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsAddingTab(false);
                      setNewTabName("");
                    }}
                  >
                    Zrušit
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddingTab(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Přidat záložku
                </Button>
              )
            )}
          </div>

          {/* Tab Content - Categories Grid */}
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0">
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
                      categories={getCategoriesByColumn(colIndex, tab.id)}
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
            </TabsContent>
          ))}
        </Tabs>
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
        currentTabId={selectedCategory?.tabId || null}
        tabs={tabs}
      />

      <CustomTextDialog
        open={customTextDialogOpen}
        onOpenChange={setCustomTextDialogOpen}
        onSave={handleCustomTextSave}
        currentText={customText}
      />

      <AddCategoryDialog
        open={addCategoryDialogOpen}
        onOpenChange={setAddCategoryDialogOpen}
        onAdd={handleAddCategory}
        tabs={tabs}
        activeTabId={activeTab}
      />

      <InfoDialog 
        open={infoDialogOpen} 
        onOpenChange={setInfoDialogOpen}
      />

      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        shareToken={shareToken}
        shareEnabled={shareEnabled}
        onUpdate={async () => {
          if (!user) return;
          const { data } = await supabase
            .from("user_settings")
            .select("share_token, share_enabled")
            .eq("user_id", user.id)
            .maybeSingle();
          if (data) {
            setShareToken(data.share_token);
            setShareEnabled(data.share_enabled || false);
          }
        }}
      />

      <EditTabDialog
        open={editTabDialogOpen}
        onOpenChange={setEditTabDialogOpen}
        onSubmit={async (data) => {
          if (selectedTabId) {
            const { error } = await supabase
              .from("tabs")
              .update({ name: data.name, color: data.color })
              .eq("id", selectedTabId);

            if (error) {
              toast({
                title: "Chyba při upravování záložky",
                description: error.message,
                variant: "destructive",
              });
              return;
            }

            setTabs(tabs.map(t => t.id === selectedTabId ? { ...t, name: data.name, color: data.color } : t));
            toast({
              title: "Záložka upravena",
              description: `Záložka byla úspěšně aktualizována.`,
            });
          }
        }}
        initialName={tabs.find(t => t.id === selectedTabId)?.name || ""}
        initialColor={tabs.find(t => t.id === selectedTabId)?.color || "blue"}
      />

      <footer className="bg-card border-t border-border mt-auto">
        <div className="px-4 py-6 text-center text-muted-foreground">
          <p>Hey hou!</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
