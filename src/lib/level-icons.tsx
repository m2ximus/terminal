import {
  Compass,
  Navigation,
  Hammer,
  FolderCog,
  BookOpen,
  Search,
  Zap,
  Bot,
} from "lucide-react";

// Map level IDs to Lucide icon components
export const LEVEL_ICONS: Record<number, typeof Compass> = {
  1: Compass,
  2: Navigation,
  3: Hammer,
  4: FolderCog,
  5: BookOpen,
  6: Search,
  7: Zap,
  8: Bot,
};

export function LevelIcon({
  levelId,
  size = 24,
  className = "",
}: {
  levelId: number;
  size?: number;
  className?: string;
}) {
  const Icon = LEVEL_ICONS[levelId] || Compass;
  return <Icon size={size} strokeWidth={1.5} className={className} />;
}
