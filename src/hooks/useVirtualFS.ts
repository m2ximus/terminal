"use client";

import { useState, useSyncExternalStore } from "react";
import { VirtualFS } from "@/lib/filesystem/VirtualFS";
import { FSNode } from "@/lib/filesystem/types";

export function useVirtualFS(initialFactory: () => Map<string, FSNode>) {
  const [fs] = useState(() => new VirtualFS(initialFactory()));

  const version = useSyncExternalStore(
    (cb) => fs.subscribe(cb),
    () => fs.getSnapshot(),
    () => fs.getSnapshot(),
  );

  return { fs, version };
}
