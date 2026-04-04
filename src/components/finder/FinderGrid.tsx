"use client";

import { VirtualFS } from "@/lib/filesystem/VirtualFS";
import { FinderIcon } from "./FinderIcon";

interface FinderGridProps {
  fs: VirtualFS;
  onNavigate?: (path: string) => void;
}

export function FinderGrid({ fs, onNavigate }: FinderGridProps) {
  let children: {
    name: string;
    node: import("@/lib/filesystem/types").FSNode;
  }[] = [];
  try {
    children = fs.listDirectory(fs.cwd);
  } catch {
    // CWD might not exist
  }

  const visible = children.filter((c) => !c.name.startsWith("."));

  if (visible.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted text-[11px]">
        This folder is empty
      </div>
    );
  }

  const cwd = fs.cwd;

  return (
    <div className="flex-1 overflow-y-auto p-2">
      <div className="flex flex-wrap gap-0.5 content-start">
        {visible.map(({ name, node }) => {
          const fullPath = cwd === "/" ? `/${name}` : `${cwd}/${name}`;
          return (
            <FinderIcon
              key={name}
              name={name}
              node={node}
              fullPath={fullPath}
              onDoubleClick={
                node.type === "directory" && onNavigate
                  ? () => onNavigate(fullPath)
                  : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}
