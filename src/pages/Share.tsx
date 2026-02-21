import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { IframeCategory } from "@/components/IframeCategory";
import { InfoDialog } from "@/components/InfoDialog";
import { Info, Moon, Sun, Laptop, Menu } from "lucide-react";
import headerIcon from "@/assets/header-icon.png";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import type { IconType } from "@/components/AddLinkDialog";
import type { ColorValue } from "@/components/ColorPickerDialog";

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
  columnIndex: number;
  tabId: string | null;
  iframeUrl?: string;
  iframeRefreshInterval?: number;
  links: Array<{
    id: string;
    title: string;
    url: string;
    description?: string;
    icon?: IconType;
    position: number;
  }>;
}

const colorClasses: Record<ColorValue, string> = {
  blue: "bg-blue-500 text-white hover:bg-blue-600 data-[state=active]:bg-blue-600",
  green: "bg-green-500 text-white hover:bg-green-600 data-[state=active]:bg-green-600",
  red: "bg-red-500 text-white hover:bg-red-600 data-[state=active]:bg-red-600",
  yellow: "bg-yellow-500 text-white hover:bg-yellow-600 data-[state=active]:bg-yellow-600",
  purple: "bg-purple-500 text-white hover:bg-purple-600 data-[state=active]:bg-purple-600",
  pink: "bg-pink-500 text-white hover:bg-pink-600 data-[state=active]:bg-pink-600",
  orange: "bg-orange-500 text-white hover:bg-orange-600 data-[state=active]:bg-orange-600",
  cyan: "bg-cyan-500 text-white hover:bg-cyan-600 data-[state=active]:bg-cyan-600",
  indigo: "bg-indigo-500 text-white hover:bg-indigo-600 data-[state=active]:bg-indigo-600",
  teal: "bg-teal-500 text-white hover:bg-teal-600 data-[state=active]:bg-teal-600",
  amber: "bg-amber-500 text-white hover:bg-amber-600 data-[state=active]:bg-amber-600",
  lime: "bg-lime-500 text-white hover:bg-lime-600 data-[state=active]:bg-lime-600",
  emerald: "bg-emerald-500 text-white hover:bg-emerald-600 data-[state=active]:bg-emerald-600",
  brown: "bg-amber-800 text-white hover:bg-amber-900 data-[state=active]:bg-amber-900",
  gray: "bg-gray-500 text-white hover:bg-gray-600 data-[state=active]:bg-gray-600",
  slate: "bg-slate-500 text-white hover:bg-slate-600 data-[state=active]:bg-slate-600",
  zinc: "bg-zinc-500 text-white hover:bg-zinc-600 data-[state=active]:bg-zinc-600",
  stone: "bg-stone-500 text-white hover:bg-stone-600 data-[state=active]:bg-stone-600",
  black: "bg-black text-white hover:bg-gray-900 data-[state=active]:bg-gray-900",
};

export default function Share() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [pageName, setPageName] = useState("Shared Page");
  const [activeTab, setActiveTab] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [columnCount, setColumnCount] = useState(3);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        if (!token) {
          toast.error("Invalid link");
          navigate("/");
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate-share-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
            body: JSON.stringify({ token }),
          }
        );

        if (!response.ok) {
          toast.error("Shared page not found");
          navigate("/");
          return;
        }

        const data = await response.json();

        if (!data.valid) {
          toast.error("Shared page not found");
          navigate("/");
          return;
        }

        setColumnCount(data.settings.column_count || 3);
        
        const name = data.page?.name || "Shared Page";
        setPageName(name);
        document.title = name;

        // Load tabs
        const loadedTabs: TabData[] = (data.tabs || []).map((tab: any) => ({
          id: tab.id,
          name: tab.name,
          color: tab.color as ColorValue,
          position: tab.position,
        }));
        setTabs(loadedTabs);
        
        if (loadedTabs.length > 0) {
          setActiveTab(loadedTabs[0].id);
        }

        // Organize categories
        const organizedCategories: CategoryData[] = (data.categories || []).map((cat: any) => ({
          id: cat.id,
          title: cat.title,
          color: cat.color as ColorValue,
          columnIndex: cat.column_index,
          tabId: cat.tab_id || (loadedTabs.length > 0 ? loadedTabs[0].id : null),
          iframeUrl: cat.iframe_url || undefined,
          iframeRefreshInterval: cat.iframe_refresh_interval || 0,
          links: (data.links || [])
            .filter((link: any) => link.category_id === cat.id)
            .map((link: any) => ({
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
        toast.error("Failed to load shared page");
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

  const getGridCols = () => {
    if (columnCount === 3) return "grid-cols-1 md:grid-cols-3";
    if (columnCount === 4) return "grid-cols-1 md:grid-cols-4";
    return "grid-cols-1 md:grid-cols-5";
  };

  const filteredCategories = categories.filter((cat) => cat.tabId === activeTab);

  const columnCategories = Array.from({ length: columnCount }, (_, i) =>
    filteredCategories.filter((cat) => cat.columnIndex === i)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src={headerIcon} alt="Loading" className="w-16 h-16 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const renderCategories = () => (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={`grid ${getGridCols()} gap-6`}>
        {columnCategories.map((columnCats, columnIndex) => (
          <div key={columnIndex} className="space-y-6">
            <SortableContext items={columnCats.map((cat) => cat.id)}>
              {columnCats.map((category) => (
                category.iframeUrl ? (
                  <IframeCategory
                    key={category.id}
                    title={category.title}
                    color={category.color}
                    iframeUrl={category.iframeUrl}
                    refreshInterval={category.iframeRefreshInterval || 0}
                    editMode={false}
                    onChangeColor={() => {}}
                    onDeleteCategory={() => {}}
                  />
                ) : (
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
                )
              ))}
            </SortableContext>
          </div>
        ))}
      </div>
      <DragOverlay>
        {activeCategory && (
          activeCategory.iframeUrl ? (
            <IframeCategory
              title={activeCategory.title}
              color={activeCategory.color}
              iframeUrl={activeCategory.iframeUrl}
              refreshInterval={activeCategory.iframeRefreshInterval || 0}
              editMode={false}
              onChangeColor={() => {}}
              onDeleteCategory={() => {}}
            />
          ) : (
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
          )
        )}
      </DragOverlay>
    </DndContext>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={headerIcon} alt="Signpost" className="w-8 h-8" />
              <h1 className="text-3xl font-bold text-foreground">{pageName}</h1>
            </div>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card">
                  <DropdownMenuLabel>Theme</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Laptop className="mr-2 h-4 w-4" />
                    System
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setInfoDialogOpen(true)}>
                    <Info className="mr-2 h-4 w-4" />
                    Info
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4">
        {tabs.length > 0 ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-6">
              <TabsList className="h-auto flex-wrap gap-2 bg-transparent p-0">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={`px-4 py-2 text-2xl font-bold shadow-md hover:shadow-lg transition-all ${colorClasses[tab.color]}`}
                  >
                    {tab.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                {renderCategories()}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          renderCategories()
        )}
      </main>

      <InfoDialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen} />
    </div>
  );
}
