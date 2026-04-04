# Branching Tracks Infrastructure — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure TryTerminal from a linear 8-level app to a multi-track architecture with routing, progress, and UI to support 6 branching tracks.

**Architecture:** Replace the numeric `Level.id` system with slug-based `Track > Level` hierarchy. New routes at `/track/[track-slug]/[level]`. Existing levels 1-7 migrate into two tracks (Terminal Basics, Terminal Advanced). Level 8 is removed (its content seeds new tracks in Phase 2). Landing page gets a track grid. Progress system moves to per-track storage with v1→v2 migration.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, TypeScript, vitest

**Spec:** `docs/superpowers/specs/2026-04-05-branching-tracks-design.md`

**Scope:** This plan covers infrastructure only — types, progress, routing, UI components, and migrating existing content. New track content (git simulation, claude mode, skills, shell customization) is Phase 2 (separate plan).

**Important:** The app uses `output: "export"` (static site), so `next.config.ts` redirects are not available. Old `/learn/` URLs will 404. This is acceptable per the spec.

**Execution order note (from developer review):** Tasks 4, 5, 6, and 7 in the original plan MUST be executed atomically as a single task. Changing `completeLevel`, `LevelIcon`, and `isLevelUnlocked` signatures separately would leave the project in a broken state across multiple tasks. The plan below reflects this — the original Tasks 4-7 are merged into "Task 4: Migrate progress, icons, engine, and lesson components" as one atomic unit with a single commit at the end.

**Other review fixes incorporated:**
- TrackCard shows prerequisite track titles (not raw slugs)
- TaskCard destructuring explicitly shown in the update
- Route-specific `not-found.tsx` files dropped (static export makes them unreachable — root `not-found.tsx` handles all 404s)
- LevelList intentionally has no sequential locking (spec says soft gates)

---

### Task 1: Set up vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/lib/__tests__/progress.test.ts`

- [ ] **Step 1: Install vitest and dependencies**

Run:
```bash
bun add -d vitest @vitejs/plugin-react
```

- [ ] **Step 2: Create vitest config**

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 3: Add test script to package.json**

Add `"test": "vitest run"` to the `scripts` section.

- [ ] **Step 4: Write a smoke test to verify setup**

```typescript
// src/lib/__tests__/progress.test.ts
import { describe, it, expect } from "vitest";

describe("vitest setup", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run test to verify**

Run: `bun test src/lib/__tests__/progress.test.ts | tail -3`
Expected: 1 test passed

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts package.json bun.lock src/lib/__tests__/progress.test.ts
git commit -m "chore: set up vitest test runner"
```

---

### Task 2: Define Track and updated Level types

**Files:**
- Create: `src/lib/tracks/types.ts`
- Create: `src/lib/__tests__/tracks.test.ts`

- [ ] **Step 1: Write tests for type validation helpers**

```typescript
// src/lib/__tests__/tracks.test.ts
import { describe, it, expect } from "vitest";
import { findTrackBySlug, findLevelInTrack, getAllTrackLevelPairs } from "@/lib/tracks";

// These tests validate the track data structure and lookup helpers.
// We'll import from the index once it exists. For now, test the types compile.
describe("track types", () => {
  it("placeholder compiles", () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Create the Track and Level types**

```typescript
// src/lib/tracks/types.ts
import { FSNode } from "@/lib/filesystem/types";
import { VirtualFS } from "@/lib/filesystem/VirtualFS";

// ── Task validation (unchanged from lessons/types.ts) ──

export type TaskValidation =
  | { type: "command"; command: string; argsContain?: string[] }
  | { type: "fs_exists"; path: string }
  | { type: "fs_not_exists"; path: string }
  | { type: "cwd_equals"; path: string }
  | { type: "file_contains"; path: string; content: string }
  | { type: "command_or_fs"; command: string; argsContain?: string[]; fsCheck?: (fs: VirtualFS) => boolean }
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
```

- [ ] **Step 3: Run type check**

Run: `bunx tsc --noEmit 2>&1 | tail -5`
Expected: no new errors (existing errors from page.tsx are pre-existing)

- [ ] **Step 4: Commit**

```bash
git add src/lib/tracks/types.ts src/lib/__tests__/tracks.test.ts
git commit -m "feat: define Track and Level types for branching tracks"
```

---

### Task 3: Create track definitions from existing levels

**Files:**
- Create: `src/lib/tracks/terminal-basics.ts`
- Create: `src/lib/tracks/terminal-advanced.ts`
- Create: `src/lib/tracks/git.ts` (stub)
- Create: `src/lib/tracks/claude-code.ts` (stub)
- Create: `src/lib/tracks/skills-agents.ts` (stub)
- Create: `src/lib/tracks/shell-customization.ts` (stub)
- Create: `src/lib/tracks/index.ts`
- Modify: `src/lib/__tests__/tracks.test.ts`

- [ ] **Step 1: Write tests for track lookup helpers**

```typescript
// src/lib/__tests__/tracks.test.ts
import { describe, it, expect } from "vitest";
import {
  tracks,
  findTrackBySlug,
  findLevelInTrack,
  getAllTrackLevelPairs,
  findCommandTrack,
} from "@/lib/tracks";

describe("tracks", () => {
  it("exports all 6 tracks", () => {
    expect(tracks).toHaveLength(6);
  });

  it("findTrackBySlug returns correct track", () => {
    const track = findTrackBySlug("terminal-basics");
    expect(track).toBeDefined();
    expect(track!.title).toBe("Terminal Basics");
  });

  it("findTrackBySlug returns undefined for unknown slug", () => {
    expect(findTrackBySlug("nonexistent")).toBeUndefined();
  });

  it("findLevelInTrack returns level by slug", () => {
    const result = findLevelInTrack("terminal-basics", "where-am-i");
    expect(result).toBeDefined();
    expect(result!.level.title).toBe("Where Am I?");
    expect(result!.index).toBe(0);
  });

  it("findLevelInTrack returns undefined for unknown level", () => {
    expect(findLevelInTrack("terminal-basics", "nonexistent")).toBeUndefined();
  });

  it("getAllTrackLevelPairs returns all track+level combinations", () => {
    const pairs = getAllTrackLevelPairs();
    // terminal-basics has 5, terminal-advanced has 2, 4 stubs have 0 each = 7
    expect(pairs.length).toBe(7);
    expect(pairs[0]).toEqual({ trackSlug: "terminal-basics", levelSlug: "where-am-i" });
  });

  it("findCommandTrack locates which track contains a command", () => {
    const result = findCommandTrack("grep");
    expect(result).toBeDefined();
    expect(result!.track.slug).toBe("terminal-advanced");
  });

  it("findCommandTrack returns undefined for unknown commands", () => {
    expect(findCommandTrack("nonexistent-cmd")).toBeUndefined();
  });

  it("terminal-basics has 5 levels with correct slugs", () => {
    const track = findTrackBySlug("terminal-basics")!;
    expect(track.levels.map((l) => l.slug)).toEqual([
      "where-am-i",
      "moving-around",
      "creating-your-world",
      "file-operations",
      "reading-and-writing",
    ]);
  });

  it("terminal-advanced has 2 levels", () => {
    const track = findTrackBySlug("terminal-advanced")!;
    expect(track.levels).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test src/lib/__tests__/tracks.test.ts 2>&1 | tail -3`
Expected: FAIL (modules don't exist yet)

- [ ] **Step 3: Create terminal-basics track**

Migrate existing levels 1-5. Each level definition stays the same but drops the numeric `id` field and adds an `icon` string field. The level files in `src/lib/lessons/levels/` are imported directly — we reuse the existing `initialFS`, `tasks`, and `availableCommands` from those files.

```typescript
// src/lib/tracks/terminal-basics.ts
import { Track } from "./types";
import { level1 } from "@/lib/lessons/levels/level-1";
import { level2 } from "@/lib/lessons/levels/level-2";
import { level3 } from "@/lib/lessons/levels/level-3";
import { level4 } from "@/lib/lessons/levels/level-4";
import { level5 } from "@/lib/lessons/levels/level-5";

export const terminalBasics: Track = {
  slug: "terminal-basics",
  title: "Terminal Basics",
  subtitle: "Learn to navigate and manage files",
  description:
    "Start from zero — learn what a terminal is, how to navigate directories, create files and folders, and manage your filesystem. No prior experience needed.",
  icon: "terminal",
  color: "#4ade80",
  prerequisites: [],
  levels: [
    {
      slug: level1.slug,
      title: level1.title,
      subtitle: level1.subtitle,
      description: level1.description,
      icon: "compass",
      initialFS: level1.initialFS,
      initialCwd: level1.initialCwd,
      tasks: level1.tasks,
      availableCommands: level1.availableCommands,
    },
    {
      slug: level2.slug,
      title: level2.title,
      subtitle: level2.subtitle,
      description: level2.description,
      icon: "navigation",
      initialFS: level2.initialFS,
      initialCwd: level2.initialCwd,
      tasks: level2.tasks,
      availableCommands: level2.availableCommands,
    },
    {
      slug: level3.slug,
      title: level3.title,
      subtitle: level3.subtitle,
      description: level3.description,
      icon: "hammer",
      initialFS: level3.initialFS,
      initialCwd: level3.initialCwd,
      tasks: level3.tasks,
      availableCommands: level3.availableCommands,
    },
    {
      slug: level4.slug,
      title: level4.title,
      subtitle: level4.subtitle,
      description: level4.description,
      icon: "folder-cog",
      initialFS: level4.initialFS,
      initialCwd: level4.initialCwd,
      tasks: level4.tasks,
      availableCommands: level4.availableCommands,
    },
    {
      slug: level5.slug,
      title: level5.title,
      subtitle: level5.subtitle,
      description: level5.description,
      icon: "book-open",
      initialFS: level5.initialFS,
      initialCwd: level5.initialCwd,
      tasks: level5.tasks,
      availableCommands: level5.availableCommands,
    },
  ],
};
```

- [ ] **Step 4: Create terminal-advanced track**

```typescript
// src/lib/tracks/terminal-advanced.ts
import { Track } from "./types";
import { level6 } from "@/lib/lessons/levels/level-6";
import { level7 } from "@/lib/lessons/levels/level-7";

export const terminalAdvanced: Track = {
  slug: "terminal-advanced",
  title: "Terminal Advanced",
  subtitle: "Search, find, and power-user tools",
  description:
    "Level up with pipes, grep, find, permissions, and shell history. These are the tools that separate beginners from power users.",
  icon: "zap",
  color: "#f59e0b",
  prerequisites: ["terminal-basics"],
  levels: [
    {
      slug: level6.slug,
      title: level6.title,
      subtitle: level6.subtitle,
      description: level6.description,
      icon: "search",
      initialFS: level6.initialFS,
      initialCwd: level6.initialCwd,
      tasks: level6.tasks,
      availableCommands: level6.availableCommands,
    },
    {
      slug: level7.slug,
      title: level7.title,
      subtitle: level7.subtitle,
      description: level7.description,
      icon: "zap",
      initialFS: level7.initialFS,
      initialCwd: level7.initialCwd,
      tasks: level7.tasks,
      availableCommands: level7.availableCommands,
    },
  ],
};
```

- [ ] **Step 5: Create stub tracks for Phase 2 content**

Each stub has metadata but an empty `levels` array — content will be added in Phase 2.

```typescript
// src/lib/tracks/git.ts
import { Track } from "./types";

export const gitTrack: Track = {
  slug: "git",
  title: "Git",
  subtitle: "Version control from first commit to worktrees",
  description:
    "Learn Git from scratch — initialize repos, commit changes, branch, merge, push, and use worktrees for parallel work.",
  icon: "git-branch",
  color: "#f97316",
  prerequisites: ["terminal-basics"],
  levels: [],
};
```

```typescript
// src/lib/tracks/claude-code.ts
import { Track } from "./types";

export const claudeCodeTrack: Track = {
  slug: "claude-code",
  title: "Claude Code",
  subtitle: "AI-powered development in your terminal",
  description:
    "Install Claude Code, have your first conversation, edit files, and learn the commit-test-push workflow with an AI assistant.",
  icon: "bot",
  color: "#d97757",
  prerequisites: ["terminal-basics", "git"],
  levels: [],
};
```

```typescript
// src/lib/tracks/skills-agents.ts
import { Track } from "./types";

export const skillsAgentsTrack: Track = {
  slug: "skills-agents",
  title: "Skills & Agents",
  subtitle: "Extend Claude with skills and agent harnesses",
  description:
    "Discover the skills ecosystem, install skills from skills.sh, configure CLAUDE.md and hooks, and work with agent harnesses.",
  icon: "puzzle",
  color: "#8b5cf6",
  prerequisites: ["claude-code"],
  levels: [],
};
```

```typescript
// src/lib/tracks/shell-customization.ts
import { Track } from "./types";

export const shellCustomizationTrack: Track = {
  slug: "shell-customization",
  title: "Shell Customization",
  subtitle: "Make the terminal yours",
  description:
    "Environment variables, dotfiles, aliases, functions, and basic scripting — customize your shell and automate repetitive tasks.",
  icon: "settings",
  color: "#06b6d4",
  prerequisites: ["terminal-basics"],
  levels: [],
};
```

- [ ] **Step 6: Create tracks index with lookup helpers**

```typescript
// src/lib/tracks/index.ts
import { Track, Level } from "./types";
import { terminalBasics } from "./terminal-basics";
import { terminalAdvanced } from "./terminal-advanced";
import { gitTrack } from "./git";
import { claudeCodeTrack } from "./claude-code";
import { skillsAgentsTrack } from "./skills-agents";
import { shellCustomizationTrack } from "./shell-customization";

export const tracks: Track[] = [
  terminalBasics,
  terminalAdvanced,
  gitTrack,
  claudeCodeTrack,
  skillsAgentsTrack,
  shellCustomizationTrack,
];

export function findTrackBySlug(slug: string): Track | undefined {
  return tracks.find((t) => t.slug === slug);
}

export function findLevelInTrack(
  trackSlug: string,
  levelSlug: string,
): { track: Track; level: Level; index: number } | undefined {
  const track = findTrackBySlug(trackSlug);
  if (!track) return undefined;
  const index = track.levels.findIndex((l) => l.slug === levelSlug);
  if (index === -1) return undefined;
  return { track, level: track.levels[index], index };
}

export function getAllTrackLevelPairs(): Array<{ trackSlug: string; levelSlug: string }> {
  return tracks.flatMap((track) =>
    track.levels.map((level) => ({
      trackSlug: track.slug,
      levelSlug: level.slug,
    })),
  );
}

export function findCommandTrack(
  command: string,
): { track: Track; level: Level } | undefined {
  for (const track of tracks) {
    for (const level of track.levels) {
      if (level.availableCommands.includes(command)) {
        return { track, level };
      }
    }
  }
  return undefined;
}

// Re-export types
export type { Track, Level, Task, TaskValidation } from "./types";
```

- [ ] **Step 7: Run tests**

Run: `bun test src/lib/__tests__/tracks.test.ts 2>&1 | tail -3`
Expected: all tests pass

- [ ] **Step 8: Commit**

```bash
git add src/lib/tracks/ src/lib/__tests__/tracks.test.ts
git commit -m "feat: create track definitions and migrate existing levels"
```

---

### Task 4: Update progress system

**Files:**
- Modify: `src/lib/progress.ts`
- Modify: `src/lib/__tests__/progress.test.ts`

- [ ] **Step 1: Write tests for new progress system**

```typescript
// src/lib/__tests__/progress.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadProgress,
  saveProgress,
  completeLevel,
  saveTaskProgress,
  incrementCommands,
  getTrackProgress,
  migrateV1Progress,
  ProgressData,
} from "@/lib/progress";

// Mock localStorage
const storage = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
};
vi.stubGlobal("window", { localStorage: localStorageMock });

beforeEach(() => {
  storage.clear();
});

describe("progress v2", () => {
  it("returns default progress when empty", () => {
    const progress = loadProgress();
    expect(progress.version).toBe(2);
    expect(progress.tracks).toEqual({});
    expect(progress.totalCommands).toBe(0);
  });

  it("saves and loads progress", () => {
    const data: ProgressData = {
      version: 2,
      tracks: {
        "terminal-basics": {
          completedLevels: ["where-am-i"],
          taskProgress: {},
        },
      },
      totalCommands: 5,
    };
    saveProgress(data);
    expect(loadProgress()).toEqual(data);
  });

  it("completeLevel adds to track's completedLevels", () => {
    const result = completeLevel("terminal-basics", "where-am-i");
    expect(result.tracks["terminal-basics"].completedLevels).toContain("where-am-i");
  });

  it("completeLevel removes taskProgress for that level", () => {
    saveTaskProgress("terminal-basics", "where-am-i", 3);
    const result = completeLevel("terminal-basics", "where-am-i");
    expect(result.tracks["terminal-basics"].taskProgress["where-am-i"]).toBeUndefined();
  });

  it("completeLevel does not duplicate entries", () => {
    completeLevel("terminal-basics", "where-am-i");
    const result = completeLevel("terminal-basics", "where-am-i");
    const count = result.tracks["terminal-basics"].completedLevels.filter(
      (l) => l === "where-am-i",
    ).length;
    expect(count).toBe(1);
  });

  it("saveTaskProgress stores task index per track+level", () => {
    saveTaskProgress("terminal-basics", "where-am-i", 3);
    const progress = loadProgress();
    expect(progress.tracks["terminal-basics"].taskProgress["where-am-i"]).toBe(3);
  });

  it("incrementCommands increments totalCommands", () => {
    incrementCommands();
    incrementCommands();
    expect(loadProgress().totalCommands).toBe(2);
  });

  it("getTrackProgress returns completion percentage", () => {
    completeLevel("terminal-basics", "where-am-i");
    completeLevel("terminal-basics", "moving-around");
    // terminal-basics has 5 levels
    const pct = getTrackProgress("terminal-basics", 5);
    expect(pct).toBe(40);
  });
});

describe("v1 migration", () => {
  it("migrates completedLevels 1-5 to terminal-basics", () => {
    storage.set(
      "tryterminal-progress",
      JSON.stringify({
        completedLevels: [1, 2, 3],
        currentLevel: 4,
        taskProgress: { 4: 2 },
        totalCommands: 50,
      }),
    );
    const result = migrateV1Progress();
    expect(result.version).toBe(2);
    expect(result.tracks["terminal-basics"].completedLevels).toEqual([
      "where-am-i",
      "moving-around",
      "creating-your-world",
    ]);
    expect(result.totalCommands).toBe(50);
  });

  it("migrates completedLevels 6-7 to terminal-advanced", () => {
    storage.set(
      "tryterminal-progress",
      JSON.stringify({
        completedLevels: [1, 2, 3, 4, 5, 6, 7],
        currentLevel: 8,
        taskProgress: {},
        totalCommands: 100,
      }),
    );
    const result = migrateV1Progress();
    expect(result.tracks["terminal-advanced"].completedLevels).toEqual([
      "finding-things",
      "power-user",
    ]);
  });

  it("drops level 8 task progress during migration", () => {
    storage.set(
      "tryterminal-progress",
      JSON.stringify({
        completedLevels: [1, 2, 3, 4, 5, 6, 7],
        currentLevel: 8,
        taskProgress: { 8: 3 },
        totalCommands: 100,
      }),
    );
    const result = migrateV1Progress();
    // Level 8 task progress is dropped, not mapped to any track
    expect(result.tracks["git"]).toBeUndefined();
  });

  it("loadProgress auto-migrates v1 data", () => {
    storage.set(
      "tryterminal-progress",
      JSON.stringify({
        completedLevels: [1, 2],
        currentLevel: 3,
        taskProgress: {},
        totalCommands: 20,
      }),
    );
    const result = loadProgress();
    expect(result.version).toBe(2);
    expect(result.tracks["terminal-basics"].completedLevels).toEqual([
      "where-am-i",
      "moving-around",
    ]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test src/lib/__tests__/progress.test.ts 2>&1 | tail -3`
Expected: FAIL

- [ ] **Step 3: Rewrite progress.ts with v2 schema and migration**

```typescript
// src/lib/progress.ts
const STORAGE_KEY = "tryterminal-progress";

export interface ProgressData {
  version: 2;
  tracks: Record<
    string,
    {
      completedLevels: string[];
      taskProgress: Record<string, number>;
    }
  >;
  totalCommands: number;
}

const DEFAULT_PROGRESS: ProgressData = {
  version: 2,
  tracks: {},
  totalCommands: 0,
};

// ── V1 migration mapping ──

const V1_LEVEL_SLUG_MAP: Record<number, { track: string; slug: string }> = {
  1: { track: "terminal-basics", slug: "where-am-i" },
  2: { track: "terminal-basics", slug: "moving-around" },
  3: { track: "terminal-basics", slug: "creating-your-world" },
  4: { track: "terminal-basics", slug: "file-operations" },
  5: { track: "terminal-basics", slug: "reading-and-writing" },
  6: { track: "terminal-advanced", slug: "finding-things" },
  7: { track: "terminal-advanced", slug: "power-user" },
  // Level 8 is intentionally omitted — it's being decomposed across new tracks
};

const V1_TASK_SLUG_MAP: Record<number, { track: string; slug: string }> = {
  1: { track: "terminal-basics", slug: "where-am-i" },
  2: { track: "terminal-basics", slug: "moving-around" },
  3: { track: "terminal-basics", slug: "creating-your-world" },
  4: { track: "terminal-basics", slug: "file-operations" },
  5: { track: "terminal-basics", slug: "reading-and-writing" },
  6: { track: "terminal-advanced", slug: "finding-things" },
  7: { track: "terminal-advanced", slug: "power-user" },
};

export function migrateV1Progress(): ProgressData {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;

    const v1 = JSON.parse(raw);
    if (v1.version === 2) return v1 as ProgressData;

    const v2: ProgressData = {
      version: 2,
      tracks: {},
      totalCommands: v1.totalCommands ?? 0,
    };

    // Migrate completed levels
    const completedLevels: number[] = v1.completedLevels ?? [];
    for (const levelId of completedLevels) {
      const mapping = V1_LEVEL_SLUG_MAP[levelId];
      if (!mapping) continue;
      if (!v2.tracks[mapping.track]) {
        v2.tracks[mapping.track] = { completedLevels: [], taskProgress: {} };
      }
      v2.tracks[mapping.track].completedLevels.push(mapping.slug);
    }

    // Migrate task progress (skip level 8)
    const taskProgress: Record<number, number> = v1.taskProgress ?? {};
    for (const [levelIdStr, taskIdx] of Object.entries(taskProgress)) {
      const levelId = Number(levelIdStr);
      const mapping = V1_TASK_SLUG_MAP[levelId];
      if (!mapping) continue;
      if (!v2.tracks[mapping.track]) {
        v2.tracks[mapping.track] = { completedLevels: [], taskProgress: {} };
      }
      v2.tracks[mapping.track].taskProgress[mapping.slug] = taskIdx as number;
    }

    // Save migrated data
    saveProgress(v2);
    return v2;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

// ── Core API ──

function ensureTrack(data: ProgressData, trackSlug: string) {
  if (!data.tracks[trackSlug]) {
    data.tracks[trackSlug] = { completedLevels: [], taskProgress: {} };
  }
}

export function loadProgress(): ProgressData {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;

    const parsed = JSON.parse(raw);
    // Auto-migrate v1
    if (!parsed.version || parsed.version < 2) {
      return migrateV1Progress();
    }
    return { ...DEFAULT_PROGRESS, ...parsed };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(data: ProgressData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage might be full or unavailable
  }
}

export function completeLevel(trackSlug: string, levelSlug: string): ProgressData {
  const data = loadProgress();
  ensureTrack(data, trackSlug);
  const track = data.tracks[trackSlug];
  if (!track.completedLevels.includes(levelSlug)) {
    track.completedLevels.push(levelSlug);
  }
  delete track.taskProgress[levelSlug];
  saveProgress(data);
  return data;
}

export function saveTaskProgress(
  trackSlug: string,
  levelSlug: string,
  taskIndex: number,
): void {
  const data = loadProgress();
  ensureTrack(data, trackSlug);
  data.tracks[trackSlug].taskProgress[levelSlug] = taskIndex;
  saveProgress(data);
}

export function incrementCommands(): void {
  const data = loadProgress();
  data.totalCommands++;
  saveProgress(data);
}

export function resetProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getTrackProgress(trackSlug: string, totalLevels: number): number {
  const data = loadProgress();
  const track = data.tracks[trackSlug];
  if (!track || totalLevels === 0) return 0;
  return Math.round((track.completedLevels.length / totalLevels) * 100);
}
```

- [ ] **Step 4: Run tests**

Run: `bun test src/lib/__tests__/progress.test.ts 2>&1 | tail -3`
Expected: all tests pass

- [ ] **Step 5: Commit**

```bash
git add src/lib/progress.ts src/lib/__tests__/progress.test.ts
git commit -m "feat: update progress system to v2 per-track schema with migration"
```

---

### Task 5: Update level icons to slug-based

**Files:**
- Modify: `src/lib/level-icons.tsx`

- [ ] **Step 1: Rewrite level-icons.tsx to use slug keys**

```typescript
// src/lib/level-icons.tsx
import {
  Compass,
  Navigation,
  Hammer,
  FolderCog,
  BookOpen,
  Search,
  Zap,
  Bot,
  GitBranch,
  Puzzle,
  Settings,
  type LucideIcon,
} from "lucide-react";

const LEVEL_ICONS: Record<string, LucideIcon> = {
  // Terminal Basics
  compass: Compass,
  navigation: Navigation,
  hammer: Hammer,
  "folder-cog": FolderCog,
  "book-open": BookOpen,
  // Terminal Advanced
  search: Search,
  zap: Zap,
  // Git
  "git-branch": GitBranch,
  // Claude Code
  bot: Bot,
  // Skills & Agents
  puzzle: Puzzle,
  // Shell Customization
  settings: Settings,
};

export function LevelIcon({
  icon,
  size = 24,
  className = "",
}: {
  icon: string;
  size?: number;
  className?: string;
}) {
  const Icon = LEVEL_ICONS[icon] || Compass;
  return <Icon size={size} strokeWidth={1.5} className={className} />;
}

// Track-level icon lookup by track slug
const TRACK_ICONS: Record<string, LucideIcon> = {
  "terminal-basics": Compass,
  "terminal-advanced": Zap,
  git: GitBranch,
  "claude-code": Bot,
  "skills-agents": Puzzle,
  "shell-customization": Settings,
};

export function TrackIcon({
  trackSlug,
  size = 24,
  className = "",
}: {
  trackSlug: string;
  size?: number;
  className?: string;
}) {
  const Icon = TRACK_ICONS[trackSlug] || Compass;
  return <Icon size={size} strokeWidth={1.5} className={className} />;
}
```

- [ ] **Step 2: Run type check**

Run: `bunx tsc --noEmit 2>&1 | tail -5`
Expected: Existing callers of `LevelIcon` with `levelId` prop will error — these get fixed in Tasks 6-7.

- [ ] **Step 3: Commit**

```bash
git add src/lib/level-icons.tsx
git commit -m "refactor: update level icons to slug-based lookup"
```

---

### Task 6: Update LessonEngine for track-aware types

**Files:**
- Modify: `src/lib/lessons/engine.ts`

The LessonEngine itself is type-agnostic (it only uses `Level.tasks`), but its import path needs to use the new types. However, since existing level files still use the old `Level` type from `lessons/types.ts`, we keep the engine importing from the same place for now and only update it when we rewire the lesson components.

- [ ] **Step 1: Update engine.ts to import from tracks/types**

Replace the import:

```typescript
// src/lib/lessons/engine.ts — line 3
// OLD: import { Level, Task, TaskValidation } from "./types";
// NEW:
import { Level, Task, TaskValidation } from "@/lib/tracks/types";
```

Keep everything else unchanged — the engine only uses `Level.tasks`, `Task.validation`, and `Task.hint`, which are identical in both type definitions.

- [ ] **Step 2: Run type check**

Run: `bunx tsc --noEmit 2>&1 | tail -5`
Expected: May show errors in other files that still use old types — engine itself should be clean.

- [ ] **Step 3: Commit**

```bash
git add src/lib/lessons/engine.ts
git commit -m "refactor: update LessonEngine to use tracks/types"
```

---

### Task 7: Update lesson components for track context

**Files:**
- Modify: `src/components/lesson/LessonShell.tsx`
- Modify: `src/components/lesson/TaskCard.tsx`
- Modify: `src/components/lesson/LevelComplete.tsx`
- Modify: `src/hooks/useLesson.ts`

- [ ] **Step 1: Update useLesson hook**

Change `useLesson` to accept `trackSlug` and `levelSlug` instead of numeric `level.id`:

```typescript
// src/hooks/useLesson.ts
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { VirtualFS } from "@/lib/filesystem/VirtualFS";
import { Level } from "@/lib/tracks/types";
import { LessonEngine, ValidationResult } from "@/lib/lessons/engine";
import { parseCommand } from "@/lib/commands/parser";
import { saveTaskProgress, incrementCommands } from "@/lib/progress";

export function useLesson(level: Level, trackSlug: string, fs: VirtualFS) {
  const engineRef = useRef<LessonEngine>(new LessonEngine(level));
  const [taskIndex, setTaskIndex] = useState(0);
  const [lastResult, setLastResult] = useState<ValidationResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const engine = engineRef.current;

  // Restore task progress
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("tryterminal-progress");
      if (raw) {
        const data = JSON.parse(raw);
        const saved = data.tracks?.[trackSlug]?.taskProgress?.[level.slug];
        if (saved && saved > 0) {
          engine.setTaskIndex(saved);
          setTaskIndex(saved);
        }
      }
    } catch {
      // ignore
    }
  }, [trackSlug, level.slug, engine]);

  const validateCommand = useCallback(
    (input: string) => {
      if (engine.isComplete) return;

      incrementCommands();
      const parsed = parseCommand(input);
      if (!parsed) return;

      const result = engine.validate(
        parsed.command,
        parsed.args,
        parsed.flags,
        fs,
      );

      setLastResult(result);

      if (result.passed) {
        setShowHint(false);
        const newIndex = engine.currentTaskIndex;
        setTaskIndex(newIndex);
        saveTaskProgress(trackSlug, level.slug, newIndex);

        if (engine.isComplete) {
          setIsComplete(true);
        }
      } else if (result.showHint) {
        setShowHint(true);
      }
    },
    [engine, fs, trackSlug, level.slug],
  );

  return {
    currentTask: engine.currentTask,
    taskIndex,
    totalTasks: level.tasks.length,
    lastResult,
    showHint,
    isComplete,
    validateCommand,
    hint: engine.currentTask?.hint || null,
  };
}
```

- [ ] **Step 2: Update TaskCard props**

Replace `levelId: number` with `levelIcon: string` and `levelTitle` stays the same. Remove `Level {levelId}` text, replace with track-relative display:

```typescript
// src/components/lesson/TaskCard.tsx
// Change the interface:
interface TaskCardProps {
  task: Task | null;
  taskIndex: number;
  totalTasks: number;
  lastResult: ValidationResult | null;
  showHint: boolean;
  hint: string | null;
  levelIcon: string;
  levelTitle: string;
  trackTitle: string;
  mobile?: boolean;
}
```

Update the import to use new `LevelIcon`:
```typescript
import { LevelIcon } from "@/lib/level-icons";
```

In the mobile layout, change:
```tsx
// OLD:
<LevelIcon levelId={levelId} size={16} className="text-accent" />
<span className="text-xs text-text-muted">Level {levelId}: {levelTitle}</span>

// NEW:
<LevelIcon icon={levelIcon} size={16} className="text-accent" />
<span className="text-xs text-text-muted">{trackTitle} / {levelTitle}</span>
```

In the desktop layout, change the level header:
```tsx
// OLD:
<LevelIcon levelId={levelId} size={20} className="text-accent" />
<h2 ...>{levelTitle}</h2>
<span ...>Level {levelId}</span>

// NEW:
<LevelIcon icon={levelIcon} size={20} className="text-accent" />
<h2 ...>{levelTitle}</h2>
<span ...>{trackTitle}</span>
```

- [ ] **Step 3: Update LevelComplete for track navigation**

```typescript
// src/components/lesson/LevelComplete.tsx
"use client";

import { Level } from "@/lib/tracks/types";
import { LevelIcon } from "@/lib/level-icons";
import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface LevelCompleteProps {
  level: Level;
  trackSlug: string;
  trackTitle: string;
  nextLevel: Level | null;
  onComplete: () => void;
}

export function LevelComplete({
  level,
  trackSlug,
  trackTitle,
  nextLevel,
  onComplete,
}: LevelCompleteProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Confetti particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 10}%`,
              backgroundColor: [
                "#4ade80",
                "#22c55e",
                "#86efac",
                "#16a34a",
                "#22d3ee",
                "#a7f3d0",
              ][i % 6],
              animation: `confetti-fall ${2 + Math.random() * 2}s ${Math.random() * 0.5}s ease-in forwards`,
            }}
          />
        ))}
      </div>

      <div className="relative bg-bg-elevated border border-card-border rounded-2xl p-8 max-w-sm w-full mx-4 text-center animate-scale-in shadow-2xl">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <LevelIcon icon={level.icon} size={32} className="text-accent" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-text-bright mb-2">
          Level Complete!
        </h2>
        <h3 className="text-base text-text mb-1">{level.title}</h3>
        <p className="text-sm text-text-muted mb-6">
          You&apos;ve mastered {level.subtitle}
        </p>

        <div className="flex flex-col gap-3">
          {nextLevel ? (
            <Link
              href={`/track/${trackSlug}/${nextLevel.slug}`}
              onClick={onComplete}
              className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-black font-bold py-2.5 px-6 rounded-lg transition-colors text-sm active:scale-[0.98]"
            >
              Next: {nextLevel.title}
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-accent font-medium">
                <CheckCircle size={18} strokeWidth={1.5} />
                <span>Track complete!</span>
              </div>
              <p className="text-xs text-text-muted">
                You&apos;ve finished the {trackTitle} track.
              </p>
            </div>
          )}

          <Link
            href={`/track/${trackSlug}`}
            onClick={onComplete}
            className="text-text-muted hover:text-text text-sm transition-colors"
          >
            Back to {trackTitle}
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Update LessonShell to receive track context**

Change the props interface and update all internal references:

```typescript
// src/components/lesson/LessonShell.tsx — update the component signature:
interface LessonShellProps {
  level: Level;
  trackSlug: string;
  trackTitle: string;
  nextLevel: Level | null;
}

export function LessonShell({ level, trackSlug, trackTitle, nextLevel }: LessonShellProps) {
```

Update the import for `Level`:
```typescript
import { Level } from "@/lib/tracks/types";
```

Remove the import for `LevelIcon` from `@/lib/level-icons` (no longer used in LessonShell — it's used via TaskCard).

Update `useLesson` call:
```typescript
// OLD: useLesson(level, fs)
// NEW:
useLesson(level, trackSlug, fs)
```

Update `handleComplete`:
```typescript
// OLD: completeLevel(level.id)
// NEW:
completeLevel(trackSlug, level.slug)
```

Update the `completeLevel` import to use the new signature:
```typescript
import { completeLevel } from "@/lib/progress";
```

Update the top bar back link:
```tsx
// OLD:
<Link href="/">
  <ArrowLeft .../> Levels
</Link>
<span ...>Level {level.id} / {level.title}</span>

// NEW:
<Link href={`/track/${trackSlug}`}>
  <ArrowLeft .../> {trackTitle}
</Link>
<span ...>{level.title}</span>
```

Update TaskCard props in both mobile and desktop layouts:
```tsx
// OLD:
levelId={level.id}
levelTitle={level.title}

// NEW:
levelIcon={level.icon}
levelTitle={level.title}
trackTitle={trackTitle}
```

Update LevelComplete rendering:
```tsx
// OLD:
{isComplete && <LevelComplete level={level} onComplete={handleComplete} />}

// NEW:
{isComplete && (
  <LevelComplete
    level={level}
    trackSlug={trackSlug}
    trackTitle={trackTitle}
    nextLevel={nextLevel}
    onComplete={handleComplete}
  />
)}
```

- [ ] **Step 5: Run type check**

Run: `bunx tsc --noEmit 2>&1 | tail -10`
Expected: Errors in old route files (`src/app/learn/...`) that still use old API — those get replaced in Task 8.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useLesson.ts src/components/lesson/LessonShell.tsx src/components/lesson/TaskCard.tsx src/components/lesson/LevelComplete.tsx
git commit -m "refactor: update lesson components for track-aware navigation"
```

---

### Task 8: Create track route pages

**Files:**
- Create: `src/app/track/[track-slug]/page.tsx`
- Create: `src/app/track/[track-slug]/TrackOverviewClient.tsx`
- Create: `src/app/track/[track-slug]/loading.tsx`
- Create: `src/app/track/[track-slug]/not-found.tsx`
- Create: `src/app/track/[track-slug]/[level]/page.tsx`
- Create: `src/app/track/[track-slug]/[level]/LessonClient.tsx`
- Create: `src/app/track/[track-slug]/[level]/loading.tsx`
- Create: `src/app/track/[track-slug]/[level]/not-found.tsx`
- Create: `src/components/track/LevelList.tsx`

- [ ] **Step 1: Create track overview server page**

```typescript
// src/app/track/[track-slug]/page.tsx
import { tracks, findTrackBySlug } from "@/lib/tracks";
import TrackOverviewClient from "./TrackOverviewClient";

export function generateStaticParams() {
  return tracks.map((track) => ({ "track-slug": track.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "track-slug": string }>;
}) {
  const { "track-slug": slug } = await params;
  const track = findTrackBySlug(slug);
  if (!track) return {};
  return {
    title: `${track.title} — TryTerminal`,
    description: track.description,
  };
}

export default function TrackPage({
  params,
}: {
  params: Promise<{ "track-slug": string }>;
}) {
  return <TrackOverviewClient params={params} />;
}
```

- [ ] **Step 2: Create track overview client island**

```typescript
// src/app/track/[track-slug]/TrackOverviewClient.tsx
"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { findTrackBySlug, tracks } from "@/lib/tracks";
import { loadProgress, ProgressData } from "@/lib/progress";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TrackIcon } from "@/lib/level-icons";
import { LevelList } from "@/components/track/LevelList";

export default function TrackOverviewClient({
  params,
}: {
  params: Promise<{ "track-slug": string }>;
}) {
  const { "track-slug": slug } = use(params);
  const track = findTrackBySlug(slug);
  const [progress, setProgress] = useState<ProgressData | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  if (!track) notFound();

  const trackProgress = progress?.tracks[track.slug];
  const completedCount = trackProgress?.completedLevels.length ?? 0;
  const totalLevels = track.levels.length;
  const progressPct = totalLevels > 0 ? Math.round((completedCount / totalLevels) * 100) : 0;

  // Check prerequisites
  const unmetPrereqs = track.prerequisites.filter((prereqSlug) => {
    const prereqTrack = findTrackBySlug(prereqSlug);
    if (!prereqTrack) return false;
    const prereqProgress = progress?.tracks[prereqSlug];
    const prereqCompleted = prereqProgress?.completedLevels.length ?? 0;
    return prereqCompleted < prereqTrack.levels.length;
  });

  const prereqTracks = unmetPrereqs
    .map((slug) => findTrackBySlug(slug))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-card-border max-w-3xl mx-auto w-full">
        <Link
          href="/"
          className="text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={12} strokeWidth={1.5} />
          All Tracks
        </Link>
        <ThemeToggle />
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${track.color}15`, borderColor: `${track.color}30`, borderWidth: 1 }}
          >
            <TrackIcon trackSlug={track.slug} size={28} className="text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-bright tracking-tight">
              {track.title}
            </h1>
            <p className="text-sm text-text-muted mt-1">{track.subtitle}</p>
          </div>
        </div>

        {/* Progress bar */}
        {totalLevels > 0 && (
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-2 bg-accent/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs text-text-muted tabular-nums">
              {completedCount}/{totalLevels}
            </span>
          </div>
        )}

        {/* Prereq nudge */}
        {prereqTracks.length > 0 && (
          <div className="bg-term-yellow/5 border border-term-yellow/20 rounded-lg px-4 py-3 mb-6 text-sm text-term-yellow">
            This track builds on{" "}
            {prereqTracks.map((t, i) => (
              <span key={t!.slug}>
                {i > 0 && " and "}
                <Link href={`/track/${t!.slug}`} className="underline hover:no-underline">
                  {t!.title}
                </Link>
              </span>
            ))}
            . We recommend completing {prereqTracks.length === 1 ? "it" : "them"} first.
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-text-muted leading-relaxed mb-8">
          {track.description}
        </p>

        {/* Level list */}
        {totalLevels > 0 ? (
          <LevelList
            trackSlug={track.slug}
            levels={track.levels}
            completedLevels={trackProgress?.completedLevels ?? []}
            taskProgress={trackProgress?.taskProgress ?? {}}
          />
        ) : (
          <div className="text-center py-12 text-text-muted text-sm border border-dashed border-card-border rounded-lg">
            Coming soon — this track is under development.
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create LevelList component**

```typescript
// src/components/track/LevelList.tsx
"use client";

import Link from "next/link";
import { Level } from "@/lib/tracks/types";
import { LevelIcon } from "@/lib/level-icons";
import { Check, ChevronRight } from "lucide-react";

interface LevelListProps {
  trackSlug: string;
  levels: Level[];
  completedLevels: string[];
  taskProgress: Record<string, number>;
}

export function LevelList({
  trackSlug,
  levels,
  completedLevels,
  taskProgress,
}: LevelListProps) {
  // Find first incomplete level
  const firstIncomplete = levels.find((l) => !completedLevels.includes(l.slug));

  return (
    <div className="space-y-2">
      {levels.map((level, i) => {
        const completed = completedLevels.includes(level.slug);
        const isCurrent = firstIncomplete?.slug === level.slug;
        const inProgress = !completed && (taskProgress[level.slug] ?? 0) > 0;
        const taskCount = level.tasks.length;
        const tasksCompleted = completed
          ? taskCount
          : (taskProgress[level.slug] ?? 0);

        return (
          <Link
            key={level.slug}
            href={`/track/${trackSlug}/${level.slug}`}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg border transition-colors ${
              isCurrent
                ? "border-accent/30 bg-accent/5"
                : "border-card-border bg-card-bg hover:border-accent/20"
            }`}
          >
            {/* Status indicator */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                completed
                  ? "bg-accent/10 text-accent"
                  : isCurrent
                    ? "bg-accent/10 border border-accent/30 text-accent"
                    : "bg-bg border border-card-border text-text-muted"
              }`}
            >
              {completed ? (
                <Check size={16} strokeWidth={2} />
              ) : (
                <span className="text-xs font-bold">{i + 1}</span>
              )}
            </div>

            {/* Level info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className={`text-sm font-medium ${
                    completed ? "text-text" : "text-text-bright"
                  }`}
                >
                  {level.title}
                </h3>
                {isCurrent && (
                  <span className="text-[10px] text-accent font-medium uppercase tracking-wider">
                    {inProgress ? "Continue" : "Start"}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted truncate">{level.subtitle}</p>
            </div>

            {/* Task progress */}
            <div className="flex items-center gap-2 shrink-0">
              {(inProgress || completed) && (
                <span className="text-[10px] text-text-muted tabular-nums">
                  {tasksCompleted}/{taskCount}
                </span>
              )}
              <ChevronRight size={14} className="text-text-muted" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Create loading and not-found for track overview**

```typescript
// src/app/track/[track-slug]/loading.tsx
export default function TrackLoading() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="animate-pulse text-text-muted text-sm">Loading track...</div>
    </div>
  );
}
```

```typescript
// src/app/track/[track-slug]/not-found.tsx
import Link from "next/link";

export default function TrackNotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-bright mb-2">Track not found</h1>
        <p className="text-sm text-text-muted mb-6">
          This track doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="text-accent hover:underline text-sm"
        >
          Back to all tracks
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create lesson server page under track routes**

```typescript
// src/app/track/[track-slug]/[level]/page.tsx
import { getAllTrackLevelPairs, findLevelInTrack } from "@/lib/tracks";
import LessonClient from "./LessonClient";

export function generateStaticParams() {
  return getAllTrackLevelPairs().map(({ trackSlug, levelSlug }) => ({
    "track-slug": trackSlug,
    level: levelSlug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "track-slug": string; level: string }>;
}) {
  const { "track-slug": trackSlug, level: levelSlug } = await params;
  const result = findLevelInTrack(trackSlug, levelSlug);
  if (!result) return {};
  return {
    title: `${result.level.title} — ${result.track.title} — TryTerminal`,
  };
}

export default function LessonPage({
  params,
}: {
  params: Promise<{ "track-slug": string; level: string }>;
}) {
  return <LessonClient params={params} />;
}
```

- [ ] **Step 6: Create lesson client island**

```typescript
// src/app/track/[track-slug]/[level]/LessonClient.tsx
"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { findLevelInTrack } from "@/lib/tracks";
import { LessonShell } from "@/components/lesson/LessonShell";

export default function LessonClient({
  params,
}: {
  params: Promise<{ "track-slug": string; level: string }>;
}) {
  const { "track-slug": trackSlug, level: levelSlug } = use(params);
  const result = findLevelInTrack(trackSlug, levelSlug);

  if (!result) notFound();

  const { track, level, index } = result;
  const nextLevel = track.levels[index + 1] ?? null;

  return (
    <LessonShell
      level={level}
      trackSlug={track.slug}
      trackTitle={track.title}
      nextLevel={nextLevel}
    />
  );
}
```

- [ ] **Step 7: Create loading and not-found for lesson pages**

```typescript
// src/app/track/[track-slug]/[level]/loading.tsx
export default function LessonLoading() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="animate-pulse text-text-muted text-sm">Loading lesson...</div>
    </div>
  );
}
```

```typescript
// src/app/track/[track-slug]/[level]/not-found.tsx
import Link from "next/link";

export default function LessonNotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-bright mb-2">Lesson not found</h1>
        <p className="text-sm text-text-muted mb-6">
          This lesson doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="text-accent hover:underline text-sm"
        >
          Back to all tracks
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Run type check**

Run: `bunx tsc --noEmit 2>&1 | tail -10`
Expected: New route files should be clean. Old `/learn/` files will error.

- [ ] **Step 9: Commit**

```bash
git add src/app/track/ src/components/track/
git commit -m "feat: add track overview and lesson pages under /track/ routes"
```

---

### Task 9: Redesign landing page

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/landing/TrackCard.tsx`
- Create: `src/components/landing/TrackGrid.tsx`
- Create: `src/components/landing/TrackGridWrapper.tsx`
- Modify: `src/components/landing/ProgressCTA.tsx`

- [ ] **Step 1: Create TrackCard component**

```typescript
// src/components/landing/TrackCard.tsx
import Link from "next/link";
import { Track } from "@/lib/tracks/types";
import { TrackIcon } from "@/lib/level-icons";
import { ChevronRight, Lock } from "lucide-react";

interface TrackCardProps {
  track: Track;
  completedCount: number;
  firstIncompleteLevelSlug: string | null;
  hasUnmetPrereqs: boolean;
  prereqTitles: Record<string, string>;
}

export function TrackCard({
  track,
  completedCount,
  firstIncompleteLevelSlug,
  hasUnmetPrereqs,
  prereqTitles,
}: TrackCardProps) {
  const totalLevels = track.levels.length;
  const isComplete = totalLevels > 0 && completedCount >= totalLevels;
  const isEmpty = totalLevels === 0;
  const progressPct =
    totalLevels > 0 ? Math.round((completedCount / totalLevels) * 100) : 0;

  const href = firstIncompleteLevelSlug
    ? `/track/${track.slug}/${firstIncompleteLevelSlug}`
    : `/track/${track.slug}`;

  return (
    <Link
      href={href}
      className="group block p-5 rounded-xl border border-card-border bg-card-bg hover:border-accent/20 transition-colors"
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: `${track.color}15`,
            borderColor: `${track.color}30`,
            borderWidth: 1,
          }}
        >
          <TrackIcon trackSlug={track.slug} size={20} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-text-bright">{track.title}</h3>
          <p className="text-xs text-text-muted mt-0.5">{track.subtitle}</p>
        </div>
        <ChevronRight
          size={14}
          className="text-text-muted group-hover:text-accent transition-colors shrink-0 mt-1"
        />
      </div>

      {/* Progress bar or status */}
      {isEmpty ? (
        <div className="text-[10px] text-text-muted uppercase tracking-wider">
          Coming soon
        </div>
      ) : (
        <>
          <div className="h-1 bg-accent/10 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-muted">
              {totalLevels} level{totalLevels !== 1 ? "s" : ""}
            </span>
            <span className="text-[10px] text-text-muted">
              {isComplete
                ? "Completed"
                : completedCount > 0
                  ? `${completedCount}/${totalLevels} done`
                  : ""}
            </span>
          </div>
          {hasUnmetPrereqs && track.prerequisites.length > 0 && (
            <div className="flex items-center gap-1 mt-2 text-[10px] text-term-yellow">
              <Lock size={10} strokeWidth={1.5} />
              <span>
                After: {track.prerequisites.map((slug) => prereqTitles[slug] ?? slug).join(", ")}
              </span>
            </div>
          )}
        </>
      )}
    </Link>
  );
}
```

- [ ] **Step 2: Create TrackGrid component**

```typescript
// src/components/landing/TrackGrid.tsx
import { Track } from "@/lib/tracks/types";
import { ProgressData } from "@/lib/progress";
import { TrackCard } from "./TrackCard";
import { findTrackBySlug } from "@/lib/tracks";

interface TrackGridProps {
  tracks: Track[];
  progress: ProgressData | null;
}

export function TrackGrid({ tracks, progress }: TrackGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tracks.map((track) => {
        const trackProgress = progress?.tracks[track.slug];
        const completedCount = trackProgress?.completedLevels.length ?? 0;
        const firstIncomplete = track.levels.find(
          (l) => !trackProgress?.completedLevels.includes(l.slug),
        );

        const hasUnmetPrereqs = track.prerequisites.some((prereqSlug) => {
          const prereqTrack = findTrackBySlug(prereqSlug);
          if (!prereqTrack || prereqTrack.levels.length === 0) return false;
          const prereqCompleted =
            progress?.tracks[prereqSlug]?.completedLevels.length ?? 0;
          return prereqCompleted < prereqTrack.levels.length;
        });

        return (
          <TrackCard
            key={track.slug}
            track={track}
            completedCount={completedCount}
            firstIncompleteLevelSlug={firstIncomplete?.slug ?? null}
            hasUnmetPrereqs={hasUnmetPrereqs}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Create TrackGridWrapper client island**

```typescript
// src/components/landing/TrackGridWrapper.tsx
"use client";

import { useEffect, useState } from "react";
import { tracks } from "@/lib/tracks";
import { loadProgress, ProgressData } from "@/lib/progress";
import { TrackGrid } from "./TrackGrid";

export function TrackGridWrapper() {
  const [progress, setProgress] = useState<ProgressData | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  return <TrackGrid tracks={tracks} progress={progress} />;
}
```

- [ ] **Step 4: Update ProgressCTA for track-based navigation**

```typescript
// src/components/landing/ProgressCTA.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { tracks } from "@/lib/tracks";
import { loadProgress, ProgressData } from "@/lib/progress";

function useProgress() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  useEffect(() => {
    setProgress(loadProgress());
  }, []);
  return progress;
}

function getNextLink(progress: ProgressData | null): { href: string; label: string } {
  if (!progress) {
    return { href: "/track/terminal-basics/where-am-i", label: "Start Learning" };
  }

  // Find the first track with incomplete levels
  for (const track of tracks) {
    if (track.levels.length === 0) continue;
    const trackProgress = progress.tracks[track.slug];
    const completedCount = trackProgress?.completedLevels.length ?? 0;
    if (completedCount < track.levels.length) {
      const nextLevel = track.levels.find(
        (l) => !trackProgress?.completedLevels.includes(l.slug),
      );
      if (nextLevel) {
        return {
          href: `/track/${track.slug}/${nextLevel.slug}`,
          label: `Continue: ${nextLevel.title}`,
        };
      }
    }
  }

  return { href: "/track/terminal-basics", label: "Review Tracks" };
}

export function ProgressCTA({ variant }: { variant: "nav" | "hero" | "cta" }) {
  const progress = useProgress();
  const { href, label } = getNextLink(progress);
  const hasProgress =
    progress && Object.values(progress.tracks).some((t) => t.completedLevels.length > 0);

  if (variant === "nav") {
    return (
      <Link
        href={href}
        className="bg-accent hover:bg-accent-hover text-black font-bold py-1.5 px-4 rounded-lg transition-colors text-xs active:scale-[0.98]"
      >
        {hasProgress ? "Continue" : "Start"}
      </Link>
    );
  }

  if (variant === "hero") {
    return (
      <Link
        href={href}
        className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-black font-bold py-3 px-7 rounded-lg transition-colors text-sm active:scale-[0.98]"
      >
        {label}
        <ArrowRight size={14} strokeWidth={2} />
      </Link>
    );
  }

  // variant === "cta"
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 bg-claude hover:bg-claude-hover text-white font-bold py-3 px-8 rounded-lg transition-colors text-sm active:scale-[0.98]"
    >
      {label}
      <ArrowRight size={14} strokeWidth={2} />
    </Link>
  );
}
```

- [ ] **Step 5: Update landing page**

Rewrite `src/app/page.tsx` — keep hero, how-it-works, and CTA sections. Replace the level slider with the track grid. Update copy to reference "tracks" instead of "levels":

Key changes:
- Replace `<LevelSliderWrapper />` with `<TrackGridWrapper />`
- Update heading from "8 levels to terminal mastery" to "6 tracks to terminal mastery"
- Update feature card "8 progressive levels" to "6 learning tracks"
- Update "How it works" step 3 copy to mention tracks
- Remove imports for `LevelSliderWrapper`
- Add imports for `TrackGridWrapper`

The full page follows the existing structure but swaps the curriculum section:

```tsx
{/* ── Curriculum ── */}
<section id="tracks" className="bg-section-bg border-y border-card-border">
  <div className="max-w-[1400px] mx-auto w-full px-6 py-20">
    <p className="text-xs text-accent uppercase tracking-wider mb-3">Curriculum</p>
    <h2 className="text-2xl md:text-3xl font-bold text-text-bright tracking-tighter mb-3">
      6 tracks to terminal mastery
    </h2>
    <p className="text-sm text-text-muted mb-10 max-w-md">
      Start with the basics, then branch into Git, Claude Code, and more.
      Each track builds on what you&apos;ve learned.
    </p>

    <TrackGridWrapper />
  </div>
</section>
```

Also update the nav links from `#levels` to `#tracks`.

- [ ] **Step 6: Run type check and build**

Run: `bunx tsc --noEmit 2>&1 | tail -10`

The old `/learn/` route files will still error — we delete those in the next task.

- [ ] **Step 7: Commit**

```bash
git add src/app/page.tsx src/components/landing/TrackCard.tsx src/components/landing/TrackGrid.tsx src/components/landing/TrackGridWrapper.tsx src/components/landing/ProgressCTA.tsx
git commit -m "feat: redesign landing page with track grid"
```

---

### Task 10: Delete old routes and components

**Files:**
- Delete: `src/app/learn/` (entire directory)
- Delete: `src/components/landing/LevelSlider.tsx`
- Delete: `src/components/landing/LevelSliderWrapper.tsx`
- Delete: `src/components/landing/MatrixCard.tsx`

- [ ] **Step 1: Delete old learn routes**

Run:
```bash
rm -r src/app/learn
```

- [ ] **Step 2: Delete old landing components**

Run:
```bash
rm src/components/landing/LevelSlider.tsx src/components/landing/LevelSliderWrapper.tsx src/components/landing/MatrixCard.tsx
```

- [ ] **Step 3: Remove any remaining imports of deleted files**

Check for broken imports:
```bash
bunx tsc --noEmit 2>&1 | grep "Cannot find module"
```

Fix any remaining references. The old `src/lib/lessons/index.ts` and level files are still needed because the track definitions import from them — they stay for now.

- [ ] **Step 4: Run type check**

Run: `bunx tsc --noEmit 2>&1 | tail -5`
Expected: Clean (no errors)

- [ ] **Step 5: Run build**

Run: `bun run build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add -u
git commit -m "refactor: delete old /learn/ routes and unused landing components"
```

---

### Task 11: Update CommandExecutor with track-aware locked messages

**Files:**
- Modify: `src/lib/commands/executor.ts`
- Create: `src/lib/__tests__/executor.test.ts`

- [ ] **Step 1: Write test for track-aware locked messages**

```typescript
// src/lib/__tests__/executor.test.ts
import { describe, it, expect } from "vitest";
import { getTrackAwareLockedMessage } from "@/lib/commands/executor";

describe("getTrackAwareLockedMessage", () => {
  it("returns track hint when command exists in another track", () => {
    const msg = getTrackAwareLockedMessage("grep");
    expect(msg).toContain("Terminal Advanced");
  });

  it("returns generic message for unknown commands", () => {
    const msg = getTrackAwareLockedMessage("unknown-command");
    expect(msg).toBeTruthy();
    // Should not mention any track since it doesn't exist anywhere
    expect(msg).not.toContain("track");
  });

  it("returns track hint for git commands", () => {
    // git is currently only in the stub level8 handlers, not in any track level's availableCommands
    // This test verifies the fallback behavior
    const msg = getTrackAwareLockedMessage("pwd");
    // pwd is in terminal-basics
    expect(msg).toContain("Terminal Basics");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test src/lib/__tests__/executor.test.ts 2>&1 | tail -3`
Expected: FAIL

- [ ] **Step 3: Update executor.ts**

Export a `getTrackAwareLockedMessage` function and replace the old `getLockedMessage`:

```typescript
// Add import at top of executor.ts:
import { findCommandTrack } from "@/lib/tracks";

// Replace the getLockedMessage function:
export function getTrackAwareLockedMessage(cmd: string): string {
  const result = findCommandTrack(cmd);
  if (result) {
    return `'${cmd}' is covered in the ${result.track.title} track. Head there to unlock it!`;
  }
  // Generic fallback for commands not in any track
  const fallbacks = [
    `'${cmd}' isn't available here. Try the Speed Test if this is too easy — tryterminal.dev/speed-test`,
    `'${cmd}'? Nice try — but it's not part of this level.`,
    `Hold up — '${cmd}' isn't unlocked yet. Keep going!`,
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}
```

Update the `executeParsed` method to use the new function:
```typescript
// In executeParsed, replace:
// return { output: getLockedMessage(parsed.command), outputType: "info" };
// with:
return { output: getTrackAwareLockedMessage(parsed.command), outputType: "info" };
```

Remove the old `SNARKY_MESSAGES`, `lastSnarkIndex`, and `getLockedMessage` function.

- [ ] **Step 4: Run tests**

Run: `bun test src/lib/__tests__/executor.test.ts 2>&1 | tail -3`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/commands/executor.ts src/lib/__tests__/executor.test.ts
git commit -m "feat: track-aware locked command messages"
```

---

### Task 12: Final integration — lint, type check, build, test

**Files:** None new — validation only.

- [ ] **Step 1: Run all tests**

Run: `bun test 2>&1 | tail -5`
Expected: All tests pass

- [ ] **Step 2: Run lint**

Run: `bun run lint 2>&1 | tail -5`
Expected: No errors

- [ ] **Step 3: Run type check**

Run: `bunx tsc --noEmit 2>&1 | tail -5`
Expected: No errors

- [ ] **Step 4: Run build**

Run: `bun run build 2>&1 | tail -10`
Expected: Build succeeds, static pages generated for all track routes

- [ ] **Step 5: Manual smoke test**

Run: `bun dev`

Verify:
- Landing page loads, shows 6 track cards
- Clicking "Terminal Basics" goes to `/track/terminal-basics`
- Track overview shows 5 levels with correct titles
- Clicking a level goes to `/track/terminal-basics/where-am-i`
- Lesson loads correctly with terminal, task card, and finder
- Completing a task saves progress
- Completing all tasks shows "Level Complete" with "Next: Moving Around" link
- "Back to Terminal Basics" link works
- Speed test still works at `/speed-test`
- Old `/learn/where-am-i` returns 404

- [ ] **Step 6: Commit any remaining fixes**

```bash
git add -u
git commit -m "chore: final integration fixes for branching tracks infrastructure"
```

---

## Appendix: What's NOT in This Plan (Phase 2)

The following are covered by a separate Phase 2 plan:

1. **Git simulation** — `SimulationState`, `GitState`, branch switching, Finder integration
2. **Git track levels** — 5 new levels with tasks, initialFS, and validation
3. **Terminal modes** — Claude mode architecture, `useSimulation` hook, prompt switching
4. **Claude Code track levels** — 4 new levels with `ClaudeScript` definitions
5. **Skills & Agents track levels** — 4 new levels with scripted `npx skills` output
6. **Shell Customization track** — `$VAR` expansion in parser, `export`/`source`/`env` commands, 4 new levels
7. **`SimulationState`** — separated from VirtualFS, passed via `CommandContext`

Phase 2 can be started immediately after this plan is complete. Each track's content can be developed in parallel via separate worktrees.
