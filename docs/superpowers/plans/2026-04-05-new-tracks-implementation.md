# New Tracks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate the three "coming soon" tracks (Git, Claude Code, Skills & Agents) with playable levels — 12 levels total across 3 tracks.

**Architecture:** Each track consists of level definitions (task lists + validation), filesystem initial states (the starting virtual filesystem per level), and enhanced command handlers (context-aware git and claude commands). The subcommand gating system is extended to progressively unlock git/claude subcommands per level.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, virtual filesystem (VirtualFS class)

**Spec:** `docs/superpowers/specs/2026-04-05-new-tracks-design.md`

---

## Phase 1: Infrastructure + Git Track

### Task 1: Subcommand Gating Infrastructure

**Files:**
- Modify: `src/lib/commands/types.ts`
- Modify: `src/lib/commands/executor.ts`

- [ ] **Step 1: Add `availableCommands` to `CommandContext`**

In `src/lib/commands/types.ts`, add `availableCommands` to the `CommandContext` interface:

```typescript
export interface CommandContext {
  fs: VirtualFS;
  args: string[];
  flags: Record<string, boolean>;
  stdin?: string;
  history: string[];
  availableCommands: string[];
}
```

- [ ] **Step 2: Pass `availableCommands` through to handlers in executor**

In `src/lib/commands/executor.ts`, update the handler call at line 94 to pass `availableCommands`:

```typescript
let result = handler({
  fs,
  args: parsed.args,
  flags: parsed.flags,
  stdin: parsed.stdin,
  history: this.commandHistory,
  availableCommands,
});
```

- [ ] **Step 3: Build verification**

Run: `bunx tsc --noEmit | tail -3`
Expected: No errors (all existing handlers receive `availableCommands` via `CommandContext` but don't need to use it)

- [ ] **Step 4: Commit**

```bash
git add src/lib/commands/types.ts src/lib/commands/executor.ts
git commit -m "feat: add availableCommands to CommandContext for subcommand gating"
```

---

### Task 2: Context-Aware Git Handler

**Files:**
- Create: `src/lib/commands/handlers/git.ts`
- Modify: `src/lib/commands/handlers/level8.ts` (remove git export)
- Modify: `src/lib/commands/executor.ts` (update import)

- [ ] **Step 1: Create the git handler**

Create `src/lib/commands/handlers/git.ts`:

```typescript
import { CommandHandler } from "../types";

// Helpers for generating fake commit hashes
function fakeHash(): string {
  return Math.random().toString(16).slice(2, 9);
}

function getCurrentBranch(fs: Parameters<CommandHandler>[0]["fs"]): string {
  const headPath = fs.resolvePath(".git/HEAD");
  if (!fs.exists(headPath)) return "main";
  const content = fs.readFile(headPath).trim();
  const match = content.match(/^ref: refs\/heads\/(.+)$/);
  return match ? match[1] : "main";
}

function getGitDir(fs: Parameters<CommandHandler>[0]["fs"]): string {
  return fs.resolvePath(".git");
}

function isRepo(fs: Parameters<CommandHandler>[0]["fs"]): boolean {
  return fs.exists(getGitDir(fs));
}

function getStagedFiles(fs: Parameters<CommandHandler>[0]["fs"]): string[] {
  const indexPath = fs.resolvePath(".git/index");
  if (!fs.exists(indexPath)) return [];
  const content = fs.readFile(indexPath).trim();
  return content ? content.split("\n").filter(Boolean) : [];
}

function getUntrackedFiles(fs: Parameters<CommandHandler>[0]["fs"]): string[] {
  const cwd = fs.cwd;
  const prefix = cwd + "/";
  const staged = new Set(getStagedFiles(fs));

  // Get committed files from logs
  const committed = new Set<string>();
  const logsPath = fs.resolvePath(".git/logs");
  if (fs.exists(logsPath)) {
    try {
      const logs = JSON.parse(fs.readFile(logsPath));
      for (const commit of logs) {
        if (commit.files) {
          for (const f of commit.files) committed.add(f);
        }
      }
    } catch { /* empty */ }
  }

  const allPaths = fs.getAllPaths();
  const files: string[] = [];
  const gitDir = getGitDir(fs);

  for (const p of allPaths) {
    if (!p.startsWith(prefix)) continue;
    if (p.startsWith(gitDir)) continue;
    const node = fs.getNode(p);
    if (!node || node.type !== "file") continue;
    const relative = p.slice(prefix.length);
    if (!staged.has(relative) && !committed.has(relative)) {
      files.push(relative);
    }
  }
  return files.sort();
}

function getLockedMessage(subcommand: string): string {
  const levelHints: Record<string, string> = {
    add: "Tracking Changes",
    diff: "Tracking Changes",
    commit: "Making History",
    log: "Making History",
    branch: "Branching Out",
    checkout: "Branching Out",
    merge: "Branching Out",
    worktree: "Parallel Worlds",
  };
  const hint = levelHints[subcommand];
  if (hint) {
    return `You'll learn \`git ${subcommand}\` in the "${hint}" level. Keep going!`;
  }
  return `\`git ${subcommand}\` isn't available in this level yet.`;
}

export const git: CommandHandler = ({ fs, args, flags, availableCommands }) => {
  if (args.length === 0) {
    return {
      output: [
        "git - version control",
        "",
        "Common commands:",
        "  git init       Initialize a new repository",
        "  git status     Show working tree status",
        "  git add        Stage changes for commit",
        "  git commit     Record changes to the repository",
        "  git log        Show commit history",
        "  git branch     List or create branches",
        "  git checkout   Switch branches",
        "  git merge      Merge branches together",
        "  git worktree   Manage multiple working trees",
      ].join("\n"),
      outputType: "stdout",
    };
  }

  const subcommand = args[0];

  // Subcommand gating
  if (!availableCommands.includes(`git ${subcommand}`)) {
    return { output: getLockedMessage(subcommand), outputType: "info" };
  }

  // ── git init ──
  if (subcommand === "init") {
    const gitDir = getGitDir(fs);
    if (isRepo(fs)) {
      return {
        output: `Reinitialized existing Git repository in ${fs.cwd}/.git/`,
        outputType: "stdout",
      };
    }
    fs.createDirectory(gitDir);
    fs.createDirectory(gitDir + "/refs");
    fs.createDirectory(gitDir + "/refs/heads");
    fs.createFile(gitDir + "/HEAD", "ref: refs/heads/main\n");
    fs.createFile(gitDir + "/index", "");
    fs.createFile(gitDir + "/logs", "[]");
    fs.createFile(gitDir + "/config", "[core]\n  repositoryformatversion = 0\n");
    fs.createFile(gitDir + "/refs/heads/main", "");
    return {
      output: `Initialized empty Git repository in ${fs.cwd}/.git/`,
      outputType: "success",
    };
  }

  // Everything below requires an initialized repo
  if (!isRepo(fs)) {
    return {
      output: "fatal: not a git repository (or any of the parent directories): .git",
      outputType: "stderr",
    };
  }

  // ── git status ──
  if (subcommand === "status") {
    const branch = getCurrentBranch(fs);
    const staged = getStagedFiles(fs);
    const untracked = getUntrackedFiles(fs);
    const lines: string[] = [`On branch ${branch}`];

    // Check if there are any commits
    const logsPath = fs.resolvePath(".git/logs");
    let hasCommits = false;
    if (fs.exists(logsPath)) {
      try {
        const logs = JSON.parse(fs.readFile(logsPath));
        hasCommits = logs.length > 0;
      } catch { /* empty */ }
    }
    if (!hasCommits) {
      lines.push("", "No commits yet");
    }

    if (staged.length > 0) {
      lines.push("", "Changes to be committed:");
      lines.push('  (use "git restore --staged <file>..." to unstage)');
      for (const f of staged) {
        lines.push(`\tnew file:   ${f}`);
      }
    }

    if (untracked.length > 0) {
      lines.push("", "Untracked files:");
      lines.push('  (use "git add <file>..." to include in what will be committed)');
      for (const f of untracked) {
        lines.push(`\t${f}`);
      }
    }

    if (staged.length === 0 && untracked.length === 0) {
      lines.push("nothing to commit, working tree clean");
    }

    return { output: lines.join("\n"), outputType: "stdout" };
  }

  // ── git add ──
  if (subcommand === "add") {
    const target = args[1];
    if (!target) {
      return { output: "Nothing specified, nothing added.", outputType: "stderr" };
    }

    const indexPath = fs.resolvePath(".git/index");
    const currentStaged = getStagedFiles(fs);
    const stagedSet = new Set(currentStaged);

    if (target === ".") {
      // Stage all untracked files
      const untracked = getUntrackedFiles(fs);
      for (const f of untracked) {
        stagedSet.add(f);
      }
    } else {
      // Stage a specific file
      const resolved = fs.resolvePath(target);
      if (!fs.exists(resolved)) {
        return { output: `fatal: pathspec '${target}' did not match any files`, outputType: "stderr" };
      }
      const cwd = fs.cwd;
      const relative = resolved.startsWith(cwd + "/") ? resolved.slice(cwd.length + 1) : target;
      stagedSet.add(relative);
    }

    fs.writeFile(indexPath, Array.from(stagedSet).join("\n"));
    return { output: "", outputType: "stdout" };
  }

  // ── git diff ──
  if (subcommand === "diff") {
    const untracked = getUntrackedFiles(fs);
    if (untracked.length === 0) {
      return { output: "", outputType: "stdout" };
    }
    const lines: string[] = [];
    for (const f of untracked.slice(0, 3)) {
      lines.push(`diff --git a/${f} b/${f}`);
      lines.push("new file mode 100644");
      lines.push(`--- /dev/null`);
      lines.push(`+++ b/${f}`);
      lines.push("@@ -0,0 +1 @@");
      lines.push(`+[new file content]`);
      lines.push("");
    }
    return { output: lines.join("\n"), outputType: "stdout" };
  }

  // ── git commit ──
  if (subcommand === "commit") {
    const staged = getStagedFiles(fs);
    if (staged.length === 0) {
      return {
        output: "nothing to commit (use \"git add\" to stage changes)",
        outputType: "stderr",
      };
    }

    // Extract message: parser puts -m in flags and the message in args
    let message = "Initial commit";
    if (flags.m && args[1]) {
      message = args.slice(1).join(" ");
    }

    const hash = fakeHash();
    const branch = getCurrentBranch(fs);

    // Append commit to logs
    const logsPath = fs.resolvePath(".git/logs");
    let logs: Array<{ hash: string; message: string; author: string; date: string; files: string[] }> = [];
    if (fs.exists(logsPath)) {
      try { logs = JSON.parse(fs.readFile(logsPath)); } catch { /* empty */ }
    }
    const isFirst = logs.length === 0;
    logs.push({
      hash,
      message,
      author: "learner <learner@example.com>",
      date: new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
      files: [...staged],
    });
    fs.writeFile(logsPath, JSON.stringify(logs));

    // Update branch ref
    const refPath = fs.resolvePath(`.git/refs/heads/${branch}`);
    fs.writeFile(refPath, hash);

    // Clear index
    fs.writeFile(fs.resolvePath(".git/index"), "");

    const label = isFirst ? `[${branch} (root-commit) ${hash}]` : `[${branch} ${hash}]`;
    return {
      output: `${label} ${message}\n ${staged.length} file${staged.length !== 1 ? "s" : ""} changed`,
      outputType: "stdout",
    };
  }

  // ── git log ──
  if (subcommand === "log") {
    const logsPath = fs.resolvePath(".git/logs");
    if (!fs.exists(logsPath)) {
      return { output: "fatal: your current branch does not have any commits yet", outputType: "stderr" };
    }
    let logs: Array<{ hash: string; message: string; author: string; date: string }> = [];
    try { logs = JSON.parse(fs.readFile(logsPath)); } catch { /* empty */ }
    if (logs.length === 0) {
      return { output: "fatal: your current branch does not have any commits yet", outputType: "stderr" };
    }

    const branch = getCurrentBranch(fs);
    const lines: string[] = [];
    for (let i = logs.length - 1; i >= 0; i--) {
      const c = logs[i];
      const isHead = i === logs.length - 1;
      lines.push(`commit ${c.hash}${isHead ? ` (HEAD -> ${branch})` : ""}`);
      lines.push(`Author: ${c.author}`);
      lines.push(`Date:   ${c.date}`);
      lines.push("");
      lines.push(`    ${c.message}`);
      if (i > 0) lines.push("");
    }
    return { output: lines.join("\n"), outputType: "stdout" };
  }

  // ── git branch ──
  if (subcommand === "branch") {
    const branchName = args[1];

    if (branchName) {
      // Create a new branch
      const refPath = fs.resolvePath(`.git/refs/heads/${branchName}`);
      if (fs.exists(refPath)) {
        return { output: `fatal: a branch named '${branchName}' already exists`, outputType: "stderr" };
      }
      // Copy current branch's ref
      const currentBranch = getCurrentBranch(fs);
      const currentRefPath = fs.resolvePath(`.git/refs/heads/${currentBranch}`);
      const currentHash = fs.exists(currentRefPath) ? fs.readFile(currentRefPath).trim() : "";
      fs.createFile(refPath, currentHash);
      return { output: "", outputType: "stdout" };
    }

    // List branches
    const currentBranch = getCurrentBranch(fs);
    const refsDir = fs.resolvePath(".git/refs/heads");
    const branches = fs.getChildNames(refsDir).sort();
    const lines = branches.map((b) => (b === currentBranch ? `* ${b}` : `  ${b}`));
    return { output: lines.join("\n"), outputType: "stdout" };
  }

  // ── git checkout ──
  if (subcommand === "checkout") {
    const headPath = fs.resolvePath(".git/HEAD");

    if (flags.b) {
      // git checkout -b <name> — create and switch
      const newBranch = args[1];
      if (!newBranch) {
        return { output: "fatal: branch name required", outputType: "stderr" };
      }
      const refPath = fs.resolvePath(`.git/refs/heads/${newBranch}`);
      if (fs.exists(refPath)) {
        return { output: `fatal: a branch named '${newBranch}' already exists`, outputType: "stderr" };
      }
      // Copy current ref
      const currentBranch = getCurrentBranch(fs);
      const currentRefPath = fs.resolvePath(`.git/refs/heads/${currentBranch}`);
      const currentHash = fs.exists(currentRefPath) ? fs.readFile(currentRefPath).trim() : "";
      fs.createFile(refPath, currentHash);
      fs.writeFile(headPath, `ref: refs/heads/${newBranch}\n`);
      return {
        output: `Switched to a new branch '${newBranch}'`,
        outputType: "success",
      };
    }

    // git checkout <branch>
    const targetBranch = args[1];
    if (!targetBranch) {
      return { output: "error: you must specify a branch", outputType: "stderr" };
    }
    const refPath = fs.resolvePath(`.git/refs/heads/${targetBranch}`);
    if (!fs.exists(refPath)) {
      return { output: `error: pathspec '${targetBranch}' did not match any branch`, outputType: "stderr" };
    }
    fs.writeFile(headPath, `ref: refs/heads/${targetBranch}\n`);
    return {
      output: `Switched to branch '${targetBranch}'`,
      outputType: "success",
    };
  }

  // ── git merge ──
  if (subcommand === "merge") {
    const sourceBranch = args[1];
    if (!sourceBranch) {
      return { output: "error: you must specify a branch to merge", outputType: "stderr" };
    }
    const refPath = fs.resolvePath(`.git/refs/heads/${sourceBranch}`);
    if (!fs.exists(refPath)) {
      return { output: `merge: ${sourceBranch} - not something we can merge`, outputType: "stderr" };
    }
    const currentBranch = getCurrentBranch(fs);
    return {
      output: `Merge made by the 'ort' strategy.\nSuccessfully merged '${sourceBranch}' into '${currentBranch}'.`,
      outputType: "success",
    };
  }

  // ── git worktree ──
  if (subcommand === "worktree") {
    const action = args[1];

    if (action === "list" || !action) {
      const worktreesDir = fs.resolvePath(".git/worktrees");
      const lines: string[] = [];
      const branch = getCurrentBranch(fs);
      lines.push(`${fs.cwd}  ${fakeHash()} [${branch}]`);

      if (fs.exists(worktreesDir)) {
        const entries = fs.getChildNames(worktreesDir);
        for (const entry of entries) {
          const infoPath = `${worktreesDir}/${entry}`;
          if (fs.isFile(infoPath)) {
            try {
              const info = JSON.parse(fs.readFile(infoPath));
              lines.push(`${info.path}  ${fakeHash()} [${info.branch}]`);
            } catch { /* empty */ }
          }
        }
      }
      return { output: lines.join("\n"), outputType: "stdout" };
    }

    if (action === "add") {
      const worktreePath = args[2];
      if (!worktreePath) {
        return { output: "usage: git worktree add <path> [-b <branch>]", outputType: "stderr" };
      }

      // Branch name: from -b flag (parser puts it in args after flag stripping)
      let branchName: string;
      if (flags.b && args[3]) {
        branchName = args[3];
      } else {
        // Derive branch from path
        branchName = worktreePath.split("/").pop() || worktreePath;
      }

      const resolvedPath = fs.resolvePath(worktreePath);

      // Create the worktree directory with project files
      fs.createDirectory(resolvedPath, true);

      // Copy project files (non-.git) from cwd to worktree
      const cwd = fs.cwd;
      const cwdPrefix = cwd + "/";
      const gitDir = getGitDir(fs);
      for (const p of fs.getAllPaths()) {
        if (!p.startsWith(cwdPrefix)) continue;
        if (p.startsWith(gitDir)) continue;
        const relative = p.slice(cwdPrefix.length);
        const node = fs.getNode(p);
        if (!node) continue;
        const destPath = resolvedPath + "/" + relative;
        if (node.type === "directory") {
          fs.createDirectory(destPath, true);
        } else {
          // Ensure parent exists
          const parentParts = destPath.split("/");
          parentParts.pop();
          const parentPath = parentParts.join("/");
          if (!fs.exists(parentPath)) {
            fs.createDirectory(parentPath, true);
          }
          fs.createFile(destPath, node.type === "file" ? node.content : "");
        }
      }

      // Create branch ref
      const currentBranch = getCurrentBranch(fs);
      const currentRefPath = fs.resolvePath(`.git/refs/heads/${currentBranch}`);
      const currentHash = fs.exists(currentRefPath) ? fs.readFile(currentRefPath).trim() : fakeHash();
      const branchRefPath = fs.resolvePath(`.git/refs/heads/${branchName}`);
      if (!fs.exists(branchRefPath)) {
        fs.createFile(branchRefPath, currentHash);
      }

      // Record worktree entry
      const worktreesDir = fs.resolvePath(".git/worktrees");
      if (!fs.exists(worktreesDir)) {
        fs.createDirectory(worktreesDir);
      }
      const entryName = branchName.replace(/[^a-zA-Z0-9-]/g, "-");
      fs.createFile(
        `${worktreesDir}/${entryName}`,
        JSON.stringify({ path: resolvedPath, branch: branchName })
      );

      return {
        output: `Preparing worktree (new branch '${branchName}')\nHEAD is now at ${currentHash.slice(0, 7) || "0000000"}`,
        outputType: "success",
      };
    }

    if (action === "remove") {
      const worktreePath = args[2];
      if (!worktreePath) {
        return { output: "usage: git worktree remove <path>", outputType: "stderr" };
      }
      const resolvedPath = fs.resolvePath(worktreePath);
      if (fs.exists(resolvedPath)) {
        fs.removeNode(resolvedPath, true);
      }

      // Remove worktree entry
      const worktreesDir = fs.resolvePath(".git/worktrees");
      if (fs.exists(worktreesDir)) {
        const entries = fs.getChildNames(worktreesDir);
        for (const entry of entries) {
          const infoPath = `${worktreesDir}/${entry}`;
          if (fs.isFile(infoPath)) {
            try {
              const info = JSON.parse(fs.readFile(infoPath));
              if (info.path === resolvedPath) {
                fs.removeNode(infoPath);
                break;
              }
            } catch { /* empty */ }
          }
        }
      }

      return { output: "", outputType: "stdout" };
    }

    return { output: `git worktree ${action || ""} - unknown command`, outputType: "stderr" };
  }

  return {
    output: `git: '${subcommand}' is not a git command. See 'git --help'.`,
    outputType: "stderr",
  };
};
```

- [ ] **Step 2: Remove git export from level8.ts**

In `src/lib/commands/handlers/level8.ts`, remove the `git` export (lines 113-174). Keep `npm`, `npx`, and `claudeCode` exports.

Remove this entire block:
```typescript
export const git: CommandHandler = ({ fs, args }) => {
  // ... entire function
};
```

- [ ] **Step 3: Update executor.ts import**

In `src/lib/commands/executor.ts`, change:

```typescript
import { npm, npx, git, claudeCode } from "./handlers/level8";
```

to:

```typescript
import { npm, npx, claudeCode } from "./handlers/level8";
import { git } from "./handlers/git";
```

- [ ] **Step 4: Build verification**

Run: `bunx tsc --noEmit | tail -3`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/lib/commands/handlers/git.ts src/lib/commands/handlers/level8.ts src/lib/commands/executor.ts
git commit -m "feat: context-aware git handler with subcommand gating"
```

---

### Task 3: Git Track Filesystem Initial States

**Files:**
- Modify: `src/lib/filesystem/initial-states.ts`

- [ ] **Step 1: Add 5 git-level filesystem factories**

Add these functions at the end of `src/lib/filesystem/initial-states.ts` (after `createLevel8FS`):

```typescript
// ── Git Level 1: First Repository (no .git/) ──
export function createGitLevel1FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/portfolio`]: dir("portfolio"),
    [`${HOME}/projects/portfolio/index.html`]: file(
      "index.html",
      '<!DOCTYPE html>\n<html>\n<head><title>My Portfolio</title>\n<link rel="stylesheet" href="style.css">\n</head>\n<body>\n<h1>Welcome to my portfolio</h1>\n<p>Projects coming soon!</p>\n<script src="app.js"></script>\n</body>\n</html>\n'
    ),
    [`${HOME}/projects/portfolio/style.css`]: file(
      "style.css",
      "body {\n  font-family: sans-serif;\n  margin: 2rem;\n  background: #fafafa;\n}\n\nh1 {\n  color: #333;\n}\n"
    ),
    [`${HOME}/projects/portfolio/app.js`]: file(
      "app.js",
      "document.addEventListener('DOMContentLoaded', () => {\n  console.log('Portfolio loaded');\n});\n"
    ),
  });
}

// ── Git Level 2: Tracking Changes (.git/ initialized, files untracked) ──
export function createGitLevel2FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/portfolio`]: dir("portfolio"),
    [`${HOME}/projects/portfolio/.git`]: dir(".git"),
    [`${HOME}/projects/portfolio/.git/refs`]: dir("refs"),
    [`${HOME}/projects/portfolio/.git/refs/heads`]: dir("heads"),
    [`${HOME}/projects/portfolio/.git/HEAD`]: file("HEAD", "ref: refs/heads/main\n"),
    [`${HOME}/projects/portfolio/.git/index`]: file("index", ""),
    [`${HOME}/projects/portfolio/.git/logs`]: file("logs", "[]"),
    [`${HOME}/projects/portfolio/.git/config`]: file("config", "[core]\n  repositoryformatversion = 0\n"),
    [`${HOME}/projects/portfolio/.git/refs/heads/main`]: file("main", ""),
    [`${HOME}/projects/portfolio/index.html`]: file(
      "index.html",
      '<!DOCTYPE html>\n<html>\n<head><title>My Portfolio</title>\n<link rel="stylesheet" href="style.css">\n</head>\n<body>\n<h1>Welcome to my portfolio</h1>\n<p>Projects coming soon!</p>\n<script src="app.js"></script>\n</body>\n</html>\n'
    ),
    [`${HOME}/projects/portfolio/style.css`]: file(
      "style.css",
      "body {\n  font-family: sans-serif;\n  margin: 2rem;\n  background: #fafafa;\n}\n\nh1 {\n  color: #333;\n}\n"
    ),
    [`${HOME}/projects/portfolio/app.js`]: file(
      "app.js",
      "document.addEventListener('DOMContentLoaded', () => {\n  console.log('Portfolio loaded');\n});\n"
    ),
  });
}

// ── Git Level 3: Making History (files already staged) ──
export function createGitLevel3FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/portfolio`]: dir("portfolio"),
    [`${HOME}/projects/portfolio/.git`]: dir(".git"),
    [`${HOME}/projects/portfolio/.git/refs`]: dir("refs"),
    [`${HOME}/projects/portfolio/.git/refs/heads`]: dir("heads"),
    [`${HOME}/projects/portfolio/.git/HEAD`]: file("HEAD", "ref: refs/heads/main\n"),
    [`${HOME}/projects/portfolio/.git/index`]: file("index", "index.html\nstyle.css\napp.js"),
    [`${HOME}/projects/portfolio/.git/logs`]: file("logs", "[]"),
    [`${HOME}/projects/portfolio/.git/config`]: file("config", "[core]\n  repositoryformatversion = 0\n"),
    [`${HOME}/projects/portfolio/.git/refs/heads/main`]: file("main", ""),
    [`${HOME}/projects/portfolio/index.html`]: file(
      "index.html",
      '<!DOCTYPE html>\n<html>\n<head><title>My Portfolio</title>\n<link rel="stylesheet" href="style.css">\n</head>\n<body>\n<h1>Welcome to my portfolio</h1>\n<p>Projects coming soon!</p>\n<script src="app.js"></script>\n</body>\n</html>\n'
    ),
    [`${HOME}/projects/portfolio/style.css`]: file(
      "style.css",
      "body {\n  font-family: sans-serif;\n  margin: 2rem;\n  background: #fafafa;\n}\n\nh1 {\n  color: #333;\n}\n"
    ),
    [`${HOME}/projects/portfolio/app.js`]: file(
      "app.js",
      "document.addEventListener('DOMContentLoaded', () => {\n  console.log('Portfolio loaded');\n});\n"
    ),
  });
}

// ── Git Level 4: Branching Out (has commit history) ──
export function createGitLevel4FS(): Map<string, FSNode> {
  const commitHash = "a3f7b21";
  return buildFS({
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/portfolio`]: dir("portfolio"),
    [`${HOME}/projects/portfolio/.git`]: dir(".git"),
    [`${HOME}/projects/portfolio/.git/refs`]: dir("refs"),
    [`${HOME}/projects/portfolio/.git/refs/heads`]: dir("heads"),
    [`${HOME}/projects/portfolio/.git/HEAD`]: file("HEAD", "ref: refs/heads/main\n"),
    [`${HOME}/projects/portfolio/.git/index`]: file("index", ""),
    [`${HOME}/projects/portfolio/.git/logs`]: file("logs", JSON.stringify([
      { hash: commitHash, message: "Add portfolio homepage", author: "learner <learner@example.com>", date: "Sat Apr 5 2026", files: ["index.html", "style.css", "app.js"] },
    ])),
    [`${HOME}/projects/portfolio/.git/config`]: file("config", "[core]\n  repositoryformatversion = 0\n"),
    [`${HOME}/projects/portfolio/.git/refs/heads/main`]: file("main", commitHash),
    [`${HOME}/projects/portfolio/index.html`]: file(
      "index.html",
      '<!DOCTYPE html>\n<html>\n<head><title>My Portfolio</title>\n<link rel="stylesheet" href="style.css">\n</head>\n<body>\n<h1>Welcome to my portfolio</h1>\n<p>Projects coming soon!</p>\n<script src="app.js"></script>\n</body>\n</html>\n'
    ),
    [`${HOME}/projects/portfolio/style.css`]: file(
      "style.css",
      "body {\n  font-family: sans-serif;\n  margin: 2rem;\n  background: #fafafa;\n}\n\nh1 {\n  color: #333;\n}\n"
    ),
    [`${HOME}/projects/portfolio/app.js`]: file(
      "app.js",
      "document.addEventListener('DOMContentLoaded', () => {\n  console.log('Portfolio loaded');\n});\n"
    ),
  });
}

// ── Git Level 5: Worktrees (has commit history, main branch) ──
export function createGitLevel5FS(): Map<string, FSNode> {
  const commitHash1 = "a3f7b21";
  const commitHash2 = "e9d4c88";
  return buildFS({
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/portfolio`]: dir("portfolio"),
    [`${HOME}/projects/portfolio/.git`]: dir(".git"),
    [`${HOME}/projects/portfolio/.git/refs`]: dir("refs"),
    [`${HOME}/projects/portfolio/.git/refs/heads`]: dir("heads"),
    [`${HOME}/projects/portfolio/.git/HEAD`]: file("HEAD", "ref: refs/heads/main\n"),
    [`${HOME}/projects/portfolio/.git/index`]: file("index", ""),
    [`${HOME}/projects/portfolio/.git/logs`]: file("logs", JSON.stringify([
      { hash: commitHash1, message: "Add portfolio homepage", author: "learner <learner@example.com>", date: "Sat Apr 5 2026", files: ["index.html", "style.css", "app.js"] },
      { hash: commitHash2, message: "Add contact page", author: "learner <learner@example.com>", date: "Sat Apr 5 2026", files: ["contact.html"] },
    ])),
    [`${HOME}/projects/portfolio/.git/config`]: file("config", "[core]\n  repositoryformatversion = 0\n"),
    [`${HOME}/projects/portfolio/.git/refs/heads/main`]: file("main", commitHash2),
    [`${HOME}/projects/portfolio/index.html`]: file(
      "index.html",
      '<!DOCTYPE html>\n<html>\n<head><title>My Portfolio</title>\n<link rel="stylesheet" href="style.css">\n</head>\n<body>\n<h1>Welcome to my portfolio</h1>\n<p>Check out my projects below.</p>\n<script src="app.js"></script>\n</body>\n</html>\n'
    ),
    [`${HOME}/projects/portfolio/style.css`]: file(
      "style.css",
      "body {\n  font-family: sans-serif;\n  margin: 2rem;\n  background: #fafafa;\n}\n\nh1 {\n  color: #333;\n}\n"
    ),
    [`${HOME}/projects/portfolio/app.js`]: file(
      "app.js",
      "document.addEventListener('DOMContentLoaded', () => {\n  console.log('Portfolio loaded');\n});\n"
    ),
    [`${HOME}/projects/portfolio/contact.html`]: file(
      "contact.html",
      '<!DOCTYPE html>\n<html>\n<body>\n<h1>Contact</h1>\n<form>\n<label>Email:</label>\n<input type="email">\n<button>Send</button>\n</form>\n</body>\n</html>\n'
    ),
  });
}
```

- [ ] **Step 2: Build verification**

Run: `bunx tsc --noEmit | tail -3`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/filesystem/initial-states.ts
git commit -m "feat: add filesystem initial states for git track levels 1-5"
```

---

### Task 4: Git Level Definitions

**Files:**
- Create: `src/lib/lessons/levels/level-git-1.ts`
- Create: `src/lib/lessons/levels/level-git-2.ts`
- Create: `src/lib/lessons/levels/level-git-3.ts`
- Create: `src/lib/lessons/levels/level-git-4.ts`
- Create: `src/lib/lessons/levels/level-git-5.ts`

- [ ] **Step 1: Create level-git-1.ts (First Repository)**

Create `src/lib/lessons/levels/level-git-1.ts`:

```typescript
import { Level } from "@/lib/tracks/types";
import { createGitLevel1FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const gitLevel1: Level = {
  slug: "first-repository",
  title: "First Repository",
  subtitle: "git init, git status",
  description: "Initialize your first Git repo and see how Git tracks your project files.",
  icon: "git-branch",
  initialFS: createGitLevel1FS,
  initialCwd: HOME,
  availableCommands: [
    "pwd", "ls", "cd", "clear", "help", "cat",
    "git", "git init", "git status",
  ],
  tasks: [
    {
      id: "g1-1",
      instruction:
        'You have a portfolio project that needs version control. First, navigate to it. Type **`cd projects/portfolio`** to go into the project folder.',
      hint: "Type cd projects/portfolio and press Enter",
      validation: { type: "cwd_equals", path: `${HOME}/projects/portfolio` },
    },
    {
      id: "g1-2",
      instruction:
        "Let's see what files are in this project. Type **`ls`** to list them.",
      validation: { type: "command", command: "ls" },
    },
    {
      id: "g1-3",
      instruction:
        'Three files — a website! Right now, there\'s no version control. If you mess something up, there\'s no way to go back. Let\'s fix that. Type **`git init`** to initialize a Git repository. This creates a hidden `.git` folder that tracks every change you make.',
      hint: "Type git init and press Enter — this turns your folder into a Git repository",
      validation: { type: "fs_exists", path: `${HOME}/projects/portfolio/.git` },
    },
    {
      id: "g1-4",
      instruction:
        'Git created a hidden `.git` folder — that\'s where it stores all its tracking data. Type **`ls -la`** to see it. The `-a` flag shows hidden files (ones starting with a dot).',
      hint: "Type ls -la to see all files including hidden ones",
      validation: { type: "command", command: "ls", argsContain: ["-a"] },
    },
    {
      id: "g1-5",
      instruction:
        'See the `.git` folder? That\'s the brain of your repository. Now type **`git status`** to see what Git thinks about your files. Since we just initialized, it should show all files as "untracked" — Git sees them but isn\'t tracking changes to them yet.',
      hint: "Type git status to see which files Git is tracking",
      validation: { type: "command", command: "git", argsContain: ["status"] },
    },
  ],
};
```

- [ ] **Step 2: Create level-git-2.ts (Tracking Changes)**

Create `src/lib/lessons/levels/level-git-2.ts`:

```typescript
import { Level } from "@/lib/tracks/types";
import { createGitLevel2FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const gitLevel2: Level = {
  slug: "tracking-changes",
  title: "Tracking Changes",
  subtitle: "git add, git diff",
  description: "Learn the staging area — the prep zone between editing files and saving them to history.",
  icon: "git-branch",
  initialFS: createGitLevel2FS,
  initialCwd: `${HOME}/projects/portfolio`,
  availableCommands: [
    "pwd", "ls", "cd", "clear", "help", "cat",
    "git", "git init", "git status", "git add", "git diff",
  ],
  tasks: [
    {
      id: "g2-1",
      instruction:
        'Your repo is initialized but Git isn\'t tracking any files yet. Type **`git status`** to see the current state.',
      validation: { type: "command", command: "git", argsContain: ["status"] },
    },
    {
      id: "g2-2",
      instruction:
        'All three files are "untracked". To tell Git to start tracking a file, you **stage** it with `git add`. Think of it like putting items in a shopping cart before checkout. Type **`git add index.html`** to stage just that one file.',
      hint: "Type git add index.html — this moves the file to the staging area",
      validation: {
        type: "custom",
        check: (fs) => {
          try {
            const index = fs.readFile(fs.resolvePath(".git/index"));
            return index.includes("index.html");
          } catch { return false; }
        },
      },
    },
    {
      id: "g2-3",
      instruction:
        'Now type **`git status`** again. Notice the difference — `index.html` is now under "Changes to be committed" (staged), while the other files are still untracked.',
      validation: { type: "command", command: "git", argsContain: ["status"] },
    },
    {
      id: "g2-4",
      instruction:
        'You can stage all remaining files at once. Type **`git add .`** — the dot means "everything in this folder".',
      hint: "Type git add . (with a space before the dot)",
      validation: {
        type: "custom",
        check: (fs) => {
          try {
            const index = fs.readFile(fs.resolvePath(".git/index"));
            return index.includes("index.html") && index.includes("style.css") && index.includes("app.js");
          } catch { return false; }
        },
      },
    },
    {
      id: "g2-5",
      instruction:
        'Check **`git status`** one more time. All files should now be staged and ready to commit — your "shopping cart" is full!',
      validation: { type: "command", command: "git", argsContain: ["status"] },
    },
  ],
};
```

- [ ] **Step 3: Create level-git-3.ts (Making History)**

Create `src/lib/lessons/levels/level-git-3.ts`:

```typescript
import { Level } from "@/lib/tracks/types";
import { createGitLevel3FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const gitLevel3: Level = {
  slug: "making-history",
  title: "Making History",
  subtitle: "git commit, git log",
  description: "Save snapshots of your project with commits and browse your project's history.",
  icon: "git-branch",
  initialFS: createGitLevel3FS,
  initialCwd: `${HOME}/projects/portfolio`,
  availableCommands: [
    "pwd", "ls", "cd", "clear", "help", "cat", "echo",
    "git", "git init", "git status", "git add", "git diff", "git commit", "git log",
  ],
  tasks: [
    {
      id: "g3-1",
      instruction:
        'Your files are already staged from the previous level. Confirm by typing **`git status`** — you should see all three files ready to commit.',
      validation: { type: "command", command: "git", argsContain: ["status"] },
    },
    {
      id: "g3-2",
      instruction:
        'Time to save a snapshot! A **commit** is like a save point in a video game — you can always come back to it. Type **`git commit -m "Add portfolio homepage"`** to create your first commit. The `-m` flag lets you write a short message describing what you did.',
      hint: 'Type: git commit -m "Add portfolio homepage" (include the quotes around the message)',
      validation: {
        type: "custom",
        check: (fs) => {
          try {
            const logs = JSON.parse(fs.readFile(fs.resolvePath(".git/logs")));
            return logs.length >= 1;
          } catch { return false; }
        },
      },
    },
    {
      id: "g3-3",
      instruction:
        'Your first commit is saved! Type **`git status`** to see the result — the working tree should be clean now, meaning all changes have been committed.',
      validation: { type: "command", command: "git", argsContain: ["status"] },
    },
    {
      id: "g3-4",
      instruction:
        'Type **`git log`** to see your commit history. You\'ll see the commit hash (a unique ID), who made the commit, when, and your message.',
      validation: { type: "command", command: "git", argsContain: ["log"] },
    },
    {
      id: "g3-5",
      instruction:
        'Let\'s practice the full cycle: edit → stage → commit. First, add a new CSS rule. Type **`echo "h1 { color: navy; }" >> style.css`** to append a line to the stylesheet.',
      hint: 'Type: echo "h1 { color: navy; }" >> style.css (the >> appends to the file)',
      validation: {
        type: "file_contains",
        path: `${HOME}/projects/portfolio/style.css`,
        content: "color: navy",
      },
    },
    {
      id: "g3-6",
      instruction:
        'Now stage the changed file. Type **`git add style.css`**.',
      validation: {
        type: "custom",
        check: (fs) => {
          try {
            const index = fs.readFile(fs.resolvePath(".git/index"));
            return index.includes("style.css");
          } catch { return false; }
        },
      },
    },
    {
      id: "g3-7",
      instruction:
        'Complete the cycle — commit your change with a descriptive message. Type **`git commit -m "Update styles"`**.',
      hint: 'Type: git commit -m "Update styles"',
      validation: {
        type: "custom",
        check: (fs) => {
          try {
            const logs = JSON.parse(fs.readFile(fs.resolvePath(".git/logs")));
            return logs.length >= 2;
          } catch { return false; }
        },
      },
    },
  ],
};
```

- [ ] **Step 4: Create level-git-4.ts (Branching Out)**

Create `src/lib/lessons/levels/level-git-4.ts`:

```typescript
import { Level } from "@/lib/tracks/types";
import { createGitLevel4FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const gitLevel4: Level = {
  slug: "branching-out",
  title: "Branching Out",
  subtitle: "git branch, git checkout, git merge",
  description: "Create parallel timelines for your code with branches, then merge them together.",
  icon: "git-branch",
  initialFS: createGitLevel4FS,
  initialCwd: `${HOME}/projects/portfolio`,
  availableCommands: [
    "pwd", "ls", "cd", "clear", "help", "cat", "echo",
    "git", "git init", "git status", "git add", "git diff",
    "git commit", "git log", "git branch", "git checkout", "git merge",
  ],
  tasks: [
    {
      id: "g4-1",
      instruction:
        'Your portfolio has one commit on the `main` branch. Type **`git branch`** to see your branches. The `*` shows which branch you\'re currently on.',
      validation: { type: "command", command: "git", argsContain: ["branch"] },
    },
    {
      id: "g4-2",
      instruction:
        'Let\'s add a contact page — but on a separate branch so we don\'t risk breaking `main`. Type **`git checkout -b add-contact`** to create a new branch AND switch to it in one step.',
      hint: "Type: git checkout -b add-contact",
      validation: {
        type: "custom",
        check: (fs) => {
          try {
            const head = fs.readFile(fs.resolvePath(".git/HEAD")).trim();
            return head === "ref: refs/heads/add-contact";
          } catch { return false; }
        },
      },
    },
    {
      id: "g4-3",
      instruction:
        'Run **`git branch`** again to confirm you\'re on the new branch. You should see `* add-contact` and `main`.',
      validation: { type: "command", command: "git", argsContain: ["branch"] },
    },
    {
      id: "g4-4",
      instruction:
        'Now create a contact page on this branch. Type **`echo "<form>Contact us</form>" > contact.html`**.',
      hint: 'Type: echo "<form>Contact us</form>" > contact.html',
      validation: {
        type: "fs_exists",
        path: `${HOME}/projects/portfolio/contact.html`,
      },
    },
    {
      id: "g4-5",
      instruction:
        'Stage the new file. Type **`git add contact.html`**.',
      validation: {
        type: "custom",
        check: (fs) => {
          try {
            const index = fs.readFile(fs.resolvePath(".git/index"));
            return index.includes("contact.html");
          } catch { return false; }
        },
      },
    },
    {
      id: "g4-6",
      instruction:
        'Commit it to the branch. Type **`git commit -m "Add contact page"`**.',
      hint: 'Type: git commit -m "Add contact page"',
      validation: {
        type: "custom",
        check: (fs) => {
          try {
            const logs = JSON.parse(fs.readFile(fs.resolvePath(".git/logs")));
            return logs.length >= 2;
          } catch { return false; }
        },
      },
    },
    {
      id: "g4-7",
      instruction:
        'Your feature is done! Switch back to `main` to merge it in. Type **`git checkout main`**.',
      validation: {
        type: "custom",
        check: (fs) => {
          try {
            const head = fs.readFile(fs.resolvePath(".git/HEAD")).trim();
            return head === "ref: refs/heads/main";
          } catch { return false; }
        },
      },
    },
    {
      id: "g4-8",
      instruction:
        'Now bring the contact page into `main` by merging. Type **`git merge add-contact`** — this pulls all the changes from your feature branch into the current branch.',
      hint: "Type: git merge add-contact",
      validation: { type: "command", command: "git", argsContain: ["merge", "add-contact"] },
    },
  ],
};
```

- [ ] **Step 5: Create level-git-5.ts (Parallel Worlds / Worktrees)**

Create `src/lib/lessons/levels/level-git-5.ts`:

```typescript
import { Level } from "@/lib/tracks/types";
import { createGitLevel5FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const gitLevel5: Level = {
  slug: "worktrees",
  title: "Parallel Worlds",
  subtitle: "git worktree",
  description: "Work on multiple branches simultaneously with worktrees — the secret weapon for parallel development.",
  icon: "git-branch",
  initialFS: createGitLevel5FS,
  initialCwd: `${HOME}/projects/portfolio`,
  availableCommands: [
    "pwd", "ls", "cd", "clear", "help", "cat", "echo",
    "git", "git init", "git status", "git add", "git diff",
    "git commit", "git log", "git branch", "git checkout", "git merge",
    "git worktree",
  ],
  tasks: [
    {
      id: "g5-1",
      instruction:
        'Branches let you work on features separately, but you have to switch back and forth. **Worktrees** solve this — they give you a separate folder for each branch, so you can work on multiple things at once. Type **`git worktree list`** to see your current worktrees.',
      validation: { type: "command", command: "git", argsContain: ["worktree", "list"] },
    },
    {
      id: "g5-2",
      instruction:
        'Just one worktree — your current folder. Let\'s create a second one for a dark-mode feature. Type **`git worktree add ../portfolio-dark-mode -b dark-mode`** — this creates a new folder next to your project with its own branch.',
      hint: "Type: git worktree add ../portfolio-dark-mode -b dark-mode",
      validation: {
        type: "fs_exists",
        path: `${HOME}/projects/portfolio-dark-mode`,
      },
    },
    {
      id: "g5-3",
      instruction:
        'Run **`git worktree list`** again to see both worktrees. Each one is on a different branch — you can edit both simultaneously without any switching.',
      validation: { type: "command", command: "git", argsContain: ["worktree", "list"] },
    },
    {
      id: "g5-4",
      instruction:
        'Navigate to the new worktree. Type **`cd ../portfolio-dark-mode`**.',
      validation: { type: "cwd_equals", path: `${HOME}/projects/portfolio-dark-mode` },
    },
    {
      id: "g5-5",
      instruction:
        'Type **`ls`** to see the files. It\'s a complete copy of your project! Each worktree is independent — changes here don\'t affect your main folder.',
      validation: { type: "command", command: "ls" },
    },
    {
      id: "g5-6",
      instruction:
        'Head back to your main project folder. Type **`cd ../portfolio`**.',
      validation: { type: "cwd_equals", path: `${HOME}/projects/portfolio` },
    },
    {
      id: "g5-7",
      instruction:
        'When you\'re done with a worktree, clean it up. Type **`git worktree remove ../portfolio-dark-mode`** to delete the folder and unregister it.\n\nThis is exactly how AI agents work in parallel — each agent gets its own worktree so they can\'t step on each other\'s toes!',
      hint: "Type: git worktree remove ../portfolio-dark-mode",
      validation: {
        type: "fs_not_exists",
        path: `${HOME}/projects/portfolio-dark-mode`,
      },
    },
  ],
};
```

- [ ] **Step 6: Build verification**

Run: `bunx tsc --noEmit | tail -3`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add src/lib/lessons/levels/level-git-1.ts src/lib/lessons/levels/level-git-2.ts src/lib/lessons/levels/level-git-3.ts src/lib/lessons/levels/level-git-4.ts src/lib/lessons/levels/level-git-5.ts
git commit -m "feat: add git track level definitions (5 levels)"
```

---

### Task 5: Wire Up Git Track

**Files:**
- Modify: `src/lib/tracks/git.ts`

- [ ] **Step 1: Populate git track with levels**

Replace the contents of `src/lib/tracks/git.ts` with:

```typescript
import { Track } from "./types";
import { gitLevel1 } from "@/lib/lessons/levels/level-git-1";
import { gitLevel2 } from "@/lib/lessons/levels/level-git-2";
import { gitLevel3 } from "@/lib/lessons/levels/level-git-3";
import { gitLevel4 } from "@/lib/lessons/levels/level-git-4";
import { gitLevel5 } from "@/lib/lessons/levels/level-git-5";

export const gitTrack: Track = {
  slug: "git",
  title: "Git",
  subtitle: "Version control from first commit to worktrees",
  description:
    "Master version control with Git — from your first commit to branching strategies and worktrees.",
  icon: "git-branch",
  color: "#f97316",
  prerequisites: ["terminal-basics"],
  levels: [gitLevel1, gitLevel2, gitLevel3, gitLevel4, gitLevel5],
};
```

- [ ] **Step 2: Build and run dev server**

Run: `bunx tsc --noEmit | tail -3`
Expected: No errors

Run: `bun run build 2>&1 | tail -5`
Expected: Build succeeds, git track should now appear with 5 levels on the landing page

- [ ] **Step 3: Commit**

```bash
git add src/lib/tracks/git.ts
git commit -m "feat: wire up git track with 5 playable levels"
```

---

## Phase 2: Claude Code Track

### Task 6: Claude Code Handler

**Files:**
- Create: `src/lib/commands/handlers/claude.ts`
- Modify: `src/lib/commands/handlers/level8.ts` (remove claudeCode export)
- Modify: `src/lib/commands/executor.ts` (update import)

- [ ] **Step 1: Create the claude handler**

Create `src/lib/commands/handlers/claude.ts`:

```typescript
import { CommandHandler } from "../types";

function getLockedMessage(subcommand: string): string {
  const levelHints: Record<string, string> = {
    "/init": "Project Memory",
    "/help": "Meet Claude",
    "/skills": "Skills & Commands",
    "/find-skills": "Extend & Share",
    "/skill-creator": "Extend & Share",
    "/install-plugin": "Extend & Share",
  };
  const hint = levelHints[subcommand];
  if (hint) {
    return `You'll learn \`claude ${subcommand}\` in the "${hint}" level. Keep going!`;
  }
  return `\`claude ${subcommand}\` isn't available in this level yet.`;
}

export const claudeCode: CommandHandler = ({ fs, args, flags, availableCommands }) => {
  // claude --version
  if (flags.version) {
    if (!availableCommands.includes("claude --version")) {
      return { output: getLockedMessage("--version"), outputType: "info" };
    }
    return { output: "1.0.34 (Claude Code)", outputType: "stdout" };
  }

  // claude --help
  if (flags.help) {
    if (!availableCommands.includes("claude --help")) {
      return { output: getLockedMessage("--help"), outputType: "info" };
    }
    return {
      output: [
        "Usage: claude [options] [prompt]",
        "",
        "Options:",
        "  --version          Show version number",
        "  --help             Show this help message",
        "  --model <model>    Choose model (default: claude-sonnet-4-6)",
        "  --allowedTools     Restrict available tools",
        "  --print            Print response and exit (non-interactive)",
        "  --debug            Enable debug logging",
        "",
        "Examples:",
        '  claude                          Start interactive session',
        '  claude "explain this code"      One-shot prompt',
        '  claude --model opus             Use a specific model',
        "",
        'Run claude /help inside a session for slash commands.',
      ].join("\n"),
      outputType: "stdout",
    };
  }

  // No args — launch screen
  if (args.length === 0) {
    return {
      output: [
        "",
        "  ╭───────────────────────────────────────────────╮",
        "  │                                               │",
        "  │   Claude Code  v1.0.34                        │",
        "  │                                               │",
        "  │   Model: claude-sonnet-4-6                    │",
        "  │   Context: 200k tokens available              │",
        "  │                                               │",
        "  │   Tips:                                       │",
        "  │   • Type your request in natural language      │",
        "  │   • Use /help to see slash commands            │",
        "  │   • Use /init to set up project memory         │",
        "  │   • Press Ctrl+C to cancel                     │",
        "  │                                               │",
        "  ╰───────────────────────────────────────────────╯",
        "",
        "  > How can I help you today?",
        "",
      ].join("\n"),
      outputType: "success",
    };
  }

  const input = args.join(" ");

  // ── Slash commands ──

  // claude /help
  if (input === "/help") {
    if (!availableCommands.includes("claude /help")) {
      return { output: getLockedMessage("/help"), outputType: "info" };
    }
    return {
      output: [
        "Slash Commands:",
        "",
        "  /help           Show this help message",
        "  /init           Initialize CLAUDE.md for this project",
        "  /compact        Compress conversation context",
        "  /clear          Clear conversation history",
        "  /model          Switch the AI model",
        "  /cost           Show session cost summary",
        "  /memory         View and edit project memory",
        "  /skills         List available skills",
        "  /find-skills    Discover community plugins",
        "",
        "Custom skills appear as /<skill-name> once installed.",
      ].join("\n"),
      outputType: "stdout",
    };
  }

  // claude /init
  if (input === "/init") {
    if (!availableCommands.includes("claude /init")) {
      return { output: getLockedMessage("/init"), outputType: "info" };
    }

    // Scan project files to generate CLAUDE.md
    const cwd = fs.cwd;
    const prefix = cwd + "/";
    const files: string[] = [];
    for (const p of fs.getAllPaths()) {
      if (!p.startsWith(prefix)) continue;
      if (p.includes("/.git/") || p.includes("/node_modules/")) continue;
      const node = fs.getNode(p);
      if (node && node.type === "file") {
        files.push(p.slice(prefix.length));
      }
    }

    // Detect project type
    const hasPackageJson = files.includes("package.json");
    const hasJs = files.some((f) => f.endsWith(".js") || f.endsWith(".ts"));

    const claudeMd = [
      "# CLAUDE.md",
      "",
      "## Project",
      hasPackageJson ? "Node.js project" : "Web project",
      "",
      "## Commands",
      hasPackageJson ? "npm run dev     # Start dev server" : "",
      hasPackageJson ? "npm test        # Run tests" : "",
      "",
      "## Structure",
      ...files.slice(0, 10).map((f) => `- ${f}`),
      "",
      "## Conventions",
      hasJs ? "- Use ES modules (import/export)" : "",
      "- Write descriptive commit messages",
      "- Keep functions small and focused",
    ]
      .filter(Boolean)
      .join("\n") + "\n";

    const claudeMdPath = fs.resolvePath("CLAUDE.md");
    fs.createFile(claudeMdPath, claudeMd);

    // Create .claude/ directory structure
    const dotClaudePath = fs.resolvePath(".claude");
    if (!fs.exists(dotClaudePath)) {
      fs.createDirectory(dotClaudePath);
      fs.createDirectory(dotClaudePath + "/rules");
      fs.createFile(
        dotClaudePath + "/settings.json",
        JSON.stringify({ permissions: { allow: ["Read", "Write", "Edit"], deny: [] } }, null, 2) + "\n"
      );
    }

    return {
      output: [
        "⏺ Scanning project files...",
        `  Found ${files.length} files`,
        "",
        "⏺ Created CLAUDE.md with project configuration",
        "⏺ Created .claude/ directory with default settings",
        "",
        'Claude will now read CLAUDE.md at the start of every session.',
        'Edit it to add your project\'s conventions, commands, and architecture.',
      ].join("\n"),
      outputType: "success",
    };
  }

  // claude /skills
  if (input === "/skills") {
    if (!availableCommands.includes("claude /skills")) {
      return { output: getLockedMessage("/skills"), outputType: "info" };
    }

    // Check for installed skills
    const skillsDir = fs.resolvePath(".claude/skills");
    let skills: string[] = [];
    if (fs.exists(skillsDir)) {
      skills = fs.getChildNames(skillsDir);
    }

    if (skills.length === 0) {
      return {
        output: [
          "No custom skills installed.",
          "",
          "Create one:",
          "  mkdir -p .claude/skills/my-skill",
          "  Create a SKILL.md file inside it",
          "",
          "Or discover community skills:",
          "  claude /find-skills",
        ].join("\n"),
        outputType: "stdout",
      };
    }

    const lines = ["Installed skills:", ""];
    for (const s of skills) {
      lines.push(`  /${s}`);
    }
    return { output: lines.join("\n"), outputType: "stdout" };
  }

  // claude /find-skills
  if (input === "/find-skills") {
    if (!availableCommands.includes("claude /find-skills")) {
      return { output: getLockedMessage("/find-skills"), outputType: "info" };
    }
    return {
      output: [
        "🔍 Searching plugin registry...",
        "",
        "Popular skills:",
        "",
        "  code-review-pro     Thorough code review with security checks",
        "  deploy-helper       Guided deployment to Vercel/Netlify",
        "  test-generator      Generate test suites from source files",
        "  doc-writer          Auto-generate documentation",
        "  refactor-guide      Safe refactoring with dependency analysis",
        "",
        "Install with: claude /install-plugin <name>",
      ].join("\n"),
      outputType: "success",
    };
  }

  // claude /install-plugin <name>
  if (input.startsWith("/install-plugin")) {
    if (!availableCommands.includes("claude /install-plugin")) {
      return { output: getLockedMessage("/install-plugin"), outputType: "info" };
    }
    const pluginName = input.replace("/install-plugin", "").trim();
    if (!pluginName) {
      return { output: "Usage: claude /install-plugin <name>", outputType: "stderr" };
    }

    const skillDir = fs.resolvePath(`.claude/skills/${pluginName}`);
    fs.createDirectory(skillDir, true);
    fs.createFile(
      skillDir + "/SKILL.md",
      [
        "---",
        `name: ${pluginName}`,
        `description: ${pluginName} — installed from the plugin registry`,
        "allowed-tools: Read, Grep, Glob",
        "---",
        "",
        `# ${pluginName}`,
        "",
        "This skill was installed from the community plugin registry.",
        `Invoke with: /${pluginName}`,
      ].join("\n") + "\n"
    );

    return {
      output: [
        `📦 Installing ${pluginName}...`,
        "",
        `  ✓ Created .claude/skills/${pluginName}/SKILL.md`,
        "",
        `Skill installed! Use /${pluginName} to invoke it.`,
      ].join("\n"),
      outputType: "success",
    };
  }

  // claude /skill-creator
  if (input === "/skill-creator") {
    if (!availableCommands.includes("claude /skill-creator")) {
      return { output: getLockedMessage("/skill-creator"), outputType: "info" };
    }

    const skillDir = fs.resolvePath(".claude/skills/my-custom-skill");
    fs.createDirectory(skillDir, true);
    fs.createFile(
      skillDir + "/SKILL.md",
      [
        "---",
        "name: my-custom-skill",
        "description: A custom skill created with the skill creator",
        "allowed-tools: Read, Write, Edit, Grep, Glob",
        "---",
        "",
        "# My Custom Skill",
        "",
        "## What this skill does",
        "Describe your skill's purpose here.",
        "",
        "## Steps",
        "1. Read the relevant files",
        "2. Analyze the code",
        "3. Generate output",
        "",
        "## Usage",
        "Invoke with /my-custom-skill or let Claude detect when it's needed.",
      ].join("\n") + "\n"
    );

    return {
      output: [
        "🛠️  Skill Creator",
        "",
        "Creating a new skill template...",
        "",
        "  ✓ Created .claude/skills/my-custom-skill/SKILL.md",
        "",
        "Next steps:",
        "  1. Edit the SKILL.md to describe what your skill does",
        "  2. Add supporting files alongside it if needed",
        "  3. Test it with /my-custom-skill",
      ].join("\n"),
      outputType: "success",
    };
  }

  // claude /security-review (simulated custom skill)
  if (input === "/security-review") {
    return {
      output: [
        "⏺ Running security-review skill...",
        "",
        "  Scanning project for vulnerabilities...",
        "  ✓ No hardcoded secrets found",
        "  ✓ No SQL injection risks detected",
        "  ⚠ Consider adding input validation to form handlers",
        "",
        "Security review complete. 0 critical, 1 advisory.",
      ].join("\n"),
      outputType: "success",
    };
  }

  // ── Prompt-based commands ──

  // claude "explain <file>"
  if (input.match(/explain/i)) {
    const fileMatch = input.match(/(?:explain\s+)(\S+)/i);
    const filePath = fileMatch ? fileMatch[1] : null;

    if (filePath) {
      const resolved = fs.resolvePath(filePath);
      if (fs.exists(resolved) && fs.isFile(resolved)) {
        const content = fs.readFile(resolved);
        const ext = filePath.split(".").pop() || "";
        const langMap: Record<string, string> = { js: "JavaScript", ts: "TypeScript", html: "HTML", css: "CSS", json: "JSON" };
        const lang = langMap[ext] || ext;

        return {
          output: [
            `⏺ Analyzing ${filePath}...`,
            "",
            `This is a ${lang} file (${content.split("\n").length} lines).`,
            "",
            content.includes("function") || content.includes("=>")
              ? "It defines functions that handle the application logic."
              : content.includes("<html>") || content.includes("<div>")
              ? "It contains HTML markup that defines the page structure."
              : content.includes("{") && filePath.endsWith(".css")
              ? "It contains CSS styles that control the visual presentation."
              : "It contains project configuration and metadata.",
            "",
            "Key observations:",
            content.includes("export") ? "  • Uses ES module exports" : "",
            content.includes("import") ? "  • Imports from other modules" : "",
            content.includes("console.log") ? "  • Contains console.log statements (consider removing for production)" : "",
            content.includes("TODO") ? "  • Has TODO comments that need attention" : "",
          ]
            .filter(Boolean)
            .join("\n"),
          outputType: "success",
        };
      }
    }
    return {
      output: "I'd be happy to explain! Please specify a file path, e.g., claude \"explain src/App.js\"",
      outputType: "info",
    };
  }

  // claude "review this project" (for agents level) — must be before "find bugs" handler
  if (input.match(/review.*project|review.*code/i)) {
    return {
      output: [
        "⏺ Spawning code-reviewer agent in isolated worktree...",
        "",
        "  Agent: code-reviewer",
        "  Model: claude-sonnet-4-6",
        "  Tools: Read, Grep, Glob",
        "",
        "  ⏺ Creating worktree at ../webapp-review-abc123...",
        "  ⏺ Agent is scanning project files...",
        "  ⏺ Reviewing 4 source files...",
        "",
        "  ── Agent Report ──",
        "  ✓ Code structure looks clean",
        "  ✓ No security issues found",
        "  ⚠ Consider adding error handling to App.js",
        "  💡 utils.js could benefit from input validation",
        "",
        "  ⏺ Cleaning up worktree...",
        "  ✓ Review complete",
      ].join("\n"),
      outputType: "success",
    };
  }

  // claude "find bugs in <file>"
  if (input.match(/find\s*bugs|bug/i)) {
    const fileMatch = input.match(/(?:in\s+)(\S+)/i);
    const filePath = fileMatch ? fileMatch[1] : null;

    if (filePath) {
      const resolved = fs.resolvePath(filePath);
      if (fs.exists(resolved) && fs.isFile(resolved)) {
        const content = fs.readFile(resolved);

        // Look for common "bugs" in file content
        const issues: string[] = [];
        if (content.includes("undefined")) issues.push("  ⚠ Reference to undefined variable — this will throw a ReferenceError at runtime");
        if (content.includes("TODO")) issues.push("  ⚠ TODO comment found — incomplete implementation");
        if (content.includes("console.log")) issues.push("  💡 console.log found — remove before production");
        if (!content.includes("try") && content.includes("fetch")) issues.push("  ⚠ No error handling around fetch call");

        if (issues.length === 0) {
          issues.push("  ✓ No obvious bugs found. Code looks clean!");
        }

        return {
          output: [`⏺ Reviewing ${filePath}...`, "", ...issues].join("\n"),
          outputType: "success",
        };
      }
    }
    return {
      output: "Specify a file to review, e.g., claude \"find bugs in src/utils.js\"",
      outputType: "info",
    };
  }

  // claude "fix <description>"
  if (input.match(/fix/i)) {
    const fileMatch = input.match(/(?:in\s+)(\S+)/i);
    const filePath = fileMatch ? fileMatch[1] : null;

    if (filePath) {
      const resolved = fs.resolvePath(filePath);
      if (fs.exists(resolved) && fs.isFile(resolved)) {
        const content = fs.readFile(resolved);
        // Attempt to fix: replace "undefined" references with proper values
        const fixed = content
          .replace(/\bundefined\b/g, "null")
          .replace(/\/\/ TODO:.*\n/g, "");

        if (fixed !== content) {
          fs.writeFile(resolved, fixed);
          return {
            output: [
              `⏺ Fixing ${filePath}...`,
              "",
              "Changes made:",
              "  - Fixed undefined variable references",
              "  - Removed TODO comments with completed implementations",
              "",
              `✓ File updated. Run \`cat ${filePath}\` to verify.`,
            ].join("\n"),
            outputType: "success",
          };
        }

        return {
          output: `⏺ Analyzed ${filePath} — no issues to fix automatically.`,
          outputType: "info",
        };
      }
    }
    return {
      output: "Specify what to fix, e.g., claude \"fix the bug in src/utils.js\"",
      outputType: "info",
    };
  }

  // claude "create <description>"
  if (input.match(/create|make|generate|write/i)) {
    const testMatch = input.match(/test.*(?:for\s+)(\S+)/i);
    if (testMatch) {
      const sourceFile = testMatch[1];
      const testFileName = sourceFile.replace(/\.([^.]+)$/, ".test.$1");
      const testPath = fs.resolvePath(testFileName);

      // Determine the directory for the test file
      const parentDir = testPath.split("/").slice(0, -1).join("/");
      if (!fs.exists(parentDir)) {
        fs.createDirectory(parentDir, true);
      }

      fs.createFile(
        testPath,
        [
          `// Tests for ${sourceFile}`,
          `const { describe, it, expect } = require('jest');`,
          "",
          `describe('${sourceFile}', () => {`,
          "  it('should export required functions', () => {",
          `    const mod = require('./${sourceFile.replace(/\.[^.]+$/, "")}');`,
          "    expect(mod).toBeDefined();",
          "  });",
          "",
          "  it('should handle edge cases', () => {",
          "    // Add your test cases here",
          "    expect(true).toBe(true);",
          "  });",
          "});",
          "",
        ].join("\n")
      );

      return {
        output: [
          `⏺ Creating test file for ${sourceFile}...`,
          "",
          `  ✓ Created ${testFileName}`,
          "",
          "The test file includes:",
          "  - Module import verification",
          "  - Placeholder for edge case tests",
          "",
          `Run \`cat ${testFileName}\` to see the generated tests.`,
        ].join("\n"),
        outputType: "success",
      };
    }

    return {
      output: "I can create files for you! Try: claude \"create a test file for utils.js\"",
      outputType: "info",
    };
  }

  // Default: generic response
  return {
    output: [
      `⏺ Processing: "${input}"`,
      "",
      "I understand your request. In a real Claude Code session,",
      "I would analyze your codebase and help with this task.",
      "",
      "Try these commands:",
      '  claude "explain <file>"',
      '  claude "find bugs in <file>"',
      '  claude "fix the bug in <file>"',
      '  claude "create a test file for <file>"',
    ].join("\n"),
    outputType: "info",
  };
};
```

- [ ] **Step 2: Remove claudeCode from level8.ts**

In `src/lib/commands/handlers/level8.ts`, remove the `claudeCode` export (the entire function starting at line 176). Keep `npm` and `npx` exports only.

- [ ] **Step 3: Update executor.ts import**

In `src/lib/commands/executor.ts`, change:

```typescript
import { npm, npx, claudeCode } from "./handlers/level8";
import { git } from "./handlers/git";
```

to:

```typescript
import { npm, npx } from "./handlers/level8";
import { git } from "./handlers/git";
import { claudeCode } from "./handlers/claude";
```

- [ ] **Step 4: Build verification**

Run: `bunx tsc --noEmit | tail -3`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/lib/commands/handlers/claude.ts src/lib/commands/handlers/level8.ts src/lib/commands/executor.ts
git commit -m "feat: interactive claude code handler with simulated responses"
```

---

### Task 7: Claude Code Track Filesystem Initial States

**Files:**
- Modify: `src/lib/filesystem/initial-states.ts`

- [ ] **Step 1: Add 3 claude-level filesystem factories**

Add these functions at the end of `src/lib/filesystem/initial-states.ts`:

```typescript
// ── Claude Level 1: Meet Claude (webapp project) ──
export function createClaudeLevel1FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/webapp`]: dir("webapp"),
    [`${HOME}/projects/webapp/src`]: dir("src"),
    [`${HOME}/projects/webapp/src/index.js`]: file(
      "index.js",
      "import { App } from './App';\n\nconst root = document.getElementById('root');\nconsole.log('App starting...');\n"
    ),
    [`${HOME}/projects/webapp/src/App.js`]: file(
      "App.js",
      "export function App() {\n  return '<div><h1>My Web App</h1></div>';\n}\n"
    ),
    [`${HOME}/projects/webapp/package.json`]: file(
      "package.json",
      '{\n  "name": "webapp",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "node src/index.js",\n    "test": "jest"\n  }\n}\n'
    ),
    [`${HOME}/projects/webapp/README.md`]: file(
      "README.md",
      "# My Web App\n\nA simple web application.\n\n## Getting Started\n\nRun `npm run dev` to start.\n"
    ),
  });
}

// ── Claude Level 2: Project Memory (webapp, no CLAUDE.md yet) ──
export function createClaudeLevel2FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/webapp`]: dir("webapp"),
    [`${HOME}/projects/webapp/src`]: dir("src"),
    [`${HOME}/projects/webapp/src/index.js`]: file(
      "index.js",
      "import { App } from './App';\n\nconst root = document.getElementById('root');\nconsole.log('App starting...');\n"
    ),
    [`${HOME}/projects/webapp/src/App.js`]: file(
      "App.js",
      "export function App() {\n  return '<div><h1>My Web App</h1></div>';\n}\n"
    ),
    [`${HOME}/projects/webapp/package.json`]: file(
      "package.json",
      '{\n  "name": "webapp",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "node src/index.js",\n    "test": "jest"\n  }\n}\n'
    ),
    [`${HOME}/projects/webapp/README.md`]: file(
      "README.md",
      "# My Web App\n\nA simple web application.\n"
    ),
  });
}

// ── Claude Level 3: Working with Code (has CLAUDE.md, utils.js with a bug) ──
export function createClaudeLevel3FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/webapp`]: dir("webapp"),
    [`${HOME}/projects/webapp/src`]: dir("src"),
    [`${HOME}/projects/webapp/src/index.js`]: file(
      "index.js",
      "import { App } from './App';\n\nconst root = document.getElementById('root');\nconsole.log('App starting...');\n"
    ),
    [`${HOME}/projects/webapp/src/App.js`]: file(
      "App.js",
      "export function App() {\n  return '<div><h1>My Web App</h1></div>';\n}\n"
    ),
    [`${HOME}/projects/webapp/src/utils.js`]: file(
      "utils.js",
      "export function formatDate(date) {\n  return date.toLocaleDateString();\n}\n\nexport function capitalize(str) {\n  return undefined.toUpperCase() + str.slice(1);\n}\n\nexport function sum(a, b) {\n  return a + b;\n}\n"
    ),
    [`${HOME}/projects/webapp/package.json`]: file(
      "package.json",
      '{\n  "name": "webapp",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "node src/index.js",\n    "test": "jest"\n  }\n}\n'
    ),
    [`${HOME}/projects/webapp/CLAUDE.md`]: file(
      "CLAUDE.md",
      "# CLAUDE.md\n\n## Project\nNode.js web application\n\n## Commands\nnpm run dev     # Start dev server\nnpm test        # Run tests\n\n## Conventions\n- Use ES modules (import/export)\n- Write descriptive commit messages\n"
    ),
    [`${HOME}/projects/webapp/.claude`]: dir(".claude"),
    [`${HOME}/projects/webapp/.claude/rules`]: dir("rules"),
    [`${HOME}/projects/webapp/.claude/settings.json`]: file(
      "settings.json",
      '{\n  "permissions": {\n    "allow": ["Read", "Write", "Edit"],\n    "deny": []\n  }\n}\n'
    ),
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/filesystem/initial-states.ts
git commit -m "feat: add filesystem initial states for claude code track"
```

---

### Task 8: Claude Code Level Definitions

**Files:**
- Create: `src/lib/lessons/levels/level-claude-1.ts`
- Create: `src/lib/lessons/levels/level-claude-2.ts`
- Create: `src/lib/lessons/levels/level-claude-3.ts`

- [ ] **Step 1: Create level-claude-1.ts (Meet Claude)**

Create `src/lib/lessons/levels/level-claude-1.ts`:

```typescript
import { Level } from "@/lib/tracks/types";
import { createClaudeLevel1FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const claudeLevel1: Level = {
  slug: "meet-claude",
  title: "Meet Claude",
  subtitle: "claude, claude --help",
  description: "Launch Claude Code for the first time and explore what it can do.",
  icon: "bot",
  initialFS: createClaudeLevel1FS,
  initialCwd: HOME,
  availableCommands: [
    "pwd", "ls", "cd", "clear", "help", "cat",
    "claude", "claude --version", "claude --help", "claude /help",
  ],
  tasks: [
    {
      id: "c1-1",
      instruction:
        'You\'ve mastered the terminal and Git. Now it\'s time for the tool that ties it all together — **Claude Code**. It\'s an AI assistant that lives right in your terminal. First, navigate to your project. Type **`cd projects/webapp`**.',
      validation: { type: "cwd_equals", path: `${HOME}/projects/webapp` },
    },
    {
      id: "c1-2",
      instruction:
        'Launch Claude Code by typing **`claude`**. In real life, this starts an interactive AI session. Here, you\'ll see the welcome screen.',
      hint: "Just type claude and press Enter",
      validation: { type: "command", command: "claude" },
    },
    {
      id: "c1-3",
      instruction:
        'Check which version you\'re running. Type **`claude --version`**.',
      validation: {
        type: "custom",
        check: (_fs, command, _args) => command === "claude",
      },
    },
    {
      id: "c1-4",
      instruction:
        'See all the options Claude Code supports. Type **`claude --help`** to view flags like `--model`, `--print`, and `--allowedTools`.',
      validation: {
        type: "custom",
        check: (_fs, command, _args) => command === "claude",
      },
    },
    {
      id: "c1-5",
      instruction:
        'Inside a Claude session, you use **slash commands** for quick actions. Type **`claude /help`** to see the list — things like `/init`, `/compact`, `/model`, and `/skills`.',
      hint: "Type: claude /help",
      validation: {
        type: "custom",
        check: (_fs, command, args) => command === "claude" && args.join(" ").includes("/help"),
      },
    },
  ],
};
```

- [ ] **Step 2: Create level-claude-2.ts (Project Memory)**

Create `src/lib/lessons/levels/level-claude-2.ts`:

```typescript
import { Level } from "@/lib/tracks/types";
import { createClaudeLevel2FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const claudeLevel2: Level = {
  slug: "project-memory",
  title: "Project Memory",
  subtitle: "CLAUDE.md, /init, .claude/",
  description: "Set up CLAUDE.md so Claude remembers your project's conventions across sessions.",
  icon: "bot",
  initialFS: createClaudeLevel2FS,
  initialCwd: `${HOME}/projects/webapp`,
  availableCommands: [
    "pwd", "ls", "cd", "clear", "help", "cat", "echo", "mkdir",
    "claude", "claude --version", "claude --help", "claude /help", "claude /init",
  ],
  tasks: [
    {
      id: "c2-1",
      instruction:
        'The most powerful file in any Claude Code project is **CLAUDE.md** — it tells Claude about your project, conventions, and commands. Let\'s check if one exists. Type **`ls -la`** to see all files.',
      hint: "Type ls -la to see all files including hidden ones",
      validation: { type: "command", command: "ls", argsContain: ["-a"] },
    },
    {
      id: "c2-2",
      instruction:
        'No CLAUDE.md yet! Let Claude create one by scanning your project. Type **`claude /init`** — this analyzes your files and generates a starter CLAUDE.md.',
      hint: "Type: claude /init",
      validation: { type: "fs_exists", path: `${HOME}/projects/webapp/CLAUDE.md` },
    },
    {
      id: "c2-3",
      instruction:
        'Claude created a CLAUDE.md! Read it with **`cat CLAUDE.md`** to see what Claude figured out about your project.',
      validation: { type: "command", command: "cat", argsContain: ["CLAUDE.md"] },
    },
    {
      id: "c2-4",
      instruction:
        'Claude also created a `.claude/` folder — the control center for Claude\'s behavior. Type **`ls -la .claude/`** to see what\'s inside.',
      hint: "Type: ls -la .claude/",
      validation: { type: "command", command: "ls", argsContain: [".claude"] },
    },
    {
      id: "c2-5",
      instruction:
        'The `rules/` folder holds modular instructions that Claude follows. Each markdown file is a separate rule. Type **`ls .claude/rules/`** to see it (it\'s empty for now).',
      validation: { type: "command", command: "ls", argsContain: ["rules"] },
    },
    {
      id: "c2-6",
      instruction:
        'Let\'s add a project-specific rule. Type **`echo "Always use TypeScript strict mode" > .claude/rules/typescript.md`** — now Claude will follow this rule every session, without cluttering CLAUDE.md.',
      hint: 'Type: echo "Always use TypeScript strict mode" > .claude/rules/typescript.md',
      validation: {
        type: "file_contains",
        path: `${HOME}/projects/webapp/.claude/rules/typescript.md`,
        content: "TypeScript strict mode",
      },
    },
  ],
};
```

- [ ] **Step 3: Create level-claude-3.ts (Working with Code)**

Create `src/lib/lessons/levels/level-claude-3.ts`:

```typescript
import { Level } from "@/lib/tracks/types";
import { createClaudeLevel3FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const claudeLevel3: Level = {
  slug: "working-with-code",
  title: "Working with Code",
  subtitle: "explain, review, fix, create",
  description: "Use Claude to understand code, find bugs, fix them, and generate new files.",
  icon: "bot",
  initialFS: createClaudeLevel3FS,
  initialCwd: `${HOME}/projects/webapp`,
  availableCommands: [
    "pwd", "ls", "cd", "clear", "help", "cat", "echo", "mkdir",
    "claude", "claude --version", "claude --help", "claude /help", "claude /init",
  ],
  tasks: [
    {
      id: "c3-1",
      instruction:
        'Claude can explain any file in your project. Type **`claude "explain src/App.js"`** to get a breakdown of what the file does.',
      hint: 'Type: claude "explain src/App.js" (include the quotes)',
      validation: {
        type: "custom",
        check: (_fs, command, args) =>
          command === "claude" && args.join(" ").toLowerCase().includes("explain"),
      },
    },
    {
      id: "c3-2",
      instruction:
        'There\'s a bug hiding in `src/utils.js` — a function tries to call a method on `undefined`. Ask Claude to find it. Type **`claude "find bugs in src/utils.js"`**.',
      hint: 'Type: claude "find bugs in src/utils.js"',
      validation: {
        type: "custom",
        check: (_fs, command, args) =>
          command === "claude" && args.join(" ").toLowerCase().includes("bug"),
      },
    },
    {
      id: "c3-3",
      instruction:
        'Claude found the bug! Now ask it to fix the file. Type **`claude "fix the bug in src/utils.js"`** — Claude will update the file directly.',
      hint: 'Type: claude "fix the bug in src/utils.js"',
      validation: {
        type: "custom",
        check: (fs) => {
          try {
            const content = fs.readFile(fs.resolvePath("src/utils.js"));
            return !content.includes("undefined.toUpperCase");
          } catch { return false; }
        },
      },
    },
    {
      id: "c3-4",
      instruction:
        'Verify the fix by reading the file. Type **`cat src/utils.js`** — the `undefined` reference should be gone.',
      validation: { type: "command", command: "cat", argsContain: ["utils.js"] },
    },
    {
      id: "c3-5",
      instruction:
        'Finally, let Claude generate a test file. Type **`claude "create a test file for src/utils.js"`** — it\'ll create a test suite that you can run with your test framework.',
      hint: 'Type: claude "create a test file for src/utils.js"',
      validation: {
        type: "fs_exists",
        path: `${HOME}/projects/webapp/src/utils.test.js`,
      },
    },
  ],
};
```

- [ ] **Step 4: Build verification**

Run: `bunx tsc --noEmit | tail -3`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/lib/lessons/levels/level-claude-1.ts src/lib/lessons/levels/level-claude-2.ts src/lib/lessons/levels/level-claude-3.ts
git commit -m "feat: add claude code track level definitions (3 levels)"
```

---

### Task 9: Wire Up Claude Code Track

**Files:**
- Modify: `src/lib/tracks/claude-code.ts`

- [ ] **Step 1: Populate claude code track with levels**

Replace the contents of `src/lib/tracks/claude-code.ts` with:

```typescript
import { Track } from "./types";
import { claudeLevel1 } from "@/lib/lessons/levels/level-claude-1";
import { claudeLevel2 } from "@/lib/lessons/levels/level-claude-2";
import { claudeLevel3 } from "@/lib/lessons/levels/level-claude-3";

export const claudeCodeTrack: Track = {
  slug: "claude-code",
  title: "Claude Code",
  subtitle: "AI-powered development in your terminal",
  description:
    "Learn to use Claude Code to supercharge your development workflow directly from the terminal.",
  icon: "bot",
  color: "#d97757",
  prerequisites: ["terminal-basics", "git"],
  levels: [claudeLevel1, claudeLevel2, claudeLevel3],
};
```

- [ ] **Step 2: Build verification**

Run: `bun run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/lib/tracks/claude-code.ts
git commit -m "feat: wire up claude code track with 3 playable levels"
```

---

## Phase 3: Skills & Agents Track

### Task 10: Skills & Agents Filesystem Initial States

**Files:**
- Modify: `src/lib/filesystem/initial-states.ts`

- [ ] **Step 1: Add 4 skills-level filesystem factories**

Add these functions at the end of `src/lib/filesystem/initial-states.ts`:

```typescript
// ── Skills Level 1: Skills & Commands (webapp with .claude/) ──
export function createSkillsLevel1FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/webapp`]: dir("webapp"),
    [`${HOME}/projects/webapp/src`]: dir("src"),
    [`${HOME}/projects/webapp/src/index.js`]: file("index.js", "import { App } from './App';\nconsole.log('Starting...');\n"),
    [`${HOME}/projects/webapp/src/App.js`]: file("App.js", "export function App() {\n  return '<div>Hello</div>';\n}\n"),
    [`${HOME}/projects/webapp/package.json`]: file("package.json", '{\n  "name": "webapp",\n  "version": "1.0.0"\n}\n'),
    [`${HOME}/projects/webapp/CLAUDE.md`]: file("CLAUDE.md", "# CLAUDE.md\n\n## Project\nNode.js web application\n\n## Commands\nnpm run dev\nnpm test\n"),
    [`${HOME}/projects/webapp/.claude`]: dir(".claude"),
    [`${HOME}/projects/webapp/.claude/rules`]: dir("rules"),
    [`${HOME}/projects/webapp/.claude/settings.json`]: file("settings.json", '{\n  "permissions": {\n    "allow": ["Read", "Write", "Edit"],\n    "deny": []\n  }\n}\n'),
  });
}

// ── Skills Level 2: Agents & Worktrees (webapp with .claude/, git initialized) ──
export function createSkillsLevel2FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/webapp`]: dir("webapp"),
    [`${HOME}/projects/webapp/src`]: dir("src"),
    [`${HOME}/projects/webapp/src/index.js`]: file("index.js", "import { App } from './App';\nconsole.log('Starting...');\n"),
    [`${HOME}/projects/webapp/src/App.js`]: file("App.js", "export function App() {\n  return '<div>Hello</div>';\n}\n"),
    [`${HOME}/projects/webapp/package.json`]: file("package.json", '{\n  "name": "webapp",\n  "version": "1.0.0"\n}\n'),
    [`${HOME}/projects/webapp/CLAUDE.md`]: file("CLAUDE.md", "# CLAUDE.md\n\n## Project\nNode.js web application\n"),
    [`${HOME}/projects/webapp/.claude`]: dir(".claude"),
    [`${HOME}/projects/webapp/.claude/rules`]: dir("rules"),
    [`${HOME}/projects/webapp/.claude/skills`]: dir("skills"),
    [`${HOME}/projects/webapp/.claude/settings.json`]: file("settings.json", '{\n  "permissions": {\n    "allow": ["Read", "Write", "Edit"],\n    "deny": []\n  }\n}\n'),
    [`${HOME}/projects/webapp/.git`]: dir(".git"),
    [`${HOME}/projects/webapp/.git/refs`]: dir("refs"),
    [`${HOME}/projects/webapp/.git/refs/heads`]: dir("heads"),
    [`${HOME}/projects/webapp/.git/HEAD`]: file("HEAD", "ref: refs/heads/main\n"),
    [`${HOME}/projects/webapp/.git/index`]: file("index", ""),
    [`${HOME}/projects/webapp/.git/logs`]: file("logs", JSON.stringify([
      { hash: "abc1234", message: "Initial commit", author: "learner <learner@example.com>", date: "Sat Apr 5 2026", files: ["src/index.js", "src/App.js", "package.json"] },
    ])),
    [`${HOME}/projects/webapp/.git/refs/heads/main`]: file("main", "abc1234"),
  });
}

// ── Skills Level 3: Hooks & Configuration (full .claude/ setup with pre-populated hooks config) ──
export function createSkillsLevel3FS(): Map<string, FSNode> {
  const settingsWithHooks = {
    permissions: {
      allow: ["Bash(npm run *)", "Read", "Write", "Edit"],
      deny: ["Bash(rm -rf *)", "Read(.env)"],
    },
    hooks: {
      PostToolUse: [
        {
          matcher: "Write|Edit",
          hooks: [
            { type: "command", command: ".claude/hooks/auto-format.sh" },
          ],
        },
      ],
    },
  };

  return buildFS({
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/webapp`]: dir("webapp"),
    [`${HOME}/projects/webapp/src`]: dir("src"),
    [`${HOME}/projects/webapp/src/index.js`]: file("index.js", "import { App } from './App';\n"),
    [`${HOME}/projects/webapp/src/App.js`]: file("App.js", "export function App() {\n  return '<div>Hello</div>';\n}\n"),
    [`${HOME}/projects/webapp/package.json`]: file("package.json", '{\n  "name": "webapp",\n  "version": "1.0.0"\n}\n'),
    [`${HOME}/projects/webapp/CLAUDE.md`]: file("CLAUDE.md", "# CLAUDE.md\n\n## Project\nNode.js web application\n"),
    [`${HOME}/projects/webapp/.claude`]: dir(".claude"),
    [`${HOME}/projects/webapp/.claude/rules`]: dir("rules"),
    [`${HOME}/projects/webapp/.claude/skills`]: dir("skills"),
    [`${HOME}/projects/webapp/.claude/agents`]: dir("agents"),
    [`${HOME}/projects/webapp/.claude/settings.json`]: file("settings.json", JSON.stringify(settingsWithHooks, null, 2) + "\n"),
  });
}

// ── Skills Level 4: Extend & Share (full .claude/ with skills, agents, hooks) ──
export function createSkillsLevel4FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/webapp`]: dir("webapp"),
    [`${HOME}/projects/webapp/src`]: dir("src"),
    [`${HOME}/projects/webapp/src/index.js`]: file("index.js", "import { App } from './App';\n"),
    [`${HOME}/projects/webapp/src/App.js`]: file("App.js", "export function App() {\n  return '<div>Hello</div>';\n}\n"),
    [`${HOME}/projects/webapp/package.json`]: file("package.json", '{\n  "name": "webapp",\n  "version": "1.0.0"\n}\n'),
    [`${HOME}/projects/webapp/CLAUDE.md`]: file("CLAUDE.md", "# CLAUDE.md\n\n## Project\nNode.js web application\n"),
    [`${HOME}/projects/webapp/.claude`]: dir(".claude"),
    [`${HOME}/projects/webapp/.claude/rules`]: dir("rules"),
    [`${HOME}/projects/webapp/.claude/skills`]: dir("skills"),
    [`${HOME}/projects/webapp/.claude/agents`]: dir("agents"),
    [`${HOME}/projects/webapp/.claude/agents/code-reviewer.md`]: file(
      "code-reviewer.md",
      "---\nname: code-reviewer\ndescription: Expert code reviewer\nmodel: sonnet\ntools: Read, Grep, Glob\n---\n\nYou are a senior code reviewer.\n"
    ),
    [`${HOME}/projects/webapp/.claude/hooks`]: dir("hooks"),
    [`${HOME}/projects/webapp/.claude/hooks/auto-format.sh`]: file(
      "auto-format.sh",
      '#!/bin/bash\nnpx prettier --write "$1"\n',
      "rwxr-xr-x"
    ),
    [`${HOME}/projects/webapp/.claude/settings.json`]: file("settings.json", '{\n  "permissions": {\n    "allow": ["Read", "Write", "Edit"],\n    "deny": ["Bash(rm -rf *)"]\n  }\n}\n'),
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/filesystem/initial-states.ts
git commit -m "feat: add filesystem initial states for skills & agents track"
```

---

### Task 11: Skills & Agents Level Definitions

**Files:**
- Create: `src/lib/lessons/levels/level-skills-1.ts`
- Create: `src/lib/lessons/levels/level-skills-2.ts`
- Create: `src/lib/lessons/levels/level-skills-3.ts`
- Create: `src/lib/lessons/levels/level-skills-4.ts`

- [ ] **Step 1: Create level-skills-1.ts (Skills & Commands)**

Create `src/lib/lessons/levels/level-skills-1.ts`:

```typescript
import { Level } from "@/lib/tracks/types";
import { createSkillsLevel1FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const skillsLevel1: Level = {
  slug: "skills-and-commands",
  title: "Skills & Commands",
  subtitle: "SKILL.md, slash commands",
  description: "Create reusable workflows that Claude can invoke automatically or on demand.",
  icon: "puzzle",
  initialFS: createSkillsLevel1FS,
  initialCwd: `${HOME}/projects/webapp`,
  availableCommands: [
    "pwd", "ls", "cd", "clear", "help", "cat", "echo", "mkdir",
    "claude", "claude --help", "claude /help", "claude /skills",
  ],
  tasks: [
    {
      id: "s1-1",
      instruction:
        '**Skills** are reusable workflows you can package up and invoke with a slash command. Let\'s see what skills look like. Type **`claude /help`** to see the available slash commands — notice skills appear alongside built-in commands.',
      validation: {
        type: "custom",
        check: (_fs, command, args) =>
          command === "claude" && args.join(" ").includes("/help"),
      },
    },
    {
      id: "s1-2",
      instruction:
        'Let\'s create a security review skill. First, create the skill directory. Type **`mkdir -p .claude/skills/security-review`**.',
      hint: "Type: mkdir -p .claude/skills/security-review",
      validation: {
        type: "fs_exists",
        path: `${HOME}/projects/webapp/.claude/skills/security-review`,
      },
    },
    {
      id: "s1-3",
      instruction:
        'Now create the skill definition. Every skill needs a `SKILL.md` file with YAML frontmatter. Type:\n\n**`echo "---\\nname: security-review\\ndescription: Scan code for security vulnerabilities\\nallowed-tools: Read, Grep, Glob\\n---\\n\\nAnalyze the codebase for security issues." > .claude/skills/security-review/SKILL.md`**',
      hint: "Copy the echo command above — it creates SKILL.md with the required frontmatter",
      validation: {
        type: "file_contains",
        path: `${HOME}/projects/webapp/.claude/skills/security-review/SKILL.md`,
        content: "security-review",
      },
    },
    {
      id: "s1-4",
      instruction:
        'Read it back to see the structure. Type **`cat .claude/skills/security-review/SKILL.md`** — notice the `name`, `description`, and `allowed-tools` fields.',
      validation: {
        type: "command",
        command: "cat",
        argsContain: ["SKILL.md"],
      },
    },
    {
      id: "s1-5",
      instruction:
        'Now invoke it! Type **`claude /security-review`** — Claude reads the SKILL.md and follows its instructions. Skills can also trigger automatically when Claude detects a matching situation.',
      hint: "Type: claude /security-review",
      validation: {
        type: "custom",
        check: (_fs, command, args) =>
          command === "claude" && args.join(" ").includes("/security-review"),
      },
    },
  ],
};
```

- [ ] **Step 2: Create level-skills-2.ts (Agents & Worktrees)**

Create `src/lib/lessons/levels/level-skills-2.ts`:

```typescript
import { Level } from "@/lib/tracks/types";
import { createSkillsLevel2FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const skillsLevel2: Level = {
  slug: "agents-and-worktrees",
  title: "Agents & Worktrees",
  subtitle: "subagents, model selection",
  description: "Create specialized AI personas that work in isolated worktrees for parallel development.",
  icon: "puzzle",
  initialFS: createSkillsLevel2FS,
  initialCwd: `${HOME}/projects/webapp`,
  availableCommands: [
    "pwd", "ls", "cd", "clear", "help", "cat", "echo", "mkdir",
    "claude", "claude --help", "claude /help",
  ],
  tasks: [
    {
      id: "s2-1",
      instruction:
        '**Agents** are specialized Claude personas — each with their own expertise, tools, and even AI model. When Claude needs help with a specific task, it can spawn an agent in an isolated worktree. Let\'s create one. Type **`mkdir .claude/agents`**.',
      validation: {
        type: "fs_exists",
        path: `${HOME}/projects/webapp/.claude/agents`,
      },
    },
    {
      id: "s2-2",
      instruction:
        'Create a code reviewer agent. Type:\n\n**`echo "---\\nname: code-reviewer\\ndescription: Expert code reviewer for bugs and quality\\nmodel: sonnet\\ntools: Read, Grep, Glob\\n---\\n\\nYou are a senior code reviewer. Focus on correctness, not style." > .claude/agents/code-reviewer.md`**',
      hint: "Copy the echo command above to create the agent definition",
      validation: {
        type: "file_contains",
        path: `${HOME}/projects/webapp/.claude/agents/code-reviewer.md`,
        content: "code-reviewer",
      },
    },
    {
      id: "s2-3",
      instruction:
        'Read the agent definition. Type **`cat .claude/agents/code-reviewer.md`** — notice key fields:\n- `model: sonnet` — uses a faster, cheaper model for focused work\n- `tools: Read, Grep, Glob` — read-only access (can\'t modify files)',
      validation: {
        type: "command",
        command: "cat",
        argsContain: ["code-reviewer.md"],
      },
    },
    {
      id: "s2-4",
      instruction:
        'Now see what happens when Claude uses an agent. Type **`claude "review this project"`** — Claude spawns the code-reviewer agent in its own **worktree** (an isolated copy of the repo, just like you learned in the Git track!).',
      hint: 'Type: claude "review this project"',
      validation: {
        type: "custom",
        check: (_fs, command, args) =>
          command === "claude" && args.join(" ").toLowerCase().includes("review"),
      },
    },
    {
      id: "s2-5",
      instruction:
        'Notice the output — the agent worked in a separate worktree, used only read-only tools, and reported back. This is how multiple agents can work on your project **in parallel** without conflicts. Each agent gets its own branch and folder, does its work, and reports results.\n\nType **`ls`** to confirm your project is unchanged — the agent worked in isolation.',
      validation: { type: "command", command: "ls" },
    },
  ],
};
```

- [ ] **Step 3: Create level-skills-3.ts (Hooks & Configuration)**

Create `src/lib/lessons/levels/level-skills-3.ts`:

```typescript
import { Level } from "@/lib/tracks/types";
import { createSkillsLevel3FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const skillsLevel3: Level = {
  slug: "hooks-and-config",
  title: "Hooks & Configuration",
  subtitle: "settings.json, hooks, permissions",
  description: "Control Claude's behavior deterministically with hooks, permissions, and configuration.",
  icon: "puzzle",
  initialFS: createSkillsLevel3FS,
  initialCwd: `${HOME}/projects/webapp`,
  availableCommands: [
    "pwd", "ls", "cd", "clear", "help", "cat", "echo", "mkdir",
    "claude", "claude --help", "claude /help",
  ],
  tasks: [
    {
      id: "s3-1",
      instruction:
        'CLAUDE.md tells Claude what to do, but it\'s a suggestion — Claude follows it *most* of the time. For things that MUST happen every time (formatting, security checks), you use **hooks** and **permissions**. Type **`cat .claude/settings.json`** to see the current configuration.',
      validation: {
        type: "command",
        command: "cat",
        argsContain: ["settings.json"],
      },
    },
    {
      id: "s3-2",
      instruction:
        'See the `permissions` section? The **allow** list (`Bash(npm run *)`, `Read`, `Write`, `Edit`) lets Claude run these without asking. The **deny** list (`Bash(rm -rf *)`, `Read(.env)`) blocks them completely. Anything not listed requires your approval.\n\nNow look at the `hooks` section. A **PostToolUse** hook runs `.claude/hooks/auto-format.sh` after every file edit. Type **`ls .claude/`** to see the folder structure.',
      validation: {
        type: "command",
        command: "ls",
        argsContain: [".claude"],
      },
    },
    {
      id: "s3-3",
      instruction:
        'The hooks section references a script that doesn\'t exist yet. Let\'s create it. Type **`mkdir .claude/hooks`**.',
      validation: {
        type: "fs_exists",
        path: `${HOME}/projects/webapp/.claude/hooks`,
      },
    },
    {
      id: "s3-4",
      instruction:
        'Create the auto-format script. Type:\n\n**`echo \'#!/bin/bash\\nnpx prettier --write "$1"\' > .claude/hooks/auto-format.sh`**\n\nThis script runs Prettier on every file Claude edits — **deterministically**, every single time.',
      hint: "Copy the echo command above to create the hook script",
      validation: {
        type: "file_contains",
        path: `${HOME}/projects/webapp/.claude/hooks/auto-format.sh`,
        content: "prettier",
      },
    },
    {
      id: "s3-5",
      instruction:
        'Read it back. Type **`cat .claude/hooks/auto-format.sh`**.\n\nHook exit codes matter:\n- **Exit 0** = success (continue)\n- **Exit 2** = block (stop Claude and show error)\n\nA **PreToolUse** hook with exit 2 can prevent dangerous commands. A **Stop** hook can require tests to pass before Claude finishes.',
      validation: {
        type: "command",
        command: "cat",
        argsContain: ["auto-format.sh"],
      },
    },
    {
      id: "s3-6",
      instruction:
        'Key takeaway: CLAUDE.md instructions are *probabilistic* (Claude usually follows them). Hooks are *deterministic* (they always run). Use CLAUDE.md for conventions and guidelines. Use hooks for things that must never be skipped.\n\nType **`cat .claude/settings.json`** one more time to see how it all connects.',
      validation: {
        type: "command",
        command: "cat",
        argsContain: ["settings.json"],
      },
    },
  ],
};
```

- [ ] **Step 4: Create level-skills-4.ts (Extend & Share)**

Create `src/lib/lessons/levels/level-skills-4.ts`:

```typescript
import { Level } from "@/lib/tracks/types";
import { createSkillsLevel4FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const skillsLevel4: Level = {
  slug: "extend-and-share",
  title: "Extend & Share",
  subtitle: "plugins, skill creator",
  description: "Discover community plugins, install pre-built skills, and create your own to share.",
  icon: "puzzle",
  initialFS: createSkillsLevel4FS,
  initialCwd: `${HOME}/projects/webapp`,
  availableCommands: [
    "pwd", "ls", "cd", "clear", "help", "cat", "echo", "mkdir",
    "claude", "claude --help", "claude /help", "claude /skills",
    "claude /find-skills", "claude /install-plugin", "claude /skill-creator",
  ],
  tasks: [
    {
      id: "s4-1",
      instruction:
        'You\'ve created skills and agents by hand. But there\'s a whole ecosystem of community-built plugins ready to install. Type **`claude /find-skills`** to browse what\'s available.',
      validation: {
        type: "custom",
        check: (_fs, command, args) =>
          command === "claude" && args.join(" ").includes("/find-skills"),
      },
    },
    {
      id: "s4-2",
      instruction:
        'Let\'s install one! Type **`claude /install-plugin code-review-pro`** — this downloads the skill and sets it up in your `.claude/skills/` folder.',
      hint: "Type: claude /install-plugin code-review-pro",
      validation: {
        type: "fs_exists",
        path: `${HOME}/projects/webapp/.claude/skills/code-review-pro`,
      },
    },
    {
      id: "s4-3",
      instruction:
        'See what was installed. Type **`ls .claude/skills/`** — the new plugin appeared alongside any skills you created earlier.',
      validation: {
        type: "command",
        command: "ls",
        argsContain: ["skills"],
      },
    },
    {
      id: "s4-4",
      instruction:
        'Read the installed skill to understand what it does. Type **`cat .claude/skills/code-review-pro/SKILL.md`**.',
      validation: {
        type: "command",
        command: "cat",
        argsContain: ["code-review-pro"],
      },
    },
    {
      id: "s4-5",
      instruction:
        'You can also create skills from a guided wizard. Type **`claude /skill-creator`** — it generates a template you can customize.',
      hint: "Type: claude /skill-creator",
      validation: {
        type: "fs_exists",
        path: `${HOME}/projects/webapp/.claude/skills/my-custom-skill`,
      },
    },
    {
      id: "s4-6",
      instruction:
        'Read the generated skill. Type **`cat .claude/skills/my-custom-skill/SKILL.md`** to see the template.\n\nSkills in `.claude/skills/` are project-scoped (shared with your team via git). Personal skills go in `~/.claude/skills/` and work across all your projects.',
      validation: {
        type: "command",
        command: "cat",
        argsContain: ["my-custom-skill"],
      },
    },
  ],
};
```

- [ ] **Step 5: Build verification**

Run: `bunx tsc --noEmit | tail -3`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/lib/lessons/levels/level-skills-1.ts src/lib/lessons/levels/level-skills-2.ts src/lib/lessons/levels/level-skills-3.ts src/lib/lessons/levels/level-skills-4.ts
git commit -m "feat: add skills & agents track level definitions (4 levels)"
```

---

### Task 12: Wire Up Skills & Agents Track

**Files:**
- Modify: `src/lib/tracks/skills-agents.ts`

- [ ] **Step 1: Populate skills & agents track with levels**

Read the current file first, then replace with:

```typescript
import { Track } from "./types";
import { skillsLevel1 } from "@/lib/lessons/levels/level-skills-1";
import { skillsLevel2 } from "@/lib/lessons/levels/level-skills-2";
import { skillsLevel3 } from "@/lib/lessons/levels/level-skills-3";
import { skillsLevel4 } from "@/lib/lessons/levels/level-skills-4";

export const skillsAgentsTrack: Track = {
  slug: "skills-agents",
  title: "Skills & Agents",
  subtitle: "Extend Claude with custom workflows",
  description:
    "Create skills, agents, and hooks to customize Claude Code for your team's workflow.",
  icon: "puzzle",
  color: "#8b5cf6",
  prerequisites: ["claude-code"],
  levels: [skillsLevel1, skillsLevel2, skillsLevel3, skillsLevel4],
};
```

- [ ] **Step 2: Full build verification**

Run: `bunx tsc --noEmit | tail -3`
Expected: No errors

Run: `bun run build 2>&1 | tail -5`
Expected: Build succeeds. All three tracks should now appear with playable levels on the landing page.

Run: `bun run lint 2>&1 | tail -5`
Expected: No lint errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/tracks/skills-agents.ts
git commit -m "feat: wire up skills & agents track with 4 playable levels"
```

---

## Post-Implementation Verification

After all tasks are complete, verify:

1. **Landing page:** All three previously "coming soon" tracks show level counts (Git: 5, Claude Code: 3, Skills & Agents: 4)
2. **Prerequisite chain:** Git track unlocks after terminal-basics completion. Claude Code unlocks after terminal-basics + git. Skills & Agents unlocks after claude-code.
3. **Subcommand gating:** In Git Level 1, typing `git commit` shows a locked message. In Git Level 3, it works.
4. **Context-aware git:** `git status` output changes based on staged/untracked files. `git commit` clears the staging area.
5. **Claude handler:** `claude /init` creates CLAUDE.md and `.claude/` folder. `claude "fix ..."` modifies files in the filesystem.
6. **Static generation:** `bun run build` generates all new track/level routes without errors.
