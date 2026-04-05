import { Level } from "@/lib/tracks/types";
import { createSkillsLevel2FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const skillsLevel2: Level = {
  slug: "agents-and-worktrees",
  title: "Agents & Worktrees",
  subtitle: "subagents, model selection",
  description:
    "Create specialized AI personas that work in isolated worktrees for parallel development.",
  icon: "puzzle",
  initialFS: createSkillsLevel2FS,
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
      id: "s2-1",
      instruction:
        "**Agents** are specialized Claude personas — each with their own expertise, tools, and even AI model. When Claude needs help with a specific task, it can spawn an agent in an isolated worktree. Let's create one. Type **`mkdir .claude/agents`**.",
      validation: {
        type: "fs_exists",
        path: `${HOME}/projects/webapp/.claude/agents`,
      },
    },
    {
      id: "s2-2",
      instruction:
        'Create a code reviewer agent. Type:\n\n**`echo "---\\nname: code-reviewer\\ndescription: Expert code reviewer for bugs and quality\\nmodel: sonnet\\ntools: Read, Grep, Glob\\n---\\n\\nYou are a senior code reviewer. Focus on correctness, not style." > .claude/agents/code-reviewer.md`**',
      hint: "Copy the echo command above to create the agent definition",
      validation: {
        type: "file_contains",
        path: `${HOME}/projects/webapp/.claude/agents/code-reviewer.md`,
        content: "code-reviewer",
      },
    },
    {
      id: "s2-3",
      instruction:
        "Read the agent definition. Type **`cat .claude/agents/code-reviewer.md`** — notice key fields:\n- `model: sonnet` — uses a faster, cheaper model for focused work\n- `tools: Read, Grep, Glob` — read-only access (can't modify files)",
      validation: {
        type: "command",
        command: "cat",
        argsContain: ["code-reviewer.md"],
      },
    },
    {
      id: "s2-4",
      instruction:
        'Now see what happens when Claude uses an agent. Type **`claude "review this project"`** — Claude spawns the code-reviewer agent in its own **worktree** (an isolated copy of the repo, just like you learned in the Git track!).',
      hint: 'Type: claude "review this project"',
      validation: {
        type: "custom",
        check: (_fs, command, args) =>
          command === "claude" && args.join(" ").toLowerCase().includes("review"),
      },
    },
    {
      id: "s2-5",
      instruction:
        "Notice the output — the agent worked in a separate worktree, used only read-only tools, and reported back. This is how multiple agents can work on your project **in parallel** without conflicts. Each agent gets its own branch and folder, does its work, and reports results.\n\nType **`ls`** to confirm your project is unchanged — the agent worked in isolation.",
      validation: { type: "command", command: "ls" },
    },
  ],
};
