import { Level } from "./types";
import { level1 } from "./levels/level-1";
import { level2 } from "./levels/level-2";
import { level3 } from "./levels/level-3";
import { level4 } from "./levels/level-4";
import { level5 } from "./levels/level-5";
import { level6 } from "./levels/level-6";
import { level7 } from "./levels/level-7";
import { level8 } from "./levels/level-8";

export const levels: Level[] = [
  level1,
  level2,
  level3,
  level4,
  level5,
  level6,
  level7,
  level8,
];

export function getLevelBySlug(slug: string): Level | undefined {
  return levels.find((l) => l.slug === slug);
}
