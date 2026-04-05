import { Track } from "./types";
import { gitLevel1 } from "@/lib/lessons/levels/level-git-1";
import { gitLevel2 } from "@/lib/lessons/levels/level-git-2";
import { gitLevel3 } from "@/lib/lessons/levels/level-git-3";
import { gitLevel4 } from "@/lib/lessons/levels/level-git-4";
import { gitLevel5 } from "@/lib/lessons/levels/level-git-5";

export const gitTrack: Track = {
  slug: "git",
  title: "Git",
  subtitle: "Version control from first commit to worktrees",
  description:
    "Master version control with Git — from your first commit to branching strategies and worktrees.",
  icon: "git-branch",
  color: "#f97316",
  prerequisites: ["terminal-basics"],
  levels: [gitLevel1, gitLevel2, gitLevel3, gitLevel4, gitLevel5],
};
