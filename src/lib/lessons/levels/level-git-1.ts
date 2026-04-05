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
  availableCommands: ["pwd", "ls", "cd", "clear", "help", "cat", "git", "git init", "git status"],
  tasks: [
    {
      id: "g1-1",
      instruction:
        "You have a portfolio project that needs version control. First, navigate to it. Type **`cd projects/portfolio`** to go into the project folder.",
      hint: "Type cd projects/portfolio and press Enter",
      validation: { type: "cwd_equals", path: `${HOME}/projects/portfolio` },
    },
    {
      id: "g1-2",
      instruction: "Let's see what files are in this project. Type **`ls`** to list them.",
      validation: { type: "command", command: "ls" },
    },
    {
      id: "g1-3",
      instruction:
        "Three files — a website! Right now, there's no version control. If you mess something up, there's no way to go back. Let's fix that. Type **`git init`** to initialize a Git repository. This creates a hidden `.git` folder that tracks every change you make.",
      hint: "Type git init and press Enter — this turns your folder into a Git repository",
      validation: { type: "fs_exists", path: `${HOME}/projects/portfolio/.git` },
    },
    {
      id: "g1-4",
      instruction:
        "Git created a hidden `.git` folder — that's where it stores all its tracking data. Type **`ls -la`** to see it. The `-a` flag shows hidden files (ones starting with a dot).",
      hint: "Type ls -la to see all files including hidden ones",
      validation: { type: "command", command: "ls", argsContain: ["-a"] },
    },
    {
      id: "g1-5",
      instruction:
        "See the `.git` folder? That's the brain of your repository. Now type **`git status`** to see what Git thinks about your files. Since we just initialized, it should show all files as \"untracked\" — Git sees them but isn't tracking changes to them yet.",
      hint: "Type git status to see which files Git is tracking",
      validation: { type: "command", command: "git", argsContain: ["status"] },
    },
  ],
};
