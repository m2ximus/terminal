const STORAGE_KEY = "tryterminal-progress";

export interface TrackProgress {
  completedLevels: string[];
  taskProgress: Record<string, number>;
}

export interface ProgressData {
  version: 2;
  tracks: Record<string, TrackProgress>;
  totalCommands: number;
}

function defaultProgress(): ProgressData {
  return {
    version: 2,
    tracks: {},
    totalCommands: 0,
  };
}

// v1 → v2 migration mapping: old numeric level id → { trackSlug, levelSlug }
const V1_LEVEL_MAP: Record<number, { track: string; level: string }> = {
  1: { track: "terminal-basics", level: "where-am-i" },
  2: { track: "terminal-basics", level: "moving-around" },
  3: { track: "terminal-basics", level: "creating-your-world" },
  4: { track: "terminal-basics", level: "file-operations" },
  5: { track: "terminal-basics", level: "reading-and-writing" },
  6: { track: "terminal-advanced", level: "finding-things" },
  7: { track: "terminal-advanced", level: "power-user" },
  // level 8 is dropped — no mapping
};

interface V1ProgressData {
  completedLevels: number[];
  currentLevel: number;
  taskProgress: Record<string, number>;
  totalCommands: number;
}

export function migrateV1Progress(v1: V1ProgressData): ProgressData {
  const data: ProgressData = {
    version: 2,
    tracks: {},
    totalCommands: v1.totalCommands || 0,
  };

  for (const levelId of v1.completedLevels) {
    const mapping = V1_LEVEL_MAP[levelId];
    if (!mapping) continue;
    if (!data.tracks[mapping.track]) {
      data.tracks[mapping.track] = { completedLevels: [], taskProgress: {} };
    }
    if (!data.tracks[mapping.track].completedLevels.includes(mapping.level)) {
      data.tracks[mapping.track].completedLevels.push(mapping.level);
    }
  }

  // Migrate task progress
  for (const [levelIdStr, taskIdx] of Object.entries(v1.taskProgress)) {
    const levelId = Number(levelIdStr);
    const mapping = V1_LEVEL_MAP[levelId];
    if (!mapping) continue;
    if (!data.tracks[mapping.track]) {
      data.tracks[mapping.track] = { completedLevels: [], taskProgress: {} };
    }
    data.tracks[mapping.track].taskProgress[mapping.level] = taskIdx;
  }

  return data;
}

export function loadProgress(): ProgressData {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw);

    // Detect v1 format (has completedLevels as array of numbers, no version field)
    if (!parsed.version && Array.isArray(parsed.completedLevels)) {
      const migrated = migrateV1Progress(parsed as V1ProgressData);
      saveProgress(migrated);
      return migrated;
    }

    return { ...defaultProgress(), ...parsed };
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(data: ProgressData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage might be full or unavailable
  }
}

function ensureTrack(data: ProgressData, trackSlug: string): TrackProgress {
  if (!data.tracks[trackSlug]) {
    data.tracks[trackSlug] = { completedLevels: [], taskProgress: {} };
  }
  return data.tracks[trackSlug];
}

export function completeLevel(trackSlug: string, levelSlug: string): ProgressData {
  const data = loadProgress();
  const track = ensureTrack(data, trackSlug);
  if (!track.completedLevels.includes(levelSlug)) {
    track.completedLevels.push(levelSlug);
  }
  delete track.taskProgress[levelSlug];
  saveProgress(data);
  return data;
}

export function saveTaskProgress(trackSlug: string, levelSlug: string, taskIndex: number): void {
  const data = loadProgress();
  const track = ensureTrack(data, trackSlug);
  track.taskProgress[levelSlug] = taskIndex;
  saveProgress(data);
}

export function incrementCommands(): void {
  const data = loadProgress();
  data.totalCommands++;
  saveProgress(data);
}

export function resetProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getTrackProgress(
  trackSlug: string,
  totalLevels: number,
): { completed: number; total: number; percent: number } {
  const data = loadProgress();
  const track = data.tracks[trackSlug];
  const completed = track?.completedLevels.length ?? 0;
  return {
    completed,
    total: totalLevels,
    percent: totalLevels > 0 ? Math.round((completed / totalLevels) * 100) : 0,
  };
}
