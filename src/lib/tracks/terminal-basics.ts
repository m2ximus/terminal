import { Track, Level } from "./types";
import { level1 } from "@/lib/lessons/levels/level-1";
import { level2 } from "@/lib/lessons/levels/level-2";
import { level3 } from "@/lib/lessons/levels/level-3";
import { level4 } from "@/lib/lessons/levels/level-4";
import { level5 } from "@/lib/lessons/levels/level-5";

const levels: Level[] = [
  {
    slug: level1.slug,
    title: level1.title,
    subtitle: level1.subtitle,
    description: level1.description,
    icon: "compass",
    initialFS: level1.initialFS,
    initialCwd: level1.initialCwd,
    tasks: level1.tasks,
    availableCommands: level1.availableCommands,
  },
  {
    slug: level2.slug,
    title: level2.title,
    subtitle: level2.subtitle,
    description: level2.description,
    icon: "navigation",
    initialFS: level2.initialFS,
    initialCwd: level2.initialCwd,
    tasks: level2.tasks,
    availableCommands: level2.availableCommands,
  },
  {
    slug: level3.slug,
    title: level3.title,
    subtitle: level3.subtitle,
    description: level3.description,
    icon: "hammer",
    initialFS: level3.initialFS,
    initialCwd: level3.initialCwd,
    tasks: level3.tasks,
    availableCommands: level3.availableCommands,
  },
  {
    slug: level4.slug,
    title: level4.title,
    subtitle: level4.subtitle,
    description: level4.description,
    icon: "folder-cog",
    initialFS: level4.initialFS,
    initialCwd: level4.initialCwd,
    tasks: level4.tasks,
    availableCommands: level4.availableCommands,
  },
  {
    slug: level5.slug,
    title: level5.title,
    subtitle: level5.subtitle,
    description: level5.description,
    icon: "book-open",
    initialFS: level5.initialFS,
    initialCwd: level5.initialCwd,
    tasks: level5.tasks,
    availableCommands: level5.availableCommands,
  },
];

export const terminalBasics: Track = {
  slug: "terminal-basics",
  title: "Terminal Basics",
  subtitle: "Learn to navigate and manage files",
  description:
    "Start from zero — learn what a terminal is, how to navigate directories, create files and folders, and manage your filesystem. No prior experience needed.",
  icon: "terminal",
  color: "#4ade80",
  prerequisites: [],
  levels,
};
