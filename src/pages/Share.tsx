import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { LinkCategory } from "@/components/LinkCategory";
import { InfoDialog } from "@/components/InfoDialog";
import { Info, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import type { IconType } from "@/components/AddLinkDialog";
import type { ColorValue } from "@/components/ColorPickerDialog";

interface CategoryData {
  id: string;
  title: string;
  color: ColorValue;
  columnIndex: number;
  links: Array<{
    id: string;
    title: string;
    url: string;
    description?: string;
    icon?: IconType;
    position: number;
  }>;
}

export default function Share() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [columnCount, setColumnCount] = useState(3);
  const [customText, setCustomText] = useState("Moje odkazy");
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        if (!token) {
          toast.error("Neplatný odkaz");
          navigate("/");
          return;
        }

        // Get user settings by share token
        const { data: settings, error: settingsError } = await supabase
          .from("user_settings")
          .select("*")
          .eq("share_token", token)
          .eq("share_enabled", true)
          .single();

        if (settingsError || !settings) {
          toast.error("Sdílená stránka nebyla nalezena");
          navigate("/");
          return;
        }

        setColumnCount(settings.column_count || 3);
        setCustomText(settings.custom_text || "Moje odkazy");

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .eq("user_id", settings.user_id)
          .order("column_index")
          .order("position");

        if (categoriesError) throw categoriesError;

        // Fetch links
        const { data: linksData, error: linksError } = await supabase
          .from("links")
          .select("*")
          .in("category_id", categoriesData?.map((c) => c.id) || [])
          .order("position");

        if (linksError) throw linksError;

        // Organize data
        const organizedCategories: CategoryData[] = (categoriesData || []).map((cat) => ({
          id: cat.id,
          title: cat.title,
          color: cat.color as ColorValue,
          columnIndex: cat.column_index,
          links: (linksData || [])
            .filter((link) => link.category_id === cat.id)
            .map((link) => ({
              id: link.id,
              title: link.title,
              url: link.url,
              description: link.description || undefined,
              icon: link.icon as IconType | undefined,
              position: link.position,
            })),
        }));

        setCategories(organizedCategories);
      } catch (error) {
        console.error("Error fetching shared data:", error);
        toast.error("Nepodařilo se načíst sdílenou stránku");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedData();
  }, [token, navigate]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCategoryId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCategoryId(null);
  };

  const activeCategory = categories.find((cat) => cat.id === activeCategoryId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground">Načítání...</div>
      </div>
    );
  }

  const columnCategories = Array.from({ length: columnCount }, (_, i) =>
    categories.filter((cat) => cat.columnIndex === i)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground">{customText}</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setInfoDialogOpen(true)}>
                <Info className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className={`grid gap-6 grid-cols-1 md:grid-cols-${columnCount}`}>
            {columnCategories.map((columnCats, columnIndex) => (
              <div key={columnIndex} className="space-y-6">
                <SortableContext items={columnCats.map((cat) => cat.id)}>
                  {columnCats.map((category) => (
                    <LinkCategory
                      key={category.id}
                      title={category.title}
                      color={category.color}
                      links={category.links}
                      editMode={false}
                      onChangeColor={() => {}}
                      onDeleteCategory={() => {}}
                      onAddLink={() => {}}
                      onEditLink={() => {}}
                      onDeleteLink={() => {}}
                      onReorderLinks={() => {}}
                    />
                  ))}
                </SortableContext>
              </div>
            ))}
          </div>
          <DragOverlay>
            {activeCategory && (
              <LinkCategory
                title={activeCategory.title}
                color={activeCategory.color}
                links={activeCategory.links}
                editMode={false}
                onChangeColor={() => {}}
                onDeleteCategory={() => {}}
                onAddLink={() => {}}
                onEditLink={() => {}}
                onDeleteLink={() => {}}
                onReorderLinks={() => {}}
              />
            )}
          </DragOverlay>
        </DndContext>
      </main>

      <InfoDialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen} />
    </div>
  );
}