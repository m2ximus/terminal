import { Track } from "@/lib/tracks";
import { findTrackBySlug } from "@/lib/tracks";
import { ProgressData } from "@/lib/progress";
import { TrackCard } from "./TrackCard";

interface TrackGridProps {
  tracks: Track[];
  progress: ProgressData | null;
}

function isTrackComplete(trackSlug: string, progress: ProgressData | null): boolean {
  if (!progress) return false;
  const track = findTrackBySlug(trackSlug);
  if (!track || track.levels.length === 0) return false;
  const completed = progress.tracks[trackSlug]?.completedLevels ?? [];
  return completed.length >= track.levels.length;
}

export function TrackGrid({ tracks, progress }: TrackGridProps) {
  // Build prereq title lookup
  const prereqTitles: Record<string, string> = {};
  for (const track of tracks) {
    prereqTitles[track.slug] = track.title;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tracks.map((track) => {
        const trackProgress = progress?.tracks[track.slug];
        const completedLevels = trackProgress?.completedLevels ?? [];
        const completedCount = completedLevels.length;

        // Find first incomplete level
        const firstIncomplete = track.levels.find((l) => !completedLevels.includes(l.slug));
        const firstIncompleteLevelSlug = firstIncomplete?.slug ?? null;

        // Check if all prerequisites are met
        const hasUnmetPrereqs = track.prerequisites.some(
          (prereqSlug) => !isTrackComplete(prereqSlug, progress),
        );

        return (
          <TrackCard
            key={track.slug}
            track={track}
            completedCount={completedCount}
            firstIncompleteLevelSlug={firstIncompleteLevelSlug}
            hasUnmetPrereqs={hasUnmetPrereqs}
            prereqTitles={prereqTitles}
          />
        );
      })}
    </div>
  );
}
