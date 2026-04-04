"use client";

import { useState, useCallback } from "react";
import { Home, Monitor, FileText, Download, Folder, Star } from "lucide-react";
import { HOME } from "@/lib/filesystem/VirtualFS";

interface Favorite {
  name: string;
  icon: typeof Home;
  path: string;
  isCustom?: boolean;
}

const DEFAULT_FAVORITES: Favorite[] = [
  { name: "Home", icon: Home, path: HOME },
  { name: "Desktop", icon: Monitor, path: `${HOME}/Desktop` },
  { name: "Documents", icon: FileText, path: `${HOME}/Documents` },
  { name: "Downloads", icon: Download, path: `${HOME}/Downloads` },
];

interface FinderSidebarProps {
  cwd: string;
  onNavigate?: (path: string) => void;
}

export function FinderSidebar({ cwd, onNavigate }: FinderSidebarProps) {
  const [favorites, setFavorites] = useState<Favorite[]>(DEFAULT_FAVORITES);
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "link";
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const path = e.dataTransfer.getData("text/plain");
      const name = path.split("/").pop() || path;
      if (!path || favorites.some((f) => f.path === path)) return;
      setFavorites((prev) => [
        ...prev,
        { name, icon: Folder, path, isCustom: true },
      ]);
    },
    [favorites]
  );

  const removeFavorite = useCallback((path: string) => {
    setFavorites((prev) => prev.filter((f) => f.path !== path || !f.isCustom));
  }, []);

  return (
    <div
      className={`w-36 shrink-0 bg-finder-sidebar border-r border-card-border p-2 hidden lg:block transition-colors ${
        dragOver ? "bg-accent/5 border-accent/20" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-2 px-2">
        <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
          Favorites
        </span>
        {dragOver && (
          <Star size={10} strokeWidth={1.5} className="text-accent animate-pulse" />
        )}
      </div>
      {favorites.map(({ name, icon: Icon, path, isCustom }) => {
        const isActive = cwd === path || cwd.startsWith(path + "/");
        return (
          <div
            key={path}
            onClick={() => onNavigate?.(path)}
            className={`group flex items-center gap-2 px-2 py-1 rounded text-[11px] cursor-pointer transition-colors ${
              isActive
                ? "bg-accent-dim text-text-bright"
                : "text-text-muted hover:bg-accent-dim/50 hover:text-text"
            }`}
          >
            <Icon size={13} strokeWidth={1.5} />
            <span className="flex-1 truncate">{name}</span>
            {isCustom && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(path);
                }}
                className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-text transition-opacity text-[10px]"
              >
                x
              </button>
            )}
          </div>
        );
      })}
      {dragOver && (
        <div className="mt-1 px-2 py-1 rounded border border-dashed border-accent/30 text-[10px] text-accent text-center animate-fade-in">
          Drop to add
        </div>
      )}
    </div>
  );
}
