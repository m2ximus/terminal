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
      id: "c2-1",
      instruction:
        "The most powerful file in any Claude Code project is **CLAUDE.md** — it tells Claude about your project, conventions, and commands. Let's check if one exists. Type **`ls -la`** to see all files.",
      hint: "Type ls -la to see all files including hidden ones",
      validation: { type: "command", command: "ls", argsContain: ["-a"] },
    },
    {
      id: "c2-2",
      instruction:
        "No CLAUDE.md yet! Let Claude create one by scanning your project. Type **`claude /init`** — this analyzes your files and generates a starter CLAUDE.md.",
      hint: "Type: claude /init",
      validation: { type: "fs_exists", path: `${HOME}/projects/webapp/CLAUDE.md` },
    },
    {
      id: "c2-3",
      instruction:
        "Claude created a CLAUDE.md! Read it with **`cat CLAUDE.md`** to see what Claude figured out about your project.",
      validation: { type: "command", command: "cat", argsContain: ["CLAUDE.md"] },
    },
    {
      id: "c2-4",
      instruction:
        "Claude also created a `.claude/` folder — the control center for Claude's behavior. Type **`ls -la .claude/`** to see what's inside.",
      hint: "Type: ls -la .claude/",
      validation: { type: "command", command: "ls", argsContain: [".claude"] },
    },
    {
      id: "c2-5",
      instruction:
        "The `rules/` folder holds modular instructions that Claude follows. Each markdown file is a separate rule. Type **`ls .claude/rules/`** to see it (it's empty for now).",
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
