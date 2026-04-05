"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import { findTrackBySlug } from "@/lib/tracks";
import { loadProgress, ProgressData } from "@/lib/progress";
import { TrackIcon } from "@/lib/level-icons";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LevelList } from "@/components/track/LevelList";

function useProgress(trackSlug: string) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => setProgress(loadProgress()));
    return () => cancelAnimationFrame(id);
  }, [trackSlug]);
  return progress;
}

export default function TrackOverviewClient({
  params,
}: {
  params: Promise<{ "track-slug": string }>;
}) {
  const { "track-slug": slug } = use(params);
  const track = findTrackBySlug(slug);

  if (!track) notFound();

  const progress = useProgress(track.slug);
  const [prereqDismissed, setPrereqDismissed] = useState(false);

  const trackProgress = progress?.tracks[track.slug] ?? {
    completedLevels: [],
    taskProgress: {},
  };

  // Progress bar
  const totalLevels = track.levels.length;
  const completedCount = trackProgress.completedLevels.length;
  const progressPercent = totalLevels > 0 ? Math.round((completedCount / totalLevels) * 100) : 0;

  // Prerequisite check
  const incompletePrereqs = track.prerequisites.filter((prereqSlug) => {
    const prereqTrack = findTrackBySlug(prereqSlug);
    if (!prereqTrack || prereqTrack.levels.length === 0) return false;
    const prereqProgress = progress?.tracks[prereqSlug];
    if (!prereqProgress) return true;
    return prereqProgress.completedLevels.length < prereqTrack.levels.length;
  });

  const hasComingSoon = track.levels.length === 0;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-card-border max-w-[1400px] mx-auto w-full">
        <Link
          href="/"
          className="text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={12} strokeWidth={1.5} />
          All tracks
        </Link>
        <ThemeToggle />
      </nav>

      <div className="max-w-2xl mx-auto w-full px-6 py-10">
        {/* Track header */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${track.color}15`, border: `1px solid ${track.color}30` }}
          >
            <span style={{ color: track.color }}>
              <TrackIcon trackSlug={track.slug} size={22} />
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-bright tracking-tight">{track.title}</h1>
            <p className="text-sm text-text-muted mt-0.5">{track.subtitle}</p>
          </div>
        </div>

        {/* Progress bar */}
        {!hasComingSoon && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-text-muted">
                {completedCount}/{totalLevels} levels completed
              </span>
              <span className="text-xs text-text-muted">{progressPercent}%</span>
            </div>
            <div className="h-1.5 bg-card-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: track.color,
                }}
              />
            </div>
          </div>
        )}

        {/* Prerequisite nudge */}
        {incompletePrereqs.length > 0 && !prereqDismissed && (
          <div className="mb-6 p-4 rounded-xl border border-warning/20 bg-warning/5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-text-bright font-medium mb-1">
                  Recommended prerequisites
                </p>
                <p className="text-xs text-text-muted leading-relaxed">
                  This track builds on{" "}
                  {incompletePrereqs.map((prereqSlug, i) => {
                    const prereqTrack = findTrackBySlug(prereqSlug);
                    return (
                      <span key={prereqSlug}>
                        {i > 0 && (i === incompletePrereqs.length - 1 ? " and " : ", ")}
                        <Link
                          href={`/track/${prereqSlug}`}
                          className="text-accent hover:underline font-medium"
                        >
                          {prereqTrack?.title ?? prereqSlug}
                        </Link>
                      </span>
                    );
                  })}
                  . Complete {incompletePrereqs.length === 1 ? "it" : "them"} first for the best
                  experience.
                </p>
              </div>
              <button
                onClick={() => setPrereqDismissed(true)}
                className="shrink-0 p-1 text-text-muted hover:text-text transition-colors"
                aria-label="Dismiss"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-text-muted leading-relaxed mb-8">{track.description}</p>

        {/* Level list or coming soon */}
        {hasComingSoon ? (
          <div className="text-center py-16 text-text-muted">
            <p className="text-sm">Coming soon — this track is under development.</p>
          </div>
        ) : (
          <LevelList
            trackSlug={track.slug}
            levels={track.levels}
            completedLevels={trackProgress.completedLevels}
            taskProgress={trackProgress.taskProgress}
          />
        )}
      </div>
    </div>
  );
}
