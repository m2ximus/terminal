"use client";

import { useRef, useSyncExternalStore } from "react";
import { VirtualFS } from "@/lib/filesystem/VirtualFS";
import { FSNode } from "@/lib/filesystem/types";

export function useVirtualFS(initialFactory: () => Map<string, FSNode>) {
  const fsRef = useRef<VirtualFS | null>(null);
  if (!fsRef.current) {
    fsRef.current = new VirtualFS(initialFactory());
  }
  const fs = fsRef.current;

  const version = useSyncExternalStore(
    (cb) => fs.subscribe(cb),
    () => fs.getSnapshot(),
    () => fs.getSnapshot()
  );

  return { fs, version };
}
