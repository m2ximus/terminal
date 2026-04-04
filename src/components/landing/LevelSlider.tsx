"use client";

import { useRef } from "react";
import Link from "next/link";
import { Level } from "@/lib/lessons/types";
import { ProgressData, isLevelUnlocked } from "@/lib/progress";
import { MatrixCard } from "./MatrixCard";

interface LevelSliderProps {
  levels: Level[];
  progress: ProgressData | null;
  nextLevelId: number;
}

export function LevelSlider({ levels, progress, nextLevelId }: LevelSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 220, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Scroll buttons */}
      <button
        onClick={() => scrollBy(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-bg-elevated border border-card-border flex items-center justify-center text-text-muted hover:text-accent transition-colors -ml-4 hidden md:flex"
      >
        &larr;
      </button>
      <button
        onClick={() => scrollBy(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-bg-elevated border border-card-border flex items-center justify-center text-text-muted hover:text-accent transition-colors -mr-4 hidden md:flex"
      >
        &rarr;
      </button>

      {/* Slider */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto hide-scrollbar px-1 py-2 snap-x snap-mandatory"
      >
        {levels.map((level) => {
          const completed = progress?.completedLevels.includes(level.id) ?? false;
          const unlocked = progress
            ? isLevelUnlocked(level.id, progress)
            : level.id === 1;
          const isCurrent = nextLevelId === level.id;

          const card = (
            <MatrixCard
              level={level}
              completed={completed}
              unlocked={unlocked}
              isCurrent={isCurrent}
            />
          );

          if (unlocked) {
            return (
              <Link
                key={level.id}
                href={`/learn/${level.slug}`}
                className="snap-start flex-shrink-0"
              >
                {card}
              </Link>
            );
          }

          return (
            <div key={level.id} className="snap-start flex-shrink-0 cursor-not-allowed">
              {card}
            </div>
          );
        })}
      </div>
    </div>
  );
}
