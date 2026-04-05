import { FSNode, FSFile, FSDirectory } from "./types";
import { HOME } from "./VirtualFS";

const now = Date.now();

function dir(name: string): FSDirectory {
  return { name, type: "directory", permissions: "rwxr-xr-x", createdAt: now, modifiedAt: now };
}

function file(name: string, content: string, permissions = "rw-r--r--"): FSFile {
  return { name, type: "file", permissions, content, createdAt: now, modifiedAt: now };
}

function buildFS(entries: Record<string, FSNode>): Map<string, FSNode> {
  const map = new Map<string, FSNode>();
  // Always include root and user directories
  map.set("/", dir(""));
  map.set("/Users", dir("Users"));
  map.set(HOME, dir("learner"));
  for (const [path, node] of Object.entries(entries)) {
    map.set(path, node);
  }
  return map;
}

// ── Level 1: Where Am I? ──
export function createLevel1FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/Desktop`]: dir("Desktop"),
    [`${HOME}/Documents`]: dir("Documents"),
    [`${HOME}/Downloads`]: dir("Downloads"),
    [`${HOME}/Music`]: dir("Music"),
    [`${HOME}/Pictures`]: dir("Pictures"),
    [`${HOME}/.zshrc`]: file(".zshrc", "# Zsh configuration\nexport PATH=$PATH:/usr/local/bin\n"),
    [`${HOME}/.gitconfig`]: file(
      ".gitconfig",
      "[user]\n  name = learner\n  email = learner@example.com\n",
    ),
    [`${HOME}/Documents/notes.txt`]: file(
      "notes.txt",
      "Welcome to Try Terminal!\nThis is your first text file.\n",
    ),
    [`${HOME}/Documents/todo.txt`]: file(
      "todo.txt",
      "1. Learn terminal basics\n2. Install Claude Code\n3. Build something amazing\n",
    ),
    [`${HOME}/Downloads/photo.jpg`]: file("photo.jpg", "[image data]"),
    [`${HOME}/Pictures/vacation.jpg`]: file("vacation.jpg", "[image data]"),
  });
}

// ── Level 2: Moving Around ──
export function createLevel2FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/Desktop`]: dir("Desktop"),
    [`${HOME}/Documents`]: dir("Documents"),
    [`${HOME}/Downloads`]: dir("Downloads"),
    [`${HOME}/Music`]: dir("Music"),
    [`${HOME}/Pictures`]: dir("Pictures"),
    [`${HOME}/Documents/work`]: dir("work"),
    [`${HOME}/Documents/personal`]: dir("personal"),
    [`${HOME}/Documents/work/report.txt`]: file(
      "report.txt",
      "Q4 Report\n=========\nRevenue is up 15%.\n",
    ),
    [`${HOME}/Documents/work/data.csv`]: file(
      "data.csv",
      "name,age,city\nAlice,30,NYC\nBob,25,LA\n",
    ),
    [`${HOME}/Documents/personal/diary.txt`]: file(
      "diary.txt",
      "Dear diary,\nToday I learned about terminal!\n",
    ),
    [`${HOME}/Desktop/readme.txt`]: file("readme.txt", "This is your desktop.\n"),
    [`${HOME}/Downloads/app.dmg`]: file("app.dmg", "[binary data]"),
  });
}

// ── Level 3: Creating Your World ──
export function createLevel3FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/Desktop`]: dir("Desktop"),
    [`${HOME}/Documents`]: dir("Documents"),
    [`${HOME}/Downloads`]: dir("Downloads"),
  });
}

// ── Level 4: File Operations ──
export function createLevel4FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/Desktop`]: dir("Desktop"),
    [`${HOME}/Documents`]: dir("Documents"),
    [`${HOME}/Downloads`]: dir("Downloads"),
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/app`]: dir("app"),
    [`${HOME}/projects/app/index.html`]: file(
      "index.html",
      "<!DOCTYPE html>\n<html>\n<body>Hello World</body>\n</html>\n",
    ),
    [`${HOME}/projects/app/style.css`]: file("style.css", "body { font-family: sans-serif; }\n"),
    [`${HOME}/Documents/notes.txt`]: file("notes.txt", "Important notes\n"),
    [`${HOME}/Documents/old-file.txt`]: file("old-file.txt", "This file is no longer needed.\n"),
    [`${HOME}/Downloads/image.png`]: file("image.png", "[image data]"),
  });
}

// ── Level 5: Reading & Writing ──
export function createLevel5FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/Desktop`]: dir("Desktop"),
    [`${HOME}/Documents`]: dir("Documents"),
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/mysite`]: dir("mysite"),
    [`${HOME}/projects/mysite/index.html`]: file(
      "index.html",
      "<!DOCTYPE html>\n<html>\n<head><title>My Site</title></head>\n<body>\n<h1>Welcome</h1>\n<p>This is my website.</p>\n</body>\n</html>\n",
    ),
    [`${HOME}/projects/mysite/style.css`]: file(
      "style.css",
      "body {\n  font-family: sans-serif;\n  background: #f0f0f0;\n  color: #333;\n}\n\nh1 {\n  color: navy;\n}\n",
    ),
    [`${HOME}/projects/mysite/app.js`]: file(
      "app.js",
      "console.log('Hello from app.js');\n\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n",
    ),
    [`${HOME}/Documents/log.txt`]: file(
      "log.txt",
      Array.from(
        { length: 20 },
        (_, i) => `[${String(i + 1).padStart(2, "0")}] Log entry number ${i + 1}`,
      ).join("\n") + "\n",
    ),
  });
}

// ── Level 6: Finding Things ──
export function createLevel6FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/Desktop`]: dir("Desktop"),
    [`${HOME}/Documents`]: dir("Documents"),
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/webapp`]: dir("webapp"),
    [`${HOME}/projects/webapp/src`]: dir("src"),
    [`${HOME}/projects/webapp/src/index.js`]: file(
      "index.js",
      "import { App } from './App';\n\nconst root = document.getElementById('root');\n// TODO: Add error handling\n",
    ),
    [`${HOME}/projects/webapp/src/App.js`]: file(
      "App.js",
      "export function App() {\n  // TODO: Implement main app\n  return '<div>Hello</div>';\n}\n",
    ),
    [`${HOME}/projects/webapp/src/utils.js`]: file(
      "utils.js",
      "export function formatDate(date) {\n  return date.toLocaleDateString();\n}\n\n// TODO: Add more utilities\n",
    ),
    [`${HOME}/projects/webapp/README.md`]: file(
      "README.md",
      "# Web App\n\nA simple web application.\n\n## Getting Started\n\nRun `npm start` to begin.\n",
    ),
    [`${HOME}/projects/webapp/package.json`]: file(
      "package.json",
      '{\n  "name": "webapp",\n  "version": "1.0.0",\n  "scripts": {\n    "start": "node src/index.js"\n  }\n}\n',
    ),
    [`${HOME}/Documents/notes.txt`]: file(
      "notes.txt",
      "Meeting notes:\n- Review TODO items\n- Plan next sprint\n- TODO: Follow up with team\n",
    ),
  });
}

// ── Level 7: Power User ──
export function createLevel7FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/Desktop`]: dir("Desktop"),
    [`${HOME}/Documents`]: dir("Documents"),
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/scripts`]: dir("scripts"),
    [`${HOME}/scripts/deploy.sh`]: file(
      "deploy.sh",
      "#!/bin/bash\necho 'Deploying...'\nnpm run build\necho 'Done!'\n",
      "rw-r--r--",
    ),
    [`${HOME}/scripts/backup.sh`]: file(
      "backup.sh",
      "#!/bin/bash\necho 'Backing up...'\ncp -r ~/projects ~/backup\necho 'Backup complete!'\n",
      "rw-r--r--",
    ),
    [`${HOME}/projects/config.json`]: file(
      "config.json",
      '{\n  "port": 3000,\n  "debug": true\n}\n',
    ),
    [`${HOME}/.zshrc`]: file(
      ".zshrc",
      "# Zsh configuration\nexport PATH=$PATH:/usr/local/bin\nalias ll='ls -la'\nalias gs='git status'\n",
    ),
  });
}

// ── Level 8: Ready for Claude Code ──
export function createLevel8FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/Desktop`]: dir("Desktop"),
    [`${HOME}/Documents`]: dir("Documents"),
    [`${HOME}/projects`]: dir("projects"),
  });
}

// ── Git Level 1: First Repository (no .git/) ──
export function createGitLevel1FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/portfolio`]: dir("portfolio"),
    [`${HOME}/projects/portfolio/index.html`]: file(
      "index.html",
      '<!DOCTYPE html>\n<html>\n<head><title>My Portfolio</title>\n<link rel="stylesheet" href="style.css">\n</head>\n<body>\n<h1>Welcome to my portfolio</h1>\n<p>Projects coming soon!</p>\n<script src="app.js"></script>\n</body>\n</html>\n',
    ),
    [`${HOME}/projects/portfolio/style.css`]: file(
      "style.css",
      "body {\n  font-family: sans-serif;\n  margin: 2rem;\n  background: #fafafa;\n}\n\nh1 {\n  color: #333;\n}\n",
    ),
    [`${HOME}/projects/portfolio/app.js`]: file(
      "app.js",
      "document.addEventListener('DOMContentLoaded', () => {\n  console.log('Portfolio loaded');\n});\n",
    ),
  });
}

// ── Git Level 2: Tracking Changes (.git/ initialized, files untracked) ──
export function createGitLevel2FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/portfolio`]: dir("portfolio"),
    [`${HOME}/projects/portfolio/.git`]: dir(".git"),
    [`${HOME}/projects/portfolio/.git/refs`]: dir("refs"),
    [`${HOME}/projects/portfolio/.git/refs/heads`]: dir("heads"),
    [`${HOME}/projects/portfolio/.git/HEAD`]: file("HEAD", "ref: refs/heads/main\n"),
    [`${HOME}/projects/portfolio/.git/index`]: file("index", ""),
    [`${HOME}/projects/portfolio/.git/logs`]: file("logs", "[]"),
    [`${HOME}/projects/portfolio/.git/config`]: file(
      "config",
      "[core]\n  repositoryformatversion = 0\n",
    ),
    [`${HOME}/projects/portfolio/.git/refs/heads/main`]: file("main", ""),
    [`${HOME}/projects/portfolio/index.html`]: file(
      "index.html",
      '<!DOCTYPE html>\n<html>\n<head><title>My Portfolio</title>\n<link rel="stylesheet" href="style.css">\n</head>\n<body>\n<h1>Welcome to my portfolio</h1>\n<p>Projects coming soon!</p>\n<script src="app.js"></script>\n</body>\n</html>\n',
    ),
    [`${HOME}/projects/portfolio/style.css`]: file(
      "style.css",
      "body {\n  font-family: sans-serif;\n  margin: 2rem;\n  background: #fafafa;\n}\n\nh1 {\n  color: #333;\n}\n",
    ),
    [`${HOME}/projects/portfolio/app.js`]: file(
      "app.js",
      "document.addEventListener('DOMContentLoaded', () => {\n  console.log('Portfolio loaded');\n});\n",
    ),
  });
}

// ── Git Level 3: Making History (files already staged) ──
export function createGitLevel3FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/portfolio`]: dir("portfolio"),
    [`${HOME}/projects/portfolio/.git`]: dir(".git"),
    [`${HOME}/projects/portfolio/.git/refs`]: dir("refs"),
    [`${HOME}/projects/portfolio/.git/refs/heads`]: dir("heads"),
    [`${HOME}/projects/portfolio/.git/HEAD`]: file("HEAD", "ref: refs/heads/main\n"),
    [`${HOME}/projects/portfolio/.git/index`]: file("index", "index.html\nstyle.css\napp.js"),
    [`${HOME}/projects/portfolio/.git/logs`]: file("logs", "[]"),
    [`${HOME}/projects/portfolio/.git/config`]: file(
      "config",
      "[core]\n  repositoryformatversion = 0\n",
    ),
    [`${HOME}/projects/portfolio/.git/refs/heads/main`]: file("main", ""),
    [`${HOME}/projects/portfolio/index.html`]: file(
      "index.html",
      '<!DOCTYPE html>\n<html>\n<head><title>My Portfolio</title>\n<link rel="stylesheet" href="style.css">\n</head>\n<body>\n<h1>Welcome to my portfolio</h1>\n<p>Projects coming soon!</p>\n<script src="app.js"></script>\n</body>\n</html>\n',
    ),
    [`${HOME}/projects/portfolio/style.css`]: file(
      "style.css",
      "body {\n  font-family: sans-serif;\n  margin: 2rem;\n  background: #fafafa;\n}\n\nh1 {\n  color: #333;\n}\n",
    ),
    [`${HOME}/projects/portfolio/app.js`]: file(
      "app.js",
      "document.addEventListener('DOMContentLoaded', () => {\n  console.log('Portfolio loaded');\n});\n",
    ),
  });
}

// ── Git Level 4: Branching Out (has commit history) ──
export function createGitLevel4FS(): Map<string, FSNode> {
  const commitHash = "a3f7b21";
  return buildFS({
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/portfolio`]: dir("portfolio"),
    [`${HOME}/projects/portfolio/.git`]: dir(".git"),
    [`${HOME}/projects/portfolio/.git/refs`]: dir("refs"),
    [`${HOME}/projects/portfolio/.git/refs/heads`]: dir("heads"),
    [`${HOME}/projects/portfolio/.git/HEAD`]: file("HEAD", "ref: refs/heads/main\n"),
    [`${HOME}/projects/portfolio/.git/index`]: file("index", ""),
    [`${HOME}/projects/portfolio/.git/logs`]: file(
      "logs",
      JSON.stringify([
        {
          hash: commitHash,
          message: "Add portfolio homepage",
          author: "learner <learner@example.com>",
          date: "Sat Apr 5 2026",
          files: ["index.html", "style.css", "app.js"],
        },
      ]),
    ),
    [`${HOME}/projects/portfolio/.git/config`]: file(
      "config",
      "[core]\n  repositoryformatversion = 0\n",
    ),
    [`${HOME}/projects/portfolio/.git/refs/heads/main`]: file("main", commitHash),
    [`${HOME}/projects/portfolio/index.html`]: file(
      "index.html",
      '<!DOCTYPE html>\n<html>\n<head><title>My Portfolio</title>\n<link rel="stylesheet" href="style.css">\n</head>\n<body>\n<h1>Welcome to my portfolio</h1>\n<p>Projects coming soon!</p>\n<script src="app.js"></script>\n</body>\n</html>\n',
    ),
    [`${HOME}/projects/portfolio/style.css`]: file(
      "style.css",
      "body {\n  font-family: sans-serif;\n  margin: 2rem;\n  background: #fafafa;\n}\n\nh1 {\n  color: #333;\n}\n",
    ),
    [`${HOME}/projects/portfolio/app.js`]: file(
      "app.js",
      "document.addEventListener('DOMContentLoaded', () => {\n  console.log('Portfolio loaded');\n});\n",
    ),
  });
}

// ── Git Level 5: Worktrees (has commit history, main branch) ──
export function createGitLevel5FS(): Map<string, FSNode> {
  const commitHash1 = "a3f7b21";
  const commitHash2 = "e9d4c88";
  return buildFS({
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/portfolio`]: dir("portfolio"),
    [`${HOME}/projects/portfolio/.git`]: dir(".git"),
    [`${HOME}/projects/portfolio/.git/refs`]: dir("refs"),
    [`${HOME}/projects/portfolio/.git/refs/heads`]: dir("heads"),
    [`${HOME}/projects/portfolio/.git/HEAD`]: file("HEAD", "ref: refs/heads/main\n"),
    [`${HOME}/projects/portfolio/.git/index`]: file("index", ""),
    [`${HOME}/projects/portfolio/.git/logs`]: file(
      "logs",
      JSON.stringify([
        {
          hash: commitHash1,
          message: "Add portfolio homepage",
          author: "learner <learner@example.com>",
          date: "Sat Apr 5 2026",
          files: ["index.html", "style.css", "app.js"],
        },
        {
          hash: commitHash2,
          message: "Add contact page",
          author: "learner <learner@example.com>",
          date: "Sat Apr 5 2026",
          files: ["contact.html"],
        },
      ]),
    ),
    [`${HOME}/projects/portfolio/.git/config`]: file(
      "config",
      "[core]\n  repositoryformatversion = 0\n",
    ),
    [`${HOME}/projects/portfolio/.git/refs/heads/main`]: file("main", commitHash2),
    [`${HOME}/projects/portfolio/index.html`]: file(
      "index.html",
      '<!DOCTYPE html>\n<html>\n<head><title>My Portfolio</title>\n<link rel="stylesheet" href="style.css">\n</head>\n<body>\n<h1>Welcome to my portfolio</h1>\n<p>Check out my projects below.</p>\n<script src="app.js"></script>\n</body>\n</html>\n',
    ),
    [`${HOME}/projects/portfolio/style.css`]: file(
      "style.css",
      "body {\n  font-family: sans-serif;\n  margin: 2rem;\n  background: #fafafa;\n}\n\nh1 {\n  color: #333;\n}\n",
    ),
    [`${HOME}/projects/portfolio/app.js`]: file(
      "app.js",
      "document.addEventListener('DOMContentLoaded', () => {\n  console.log('Portfolio loaded');\n});\n",
    ),
    [`${HOME}/projects/portfolio/contact.html`]: file(
      "contact.html",
      '<!DOCTYPE html>\n<html>\n<body>\n<h1>Contact</h1>\n<form>\n<label>Email:</label>\n<input type="email">\n<button>Send</button>\n</form>\n</body>\n</html>\n',
    ),
  });
}

// ── Claude Level 1: Meet Claude (webapp project) ──
export function createClaudeLevel1FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/webapp`]: dir("webapp"),
    [`${HOME}/projects/webapp/src`]: dir("src"),
    [`${HOME}/projects/webapp/src/index.js`]: file(
      "index.js",
      "import { App } from './App';\n\nconst root = document.getElementById('root');\nconsole.log('App starting...');\n",
    ),
    [`${HOME}/projects/webapp/src/App.js`]: file(
      "App.js",
      "export function App() {\n  return '<div><h1>My Web App</h1></div>';\n}\n",
    ),
    [`${HOME}/projects/webapp/package.json`]: file(
      "package.json",
      '{\n  "name": "webapp",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "node src/index.js",\n    "test": "jest"\n  }\n}\n',
    ),
    [`${HOME}/projects/webapp/README.md`]: file(
      "README.md",
      "# My Web App\n\nA simple web application.\n\n## Getting Started\n\nRun `npm run dev` to start.\n",
    ),
  });
}

// ── Claude Level 2: Project Memory (webapp, no CLAUDE.md yet) ──
export function createClaudeLevel2FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/webapp`]: dir("webapp"),
    [`${HOME}/projects/webapp/src`]: dir("src"),
    [`${HOME}/projects/webapp/src/index.js`]: file(
      "index.js",
      "import { App } from './App';\n\nconst root = document.getElementById('root');\nconsole.log('App starting...');\n",
    ),
    [`${HOME}/projects/webapp/src/App.js`]: file(
      "App.js",
      "export function App() {\n  return '<div><h1>My Web App</h1></div>';\n}\n",
    ),
    [`${HOME}/projects/webapp/package.json`]: file(
      "package.json",
      '{\n  "name": "webapp",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "node src/index.js",\n    "test": "jest"\n  }\n}\n',
    ),
    [`${HOME}/projects/webapp/README.md`]: file(
      "README.md",
      "# My Web App\n\nA simple web application.\n",
    ),
  });
}

// ── Claude Level 3: Working with Code (has CLAUDE.md, utils.js with a bug) ──
export function createClaudeLevel3FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/webapp`]: dir("webapp"),
    [`${HOME}/projects/webapp/src`]: dir("src"),
    [`${HOME}/projects/webapp/src/index.js`]: file(
      "index.js",
      "import { App } from './App';\n\nconst root = document.getElementById('root');\nconsole.log('App starting...');\n",
    ),
    [`${HOME}/projects/webapp/src/App.js`]: file(
      "App.js",
      "export function App() {\n  return '<div><h1>My Web App</h1></div>';\n}\n",
    ),
    [`${HOME}/projects/webapp/src/utils.js`]: file(
      "utils.js",
      "export function formatDate(date) {\n  return date.toLocaleDateString();\n}\n\nexport function capitalize(str) {\n  return undefined.toUpperCase() + str.slice(1);\n}\n\nexport function sum(a, b) {\n  return a + b;\n}\n",
    ),
    [`${HOME}/projects/webapp/package.json`]: file(
      "package.json",
      '{\n  "name": "webapp",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "node src/index.js",\n    "test": "jest"\n  }\n}\n',
    ),
    [`${HOME}/projects/webapp/CLAUDE.md`]: file(
      "CLAUDE.md",
      "# CLAUDE.md\n\n## Project\nNode.js web application\n\n## Commands\nnpm run dev     # Start dev server\nnpm test        # Run tests\n\n## Conventions\n- Use ES modules (import/export)\n- Write descriptive commit messages\n",
    ),
    [`${HOME}/projects/webapp/.claude`]: dir(".claude"),
    [`${HOME}/projects/webapp/.claude/rules`]: dir("rules"),
    [`${HOME}/projects/webapp/.claude/settings.json`]: file(
      "settings.json",
      '{\n  "permissions": {\n    "allow": ["Read", "Write", "Edit"],\n    "deny": []\n  }\n}\n',
    ),
  });
}

// ── Skills Level 1: Skills & Commands (webapp with .claude/) ──
export function createSkillsLevel1FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/webapp`]: dir("webapp"),
    [`${HOME}/projects/webapp/src`]: dir("src"),
    [`${HOME}/projects/webapp/src/index.js`]: file(
      "index.js",
      "import { App } from './App';\nconsole.log('Starting...');\n",
    ),
    [`${HOME}/projects/webapp/src/App.js`]: file(
      "App.js",
      "export function App() {\n  return '<div>Hello</div>';\n}\n",
    ),
    [`${HOME}/projects/webapp/package.json`]: file(
      "package.json",
      '{\n  "name": "webapp",\n  "version": "1.0.0"\n}\n',
    ),
    [`${HOME}/projects/webapp/CLAUDE.md`]: file(
      "CLAUDE.md",
      "# CLAUDE.md\n\n## Project\nNode.js web application\n\n## Commands\nnpm run dev\nnpm test\n",
    ),
    [`${HOME}/projects/webapp/.claude`]: dir(".claude"),
    [`${HOME}/projects/webapp/.claude/rules`]: dir("rules"),
    [`${HOME}/projects/webapp/.claude/settings.json`]: file(
      "settings.json",
      '{\n  "permissions": {\n    "allow": ["Read", "Write", "Edit"],\n    "deny": []\n  }\n}\n',
    ),
  });
}

// ── Skills Level 2: Agents & Worktrees (webapp with .claude/, git initialized) ──
export function createSkillsLevel2FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/webapp`]: dir("webapp"),
    [`${HOME}/projects/webapp/src`]: dir("src"),
    [`${HOME}/projects/webapp/src/index.js`]: file(
      "index.js",
      "import { App } from './App';\nconsole.log('Starting...');\n",
    ),
    [`${HOME}/projects/webapp/src/App.js`]: file(
      "App.js",
      "export function App() {\n  return '<div>Hello</div>';\n}\n",
    ),
    [`${HOME}/projects/webapp/package.json`]: file(
      "package.json",
      '{\n  "name": "webapp",\n  "version": "1.0.0"\n}\n',
    ),
    [`${HOME}/projects/webapp/CLAUDE.md`]: file(
      "CLAUDE.md",
      "# CLAUDE.md\n\n## Project\nNode.js web application\n",
    ),
    [`${HOME}/projects/webapp/.claude`]: dir(".claude"),
    [`${HOME}/projects/webapp/.claude/rules`]: dir("rules"),
    [`${HOME}/projects/webapp/.claude/skills`]: dir("skills"),
    [`${HOME}/projects/webapp/.claude/settings.json`]: file(
      "settings.json",
      '{\n  "permissions": {\n    "allow": ["Read", "Write", "Edit"],\n    "deny": []\n  }\n}\n',
    ),
    [`${HOME}/projects/webapp/.git`]: dir(".git"),
    [`${HOME}/projects/webapp/.git/refs`]: dir("refs"),
    [`${HOME}/projects/webapp/.git/refs/heads`]: dir("heads"),
    [`${HOME}/projects/webapp/.git/HEAD`]: file("HEAD", "ref: refs/heads/main\n"),
    [`${HOME}/projects/webapp/.git/index`]: file("index", ""),
    [`${HOME}/projects/webapp/.git/logs`]: file(
      "logs",
      JSON.stringify([
        {
          hash: "abc1234",
          message: "Initial commit",
          author: "learner <learner@example.com>",
          date: "Sat Apr 5 2026",
          files: ["src/index.js", "src/App.js", "package.json"],
        },
      ]),
    ),
    [`${HOME}/projects/webapp/.git/refs/heads/main`]: file("main", "abc1234"),
  });
}

// ── Skills Level 3: Hooks & Configuration (full .claude/ setup with pre-populated hooks config) ──
export function createSkillsLevel3FS(): Map<string, FSNode> {
  const settingsWithHooks = {
    permissions: {
      allow: ["Bash(npm run *)", "Read", "Write", "Edit"],
      deny: ["Bash(rm -rf *)", "Read(.env)"],
    },
    hooks: {
      PostToolUse: [
        {
          matcher: "Write|Edit",
          hooks: [{ type: "command", command: ".claude/hooks/auto-format.sh" }],
        },
      ],
    },
  };

  return buildFS({
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/webapp`]: dir("webapp"),
    [`${HOME}/projects/webapp/src`]: dir("src"),
    [`${HOME}/projects/webapp/src/index.js`]: file("index.js", "import { App } from './App';\n"),
    [`${HOME}/projects/webapp/src/App.js`]: file(
      "App.js",
      "export function App() {\n  return '<div>Hello</div>';\n}\n",
    ),
    [`${HOME}/projects/webapp/package.json`]: file(
      "package.json",
      '{\n  "name": "webapp",\n  "version": "1.0.0"\n}\n',
    ),
    [`${HOME}/projects/webapp/CLAUDE.md`]: file(
      "CLAUDE.md",
      "# CLAUDE.md\n\n## Project\nNode.js web application\n",
    ),
    [`${HOME}/projects/webapp/.claude`]: dir(".claude"),
    [`${HOME}/projects/webapp/.claude/rules`]: dir("rules"),
    [`${HOME}/projects/webapp/.claude/skills`]: dir("skills"),
    [`${HOME}/projects/webapp/.claude/agents`]: dir("agents"),
    [`${HOME}/projects/webapp/.claude/settings.json`]: file(
      "settings.json",
      JSON.stringify(settingsWithHooks, null, 2) + "\n",
    ),
  });
}

// ── Skills Level 4: Extend & Share (full .claude/ with skills, agents, hooks) ──
export function createSkillsLevel4FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/projects/webapp`]: dir("webapp"),
    [`${HOME}/projects/webapp/src`]: dir("src"),
    [`${HOME}/projects/webapp/src/index.js`]: file("index.js", "import { App } from './App';\n"),
    [`${HOME}/projects/webapp/src/App.js`]: file(
      "App.js",
      "export function App() {\n  return '<div>Hello</div>';\n}\n",
    ),
    [`${HOME}/projects/webapp/package.json`]: file(
      "package.json",
      '{\n  "name": "webapp",\n  "version": "1.0.0"\n}\n',
    ),
    [`${HOME}/projects/webapp/CLAUDE.md`]: file(
      "CLAUDE.md",
      "# CLAUDE.md\n\n## Project\nNode.js web application\n",
    ),
    [`${HOME}/projects/webapp/.claude`]: dir(".claude"),
    [`${HOME}/projects/webapp/.claude/rules`]: dir("rules"),
    [`${HOME}/projects/webapp/.claude/skills`]: dir("skills"),
    [`${HOME}/projects/webapp/.claude/agents`]: dir("agents"),
    [`${HOME}/projects/webapp/.claude/agents/code-reviewer.md`]: file(
      "code-reviewer.md",
      "---\nname: code-reviewer\ndescription: Expert code reviewer\nmodel: sonnet\ntools: Read, Grep, Glob\n---\n\nYou are a senior code reviewer.\n",
    ),
    [`${HOME}/projects/webapp/.claude/hooks`]: dir("hooks"),
    [`${HOME}/projects/webapp/.claude/hooks/auto-format.sh`]: file(
      "auto-format.sh",
      '#!/bin/bash\nnpx prettier --write "$1"\n',
      "rwxr-xr-x",
    ),
    [`${HOME}/projects/webapp/.claude/settings.json`]: file(
      "settings.json",
      '{\n  "permissions": {\n    "allow": ["Read", "Write", "Edit"],\n    "deny": ["Bash(rm -rf *)"]\n  }\n}\n',
    ),
  });
}
