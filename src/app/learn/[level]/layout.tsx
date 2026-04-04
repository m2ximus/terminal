import { levels } from "@/lib/lessons";

export function generateStaticParams() {
  return levels.map((level) => ({ level: level.slug }));
}

export default function LevelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
