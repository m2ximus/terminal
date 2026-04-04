"use client";

import { useCallback } from "react";
import { FSNode } from "@/lib/filesystem/types";

const EXT_COLORS: Record<string, string> = {
  js: "text-term-yellow",
  ts: "text-term-blue",
  tsx: "text-term-blue",
  jsx: "text-term-yellow",
  html: "text-term-red",
  css: "text-term-magenta",
  json: "text-term-yellow",
  md: "text-text",
  txt: "text-text-muted",
  sh: "text-term-green",
  jpg: "text-term-cyan",
  png: "text-term-cyan",
  csv: "text-term-green",
  dmg: "text-text-muted",
};

function getExtColor(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return EXT_COLORS[ext] || "text-text-muted";
}

interface FinderIconProps {
  name: string;
  node: FSNode;
  fullPath?: string;
  onDoubleClick?: () => void;
}

export function FinderIcon({ name, node, fullPath, onDoubleClick }: FinderIconProps) {
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (node.type !== "directory" || !fullPath) return;
      e.dataTransfer.setData("text/plain", fullPath);
      e.dataTransfer.effectAllowed = "link";
    },
    [node.type, fullPath]
  );

  const isDraggableDir = node.type === "directory" && !!fullPath;

  if (node.type === "directory") {
    return (
      <div
        className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent-dim transition-colors animate-scale-in w-[72px] cursor-default"
        draggable={isDraggableDir}
        onDragStart={handleDragStart}
        onDoubleClick={onDoubleClick}
      >
        <div className="w-11 h-9 relative">
          <div className="absolute inset-0 bg-[#3b9dff] rounded-[4px]" />
          <div className="absolute top-0 left-0 w-[18px] h-[8px] bg-[#5ab0ff] rounded-t-[4px] rounded-br-[4px] -translate-y-[3px]" />
          <div className="absolute bottom-0 left-0 right-0 h-[24px] bg-[#5ab0ff] rounded-b-[4px] rounded-tr-[4px] shadow-sm" />
        </div>
        <span className="text-[10px] text-text text-center truncate w-full leading-tight">
          {name}
        </span>
      </div>
    );
  }

  const extColor = getExtColor(name);
  const ext = name.split(".").pop()?.toUpperCase() || "";

  return (
    <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent-dim transition-colors animate-scale-in w-[72px]">
      <div className="w-9 h-11 relative">
        <div className="absolute inset-0 bg-bg-elevated rounded-[3px] border border-card-border" />
        <div className="absolute top-0 right-0 w-[10px] h-[10px] bg-bg border-l border-b border-card-border rounded-bl-sm" />
        <div className="absolute bottom-1.5 inset-x-0 flex justify-center">
          <span className={`text-[8px] font-bold ${extColor}`}>
            {ext.slice(0, 4)}
          </span>
        </div>
      </div>
      <span className="text-[10px] text-text text-center truncate w-full leading-tight">
        {name}
      </span>
    </div>
  );
}
