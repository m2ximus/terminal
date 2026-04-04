"use client";

import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { LevelIcon } from "@/lib/level-icons";
import { Level } from "@/lib/tracks/types";

interface LevelListProps {
  trackSlug: string;
  levels: Level[];
  completedLevels: string[];
  taskProgress: Record<string, number>;
}

export function LevelList({ trackSlug, levels, completedLevels, taskProgress }: LevelListProps) {
  const firstIncompleteIndex = levels.findIndex((l) => !completedLevels.includes(l.slug));

  return (
    <div className="flex flex-col gap-2">
      {levels.map((level, i) => {
        const isCompleted = completedLevels.includes(level.slug);
        const isContinue = i === firstIncompleteIndex;
        const inProgressTask = taskProgress[level.slug];
        const totalTasks = level.tasks.length;

        return (
          <Link
            key={level.slug}
            href={`/track/${trackSlug}/${level.slug}`}
            className={`group flex items-center gap-4 p-4 rounded-xl border transition-colors ${
              isContinue
                ? "border-accent/30 bg-accent/5 hover:bg-accent/10"
                : "border-card-border bg-card-bg hover:border-accent/20 hover:bg-bg-elevated"
            }`}
          >
            {/* Status indicator */}
            <div
              className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                isCompleted
                  ? "bg-success/15 text-success"
                  : isContinue
                    ? "bg-accent/15 text-accent"
                    : "bg-card-border/50 text-text-muted"
              }`}
            >
              {isCompleted ? (
                <Check size={16} strokeWidth={2} />
              ) : (
                <LevelIcon icon={level.icon} size={16} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-bright truncate">{level.title}</span>
                {isContinue && (
                  <span className="shrink-0 text-[10px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                    Continue
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted truncate mt-0.5">{level.subtitle}</p>
              {/* Task progress */}
              {(isCompleted || inProgressTask !== undefined) && (
                <p className="text-[10px] text-text-muted mt-1">
                  {isCompleted
                    ? `${totalTasks}/${totalTasks} tasks`
                    : `${inProgressTask}/${totalTasks} tasks`}
                </p>
              )}
            </div>

            {/* Chevron */}
            <ChevronRight
              size={16}
              strokeWidth={1.5}
              className="shrink-0 text-text-muted group-hover:text-accent transition-colors"
            />
          </Link>
        );
      })}
    </div>
  );
}
