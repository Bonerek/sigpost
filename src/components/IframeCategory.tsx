import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Palette, Trash2, RefreshCw } from "lucide-react";
import type { ColorValue } from "@/components/ColorPickerDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface IframeCategoryProps {
  title: string;
  color: ColorValue;
  iframeUrl: string;
  refreshInterval: number;
  onChangeColor: () => void;
  onDeleteCategory: () => void;
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
  yellow: "bg-category-yellow text-category-yellow-foreground",
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

export const IframeCategory = ({
  title,
  color,
  iframeUrl,
  refreshInterval,
  onChangeColor,
  onDeleteCategory,
  editMode,
}: IframeCategoryProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [key, setKey] = useState(0);
  const [countdown, setCountdown] = useState(refreshInterval);

  // Auto-refresh iframe
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      setKey((prev) => prev + 1);
      setCountdown(refreshInterval);
    }, refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  // Countdown timer
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const countdownId = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : refreshInterval));
    }, 1000);

    return () => clearInterval(countdownId);
  }, [refreshInterval]);

  const handleManualRefresh = () => {
    setKey((prev) => prev + 1);
    setCountdown(refreshInterval);
  };

  const handleOpenExternal = () => {
    window.open(iframeUrl, "_blank", "noopener,noreferrer");
  };

  const formatTime = (seconds: number) => {
    if (seconds >= 3600) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    } else if (seconds >= 60) {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, "0")}`;
    }
    return `${seconds}s`;
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className={`${colorClasses[color]} px-4 py-2 flex items-center justify-between`}>
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex items-center gap-2">
          {refreshInterval > 0 && (
            <span className="text-sm opacity-80 font-mono">
              {formatTime(countdown)}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-white/20 text-current"
            onClick={handleManualRefresh}
            title="Refresh now"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          {editMode && (
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
                <DropdownMenuItem onClick={onChangeColor} className="cursor-pointer">
                  <Palette className="mr-2 h-4 w-4" />
                  Edit category
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDeleteCategory}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete category
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <div className="p-0">
        <iframe
          ref={iframeRef}
          key={key}
          src={iframeUrl}
          className="w-full h-[400px] border-0"
          title={title}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          loading="lazy"
          scrolling="no"
          style={{ overflow: "hidden" }}
        />
      </div>
    </Card>
  );
};
