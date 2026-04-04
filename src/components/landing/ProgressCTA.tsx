"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { levels } from "@/lib/lessons";
import { loadProgress, isLevelUnlocked, ProgressData } from "@/lib/progress";

function useProgress() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  useEffect(() => {
    setProgress(loadProgress());
  }, []);
  return progress;
}

function getNextLevel(progress: ProgressData | null) {
  if (!progress) return levels[0];
  return (
    levels.find(
      (l) => !progress.completedLevels.includes(l.id) && isLevelUnlocked(l.id, progress),
    ) ?? levels[0]
  );
}

export function ProgressCTA({ variant }: { variant: "nav" | "hero" | "cta" }) {
  const progress = useProgress();
  const nextLevel = getNextLevel(progress);
  const completedCount = progress?.completedLevels.length ?? 0;

  if (variant === "nav") {
    return (
      <Link
        href={`/learn/${nextLevel.slug}`}
        className="bg-accent hover:bg-accent-hover text-black font-bold py-1.5 px-4 rounded-lg transition-colors text-xs active:scale-[0.98]"
      >
        {completedCount > 0 ? "Continue" : "Start"}
      </Link>
    );
  }

  if (variant === "hero") {
    return (
      <Link
        href={`/learn/${nextLevel.slug}`}
        className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-black font-bold py-3 px-7 rounded-lg transition-colors text-sm active:scale-[0.98]"
      >
        {completedCount > 0 ? `Continue Level ${nextLevel.id}` : "Start Learning"}
        <ArrowRight size={14} strokeWidth={2} />
      </Link>
    );
  }

  // variant === "cta"
  return (
    <Link
      href={`/learn/${nextLevel.slug}`}
      className="inline-flex items-center gap-2 bg-claude hover:bg-claude-hover text-white font-bold py-3 px-8 rounded-lg transition-colors text-sm active:scale-[0.98]"
    >
      {completedCount > 0 ? `Continue Level ${nextLevel.id}` : "Start Level 1"}
      <ArrowRight size={14} strokeWidth={2} />
    </Link>
  );
}
