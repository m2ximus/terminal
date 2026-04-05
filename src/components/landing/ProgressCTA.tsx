"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { tracks } from "@/lib/tracks";
import { loadProgress, ProgressData } from "@/lib/progress";

function useProgress() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => setProgress(loadProgress()));
    return () => cancelAnimationFrame(id);
  }, []);
  return progress;
}

const DEFAULT_HREF = "/track/terminal-basics/where-am-i";

function getNextHref(progress: ProgressData | null): { href: string; hasProgress: boolean } {
  if (!progress) return { href: DEFAULT_HREF, hasProgress: false };

  // Check if user has any progress at all
  const hasProgress = Object.values(progress.tracks).some(
    (tp) => tp.completedLevels.length > 0 || Object.keys(tp.taskProgress).length > 0,
  );

  // Find first track with incomplete levels
  for (const track of tracks) {
    if (track.levels.length === 0) continue;
    const trackProgress = progress.tracks[track.slug];
    const completedLevels = trackProgress?.completedLevels ?? [];

    const firstIncomplete = track.levels.find((l) => !completedLevels.includes(l.slug));
    if (firstIncomplete) {
      return { href: `/track/${track.slug}/${firstIncomplete.slug}`, hasProgress };
    }
  }

  // All tracks complete — link back to first level
  return { href: DEFAULT_HREF, hasProgress };
}

export function ProgressCTA({ variant }: { variant: "nav" | "hero" | "cta" }) {
  const progress = useProgress();
  const { href, hasProgress } = getNextHref(progress);

  if (variant === "nav") {
    return (
      <Link
        href={href}
        className="bg-accent hover:bg-accent-hover text-black font-bold py-1.5 px-4 rounded-lg transition-colors text-xs active:scale-[0.98]"
      >
        {hasProgress ? "Continue" : "Start"}
      </Link>
    );
  }

  if (variant === "hero") {
    return (
      <Link
        href={href}
        className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-black font-bold py-3 px-7 rounded-lg transition-colors text-sm active:scale-[0.98]"
      >
        {hasProgress ? "Continue Learning" : "Start Learning"}
        <ArrowRight size={14} strokeWidth={2} />
      </Link>
    );
  }

  // variant === "cta"
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 bg-claude hover:bg-claude-hover text-white font-bold py-3 px-8 rounded-lg transition-colors text-sm active:scale-[0.98]"
    >
      {hasProgress ? "Continue Learning" : "Start Learning"}
      <ArrowRight size={14} strokeWidth={2} />
    </Link>
  );
}
