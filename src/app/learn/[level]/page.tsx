import { levels, getLevelBySlug } from "@/lib/lessons";
import LessonClient from "./LessonClient";

export function generateStaticParams() {
  return levels.map((level) => ({ level: level.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ level: string }> }) {
  const { level: slug } = await params;
  const level = getLevelBySlug(slug);
  if (!level) return {};
  return { title: `Level ${level.id}: ${level.title}` };
}

export default function LevelPage({ params }: { params: Promise<{ level: string }> }) {
  return <LessonClient params={params} />;
}
