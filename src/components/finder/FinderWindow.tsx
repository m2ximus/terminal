"use client";

import { VirtualFS, HOME } from "@/lib/filesystem/VirtualFS";
import { FinderSidebar } from "./FinderSidebar";
import { FinderGrid } from "./FinderGrid";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TrafficLights } from "@/components/ui/TrafficLights";

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
    itemCount = fs.listDirectory(fs.cwd).filter((c) => !c.name.startsWith(".")).length;
  } catch {
    // ignore
  }

  return (
    <div
      className="flex flex-col h-full rounded-lg overflow-hidden border border-card-border bg-bg-finder shadow-window"
      onClick={onFocus}
    >
      {/* Title bar — draggable handle */}
      <div
        data-drag-handle
        className="flex items-center gap-2 px-3 py-2 bg-finder-toolbar border-b border-card-border cursor-grab active:cursor-grabbing select-none"
      >
        <TrafficLights />
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
                  <ChevronRight size={10} strokeWidth={1.5} className="text-text-muted/40" />
                )}
                <span
                  className={i === crumbs.length - 1 ? "text-text font-medium" : "text-text-muted"}
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
