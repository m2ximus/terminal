import { Level } from "@/lib/tracks/types";
import { createSkillsLevel4FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const skillsLevel4: Level = {
  slug: "extend-and-share",
  title: "Extend & Share",
  subtitle: "plugins, skill creator",
  description:
    "Discover community plugins, install pre-built skills, and create your own to share.",
  icon: "puzzle",
  initialFS: createSkillsLevel4FS,
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
    "claude /find-skills",
    "claude /install-plugin",
    "claude /skill-creator",
  ],
  tasks: [
    {
      id: "s4-1",
      instruction:
        "You've created skills and agents by hand. But there's a whole ecosystem of community-built plugins ready to install. Type **`claude /find-skills`** to browse what's available.",
      validation: {
        type: "custom",
        check: (_fs, command, args) =>
          command === "claude" && args.join(" ").includes("/find-skills"),
      },
    },
    {
      id: "s4-2",
      instruction:
        "Let's install one! Type **`claude /install-plugin code-review-pro`** — this downloads the skill and sets it up in your `.claude/skills/` folder.",
      hint: "Type: claude /install-plugin code-review-pro",
      validation: {
        type: "fs_exists",
        path: `${HOME}/projects/webapp/.claude/skills/code-review-pro`,
      },
    },
    {
      id: "s4-3",
      instruction:
        "See what was installed. Type **`ls .claude/skills/`** — the new plugin appeared alongside any skills you created earlier.",
      validation: {
        type: "command",
        command: "ls",
        argsContain: ["skills"],
      },
    },
    {
      id: "s4-4",
      instruction:
        "Read the installed skill to understand what it does. Type **`cat .claude/skills/code-review-pro/SKILL.md`**.",
      validation: {
        type: "command",
        command: "cat",
        argsContain: ["code-review-pro"],
      },
    },
    {
      id: "s4-5",
      instruction:
        "You can also create skills from a guided wizard. Type **`claude /skill-creator`** — it generates a template you can customize.",
      hint: "Type: claude /skill-creator",
      validation: {
        type: "fs_exists",
        path: `${HOME}/projects/webapp/.claude/skills/my-custom-skill`,
      },
    },
    {
      id: "s4-6",
      instruction:
        "Read the generated skill. Type **`cat .claude/skills/my-custom-skill/SKILL.md`** to see the template.\n\nSkills in `.claude/skills/` are project-scoped (shared with your team via git). Personal skills go in `~/.claude/skills/` and work across all your projects.",
      validation: {
        type: "command",
        command: "cat",
        argsContain: ["my-custom-skill"],
      },
    },
  ],
};
