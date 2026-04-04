import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { Track } from "@/lib/tracks";
import { TrackIcon } from "@/lib/level-icons";

interface TrackCardProps {
  track: Track;
  completedCount: number;
  firstIncompleteLevelSlug: string | null;
  hasUnmetPrereqs: boolean;
  prereqTitles: Record<string, string>;
}

export function TrackCard({
  track,
  completedCount,
  firstIncompleteLevelSlug,
  hasUnmetPrereqs,
  prereqTitles,
}: TrackCardProps) {
  const totalLevels = track.levels.length;
  const isEmpty = totalLevels === 0;
  const isComplete = totalLevels > 0 && completedCount >= totalLevels;
  const percent = totalLevels > 0 ? Math.round((completedCount / totalLevels) * 100) : 0;

  const href = firstIncompleteLevelSlug
    ? `/track/${track.slug}/${firstIncompleteLevelSlug}`
    : `/track/${track.slug}`;

  const isLocked = hasUnmetPrereqs && !isComplete;

  return (
    <div className="group relative flex flex-col rounded-xl border border-card-border bg-card-bg p-5 transition-colors hover:border-white/10">
      {/* Icon + title row */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${track.color}15`, border: `1px solid ${track.color}30` }}
        >
          <TrackIcon
            trackSlug={track.slug}
            size={18}
            className="text-current"
            style={{ color: track.color }}
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-text-bright leading-tight">{track.title}</h3>
          <p className="text-xs text-text-muted mt-0.5 leading-snug">{track.subtitle}</p>
        </div>
      </div>

      {/* Level count + progress */}
      {!isEmpty && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] text-text-muted mb-1.5">
            <span>
              {completedCount}/{totalLevels} levels
            </span>
            {percent > 0 && <span>{percent}%</span>}
          </div>
          <div className="h-1 w-full rounded-full bg-white/5">
            <div
              className="h-1 rounded-full transition-all duration-300"
              style={{ width: `${percent}%`, backgroundColor: track.color }}
            />
          </div>
        </div>
      )}

      {/* Prereq badge */}
      {isLocked && track.prerequisites.length > 0 && (
        <div className="flex items-center gap-1.5 text-[11px] text-text-muted mb-4">
          <Lock size={11} strokeWidth={1.5} />
          <span>
            Requires {track.prerequisites.map((slug) => prereqTitles[slug] ?? slug).join(", ")}
          </span>
        </div>
      )}

      {/* Spacer to push CTA down */}
      <div className="flex-1" />

      {/* CTA */}
      {isEmpty ? (
        <span className="inline-flex items-center text-xs text-text-muted/50 font-medium">
          Coming soon
        </span>
      ) : isLocked ? (
        <span className="inline-flex items-center gap-1.5 text-xs text-text-muted/50 font-medium">
          <Lock size={12} strokeWidth={1.5} />
          Locked
        </span>
      ) : (
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
          style={{ color: track.color }}
        >
          {isComplete ? "Review" : completedCount > 0 ? "Continue" : "Start"}
          <ArrowRight size={12} strokeWidth={2} />
        </Link>
      )}
    </div>
  );
}
