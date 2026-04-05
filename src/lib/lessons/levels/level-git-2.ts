import { Level } from "@/lib/tracks/types";
import { createGitLevel2FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const gitLevel2: Level = {
  slug: "tracking-changes",
  title: "Tracking Changes",
  subtitle: "git add, git diff",
  description:
    "Learn the staging area — the prep zone between editing files and saving them to history.",
  icon: "git-branch",
  initialFS: createGitLevel2FS,
  initialCwd: `${HOME}/projects/portfolio`,
  availableCommands: [
    "pwd",
    "ls",
    "cd",
    "clear",
    "help",
    "cat",
    "git",
    "git init",
    "git status",
    "git add",
    "git diff",
  ],
  tasks: [
    {
      id: "g2-1",
      instruction:
        "Your repo is initialized but Git isn't tracking any files yet. Type **`git status`** to see the current state.",
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
          } catch {
            return false;
          }
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
            return (
              index.includes("index.html") &&
              index.includes("style.css") &&
              index.includes("app.js")
            );
          } catch {
            return false;
          }
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
