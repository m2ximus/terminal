import { Track, Level } from "./types";
import { level6 } from "@/lib/lessons/levels/level-6";
import { level7 } from "@/lib/lessons/levels/level-7";

const levels: Level[] = [
  {
    slug: level6.slug,
    title: level6.title,
    subtitle: level6.subtitle,
    description: level6.description,
    icon: "search",
    initialFS: level6.initialFS,
    initialCwd: level6.initialCwd,
    tasks: level6.tasks,
    availableCommands: level6.availableCommands,
  },
  {
    slug: level7.slug,
    title: level7.title,
    subtitle: level7.subtitle,
    description: level7.description,
    icon: "zap",
    initialFS: level7.initialFS,
    initialCwd: level7.initialCwd,
    tasks: level7.tasks,
    availableCommands: level7.availableCommands,
  },
];

export const terminalAdvanced: Track = {
  slug: "terminal-advanced",
  title: "Terminal Advanced",
  subtitle: "Search, find, and power-user tools",
  description:
    "Level up with pipes, grep, find, permissions, and shell history. These are the tools that separate beginners from power users.",
  icon: "zap",
  color: "#f59e0b",
  prerequisites: ["terminal-basics"],
  levels,
};
