"use client";

import { VirtualFS, HOME } from "@/lib/filesystem/VirtualFS";
import { FinderSidebar } from "./FinderSidebar";
import { FinderGrid } from "./FinderGrid";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FinderWindowProps {
  fs: VirtualFS;
  version: number;
  onFocus?: () => void;
  onNavigate?: (path: string) => void;
}

function getBreadcrumbs(cwd: string): { name: string; path: string }[] {
  const crumbs: { name: string; path: string }[] = [];
  if (cwd === HOME) {
    crumbs.push({ name: "learner", path: HOME });
    return crumbs;
  }

  const relative = cwd.startsWith(HOME) ? cwd.slice(HOME.length) : cwd;
  const parts = relative.split("/").filter(Boolean);

  crumbs.push({ name: "learner", path: HOME });
  let currentPath = HOME;
  for (const part of parts) {
    currentPath += "/" + part;
    crumbs.push({ name: part, path: currentPath });
  }

  return crumbs;
}

export function FinderWindow({ fs, version, onFocus, onNavigate }: FinderWindowProps) {
  const crumbs = getBreadcrumbs(fs.cwd);
  let itemCount = 0;
  try {
    itemCount = fs
      .listDirectory(fs.cwd)
      .filter((c) => !c.name.startsWith(".")).length;
  } catch {
    // ignore
  }

  return (
    <div
      className="flex flex-col h-full rounded-lg overflow-hidden border border-card-border bg-bg-finder shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]"
      onClick={onFocus}
    >
      {/* Title bar — draggable handle */}
      <div
        data-drag-handle
        className="flex items-center gap-2 px-3 py-2 bg-finder-toolbar border-b border-card-border cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex gap-[6px]">
          <div className="w-[12px] h-[12px] rounded-full bg-[#ff5f57] border border-[#e0443e]/50" />
          <div className="w-[12px] h-[12px] rounded-full bg-[#febc2e] border border-[#d4a123]/50" />
          <div className="w-[12px] h-[12px] rounded-full bg-[#28c840] border border-[#1aab29]/50" />
        </div>
        {/* Nav arrows */}
        <div className="flex gap-1 ml-1">
          <ChevronLeft size={14} strokeWidth={1.5} className="text-text-muted/40" />
          <ChevronRight size={14} strokeWidth={1.5} className="text-text-muted/40" />
        </div>
        {/* Breadcrumb title */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-1 text-[11px] text-text-muted">
            {crumbs.map((crumb, i) => (
              <span key={crumb.path} className="flex items-center gap-1">
                {i > 0 && (
                  <ChevronRight
                    size={10}
                    strokeWidth={1.5}
                    className="text-text-muted/40"
                  />
                )}
                <span
                  className={
                    i === crumbs.length - 1
                      ? "text-text font-medium"
                      : "text-text-muted"
                  }
                >
                  {crumb.name}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        <FinderSidebar cwd={fs.cwd} onNavigate={onNavigate} />
        <FinderGrid fs={fs} onNavigate={onNavigate} />
      </div>

      {/* Status bar */}
      <div className="px-3 py-1 border-t border-card-border text-[10px] text-text-muted">
        {itemCount} item{itemCount !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
