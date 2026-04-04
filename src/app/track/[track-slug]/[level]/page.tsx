import { getAllTrackLevelPairs, findLevelInTrack } from "@/lib/tracks";
import LessonClient from "./LessonClient";

export function generateStaticParams() {
  return getAllTrackLevelPairs().map(({ trackSlug, levelSlug }) => ({
    "track-slug": trackSlug,
    level: levelSlug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "track-slug": string; level: string }>;
}) {
  const { "track-slug": trackSlug, level: levelSlug } = await params;
  const result = findLevelInTrack(trackSlug, levelSlug);
  if (!result) return {};
  return {
    title: `${result.level.title} — ${result.track.title} — TryTerminal`,
  };
}

export default function LessonPage({
  params,
}: {
  params: Promise<{ "track-slug": string; level: string }>;
}) {
  return <LessonClient params={params} />;
}
