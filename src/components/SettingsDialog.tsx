import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Download, Upload, AlertCircle, Copy, RefreshCw, Pencil } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TabData {
  id: string;
  name: string;
  color: string;
  position: number;
}

interface CategoryData {
  id: string;
  title: string;
  color: string;
  column_index: number;
  position: number;
  tab_id: string | null;
  iframe_url: string | null;
  iframe_refresh_interval: number | null;
}

interface LinkData {
  id: string;
  category_id: string;
  title: string;
  url: string;
  description: string | null;
  icon: string | null;
  position: number;
}

interface ExportData {
  version: string;
  exported_at: string;
  tabs: Omit<TabData, "id">[];
  categories: (Omit<CategoryData, "id" | "tab_id"> & { tab_name: string | null })[];
  links: (Omit<LinkData, "id" | "category_id"> & { category_title: string; tab_name: string | null })[];
}

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onDataImported: () => void;
  pageName: string;
  onPageNameSave: (name: string) => void;
  pageId: string;
  shareToken: string | null;
  shareEnabled: boolean;
  onShareUpdate: () => void;
}

export const SettingsDialog = ({
  open,
  onOpenChange,
  userId,
  onDataImported,
  pageName,
  onPageNameSave,
  pageId,
  shareToken,
  shareEnabled,
  onShareUpdate,
}: SettingsDialogProps) => {
  const [pageNameText, setPageNameText] = useState(pageName);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPageNameText(pageName);
  }, [pageName, open]);

  const handleSave = () => {
    onPageNameSave(pageNameText.trim() || "New page");
    onOpenChange(false);
  };

  // Share functionality
  const generateToken = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  };

  const handleToggleShare = async (enabled: boolean) => {
    setShareLoading(true);
    try {
      const newToken = enabled && !shareToken ? generateToken() : shareToken;
      const { error } = await supabase
        .from("pages")
        .update({ share_enabled: enabled, share_token: newToken })
        .eq("id", pageId);
      if (error) throw error;
      toast.success(enabled ? "Sharing enabled" : "Sharing disabled");
      onShareUpdate();
    } catch (error) {
      console.error("Error toggling share:", error);
      toast.error("Failed to change sharing settings");
    } finally {
      setShareLoading(false);
    }
  };

  const handleRegenerateToken = async () => {
    setShareLoading(true);
    try {
      const newToken = generateToken();
      const { error } = await supabase
        .from("pages")
        .update({ share_token: newToken })
        .eq("id", pageId);
      if (error) throw error;
      toast.success("New link generated");
      onShareUpdate();
    } catch (error) {
      console.error("Error regenerating token:", error);
      toast.error("Failed to generate new link");
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/share/${shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied");
  };

  const shareUrl = shareToken ? `${window.location.origin}/share/${shareToken}` : "";

  // Export/Import functionality
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data: tabs, error: tabsError } = await supabase
        .from("tabs")
        .select("*")
        .eq("user_id", userId)
        .order("position");
      if (tabsError) throw tabsError;

      const { data: categories, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId)
        .order("position");
      if (categoriesError) throw categoriesError;

      const categoryIds = categories?.map((c) => c.id) || [];
      let links: any[] = [];
      if (categoryIds.length > 0) {
        const { data: linksData, error: linksError } = await supabase
          .from("links")
          .select("*")
          .in("category_id", categoryIds)
          .order("position");
        if (linksError) throw linksError;
        links = linksData || [];
      }

      const tabIdToName = new Map(tabs?.map((t) => [t.id, t.name]) || []);
      const categoryIdToInfo = new Map(
        categories?.map((c) => [c.id, { title: c.title, tab_id: c.tab_id }]) || []
      );

      const exportData: ExportData = {
        version: "1.0",
        exported_at: new Date().toISOString(),
        tabs: (tabs || []).map((t) => ({
          name: t.name,
          color: t.color,
          position: t.position,
        })),
        categories: (categories || []).map((c) => ({
          title: c.title,
          color: c.color,
          column_index: c.column_index,
          position: c.position,
          iframe_url: c.iframe_url,
          iframe_refresh_interval: c.iframe_refresh_interval,
          tab_name: c.tab_id ? tabIdToName.get(c.tab_id) || null : null,
        })),
        links: links.map((l) => {
          const catInfo = categoryIdToInfo.get(l.category_id);
          return {
            title: l.title,
            url: l.url,
            description: l.description,
            icon: l.icon,
            position: l.position,
            category_title: catInfo?.title || "",
            tab_name: catInfo?.tab_id ? tabIdToName.get(catInfo.tab_id) || null : null,
          };
        }),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `signpost-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Error exporting data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data: ExportData = JSON.parse(text);

      if (!data.version || !data.tabs || !data.categories || !data.links) {
        throw new Error("Invalid file format");
      }

      const tabNameToId = new Map<string, string>();
      for (const tab of data.tabs) {
        const { data: newTab, error } = await supabase
          .from("tabs")
          .insert({ user_id: userId, name: tab.name, color: tab.color, position: tab.position })
          .select()
          .single();
        if (error) throw error;
        if (newTab) tabNameToId.set(tab.name, newTab.id);
      }

      const categoryKey = (title: string, tabName: string | null) => `${title}::${tabName || ""}`;
      const categoryToId = new Map<string, string>();
      for (const category of data.categories) {
        const tabId = category.tab_name ? tabNameToId.get(category.tab_name) : null;
        const { data: newCategory, error } = await supabase
          .from("categories")
          .insert({
            user_id: userId,
            title: category.title,
            color: category.color,
            column_index: category.column_index,
            position: category.position,
            tab_id: tabId,
            iframe_url: category.iframe_url,
            iframe_refresh_interval: category.iframe_refresh_interval,
          })
          .select()
          .single();
        if (error) throw error;
        if (newCategory) categoryToId.set(categoryKey(category.title, category.tab_name), newCategory.id);
      }

      for (const link of data.links) {
        const categoryId = categoryToId.get(categoryKey(link.category_title, link.tab_name));
        if (!categoryId) {
          console.warn(`Category not found for link: ${link.title}`);
          continue;
        }
        const { error } = await supabase.from("links").insert({
          category_id: categoryId,
          title: link.title,
          url: link.url,
          description: link.description,
          icon: link.icon,
          position: link.position,
        });
        if (error) throw error;
      }

      toast.success(`Import complete: ${data.tabs.length} tabs, ${data.categories.length} categories, ${data.links.length} links`);
      onDataImported();
      onOpenChange(false);
    } catch (error) {
      console.error("Import error:", error);
      toast.error(error instanceof Error ? error.message : "Error importing data");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edit page
          </DialogTitle>
          <DialogDescription>
            Edit page name, sharing, and manage backups.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Page Name Section */}
          <div className="grid gap-2">
            <Label htmlFor="page-name">Page name</Label>
            <Input
              id="page-name"
              value={pageNameText}
              onChange={(e) => setPageNameText(e.target.value)}
              placeholder="Enter page name..."
            />
          </div>

          <Separator className="my-2" />

          {/* Share Section */}
          <div className="grid gap-3">
            <Label>Sharing</Label>
            <div className="flex items-center justify-between">
              <Label htmlFor="share-enabled" className="text-sm font-normal text-muted-foreground">Enable public sharing</Label>
              <Switch
                id="share-enabled"
                checked={shareEnabled}
                onCheckedChange={handleToggleShare}
                disabled={shareLoading}
              />
            </div>

            {shareEnabled && shareToken && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="text-xs" />
                  <Button size="icon" variant="outline" onClick={handleCopyLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={handleRegenerateToken}
                  disabled={shareLoading}
                  className="w-full"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate new link
                </Button>
                <p className="text-xs text-muted-foreground">
                  Anyone with this link can view this page without signing in (read-only).
                </p>
              </div>
            )}
          </div>

          <Separator className="my-2" />

          {/* Backup Section */}
          <div className="grid gap-3">
            <Label>Data backup</Label>
            <p className="text-sm text-muted-foreground">
              Export all tabs, categories, and links to a JSON file or import from a backup.
            </p>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? "Exporting..." : "Export"}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleImportClick}
                disabled={isImporting}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isImporting ? "Importing..." : "Import"}
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="flex items-start gap-2 p-3 rounded-md bg-muted/50 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">
                Import adds data to existing. To replace, first delete existing data.
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
