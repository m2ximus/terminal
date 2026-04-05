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
    "pwd",
    "ls",
    "cd",
    "clear",
    "help",
    "cat",
    "echo",
    "mkdir",
    "claude",
    "claude --version",
    "claude --help",
    "claude /help",
    "claude /init",
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
          } catch {
            return false;
          }
        },
      },
    },
    {
      id: "c3-4",
      instruction:
        "Verify the fix by reading the file. Type **`cat src/utils.js`** — the `undefined` reference should be gone.",
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
