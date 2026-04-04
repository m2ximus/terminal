import { tracks, findTrackBySlug } from "@/lib/tracks";
import TrackOverviewClient from "./TrackOverviewClient";

export function generateStaticParams() {
  return tracks.map((track) => ({ "track-slug": track.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ "track-slug": string }> }) {
  const { "track-slug": slug } = await params;
  const track = findTrackBySlug(slug);
  if (!track) return {};
  return {
    title: `${track.title} — TryTerminal`,
    description: track.description,
  };
}

export default function TrackPage({ params }: { params: Promise<{ "track-slug": string }> }) {
  return <TrackOverviewClient params={params} />;
}
