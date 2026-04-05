# New Tracks Design: Git, Claude Code, Skills & Agents

**Date:** 2026-04-05
**Status:** Approved

## Overview

Add content to three "coming soon" tracks, turning them into playable courses:

1. **Git** (5 levels) — version control from first init to worktrees
2. **Claude Code** (3 levels) — AI-powered development fundamentals
3. **Skills & Agents** (4 levels) — advanced Claude Code configuration

Prerequisite chain: terminal-basics → git → claude-code → skills-agents

## Architectural Notes (from review)

### Subcommand Gating

The executor registers `git` as a single command — all subcommands become available at once. To support progressive unlock of subcommands per level:

- Add `availableCommands: string[]` to `CommandContext` in `src/lib/commands/types.ts`
- Pass it through in `executor.ts`
- Git and claude handlers check for entries like `"git init"`, `"git add"`, `"claude /init"` etc.
- Return pedagogical message when subcommand is locked: "You'll learn `git commit` in Level 3: Making History"
- Level `availableCommands` arrays list both `"git"` (top-level) and `"git init"`, `"git status"` (subcommand-level)

### Parser Flag Quirk

The parser converts `-m` to `flags.m = true` and `-b` to `flags.b = true`, stripping them from args. The commit message and branch name end up as regular args. Handlers must check `flags.m === true` and read the message from `args[1]`. Same for `-b` in `git checkout -b` and `git worktree add ... -b`.

### Multi-Step Tasks

Tasks that require multiple sequential commands (echo → git add → git commit) must be split into separate tasks, each with its own validation. The system validates one command per submission.

### Filesystem State on Refresh

Refreshing mid-level resets the filesystem via `initialFS()` while preserving the task index. Accept this limitation — it's fine for a tutorial. Each level's `initialFS` represents the starting state of the level, not mid-level states.

### Level Type

New level files should use the `Level` type from `src/lib/tracks/types.ts` (which includes `icon: string`), not the old type from `src/lib/lessons/types.ts`. The old type has a numeric `id` field that new levels don't need.

### Level 8 Overlap

Terminal Advanced Level 8 ("Ready for Claude Code") already teaches basic `git init`, `git add`, `git commit`, and `claude`. It serves as a teaser/preview. No changes needed — it motivates learners to start the Git track.

## Handler Changes

### Git Handler Enhancement (`src/lib/commands/handlers/level8.ts` → split to `git.ts`)

The existing git handler returns hardcoded output. Enhance to be **context-aware** using the virtual filesystem to track git state:

**State tracking via filesystem:**
- `.git/` existence → repo initialized or not
- `.git/HEAD` → current branch (`ref: refs/heads/main`)
- `.git/index` → newline-separated list of staged file paths
- `.git/logs` → JSON array of commit objects `{ hash, message, author, date }`
- `.git/refs/heads/` → branch files (each contains latest commit hash)
- `.git/worktrees/` → worktree tracking entries

**Subcommands to implement:**

| Subcommand | Behavior |
|---|---|
| `git init` | Creates `.git/`, `HEAD`, empty `index`, empty `logs` (already partially exists) |
| `git status` | Checks `.git/` exists, reads `index` for staged files, scans filesystem for untracked files |
| `git add <file>` | Appends filename to `.git/index` |
| `git add .` | Adds all untracked files to `.git/index` |
| `git diff` | Shows simulated diff output for modified/untracked files |
| `git commit -m "<msg>"` | Reads `index`, clears it, appends commit to `logs`, updates branch ref |
| `git log` | Reads `logs` and formats as standard git log output |
| `git branch` | Lists branches from `.git/refs/heads/`, marks current from `HEAD` |
| `git branch <name>` | Creates new branch ref file |
| `git checkout <branch>` | Updates `.git/HEAD` to point to branch |
| `git checkout -b <name>` | Creates branch + switches to it |
| `git merge <branch>` | Simulated merge success message |
| `git worktree list` | Lists worktrees from `.git/worktrees/` |
| `git worktree add <path> -b <branch>` | Creates directory at path, adds worktree entry, creates branch |
| `git worktree remove <path>` | Removes directory and worktree entry |

### Claude Handler Enhancement (`src/lib/commands/handlers/level8.ts` → split to `claude.ts`)

Simulate realistic Claude Code interactions:

| Input | Behavior |
|---|---|
| `claude` (no args) | ASCII welcome screen with version, model, tips |
| `claude --help` | Realistic help output (flags, options) |
| `claude --version` | Version string `1.0.34 (Claude Code)` |
| `claude /init` | Scans project files, creates `CLAUDE.md` with project-specific content |
| `claude /help` | Slash commands list |
| `claude "explain <file>"` | Simulated explanation of the file's purpose |
| `claude "find bugs in <file>"` | Simulated bug report (finds deliberate bug in filesystem) |
| `claude "fix <description>"` | Simulated diff output, actually modifies the file in VirtualFS |
| `claude "create <description>"` | Creates a file in VirtualFS with simulated content |

Keyword matching on the prompt text drives which response template to use.

### Skills & Agents Handler Additions

New simulated commands/behaviors:
- `claude /skills` — lists available skills
- `claude /find-skills` — simulated plugin discovery search results
- `claude /skill-creator` — simulated guided skill creation flow
- `claude /install-plugin <name>` — simulated plugin install (creates skill files in filesystem)
- `cat .claude/agents/<name>.md` — reading agent definitions (filesystem-based, no handler needed)
- `cat .claude/settings.json` — reading settings (filesystem-based)
- Hooks and settings.json are file-based, taught through `cat`, `echo`, and file creation commands

## Git Track (5 Levels)

### Level 1: "First Repository" (`first-repository`)
**Slug:** `first-repository`
**Icon:** `git-branch`
**Commands:** `git init`, `git status`, `ls`, `cd`, `pwd`
**Filesystem:** `~/projects/portfolio/` with `index.html`, `style.css`, `app.js` — no `.git/`

**Tasks:**
1. Navigate to the portfolio project → `cd projects/portfolio`
2. List the files → `ls`
3. Initialize a git repo → `git init`
4. Check that `.git/` was created → `ls -la`
5. Check repo status → `git status` (shows untracked files)

**Teaching points:** What a repo is, the `.git` folder, tracked vs untracked files.

### Level 2: "Tracking Changes" (`tracking-changes`)
**Slug:** `tracking-changes`
**Icon:** `git-branch`
**Commands:** `+ git add, git diff`
**Filesystem:** `~/projects/portfolio/` with `.git/` initialized, files untracked

**Tasks:**
1. Check status → `git status` (untracked files listed)
2. Stage one file → `git add index.html`
3. Check status again → `git status` (staged vs untracked)
4. Stage all remaining files → `git add .`
5. Check status → `git status` (all staged, ready to commit)

**Teaching points:** Staging area concept, `git add`, partial vs full staging.

### Level 3: "Making History" (`making-history`)
**Slug:** `making-history`
**Icon:** `git-branch`
**Commands:** `+ git commit, git log, echo`
**Filesystem:** `~/projects/portfolio/` with `.git/` and files already staged

**Tasks:**
1. Check status → `git status` (files staged)
2. Commit with message → `git commit -m "Add portfolio homepage"`
3. Check status → `git status` (clean working tree)
4. View the log → `git log`
5. Make a change to a file → `echo "h1 { color: navy; }" >> style.css`
6. Stage the change → `git add style.css`
7. Commit again → `git commit -m "Update styles"`

**Teaching points:** Commits as snapshots, good commit messages, reading history, the edit-stage-commit cycle.

### Level 4: "Branching Out" (`branching-out`)
**Slug:** `branching-out`
**Icon:** `git-branch`
**Commands:** `+ git branch, git checkout, git merge`
**Filesystem:** `~/projects/portfolio/` with existing commit history

**Tasks:**
1. Check current branch → `git branch`
2. Create and switch to feature branch → `git checkout -b add-contact`
3. Verify branch → `git branch` (see `* add-contact`)
4. Create a new file on the branch → `echo "<form>Contact us</form>" > contact.html`
5. Stage and commit → `git add contact.html`
6. Commit the change → `git commit -m "Add contact page"`
7. Switch back to main → `git checkout main`
8. Merge the feature → `git merge add-contact`

**Teaching points:** Branches as parallel timelines, feature branch workflow, merging.

### Level 5: "Parallel Worlds" (`worktrees`)
**Slug:** `worktrees`
**Icon:** `git-branch`
**Commands:** `+ git worktree`
**Filesystem:** `~/projects/portfolio/` with commit history, main branch

**Tasks:**
1. List current worktrees → `git worktree list`
2. Create a worktree → `git worktree add ../portfolio-dark-mode -b dark-mode`
3. List worktrees again → `git worktree list` (shows both)
4. Navigate to new worktree → `cd ../portfolio-dark-mode`
5. Verify isolation → `ls` and `git branch`
6. Return and clean up → `cd ../portfolio`, `git worktree remove ../portfolio-dark-mode`

**Teaching points:** Worktrees as isolated working copies, why agents use them for parallel work, cleanup.

## Claude Code Track (3 Levels)

### Level 1: "Meet Claude" (`meet-claude`)
**Slug:** `meet-claude`
**Icon:** `bot`
**Commands:** `claude`, `ls`, `cd`, `pwd`, `cat`
**Filesystem:** `~/projects/webapp/` with `package.json`, `src/index.js`, `src/App.js`, `README.md`

**Tasks:**
1. Navigate to project → `cd projects/webapp`
2. Launch Claude Code → `claude` (see welcome screen)
3. Check version → `claude --version`
4. View help → `claude --help`
5. See slash commands → `claude /help`

**Teaching points:** What Claude Code is, how to start it, the interface, that it's a CLI tool.

### Level 2: "Project Memory" (`project-memory`)
**Slug:** `project-memory`
**Icon:** `bot`
**Commands:** `claude`, `cat`, `echo`, `ls`, `mkdir`
**Filesystem:** `~/projects/webapp/` — no CLAUDE.md yet

**Tasks:**
1. Check for CLAUDE.md → `ls -la` (not present)
2. Initialize → `claude /init` (creates CLAUDE.md)
3. Read it → `cat CLAUDE.md`
4. See `.claude/` folder → `ls -la .claude/`
5. Check rules folder → `ls .claude/rules/`
6. Add a custom rule → `echo "Always use TypeScript strict mode" > .claude/rules/typescript.md`

**Teaching points:** CLAUDE.md as the highest-leverage file, `.claude/` folder anatomy, modular rules.

### Level 3: "Working with Code" (`working-with-code`)
**Slug:** `working-with-code`
**Icon:** `bot`
**Commands:** `claude`, `cat`
**Filesystem:** `~/projects/webapp/` with CLAUDE.md, `src/utils.js` with a deliberate bug

**Tasks:**
1. Ask Claude to explain a file → `claude "explain src/App.js"`
2. Ask Claude to find bugs → `claude "find bugs in src/utils.js"`
3. Ask Claude to fix it → `claude "fix the bug in src/utils.js"` (file gets updated)
4. Verify the fix → `cat src/utils.js`
5. Create a new file → `claude "create a test file for utils.js"` (creates `src/utils.test.js`)

**Teaching points:** Prompting for different tasks, reviewing AI output, iterative workflow.

## Skills & Agents Track (4 Levels)

### Level 1: "Skills & Commands" (`skills-and-commands`)
**Slug:** `skills-and-commands`
**Icon:** `puzzle`
**Commands:** `claude`, `cat`, `echo`, `ls`, `mkdir`
**Filesystem:** `~/projects/webapp/` with CLAUDE.md, `.claude/` folder

**Tasks:**
1. Explore what skills are → `claude /help` (see skills listed)
2. Create a skill directory → `mkdir -p .claude/skills/security-review`
3. Create a SKILL.md → `echo` with frontmatter (name, description, allowed-tools)
4. Read it back → `cat .claude/skills/security-review/SKILL.md`
5. Invoke the skill → `claude /security-review` (simulated skill execution)

**Teaching points:** Skills as packaged workflows, SKILL.md frontmatter, user-invocable vs auto-invoked.

### Level 2: "Agents & Worktrees" (`agents-and-worktrees`)
**Slug:** `agents-and-worktrees`
**Icon:** `puzzle`
**Commands:** `claude`, `cat`, `echo`, `ls`, `mkdir`
**Filesystem:** `~/projects/webapp/` with `.claude/` folder, git initialized

**Tasks:**
1. Create agents directory → `mkdir .claude/agents`
2. Create a code-reviewer agent → `echo` with frontmatter (name, description, model, tools)
3. Read it → `cat .claude/agents/code-reviewer.md`
4. Understand how agents use worktrees → `claude "review this project"` (simulated: "Spawning code-reviewer agent in worktree...")
5. See how model selection works → reference to the agent's `model: sonnet` field

**Teaching points:** Subagent personas, model selection for cost efficiency, tool restrictions, worktree isolation.

### Level 3: "Hooks & Configuration" (`hooks-and-config`)
**Slug:** `hooks-and-config`
**Icon:** `puzzle`
**Commands:** `claude`, `cat`, `echo`, `ls`, `mkdir`
**Filesystem:** `~/projects/webapp/` with `.claude/` folder, `settings.json` pre-populated with permissions AND hooks config referencing `.claude/hooks/auto-format.sh`

**Tasks:**
1. Read current settings → `cat .claude/settings.json` (see permissions: allow/deny lists)
2. Understand allow/deny → instruction explains the format and what each entry means
3. Look at the hooks config → instruction points out the hooks section already in settings.json
4. Create the hooks directory → `mkdir .claude/hooks`
5. Create the hook script that settings.json references → `echo '#!/bin/bash\nnpx prettier --write "$1"' > .claude/hooks/auto-format.sh`
6. Read it back → `cat .claude/hooks/auto-format.sh`

**Teaching points:** Permissions (allow/deny), hooks lifecycle (PreToolUse/PostToolUse/Stop), exit codes (0=pass, 2=block), that hooks are deterministic (always run) vs CLAUDE.md instructions (probabilistic), settings.json as the hooks registry.

### Level 4: "Extend & Share" (`extend-and-share`)
**Slug:** `extend-and-share`
**Icon:** `puzzle`
**Commands:** `claude`, `cat`, `ls`
**Filesystem:** `~/projects/webapp/` with full `.claude/` setup from prior levels (skills/, agents/, settings.json, hooks/)

**Tasks:**
1. Discover available plugins → `claude /find-skills` (simulated search results from plugin registry)
2. Install a plugin → `claude /install-plugin code-review-pro` (simulated install, creates files in `.claude/skills/`)
3. See what was installed → `ls .claude/skills/` (new skill directory appeared)
4. Read the installed skill → `cat .claude/skills/code-review-pro/SKILL.md`
5. Use the skill creator → `claude /skill-creator` (simulated guided creation flow, creates a new skill)
6. Read the created skill → `cat .claude/skills/my-custom-skill/SKILL.md`

**Teaching points:** The plugin/skill ecosystem, discovering community extensions, installing pre-built plugins, creating your own skills to share with the team.

## New Icons Needed

Need to add icons for git track sub-levels. Current `level-icons.tsx` has `git-branch` but may need variants. Options:
- Reuse `git-branch` for all git levels (simple)
- Add `git-commit`, `git-merge` from Lucide (if available)

For now, reuse existing icons:
- Git levels: `git-branch` for all (or use `compass`, `navigation`, etc. for variety)
- Claude Code levels: `bot` for all
- Skills & Agents levels: `puzzle` for all

## Implementation Phasing

**Phase 1: Git Track** — Handler + 5 levels + subcommand gating infrastructure
- Subcommand gating (CommandContext change) is foundational — do this first
- Git handler is the most complex piece (context-aware filesystem state)
- Produces a shippable increment (git track goes live)

**Phase 2: Claude Code Track** — Handler + 3 levels
- Simpler handler (keyword matching + template responses)
- Builds on the subcommand gating pattern from Phase 1

**Phase 3: Skills & Agents Track** — Handler extensions + 4 levels
- Mostly filesystem-based tasks (echo, mkdir, cat)
- Lightest handler work, heaviest content design
- Adds claude slash command extensions (/find-skills, /skill-creator, /install-plugin)

Each phase matches the prerequisite chain and produces a shippable increment.

## Files to Create/Modify

**New files:**
- `src/lib/commands/handlers/git.ts` — enhanced git handler (split from level8.ts)
- `src/lib/commands/handlers/claude.ts` — enhanced claude handler (split from level8.ts)
- `src/lib/lessons/levels/level-git-1.ts` through `level-git-5.ts`
- `src/lib/lessons/levels/level-claude-1.ts` through `level-claude-3.ts`
- `src/lib/lessons/levels/level-skills-1.ts` through `level-skills-4.ts`

**Modified files:**
- `src/lib/filesystem/initial-states.ts` — add filesystem creators for all 12 new levels
- `src/lib/tracks/git.ts` — populate levels array
- `src/lib/tracks/claude-code.ts` — populate levels array
- `src/lib/tracks/skills-agents.ts` — populate levels array
- `src/lib/commands/executor.ts` — update git/claude handler imports
- `src/lib/level-icons.tsx` — add any new icon mappings needed
- `src/lib/commands/types.ts` — add `availableCommands` to `CommandContext` for subcommand gating
