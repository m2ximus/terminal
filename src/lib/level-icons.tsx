import {
  Compass,
  Navigation,
  Hammer,
  FolderCog,
  BookOpen,
  Search,
  Zap,
  Bot,
  GitBranch,
  Puzzle,
  Settings,
  type LucideIcon,
} from "lucide-react";

const LEVEL_ICONS: Record<string, LucideIcon> = {
  compass: Compass,
  navigation: Navigation,
  hammer: Hammer,
  "folder-cog": FolderCog,
  "book-open": BookOpen,
  search: Search,
  zap: Zap,
  bot: Bot,
  "git-branch": GitBranch,
  puzzle: Puzzle,
  settings: Settings,
};

export function LevelIcon({
  icon,
  size = 24,
  className = "",
}: {
  icon: string;
  size?: number;
  className?: string;
}) {
  const Icon = LEVEL_ICONS[icon] || Compass;
  return <Icon size={size} strokeWidth={1.5} className={className} />;
}

const TRACK_ICONS: Record<string, LucideIcon> = {
  "terminal-basics": Compass,
  "terminal-advanced": Zap,
  git: GitBranch,
  "claude-code": Bot,
  "skills-agents": Puzzle,
  "shell-customization": Settings,
};

export function TrackIcon({
  trackSlug,
  size = 24,
  className = "",
}: {
  trackSlug: string;
  size?: number;
  className?: string;
}) {
  const Icon = TRACK_ICONS[trackSlug] || Compass;
  return <Icon size={size} strokeWidth={1.5} className={className} />;
}
