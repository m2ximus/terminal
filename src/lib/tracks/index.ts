// src/lib/tracks/index.ts
import { Track, Level } from "./types";
import { terminalBasics } from "./terminal-basics";
import { terminalAdvanced } from "./terminal-advanced";
import { gitTrack } from "./git";
import { claudeCodeTrack } from "./claude-code";
import { skillsAgentsTrack } from "./skills-agents";
import { shellCustomizationTrack } from "./shell-customization";

export const tracks: Track[] = [
  terminalBasics,
  terminalAdvanced,
  gitTrack,
  claudeCodeTrack,
  skillsAgentsTrack,
  shellCustomizationTrack,
];

export function findTrackBySlug(slug: string): Track | undefined {
  return tracks.find((t) => t.slug === slug);
}

export function findLevelInTrack(
  trackSlug: string,
  levelSlug: string,
): { track: Track; level: Level; index: number } | undefined {
  const track = findTrackBySlug(trackSlug);
  if (!track) return undefined;
  const index = track.levels.findIndex((l) => l.slug === levelSlug);
  if (index === -1) return undefined;
  return { track, level: track.levels[index], index };
}

export function getAllTrackLevelPairs(): Array<{ trackSlug: string; levelSlug: string }> {
  return tracks.flatMap((track) =>
    track.levels.map((level) => ({
      trackSlug: track.slug,
      levelSlug: level.slug,
    })),
  );
}

export function findCommandTrack(command: string): { track: Track; level: Level } | undefined {
  for (const track of tracks) {
    for (const level of track.levels) {
      if (level.availableCommands.includes(command)) {
        return { track, level };
      }
    }
  }
  return undefined;
}

export type { Track, Level, Task, TaskValidation } from "./types";
