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
    "pwd",
    "ls",
    "cd",
    "clear",
    "help",
    "cat",
    "claude",
    "claude --version",
    "claude --help",
    "claude /help",
  ],
  tasks: [
    {
      id: "c1-1",
      instruction:
        "You've mastered the terminal and Git. Now it's time for the tool that ties it all together — **Claude Code**. It's an AI assistant that lives right in your terminal. First, navigate to your project. Type **`cd projects/webapp`**.",
      validation: { type: "cwd_equals", path: `${HOME}/projects/webapp` },
    },
    {
      id: "c1-2",
      instruction:
        "Launch Claude Code by typing **`claude`**. In real life, this starts an interactive AI session. Here, you'll see the welcome screen.",
      hint: "Just type claude and press Enter",
      validation: { type: "command", command: "claude" },
    },
    {
      id: "c1-3",
      instruction: "Check which version you're running. Type **`claude --version`**.",
      validation: { type: "command", command: "claude" },
    },
    {
      id: "c1-4",
      instruction:
        "See all the options Claude Code supports. Type **`claude --help`** to view flags like `--model`, `--print`, and `--allowedTools`.",
      validation: { type: "command", command: "claude" },
    },
    {
      id: "c1-5",
      instruction:
        "Inside a Claude session, you use **slash commands** for quick actions. Type **`claude /help`** to see the list — things like `/init`, `/compact`, `/model`, and `/skills`.",
      hint: "Type: claude /help",
      validation: {
        type: "custom",
        check: (_fs, command, args) => command === "claude" && args.join(" ").includes("/help"),
      },
    },
  ],
};
