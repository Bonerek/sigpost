import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Share2, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageId: string;
  pageName: string;
  shareToken: string | null;
  shareEnabled: boolean;
  onUpdate: () => void;
}

export function ShareDialog({ open, onOpenChange, pageId, pageName, shareToken, shareEnabled, onUpdate }: ShareDialogProps) {
  const [loading, setLoading] = useState(false);

  const generateToken = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  };

  const handleToggleShare = async (enabled: boolean) => {
    setLoading(true);
    try {
      const newToken = enabled && !shareToken ? generateToken() : shareToken;

      const { error } = await supabase
        .from("pages")
        .update({
          share_enabled: enabled,
          share_token: newToken
        })
        .eq("id", pageId);

      if (error) throw error;

      toast.success(enabled ? "Sharing enabled" : "Sharing disabled");
      onUpdate();
    } catch (error) {
      console.error("Error toggling share:", error);
      toast.error("Failed to change sharing settings");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateToken = async () => {
    setLoading(true);
    try {
      const newToken = generateToken();

      const { error } = await supabase
        .from("pages")
        .update({ share_token: newToken })
        .eq("id", pageId);

      if (error) throw error;

      toast.success("New link generated");
      onUpdate();
    } catch (error) {
      console.error("Error regenerating token:", error);
      toast.error("Failed to generate new link");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/share/${shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied");
  };

  const shareUrl = shareToken ? `${window.location.origin}/share/${shareToken}` : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share "{pageName}"
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="share-enabled">Enable public sharing</Label>
            <Switch
              id="share-enabled"
              checked={shareEnabled}
              onCheckedChange={handleToggleShare}
              disabled={loading}
            />
          </div>

          {shareEnabled && shareToken && (
            <>
              <div className="space-y-2">
                <Label>Public link</Label>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly />
                  <Button size="icon" variant="outline" onClick={handleCopyLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleRegenerateToken}
                disabled={loading}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate new link
              </Button>

              <p className="text-sm text-muted-foreground">
                Anyone with this link can view this page without signing in (read-only).
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
