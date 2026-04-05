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
  ],
  tasks: [
    {
      id: "g3-1",
      instruction:
        "Your files are already staged from the previous level. Confirm by typing **`git status`** — you should see all three files ready to commit.",
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
          } catch {
            return false;
          }
        },
      },
    },
    {
      id: "g3-3",
      instruction:
        "Your first commit is saved! Type **`git status`** to see the result — the working tree should be clean now, meaning all changes have been committed.",
      validation: { type: "command", command: "git", argsContain: ["status"] },
    },
    {
      id: "g3-4",
      instruction:
        "Type **`git log`** to see your commit history. You'll see the commit hash (a unique ID), who made the commit, when, and your message.",
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
      instruction: "Now stage the changed file. Type **`git add style.css`**.",
      validation: {
        type: "custom",
        check: (fs) => {
          try {
            const index = fs.readFile(fs.resolvePath(".git/index"));
            return index.includes("style.css");
          } catch {
            return false;
          }
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
          } catch {
            return false;
          }
        },
      },
    },
  ],
};
