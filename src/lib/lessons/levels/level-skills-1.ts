import { Level } from "@/lib/tracks/types";
import { createSkillsLevel1FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const skillsLevel1: Level = {
  slug: "skills-and-commands",
  title: "Skills & Commands",
  subtitle: "SKILL.md, slash commands",
  description: "Create reusable workflows that Claude can invoke automatically or on demand.",
  icon: "puzzle",
  initialFS: createSkillsLevel1FS,
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
    "claude /skills",
  ],
  tasks: [
    {
      id: "s1-1",
      instruction:
        "**Skills** are reusable workflows you can package up and invoke with a slash command. Let's see what skills look like. Type **`claude /help`** to see the available slash commands — notice skills appear alongside built-in commands.",
      validation: {
        type: "custom",
        check: (_fs, command, args) => command === "claude" && args.join(" ").includes("/help"),
      },
    },
    {
      id: "s1-2",
      instruction:
        "Let's create a security review skill. First, create the skill directory. Type **`mkdir -p .claude/skills/security-review`**.",
      hint: "Type: mkdir -p .claude/skills/security-review",
      validation: {
        type: "fs_exists",
        path: `${HOME}/projects/webapp/.claude/skills/security-review`,
      },
    },
    {
      id: "s1-3",
      instruction:
        'Now create the skill definition. Every skill needs a `SKILL.md` file with YAML frontmatter. Type:\n\n**`echo "---\\nname: security-review\\ndescription: Scan code for security vulnerabilities\\nallowed-tools: Read, Grep, Glob\\n---\\n\\nAnalyze the codebase for security issues." > .claude/skills/security-review/SKILL.md`**',
      hint: "Copy the echo command above — it creates SKILL.md with the required frontmatter",
      validation: {
        type: "file_contains",
        path: `${HOME}/projects/webapp/.claude/skills/security-review/SKILL.md`,
        content: "security-review",
      },
    },
    {
      id: "s1-4",
      instruction:
        "Read it back to see the structure. Type **`cat .claude/skills/security-review/SKILL.md`** — notice the `name`, `description`, and `allowed-tools` fields.",
      validation: {
        type: "command",
        command: "cat",
        argsContain: ["SKILL.md"],
      },
    },
    {
      id: "s1-5",
      instruction:
        "Now invoke it! Type **`claude /security-review`** — Claude reads the SKILL.md and follows its instructions. Skills can also trigger automatically when Claude detects a matching situation.",
      hint: "Type: claude /security-review",
      validation: {
        type: "custom",
        check: (_fs, command, args) =>
          command === "claude" && args.join(" ").includes("/security-review"),
      },
    },
  ],
};
