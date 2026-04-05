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
  ],
  tasks: [
    {
      id: "g4-1",
      instruction:
        "Your portfolio has one commit on the `main` branch. Type **`git branch`** to see your branches. The `*` shows which branch you're currently on.",
      validation: { type: "command", command: "git", argsContain: ["branch"] },
    },
    {
      id: "g4-2",
      instruction:
        "Let's add a contact page — but on a separate branch so we don't risk breaking `main`. Type **`git checkout -b add-contact`** to create a new branch AND switch to it in one step.",
      hint: "Type: git checkout -b add-contact",
      validation: {
        type: "custom",
        check: (fs) => {
          try {
            const head = fs.readFile(fs.resolvePath(".git/HEAD")).trim();
            return head === "ref: refs/heads/add-contact";
          } catch {
            return false;
          }
        },
      },
    },
    {
      id: "g4-3",
      instruction:
        "Run **`git branch`** again to confirm you're on the new branch. You should see `* add-contact` and `main`.",
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
      instruction: "Stage the new file. Type **`git add contact.html`**.",
      validation: {
        type: "custom",
        check: (fs) => {
          try {
            const index = fs.readFile(fs.resolvePath(".git/index"));
            return index.includes("contact.html");
          } catch {
            return false;
          }
        },
      },
    },
    {
      id: "g4-6",
      instruction: 'Commit it to the branch. Type **`git commit -m "Add contact page"`**.',
      hint: 'Type: git commit -m "Add contact page"',
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
    {
      id: "g4-7",
      instruction:
        "Your feature is done! Switch back to `main` to merge it in. Type **`git checkout main`**.",
      validation: {
        type: "custom",
        check: (fs) => {
          try {
            const head = fs.readFile(fs.resolvePath(".git/HEAD")).trim();
            return head === "ref: refs/heads/main";
          } catch {
            return false;
          }
        },
      },
    },
    {
      id: "g4-8",
      instruction:
        "Now bring the contact page into `main` by merging. Type **`git merge add-contact`** — this pulls all the changes from your feature branch into the current branch.",
      hint: "Type: git merge add-contact",
      validation: { type: "command", command: "git", argsContain: ["merge", "add-contact"] },
    },
  ],
};
