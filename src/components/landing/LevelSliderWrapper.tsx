"use client";

import { useEffect, useState } from "react";
import { levels as allLevels } from "@/lib/lessons";
import { loadProgress, isLevelUnlocked, ProgressData } from "@/lib/progress";
import { LevelSlider } from "./LevelSlider";

export function LevelSliderWrapper() {
  const [progress, setProgress] = useState<ProgressData | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const nextLevel = progress
    ? (allLevels.find(
        (l) => !progress.completedLevels.includes(l.id) && isLevelUnlocked(l.id, progress),
      ) ?? allLevels[0])
    : allLevels[0];

  return <LevelSlider levels={allLevels} progress={progress} nextLevelId={nextLevel.id} />;
}
