"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { findLevelInTrack } from "@/lib/tracks";
import { LessonShell } from "@/components/lesson/LessonShell";

export default function LessonClient({
  params,
}: {
  params: Promise<{ "track-slug": string; level: string }>;
}) {
  const { "track-slug": trackSlug, level: levelSlug } = use(params);
  const result = findLevelInTrack(trackSlug, levelSlug);

  if (!result) notFound();

  const { track, level, index } = result;
  const nextLevel = track.levels[index + 1] ?? null;

  return (
    <LessonShell
      level={level}
      trackSlug={track.slug}
      trackTitle={track.title}
      nextLevel={nextLevel}
    />
  );
}
