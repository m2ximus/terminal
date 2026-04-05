import { Track } from "./types";
import { skillsLevel1 } from "@/lib/lessons/levels/level-skills-1";
import { skillsLevel2 } from "@/lib/lessons/levels/level-skills-2";
import { skillsLevel3 } from "@/lib/lessons/levels/level-skills-3";
import { skillsLevel4 } from "@/lib/lessons/levels/level-skills-4";

export const skillsAgentsTrack: Track = {
  slug: "skills-agents",
  title: "Skills & Agents",
  subtitle: "Extend Claude with custom workflows",
  description:
    "Create skills, agents, and hooks to customize Claude Code for your team's workflow.",
  icon: "puzzle",
  color: "#8b5cf6",
  prerequisites: ["claude-code"],
  levels: [skillsLevel1, skillsLevel2, skillsLevel3, skillsLevel4],
};
