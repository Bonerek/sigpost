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
  shareToken: string | null;
  shareEnabled: boolean;
  onUpdate: () => void;
}

export function ShareDialog({ open, onOpenChange, shareToken, shareEnabled, onUpdate }: ShareDialogProps) {
  const [loading, setLoading] = useState(false);

  const generateToken = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  };

  const handleToggleShare = async (enabled: boolean) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Uživatel není přihlášen");

      const newToken = enabled && !shareToken ? generateToken() : shareToken;

      const { error } = await supabase
        .from("user_settings")
        .update({
          share_enabled: enabled,
          share_token: newToken
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success(enabled ? "Sdílení povoleno" : "Sdílení zakázáno");
      onUpdate();
    } catch (error) {
      console.error("Error toggling share:", error);
      toast.error("Nepodařilo se změnit nastavení sdílení");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateToken = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Uživatel není přihlášen");

      const newToken = generateToken();

      const { error } = await supabase
        .from("user_settings")
        .update({ share_token: newToken })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Nový odkaz vygenerován");
      onUpdate();
    } catch (error) {
      console.error("Error regenerating token:", error);
      toast.error("Nepodařilo se vygenerovat nový odkaz");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/share/${shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Odkaz zkopírován");
  };

  const shareUrl = shareToken ? `${window.location.origin}/share/${shareToken}` : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Sdílet stránku
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="share-enabled">Povolit veřejné sdílení</Label>
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
                <Label>Veřejný odkaz</Label>
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
                Vygenerovat nový odkaz
              </Button>

              <p className="text-sm text-muted-foreground">
                Kdokoliv s tímto odkazem může zobrazit vaši stránku bez přihlášení (pouze pro čtení).
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}