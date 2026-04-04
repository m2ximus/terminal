const STORAGE_KEY = "tryterminal-progress";

export interface ProgressData {
  completedLevels: number[];
  currentLevel: number;
  taskProgress: Record<number, number>;
  totalCommands: number;
}

const DEFAULT_PROGRESS: ProgressData = {
  completedLevels: [],
  currentLevel: 1,
  taskProgress: {},
  totalCommands: 0,
};

export function loadProgress(): ProgressData {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROGRESS;
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

export function completeLevel(levelId: number): ProgressData {
  const data = loadProgress();
  if (!data.completedLevels.includes(levelId)) {
    data.completedLevels.push(levelId);
  }
  data.currentLevel = Math.max(data.currentLevel, levelId + 1);
  delete data.taskProgress[levelId];
  saveProgress(data);
  return data;
}

export function saveTaskProgress(levelId: number, taskIndex: number): void {
  const data = loadProgress();
  data.taskProgress[levelId] = taskIndex;
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

export function isLevelUnlocked(levelId: number, progress: ProgressData): boolean {
  if (levelId === 1) return true;
  return progress.completedLevels.includes(levelId - 1);
}
