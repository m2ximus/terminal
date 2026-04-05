import { Level } from "@/lib/tracks/types";
import { createSkillsLevel3FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const skillsLevel3: Level = {
  slug: "hooks-and-config",
  title: "Hooks & Configuration",
  subtitle: "settings.json, hooks, permissions",
  description:
    "Control Claude's behavior deterministically with hooks, permissions, and configuration.",
  icon: "puzzle",
  initialFS: createSkillsLevel3FS,
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
    "claude --help",
    "claude /help",
  ],
  tasks: [
    {
      id: "s3-1",
      instruction:
        "CLAUDE.md tells Claude what to do, but it's a suggestion — Claude follows it *most* of the time. For things that MUST happen every time (formatting, security checks), you use **hooks** and **permissions**. Type **`cat .claude/settings.json`** to see the current configuration.",
      validation: {
        type: "command",
        command: "cat",
        argsContain: ["settings.json"],
      },
    },
    {
      id: "s3-2",
      instruction:
        "See the `permissions` section? The **allow** list (`Bash(npm run *)`, `Read`, `Write`, `Edit`) lets Claude run these without asking. The **deny** list (`Bash(rm -rf *)`, `Read(.env)`) blocks them completely. Anything not listed requires your approval.\n\nNow look at the `hooks` section. A **PostToolUse** hook runs `.claude/hooks/auto-format.sh` after every file edit. Type **`ls .claude/`** to see the folder structure.",
      validation: {
        type: "command",
        command: "ls",
        argsContain: [".claude"],
      },
    },
    {
      id: "s3-3",
      instruction:
        "The hooks section references a script that doesn't exist yet. Let's create it. Type **`mkdir .claude/hooks`**.",
      validation: {
        type: "fs_exists",
        path: `${HOME}/projects/webapp/.claude/hooks`,
      },
    },
    {
      id: "s3-4",
      instruction:
        "Create the auto-format script. Type:\n\n**`echo '#!/bin/bash\\nnpx prettier --write \"$1\"' > .claude/hooks/auto-format.sh`**\n\nThis script runs Prettier on every file Claude edits — **deterministically**, every single time.",
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
        "Read it back. Type **`cat .claude/hooks/auto-format.sh`**.\n\nHook exit codes matter:\n- **Exit 0** = success (continue)\n- **Exit 2** = block (stop Claude and show error)\n\nA **PreToolUse** hook with exit 2 can prevent dangerous commands. A **Stop** hook can require tests to pass before Claude finishes.",
      validation: {
        type: "command",
        command: "cat",
        argsContain: ["auto-format.sh"],
      },
    },
    {
      id: "s3-6",
      instruction:
        "Key takeaway: CLAUDE.md instructions are *probabilistic* (Claude usually follows them). Hooks are *deterministic* (they always run). Use CLAUDE.md for conventions and guidelines. Use hooks for things that must never be skipped.\n\nType **`cat .claude/settings.json`** one more time to see how it all connects.",
      validation: {
        type: "command",
        command: "cat",
        argsContain: ["settings.json"],
      },
    },
  ],
};
