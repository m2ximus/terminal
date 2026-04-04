import { Level } from "../types";
import { createLevel8FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const level8: Level = {
  id: 8,
  slug: "ready-for-claude-code",
  title: "Ready for Claude Code",
  subtitle: "npm, git, claude",
  description:
    "Put everything together. Set up a real project with npm and git, then launch Claude Code.",
  initialFS: createLevel8FS,
  initialCwd: HOME,
  availableCommands: [
    "pwd", "ls", "clear", "help", "cd", "mkdir", "touch", "open",
    "cp", "mv", "rm", "cat", "head", "tail", "echo", "find", "grep",
    "chmod", "which", "history", "alias", "npm", "npx", "git", "claude",
  ],
  tasks: [
    {
      id: "8-1",
      instruction:
        "This is it — let's set up a real coding project, just like a developer would. First, create a new folder and go into it. Type **`mkdir my-project`** and then **`cd my-project`**.",
      validation: { type: "cwd_equals", path: `${HOME}/my-project` },
    },
    {
      id: "8-2",
      instruction:
        'Most coding projects use a tool called `npm` (Node Package Manager) to manage things. Type **`npm init -y`** to create a `package.json` file — this is like the project\'s ID card. It stores the name, version, and a list of tools (packages) the project uses.',
      hint: "npm init creates a new project config file. The -y flag means 'yes to all defaults' so it doesn't ask you questions.",
      validation: {
        type: "fs_exists",
        path: `${HOME}/my-project/package.json`,
      },
    },
    {
      id: "8-3",
      instruction:
        'Now let\'s set up version control with `git`. This is like a "save game" system for your code — you can save snapshots and go back to any previous version. Type **`git init`** to start tracking this project.',
      validation: {
        type: "fs_exists",
        path: `${HOME}/my-project/.git`,
      },
    },
    {
      id: "8-4",
      instruction:
        "Create your first code file. Type **`touch index.js`** to create a JavaScript file.",
      validation: {
        type: "fs_exists",
        path: `${HOME}/my-project/index.js`,
      },
    },
    {
      id: "8-5",
      instruction:
        'Write some code into it. Type: **`echo "console.log(\'Hello from my project!\')" > index.js`** — this saves a line of JavaScript code into your file.',
      validation: {
        type: "file_contains",
        path: `${HOME}/my-project/index.js`,
        content: "console.log",
      },
    },
    {
      id: "8-6",
      instruction:
        'Now save a snapshot with git. First, type **`git add .`** to tell git "track all these files", then type **`git commit -m "Initial commit"`** to save the snapshot with a message describing what you did.',
      hint: 'git add . stages all files (the dot means "everything in this folder"). git commit -m saves a snapshot with a descriptive message.',
      validation: {
        type: "command",
        command: "git",
        argsContain: ["commit"],
      },
    },
    {
      id: "8-7",
      instruction:
        'You did it! You now know enough terminal to use Claude Code. On your real computer, you\'d install it by typing `npm install -g @anthropic-ai/claude-code` in your terminal. For now, type **`claude`** to see what happens when you launch it.',
      validation: { type: "command", command: "claude" },
    },
  ],
};
