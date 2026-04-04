# Branching Tracks Design

## Summary

Restructure TryTerminal from a linear 8-level progression into a multi-track learning platform. Six branching tracks cover terminal fundamentals through Claude Code, agent skills, and shell customization. Tracks use soft prerequisite gates — recommended but not enforced.

## Goals

- Let beginners start from zero while allowing developer-adjacent users to skip ahead
- Extend content beyond terminal basics into Git, Claude Code, Skills & Agents, and shell customization
- Maintain the existing interactive lesson experience (virtual FS, terminal emulator, Finder, task validation)
- Keep gamification light: progress bars, track completion %, and the existing speed test

## Non-Goals

- No backend or user accounts — all progress stays in localStorage
- No real Claude API integration — Claude Code lessons use scripted responses
- No badges, XP, streaks, or social features
- No changes to the speed test (may add new challenges later, out of scope)

---

## Data Model

### Track Type

```typescript
type Track = {
  slug: string;            // "terminal-basics" (also serves as unique ID)
  title: string;           // "Terminal Basics"
  subtitle: string;        // "Learn to navigate and manage files"
  description: string;     // Longer description for track page
  icon: string;            // Emoji or component name
  color: string;           // Accent color for the track
  prerequisites: string[]; // Track slugs — soft gates, not hard locks
  levels: Level[];         // Ordered list of levels within this track
};
```

### Level Type (Redesigned)

The current `Level` type uses a numeric `id` with arithmetic (`id + 1` for navigation). This collides when multiple tracks each have their own ordered levels. The new type uses string-based composite identity:

```typescript
type Level = {
  slug: string;            // "where-am-i" (unique within track)
  title: string;           // "Where Am I?"
  subtitle: string;        // "Learn pwd, ls, and clear"
  description: string;
  icon: string;            // Emoji or component — keyed by slug, not number
  initialFS: () => Map<string, FSNode>;
  initialCwd: string;
  availableCommands: string[];
  tasks: Task[];
};
```

**Key changes from current `Level`:**
- `id: number` removed — replaced by `slug: string`
- Navigation uses track context: "next level" = next item in the track's `levels` array, not `id + 1`
- Level icons keyed by slug (e.g., `{ "where-am-i": Compass, "moving-around": FolderTree }`) instead of numeric `Record<number, Icon>`
- `LevelComplete` receives `nextLevel: Level | null` and `trackSlug: string` as props — renders "Next Level" or "Back to Track" accordingly

### Simulation State

To avoid coupling domain-specific simulation state onto VirtualFS, simulation state lives alongside it in a separate object:

```typescript
type SimulationState = {
  git: GitState | null;
  terminalMode: TerminalMode;
  env: Record<string, string>;  // For shell customization track
};

type GitState = {
  initialized: boolean;
  branch: string;
  branches: Record<string, Map<string, FSNode>>;  // Branch → file snapshots
  staged: string[];
  commits: Array<{ hash: string; message: string; files: string[]; branch: string }>;
  remotes: Record<string, string>;
  worktrees: Array<{ path: string; branch: string }>;
};

type TerminalMode = 
  | { type: "normal" }
  | { type: "claude"; script: ClaudeScript[]; history: string[] };
```

`SimulationState` is passed into `CommandExecutor` via `CommandContext` and stored in the `useLesson` hook (or a dedicated `useSimulation` hook). VirtualFS remains a clean, general-purpose filesystem.

### Progress Model

```typescript
type ProgressData = {
  version: 2;                    // Schema version for migration detection
  tracks: Record<string, {
    completedLevels: string[];              // Level slugs
    taskProgress: Record<string, number>;   // Per-level task index
  }>;
  totalCommands: number;
};
```

Replaces the current flat `completedLevels: number[]` model.

**Migration strategy:** On first load, detect `version` field absence (v1 schema). Map old progress:
- Completed levels 1-5 → `terminal-basics` track, slugs mapped by index
- Completed levels 6-7 → `terminal-advanced` track
- Completed level 8 → mark as completed in `git` track level 1 only (the only clean mapping)
- Mid-level-8 task progress is dropped — acceptable loss since level 8 is being decomposed across multiple tracks. User restarts those sections fresh.
- Write migrated data with `version: 2` to prevent re-migration.

---

## Tracks & Levels

### Terminal Basics (no prerequisites)

| # | Level | Commands | Tasks |
|---|-------|----------|-------|
| 1 | Where Am I? | pwd, ls, clear | Existing level 1 |
| 2 | Moving Around | cd, cd .., cd ~ | Existing level 2 |
| 3 | Creating Your World | mkdir, touch, open | Existing level 3 |
| 4 | File Operations | cp, mv, rm | Existing level 4 |
| 5 | Reading & Writing | cat, head, tail, echo | Existing level 5 |

### Terminal Advanced (prereq: Terminal Basics)

| # | Level | Commands | Tasks |
|---|-------|----------|-------|
| 1 | Finding Things | find, grep, pipes | Existing level 6 |
| 2 | Power User | chmod, which, history, alias | Existing level 7 |

### Git (prereq: Terminal Basics)

| # | Level | Commands | Tasks |
|---|-------|----------|-------|
| 1 | First Repository | git init, git add, git commit | New (seeds from level 8) |
| 2 | Branching & Merging | git branch, git checkout, git merge | New |
| 3 | Remote & Push/Pull | git remote, git push, git pull | New (canned output — no real remote) |
| 4 | Worktrees | git worktree add/list/remove | New (canned output — simulated paths) |
| 5 | Resolving Conflicts | Pre-scripted merge conflicts | New |

**Git simulation scope:** Levels 1-2 have full FS-aware simulation (files change on checkout, staged files tracked). Levels 3-4 use canned terminal output since there's no actual remote or separate worktree filesystem. Level 5 pre-populates conflict markers in files; the user edits the file content (via echo/cat redirection) and commits.

### Claude Code (prereqs: Terminal Basics, Git)

| # | Level | Concepts | Tasks |
|---|-------|----------|-------|
| 1 | Installing & First Chat | Install, launch, first prompt | New |
| 2 | Reading & Editing Code | Ask Claude to read/edit files | New |
| 3 | Slash Commands & Workflows | /commit, /push, /help, custom commands | New |
| 4 | Commit, Test, Push Loop | Full development workflow with Claude | New |

### Skills & Agents (prereq: Claude Code)

| # | Level | Concepts | Tasks |
|---|-------|----------|-------|
| 1 | What Are Skills? | Concept of agent skills, skills.sh | New |
| 2 | Browsing & Installing Skills | npx skills find/add | New |
| 3 | CLAUDE.md & Hooks | Project configuration, hooks | New |
| 4 | Agent Harnesses | Hermes, agent config, workflows | New |

### Shell Customization (prereq: Terminal Basics)

| # | Level | Commands | Tasks |
|---|-------|----------|-------|
| 1 | Environment Variables | export, echo $VAR, PATH | New |
| 2 | Dotfiles | .zshrc, .bashrc, sourcing | New |
| 3 | Aliases & Functions | alias, shell functions | New |
| 4 | Basic Scripting | #!/bin/bash, conditionals, loops | New |

### Filesystem Continuity

Each level gets its own `initialFS` that pre-populates the filesystem as if prior levels in the track were completed. This matches the current pattern and avoids needing cross-level FS persistence.

For example, Git level 2 (Branching & Merging) starts with an `initialFS` that includes a `.git` directory indicator, pre-existing commits in `GitState`, and files that reflect what the user would have created in level 1. The user does not need to replay level 1 to use level 2.

This applies to `SimulationState` as well: Git level 2's initial `SimulationState` includes a pre-populated `GitState` with a commit history and initialized repo.

---

## Routing

```
/                              → Landing page (track grid)
/track/[track-slug]            → Track overview page
/track/[track-slug]/[level]    → Lesson page
/speed-test                    → Speed test (unchanged)
```

- Delete `/learn/` route entirely.
- Add redirects in `next.config.ts` for the 8 old `/learn/[slug]` paths to their new `/track/[track]/[slug]` equivalents:

```typescript
// next.config.ts
redirects: async () => [
  { source: '/learn/where-am-i', destination: '/track/terminal-basics/where-am-i', permanent: true },
  { source: '/learn/moving-around', destination: '/track/terminal-basics/moving-around', permanent: true },
  // ... 6 more mappings
],
```

### Page Patterns

**`/track/[track-slug]/page.tsx`** — async server component:
- `generateStaticParams()` for all track slugs
- `generateMetadata()` for per-track OG tags
- Renders `TrackOverviewClient` as client island

**`/track/[track-slug]/[level]/page.tsx`** — async server component:
- `generateStaticParams()` for all track+level combinations
- `generateMetadata()` for per-level OG tags
- Renders `LessonClient` wrapping `LessonShell`
- Passes `trackSlug`, `track.title`, `nextLevel`, and `prevLevel` into `LessonShell`

**Error/loading/not-found boundaries** at each route segment following existing patterns.

---

## Landing Page

### Sections (in order)

1. **Hero** — Keep Clawd mascot, update copy to reference tracks
2. **How It Works** — Keep 3 feature cards, update wording
3. **Track Grid** — 2-column grid (3 on wide screens), 6 track cards
4. **Speed Test CTA** — Keep existing
5. **Footer CTA** — "Pick a track and start learning"

### Track Card Contents

- Track icon + accent color stripe
- Title + subtitle
- Level count (e.g., "5 levels")
- Progress bar (if any progress exists)
- Prereq badge if applicable (e.g., "After: Terminal Basics")
- CTA: "Start" / "Continue" / "Completed"

### Client Islands

- `TrackGridWrapper.tsx` — loads progress from localStorage, passes to cards
- Track cards server-rendered, progress indicators injected client-side

---

## Track Overview Page

### Components

- **Header**: Track title, subtitle, icon, accent color
- **Prereq nudge**: Dismissible banner if prerequisites not completed ("This track builds on Terminal Basics. We recommend completing it first.")
- **Progress bar**: Track completion % at top
- **Level list**: Vertical list with status indicators
  - Checkmark: completed
  - Arrow/highlight: first incomplete ("Continue here")
  - Open circle: not started
  - All levels always clickable (soft gates)
- **Description**: What you'll learn, commands/tools covered

### Component Breakdown

- `TrackOverview.tsx` — server component, generates metadata
- `TrackOverviewClient.tsx` — client island, loads progress, renders level list with status

---

## Terminal Modes

The terminal currently operates in a single mode: user types a command, `CommandExecutor` parses and dispatches it. The Claude Code track requires a second mode where the terminal behaves like a Claude Code session with scripted responses.

### Mode Architecture

Terminal mode state lives in `SimulationState.terminalMode`:

```typescript
type TerminalMode = 
  | { type: "normal" }
  | { type: "claude"; script: ClaudeScript[]; history: string[] };
```

**How it works:**

1. **Mode transition**: The `claude` command handler sets `terminalMode` to `{ type: "claude", script: [...], history: [] }`. The script is defined per-task in the level definition.

2. **Prompt change**: `useTerminal` reads `terminalMode.type` to determine the prompt string. Normal mode: `learner@tryterminal:~/path $`. Claude mode: `claude> `.

3. **Input routing**: In `useTerminal.handleSubmit()`, before calling `CommandExecutor.execute()`, check `terminalMode.type`. If `"claude"`, route to a `matchClaudeScript()` function instead of the command parser.

4. **Script matching**: `matchClaudeScript()` compares user input against the active script entries. Matching is case-insensitive with trimmed whitespace. If no match, show a hint: "Try typing: `[expected input]`".

5. **Exit**: Typing `exit` or `/quit` in Claude mode resets `terminalMode` to `{ type: "normal" }` and restores the standard prompt.

### ClaudeScript Type

```typescript
type ClaudeScript = {
  trigger: string | RegExp;              // What the user types
  response: string[];                    // Lines of output (rendered as terminal lines)
  responseType?: "stdout" | "info";      // How to style the response (default: "info")
  sideEffects?: (fs: VirtualFS) => void; // Optional FS mutations (file edits, creates)
  delay?: number;                        // Optional delay in ms before response (simulates "thinking")
};
```

**Integration with lessons:** Claude Code track levels define `claudeScript` arrays on their tasks:

```typescript
{
  instruction: "Ask Claude to create a hello.js file",
  claudeScript: [
    {
      trigger: /create.*hello/i,
      response: [
        "[Reading project structure...]",
        "[Writing file: hello.js]",
        "",
        "I've created hello.js with a simple greeting:"
      ],
      sideEffects: (fs) => fs.createFile("/Users/learner/project/hello.js", 'console.log("Hello!")'),
    }
  ],
  validation: { type: "fs_exists", path: "/Users/learner/project/hello.js" }
}
```

### Mode Indicator

When in Claude mode, the terminal title bar changes from "Terminal" to "Claude Code" and the accent color shifts to Claude orange. This gives a clear visual signal that the user is in a different context.

---

## Simulation: Git

### State Management

Git state lives in `SimulationState.git`, separate from VirtualFS. Command handlers receive both via `CommandContext`.

```typescript
type GitState = {
  initialized: boolean;
  branch: string;
  branches: Record<string, Map<string, FSNode>>;  // Branch name → file snapshots
  staged: string[];
  commits: Array<{ hash: string; message: string; files: string[]; branch: string }>;
  remotes: Record<string, string>;
  worktrees: Array<{ path: string; branch: string }>;
};
```

### Branch Switching (git checkout)

When the user runs `git checkout <branch>`:

1. Snapshot current branch's files: store current VirtualFS file contents into `branches[currentBranch]`
2. Restore target branch's files: replace VirtualFS contents with `branches[targetBranch]`
3. Update `git.branch` to the target branch
4. Call `VirtualFS.notify()` to trigger Finder window update

This means the Finder window visually updates when switching branches — files appear/disappear as they would in a real repo.

### Scoped Simulation Fidelity

| Level | Simulation Depth |
|-------|-----------------|
| 1. First Repository | Full: git init creates GitState, add/commit track files, status shows staged/unstaged |
| 2. Branching & Merging | Full: branch creates snapshots, checkout swaps FS contents, merge combines file states |
| 3. Remote & Push/Pull | Canned: `git push` prints success message, `git pull` prints "Already up to date" — no actual remote |
| 4. Worktrees | Canned: `git worktree add` prints creation message, `git worktree list` shows table — no separate FS |
| 5. Resolving Conflicts | Pre-scripted: level's `initialFS` contains files with `<<<<<<< HEAD` conflict markers. User edits file via echo/cat, then commits. Validation checks that conflict markers are removed from file content. |

### Finder Integration

When `GitState.initialized` is true, the Finder window header shows the current branch name as a badge (e.g., `main` or `feature-branch`). No other Finder changes needed.

---

## Simulation: Claude Code

See **Terminal Modes** section above for the full architecture. Summary:

- `claude` command enters Claude mode with scripted responses
- Each task defines its own `ClaudeScript[]` array
- Responses can mutate VirtualFS (simulating file edits)
- Visual indicators: prompt changes, title bar changes, tool use messages
- `exit`/`/quit` returns to normal terminal

---

## Simulation: Skills

- `npx skills find [query]` — scripted search results showing matching skills
- `npx skills add [package]` — scripted installation output with progress indicators
- CLAUDE.md editing via `echo >>` on a virtual `.claude/CLAUDE.md` file
- Hooks shown as config file edits in a virtual `.claude/settings.json`

These are straightforward command handlers with canned output, similar to the current `npx` stub. No new architectural patterns needed.

---

## Shell Variable Expansion

The Shell Customization track requires `$VAR` expansion in the command parser. Currently `parseCommand()` does not handle variable substitution.

### Changes to Parser

Add a pre-processing step in `parseCommand()` that expands `$VAR` and `${VAR}` references before tokenizing:

```typescript
function expandVariables(input: string, env: Record<string, string>): string {
  return input.replace(/\$\{(\w+)\}|\$(\w+)/g, (_, braced, plain) => {
    const name = braced || plain;
    return env[name] ?? "";
  });
}
```

`env` comes from `SimulationState.env`. Default env includes `HOME=/Users/learner`, `USER=learner`, `PATH=/usr/local/bin:/usr/bin:/bin`.

New command handlers needed:
- `export`: Sets a variable in `SimulationState.env` (e.g., `export FOO=bar`)
- `source`: Reads a file and executes each line as a command (simplified — just for `.zshrc` lessons)
- `env` / `printenv`: Prints all variables

---

## Track-Aware Locked Command Messages

When a user tries a command that isn't in the current level's `availableCommands`, the error message should be track-aware instead of assuming linear progression.

Current: "That command is a few levels away!"
New: Check which track contains the command and display: "git is covered in the Git track" or "Try this command in the Terminal Advanced track."

Implementation: Add a lookup function `findCommandTrack(command: string): { track: Track, level: Level } | null` that scans all tracks to find where a command first appears. Use this in `CommandExecutor.getLockedMessage()`.

---

## What Stays the Same

- **LessonShell** — draggable windows on desktop, stacked on mobile (receives track context as new props)
- **Terminal emulator** — parser, command execution pipeline (extended with mode routing and variable expansion)
- **VirtualFS core** — observer pattern, `useSyncExternalStore`, all unchanged (simulation state is separate)
- **Task validation engine** — same types, new tracks define tasks using existing validators
- **Speed test** — unchanged, stays at `/speed-test`
- **Theme system** — light/dark, design tokens, unchanged
- **Error/loading/not-found boundaries** — same pattern, extended to new route segments
- **Client islands pattern** — server components for metadata, client islands for interactivity
- **TrafficLights, Clawd, ThemeToggle** — reused as-is

---

## File Structure (New/Changed)

```
src/
├── app/
│   ├── page.tsx                          # Redesigned landing (track grid)
│   ├── track/
│   │   ├── [track-slug]/
│   │   │   ├── page.tsx                  # Track overview (server)
│   │   │   ├── TrackOverviewClient.tsx   # Track overview (client island)
│   │   │   ├── loading.tsx
│   │   │   ├── not-found.tsx
│   │   │   ├── [level]/
│   │   │   │   ├── page.tsx             # Lesson (server)
│   │   │   │   ├── LessonClient.tsx     # Lesson (client island)
│   │   │   │   ├── loading.tsx
│   │   │   │   └── not-found.tsx
│   ├── learn/                            # DELETE
│
├── components/
│   ├── landing/
│   │   ├── TrackGrid.tsx                 # Track card grid
│   │   ├── TrackCard.tsx                 # Individual track card
│   │   ├── TrackGridWrapper.tsx          # Client island for progress
│   │   ├── LevelSlider.tsx              # REMOVE (replaced by track grid)
│   │   └── MatrixCard.tsx               # REMOVE
│   ├── track/
│   │   └── LevelList.tsx                # Level list with status indicators
│
├── lib/
│   ├── tracks/
│   │   ├── types.ts                     # Track, Level, SimulationState types
│   │   ├── index.ts                     # All tracks exported, lookup helpers
│   │   ├── terminal-basics.ts           # Track: levels 1-5
│   │   ├── terminal-advanced.ts         # Track: levels 6-7
│   │   ├── git.ts                       # Track: git levels + initialFS factories
│   │   ├── claude-code.ts              # Track: claude levels + ClaudeScripts
│   │   ├── skills-agents.ts            # Track: skills levels
│   │   └── shell-customization.ts      # Track: shell levels
│   ├── simulation/
│   │   ├── types.ts                     # SimulationState, GitState, TerminalMode, ClaudeScript
│   │   ├── git.ts                       # Git state management (snapshot, restore, merge)
│   │   └── claude.ts                    # Claude script matching logic
│   ├── commands/
│   │   ├── executor.ts                  # Extended with SimulationState in CommandContext
│   │   ├── parser.ts                    # Extended with $VAR expansion
│   │   ├── handlers/
│   │   │   ├── git.ts                   # Full git simulation (replaces level8 stubs)
│   │   │   ├── claude.ts               # Claude mode enter/exit handler
│   │   │   ├── skills.ts               # npx skills handlers
│   │   │   ├── env.ts                  # export, env, printenv, source
│   │   │   └── level8.ts              # DELETE (replaced by git.ts, claude.ts)
│   ├── progress.ts                      # Updated for per-track progress + v1→v2 migration
│
├── hooks/
│   ├── useLesson.ts                     # Updated for track-aware progress
│   ├── useTerminal.ts                   # Extended with terminal mode routing
│   └── useSimulation.ts                 # NEW: manages SimulationState lifecycle
│
├── next.config.ts                       # Add /learn/* → /track/* redirects
```
