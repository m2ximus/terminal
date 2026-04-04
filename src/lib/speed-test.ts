import { VirtualFS, HOME } from "@/lib/filesystem/VirtualFS";

export interface Challenge {
  id: string;
  prompt: string; // What to tell the user
  check: (fs: VirtualFS, command: string, args: string[]) => boolean;
  difficulty: "easy" | "medium" | "hard";
}

// ── Challenges pool ──

const EASY_CHALLENGES: Challenge[] = [
  {
    id: "e1",
    prompt: "Print your current directory",
    check: (_fs, cmd) => cmd === "pwd",
    difficulty: "easy",
  },
  {
    id: "e2",
    prompt: "List the files in your current folder",
    check: (_fs, cmd) => cmd === "ls",
    difficulty: "easy",
  },
  {
    id: "e3",
    prompt: "Clear the terminal screen",
    check: (_fs, cmd) => cmd === "clear",
    difficulty: "easy",
  },
  {
    id: "e4",
    prompt: "Go to your home folder",
    check: (fs) => fs.cwd === HOME,
    difficulty: "easy",
  },
  {
    id: "e5",
    prompt: "Go into the Documents folder",
    check: (fs) => fs.cwd === `${HOME}/Documents`,
    difficulty: "easy",
  },
  {
    id: "e6",
    prompt: "Go back up one directory",
    check: (_fs, cmd, args) => cmd === "cd" && args[0] === "..",
    difficulty: "easy",
  },
  {
    id: "e7",
    prompt: "Create a folder called 'test'",
    check: (fs) => fs.exists(fs.resolvePath("test")),
    difficulty: "easy",
  },
  {
    id: "e8",
    prompt: "Create an empty file called 'hello.txt'",
    check: (fs) => fs.exists(fs.resolvePath("hello.txt")),
    difficulty: "easy",
  },
];

const MEDIUM_CHALLENGES: Challenge[] = [
  {
    id: "m1",
    prompt: "List all files including hidden ones in long format",
    check: (_fs, cmd, args) => cmd === "ls" && args.join("").includes("-la"),
    difficulty: "medium",
  },
  {
    id: "m2",
    prompt: "Create nested folders: projects/src/components",
    check: (fs) => fs.exists(fs.resolvePath("projects/src/components")),
    difficulty: "medium",
  },
  {
    id: "m3",
    prompt: 'Write "hello world" into a file called greeting.txt',
    check: (fs) => {
      try {
        return fs.readFile(fs.resolvePath("greeting.txt")).toLowerCase().includes("hello world");
      } catch { return false; }
    },
    difficulty: "medium",
  },
  {
    id: "m4",
    prompt: "Copy greeting.txt to backup.txt",
    check: (fs) => fs.exists(fs.resolvePath("backup.txt")),
    difficulty: "medium",
  },
  {
    id: "m5",
    prompt: "Rename backup.txt to archive.txt",
    check: (fs) => fs.exists(fs.resolvePath("archive.txt")) && !fs.exists(fs.resolvePath("backup.txt")),
    difficulty: "medium",
  },
  {
    id: "m6",
    prompt: "Delete archive.txt",
    check: (fs) => !fs.exists(fs.resolvePath("archive.txt")),
    difficulty: "medium",
  },
  {
    id: "m7",
    prompt: "Read the contents of greeting.txt",
    check: (_fs, cmd, args) => cmd === "cat" && args.some(a => a.includes("greeting")),
    difficulty: "medium",
  },
  {
    id: "m8",
    prompt: "Find where the 'ls' program lives on the system",
    check: (_fs, cmd, args) => cmd === "which" && args.includes("ls"),
    difficulty: "medium",
  },
];

const HARD_CHALLENGES: Challenge[] = [
  {
    id: "h1",
    prompt: 'Find all .txt files in the current directory tree',
    check: (_fs, cmd, args) => cmd === "find" && args.some(a => a.includes("*.txt")),
    difficulty: "hard",
  },
  {
    id: "h2",
    prompt: 'Search for the word "hello" in greeting.txt',
    check: (_fs, cmd, args) => cmd === "grep" && args.some(a => a.toLowerCase().includes("hello")),
    difficulty: "hard",
  },
  {
    id: "h3",
    prompt: "Initialize a git repository",
    check: (fs) => fs.exists(fs.resolvePath(".git")),
    difficulty: "hard",
  },
  {
    id: "h4",
    prompt: "Create a package.json with npm",
    check: (fs) => fs.exists(fs.resolvePath("package.json")),
    difficulty: "hard",
  },
  {
    id: "h5",
    prompt: "Make greeting.txt executable",
    check: (fs) => {
      const n = fs.getNode(fs.resolvePath("greeting.txt"));
      return n ? n.permissions.includes("x") : false;
    },
    difficulty: "hard",
  },
  {
    id: "h6",
    prompt: "Show your command history",
    check: (_fs, cmd) => cmd === "history",
    difficulty: "hard",
  },
  {
    id: "h7",
    prompt: "Stage all files and commit with message 'speed run'",
    check: (_fs, cmd, args) => cmd === "git" && args.includes("commit"),
    difficulty: "hard",
  },
  {
    id: "h8",
    prompt: 'Recursively search for "hello" in the current directory',
    check: (_fs, cmd, args) => cmd === "grep" && (args.includes("-r") || args.includes("-R")),
    difficulty: "hard",
  },
];

export function generateRound(count: number = 10): Challenge[] {
  // Mix of difficulties: 3 easy, 4 medium, 3 hard
  const easy = shuffle(EASY_CHALLENGES).slice(0, 3);
  const medium = shuffle(MEDIUM_CHALLENGES).slice(0, 4);
  const hard = shuffle(HARD_CHALLENGES).slice(0, 3);
  return [...easy, ...medium, ...hard].slice(0, count);
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ── Leaderboard ──

export interface LeaderboardEntry {
  name: string;
  time: number; // ms
  challenges: number;
  date: string;
}

const LB_KEY = "tryterminal-leaderboard";

export function loadLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LB_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveToLeaderboard(entry: LeaderboardEntry): LeaderboardEntry[] {
  const lb = loadLeaderboard();
  lb.push(entry);
  lb.sort((a, b) => a.time - b.time);
  const top20 = lb.slice(0, 20);
  localStorage.setItem(LB_KEY, JSON.stringify(top20));
  return top20;
}
