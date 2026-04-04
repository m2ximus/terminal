import { FSNode } from "@/lib/filesystem/types";
import { VirtualFS } from "@/lib/filesystem/VirtualFS";

// ── Task validation (unchanged from lessons/types.ts) ──

export type TaskValidation =
  | { type: "command"; command: string; argsContain?: string[] }
  | { type: "fs_exists"; path: string }
  | { type: "fs_not_exists"; path: string }
  | { type: "cwd_equals"; path: string }
  | { type: "file_contains"; path: string; content: string }
  | {
      type: "command_or_fs";
      command: string;
      argsContain?: string[];
      fsCheck?: (fs: VirtualFS) => boolean;
    }
  | { type: "custom"; check: (fs: VirtualFS, command: string, args: string[]) => boolean };

export interface Task {
  id: string;
  instruction: string;
  hint?: string;
  validation: TaskValidation;
}

// ── Level (slug-based, no numeric id) ──

export interface Level {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  initialFS: () => Map<string, FSNode>;
  initialCwd: string;
  tasks: Task[];
  availableCommands: string[];
}

// ── Track ──

export interface Track {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  prerequisites: string[];
  levels: Level[];
}
