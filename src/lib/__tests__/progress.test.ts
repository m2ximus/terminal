import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  loadProgress,
  saveProgress,
  completeLevel,
  saveTaskProgress,
  incrementCommands,
  resetProgress,
  getTrackProgress,
  migrateV1Progress,
  type ProgressData,
} from "../progress";

describe("progress", () => {
  beforeEach(() => {
    // Create a fresh localStorage mock for each test
    const store: Record<string, string> = {};
    const mock = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach((k) => delete store[k]);
      },
      length: 0,
      key: (): string | null => null,
    };
    // @ts-expect-error - minimal window mock for testing
    globalThis.window = { localStorage: mock };
    globalThis.localStorage = mock;
  });

  afterEach(() => {
    // @ts-expect-error - cleanup
    delete globalThis.window;
    // @ts-expect-error - cleanup
    delete globalThis.localStorage;
    vi.restoreAllMocks();
  });

  describe("loadProgress", () => {
    it("returns default progress when nothing stored", () => {
      const data = loadProgress();
      expect(data).toEqual({ version: 2, tracks: {}, totalCommands: 0 });
    });

    it("loads stored progress", () => {
      const stored: ProgressData = {
        version: 2,
        tracks: {
          "terminal-basics": { completedLevels: ["where-am-i"], taskProgress: {} },
        },
        totalCommands: 5,
      };
      localStorage.setItem("tryterminal-progress", JSON.stringify(stored));
      const data = loadProgress();
      expect(data.tracks["terminal-basics"].completedLevels).toEqual(["where-am-i"]);
      expect(data.totalCommands).toBe(5);
    });
  });

  describe("saveProgress", () => {
    it("persists progress to localStorage", () => {
      const data: ProgressData = {
        version: 2,
        tracks: { git: { completedLevels: ["init"], taskProgress: {} } },
        totalCommands: 3,
      };
      saveProgress(data);
      const saved = JSON.parse(localStorage.getItem("tryterminal-progress")!);
      expect(saved).toEqual(data);
    });
  });

  describe("completeLevel", () => {
    it("adds level to completed list and removes task progress", () => {
      saveTaskProgress("terminal-basics", "where-am-i", 2);
      const result = completeLevel("terminal-basics", "where-am-i");
      expect(result.tracks["terminal-basics"].completedLevels).toContain("where-am-i");
      expect(result.tracks["terminal-basics"].taskProgress["where-am-i"]).toBeUndefined();
    });

    it("does not duplicate completed levels", () => {
      completeLevel("terminal-basics", "where-am-i");
      const result = completeLevel("terminal-basics", "where-am-i");
      const count = result.tracks["terminal-basics"].completedLevels.filter(
        (l) => l === "where-am-i",
      ).length;
      expect(count).toBe(1);
    });

    it("creates track entry if it does not exist", () => {
      const result = completeLevel("git", "init");
      expect(result.tracks["git"]).toBeDefined();
      expect(result.tracks["git"].completedLevels).toContain("init");
    });
  });

  describe("saveTaskProgress", () => {
    it("saves task index for a level in a track", () => {
      saveTaskProgress("terminal-basics", "moving-around", 3);
      const data = loadProgress();
      expect(data.tracks["terminal-basics"].taskProgress["moving-around"]).toBe(3);
    });
  });

  describe("incrementCommands", () => {
    it("increments total command count", () => {
      incrementCommands();
      incrementCommands();
      incrementCommands();
      const data = loadProgress();
      expect(data.totalCommands).toBe(3);
    });
  });

  describe("resetProgress", () => {
    it("removes progress from localStorage", () => {
      saveTaskProgress("terminal-basics", "where-am-i", 1);
      resetProgress();
      const data = loadProgress();
      expect(data.tracks).toEqual({});
    });
  });

  describe("getTrackProgress", () => {
    it("returns zero progress for unknown track", () => {
      const result = getTrackProgress("unknown", 5);
      expect(result).toEqual({ completed: 0, total: 5, percent: 0 });
    });

    it("calculates correct percentage", () => {
      completeLevel("terminal-basics", "where-am-i");
      completeLevel("terminal-basics", "moving-around");
      const result = getTrackProgress("terminal-basics", 5);
      expect(result).toEqual({ completed: 2, total: 5, percent: 40 });
    });

    it("handles zero total levels", () => {
      const result = getTrackProgress("empty", 0);
      expect(result.percent).toBe(0);
    });
  });

  describe("migrateV1Progress", () => {
    it("maps old numeric levels to track slugs", () => {
      const v1 = {
        completedLevels: [1, 2, 3, 6],
        currentLevel: 7,
        taskProgress: { "4": 2 },
        totalCommands: 42,
      };
      const result = migrateV1Progress(v1);
      expect(result.version).toBe(2);
      expect(result.totalCommands).toBe(42);
      expect(result.tracks["terminal-basics"].completedLevels).toEqual([
        "where-am-i",
        "moving-around",
        "creating-your-world",
      ]);
      expect(result.tracks["terminal-advanced"].completedLevels).toEqual(["finding-things"]);
      expect(result.tracks["terminal-basics"].taskProgress["file-operations"]).toBe(2);
    });

    it("drops level 8 (no mapping)", () => {
      const v1 = {
        completedLevels: [8],
        currentLevel: 9,
        taskProgress: {},
        totalCommands: 10,
      };
      const result = migrateV1Progress(v1);
      expect(Object.keys(result.tracks)).toHaveLength(0);
    });

    it("auto-migrates v1 data on load", () => {
      const v1 = {
        completedLevels: [1, 2],
        currentLevel: 3,
        taskProgress: {},
        totalCommands: 15,
      };
      localStorage.setItem("tryterminal-progress", JSON.stringify(v1));
      const data = loadProgress();
      expect(data.version).toBe(2);
      expect(data.tracks["terminal-basics"].completedLevels).toEqual([
        "where-am-i",
        "moving-around",
      ]);
      // Verify it was persisted back (migration saves)
      const persisted = JSON.parse(localStorage.getItem("tryterminal-progress")!);
      expect(persisted.version).toBe(2);
    });
  });
});
