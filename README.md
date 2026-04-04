# >_ TryTerminal

An interactive terminal learning platform that teaches command-line basics through a hands-on, visual experience. Type commands in a virtual terminal, watch files appear in a real-time Finder window.

**Live:** [terminal-one-omega.vercel.app](https://terminal-one-omega.vercel.app/)

## What is this?

TryTerminal helps complete beginners go from never having opened a terminal to being ready for tools like [Claude Code](https://claude.ai/code). No installs, no accounts — just open the browser and start typing.

### Learning Tracks

| Track | Levels | What you'll learn |
|-------|--------|-------------------|
| **Terminal Basics** | 5 | pwd, ls, cd, mkdir, touch, cp, mv, rm, cat, echo |
| **Terminal Advanced** | 2 | find, grep, pipes, chmod, history, aliases |
| **Git** | — | Coming soon: init, commit, branch, merge, worktrees |
| **Claude Code** | — | Coming soon: AI-assisted development workflows |
| **Skills & Agents** | — | Coming soon: skills.sh, CLAUDE.md, agent harnesses |
| **Shell Customization** | — | Coming soon: env vars, dotfiles, aliases, scripting |

### Features

- Virtual terminal with 40+ commands, tab completion, command history, pipes, and redirects
- macOS-style Finder window that mirrors the filesystem in real time
- Guided tasks with validation — the app checks your work as you go
- Progress tracking saved locally (no account needed)
- Speed test mode with leaderboard
- Light/dark theme
- Fully static — no backend required

## Development

```bash
bun install
bun dev          # http://localhost:3000
bun run build    # Production build (static export)
bun run lint     # ESLint
bun test         # Vitest
bunx tsc --noEmit # Type check
```

### Tech Stack

- Next.js 16 (App Router, static export)
- React 19
- TypeScript
- Tailwind CSS v4
- Vitest

### Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page with track grid
│   ├── track/[track-slug]/         # Track overview pages
│   │   └── [level]/                # Lesson pages
│   └── speed-test/                 # Speed test mode
├── components/
│   ├── terminal/                   # Terminal UI and output rendering
│   ├── lesson/                     # LessonShell, TaskCard, LevelComplete
│   ├── finder/                     # macOS Finder file browser
│   ├── landing/                    # TrackGrid, TrackCard, ProgressCTA
│   └── track/                      # LevelList for track overview
├── hooks/                          # useTerminal, useLesson, useVirtualFS, useDraggable
└── lib/
    ├── tracks/                     # Track + Level definitions
    ├── commands/                   # Command parser, executor, handlers
    ├── filesystem/                 # VirtualFS implementation
    ├── lessons/                    # LessonEngine, legacy level data
    └── progress.ts                 # localStorage progress tracking
```

## License

MIT
