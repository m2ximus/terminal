# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
bun dev          # Start dev server (http://localhost:3000)
bun run build    # Production build (static export)
bun run lint     # ESLint (flat config, core-web-vitals + typescript)
bun test         # Vitest
bunx tsc --noEmit # Type-check without emitting
```

## Architecture

- **Next.js 16** (App Router, static export), **React 19**, **Tailwind CSS v4**, **TypeScript**, **Vitest**
- `@/*` path alias maps to `./src/*` (configured in tsconfig.json)
- Tailwind v4 uses `@import "tailwindcss"` and `@theme inline` in `globals.css` (not `tailwind.config.js`)
- PostCSS config uses `@tailwindcss/postcss` plugin (Tailwind v4 style)
- ESLint uses flat config (`eslint.config.mjs`) with `eslint-config-next`

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
