import { describe, it, expect } from "vitest";
import {
  tracks,
  findTrackBySlug,
  findLevelInTrack,
  getAllTrackLevelPairs,
  findCommandTrack,
} from "@/lib/tracks";

describe("tracks", () => {
  it("exports all 6 tracks", () => {
    expect(tracks).toHaveLength(6);
  });

  it("findTrackBySlug returns correct track", () => {
    const track = findTrackBySlug("terminal-basics");
    expect(track).toBeDefined();
    expect(track!.title).toBe("Terminal Basics");
  });

  it("findTrackBySlug returns undefined for unknown slug", () => {
    expect(findTrackBySlug("nonexistent")).toBeUndefined();
  });

  it("findLevelInTrack returns level by slug", () => {
    const result = findLevelInTrack("terminal-basics", "where-am-i");
    expect(result).toBeDefined();
    expect(result!.level.title).toBe("Where Am I?");
    expect(result!.index).toBe(0);
  });

  it("findLevelInTrack returns undefined for unknown level", () => {
    expect(findLevelInTrack("terminal-basics", "nonexistent")).toBeUndefined();
  });

  it("getAllTrackLevelPairs returns all track+level combinations", () => {
    const pairs = getAllTrackLevelPairs();
    expect(pairs.length).toBe(7); // 5 terminal-basics + 2 terminal-advanced
    expect(pairs[0]).toEqual({ trackSlug: "terminal-basics", levelSlug: "where-am-i" });
  });

  it("findCommandTrack locates which track contains a command", () => {
    const result = findCommandTrack("grep");
    expect(result).toBeDefined();
    expect(result!.track.slug).toBe("terminal-advanced");
  });

  it("findCommandTrack returns undefined for unknown commands", () => {
    expect(findCommandTrack("nonexistent-cmd")).toBeUndefined();
  });

  it("terminal-basics has 5 levels with correct slugs", () => {
    const track = findTrackBySlug("terminal-basics")!;
    expect(track.levels.map((l) => l.slug)).toEqual([
      "where-am-i",
      "moving-around",
      "creating-your-world",
      "file-operations",
      "reading-and-writing",
    ]);
  });

  it("terminal-advanced has 2 levels", () => {
    const track = findTrackBySlug("terminal-advanced")!;
    expect(track.levels).toHaveLength(2);
  });
});
