import { Level } from "@/lib/tracks/types";
import { createGitLevel5FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const gitLevel5: Level = {
  slug: "worktrees",
  title: "Parallel Worlds",
  subtitle: "git worktree",
  description:
    "Work on multiple branches simultaneously with worktrees — the secret weapon for parallel development.",
  icon: "git-branch",
  initialFS: createGitLevel5FS,
  initialCwd: `${HOME}/projects/portfolio`,
  availableCommands: [
    "pwd",
    "ls",
    "cd",
    "clear",
    "help",
    "cat",
    "echo",
    "git",
    "git init",
    "git status",
    "git add",
    "git diff",
    "git commit",
    "git log",
    "git branch",
    "git checkout",
    "git merge",
    "git worktree",
  ],
  tasks: [
    {
      id: "g5-1",
      instruction:
        "Branches let you work on features separately, but you have to switch back and forth. **Worktrees** solve this — they give you a separate folder for each branch, so you can work on multiple things at once. Type **`git worktree list`** to see your current worktrees.",
      validation: { type: "command", command: "git", argsContain: ["worktree", "list"] },
    },
    {
      id: "g5-2",
      instruction:
        "Just one worktree — your current folder. Let's create a second one for a dark-mode feature. Type **`git worktree add ../portfolio-dark-mode -b dark-mode`** — this creates a new folder next to your project with its own branch.",
      hint: "Type: git worktree add ../portfolio-dark-mode -b dark-mode",
      validation: {
        type: "fs_exists",
        path: `${HOME}/projects/portfolio-dark-mode`,
      },
    },
    {
      id: "g5-3",
      instruction:
        "Run **`git worktree list`** again to see both worktrees. Each one is on a different branch — you can edit both simultaneously without any switching.",
      validation: { type: "command", command: "git", argsContain: ["worktree", "list"] },
    },
    {
      id: "g5-4",
      instruction: "Navigate to the new worktree. Type **`cd ../portfolio-dark-mode`**.",
      validation: { type: "cwd_equals", path: `${HOME}/projects/portfolio-dark-mode` },
    },
    {
      id: "g5-5",
      instruction:
        "Type **`ls`** to see the files. It's a complete copy of your project! Each worktree is independent — changes here don't affect your main folder.",
      validation: { type: "command", command: "ls" },
    },
    {
      id: "g5-6",
      instruction: "Head back to your main project folder. Type **`cd ../portfolio`**.",
      validation: { type: "cwd_equals", path: `${HOME}/projects/portfolio` },
    },
    {
      id: "g5-7",
      instruction:
        "When you're done with a worktree, clean it up. Type **`git worktree remove ../portfolio-dark-mode`** to delete the folder and unregister it.\n\nThis is exactly how AI agents work in parallel — each agent gets its own worktree so they can't step on each other's toes!",
      hint: "Type: git worktree remove ../portfolio-dark-mode",
      validation: {
        type: "fs_not_exists",
        path: `${HOME}/projects/portfolio-dark-mode`,
      },
    },
  ],
};
