import { Track } from "./types";
import { claudeLevel1 } from "@/lib/lessons/levels/level-claude-1";
import { claudeLevel2 } from "@/lib/lessons/levels/level-claude-2";
import { claudeLevel3 } from "@/lib/lessons/levels/level-claude-3";

export const claudeCodeTrack: Track = {
  slug: "claude-code",
  title: "Claude Code",
  subtitle: "AI-powered development in your terminal",
  description:
    "Learn to use Claude Code to supercharge your development workflow directly from the terminal.",
  icon: "bot",
  color: "#d97757",
  prerequisites: ["terminal-basics", "git"],
  levels: [claudeLevel1, claudeLevel2, claudeLevel3],
};
