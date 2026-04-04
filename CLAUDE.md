# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
bun dev          # Start dev server (http://localhost:3000)
bun run build    # Production build
bun run lint     # ESLint (flat config, core-web-vitals + typescript)
bunx tsc --noEmit # Type-check without emitting
```

No test runner is configured yet. When adding tests, set up vitest or similar and add a `test` script to package.json.

## Architecture

- **Next.js 16** with App Router, **React 19**, **Tailwind CSS v4**, **TypeScript**
- `src/app/` — App Router pages and layouts (no `pages/` directory)
- `@/*` path alias maps to `./src/*` (configured in tsconfig.json)
- Tailwind v4 uses `@import "tailwindcss"` and `@theme inline` in `globals.css` (not `tailwind.config.js`)
- Fonts: Geist Sans + Geist Mono loaded via `next/font/google`, exposed as CSS variables
- PostCSS config uses `@tailwindcss/postcss` plugin (Tailwind v4 style)
- ESLint uses flat config (`eslint.config.mjs`) with `eslint-config-next`
