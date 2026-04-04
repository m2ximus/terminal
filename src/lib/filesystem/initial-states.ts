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
    [`${HOME}/.gitconfig`]: file(".gitconfig", "[user]\n  name = learner\n  email = learner@example.com\n"),
    [`${HOME}/Documents/notes.txt`]: file("notes.txt", "Welcome to Try Terminal!\nThis is your first text file.\n"),
    [`${HOME}/Documents/todo.txt`]: file("todo.txt", "1. Learn terminal basics\n2. Install Claude Code\n3. Build something amazing\n"),
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
    [`${HOME}/Documents/work/report.txt`]: file("report.txt", "Q4 Report\n=========\nRevenue is up 15%.\n"),
    [`${HOME}/Documents/work/data.csv`]: file("data.csv", "name,age,city\nAlice,30,NYC\nBob,25,LA\n"),
    [`${HOME}/Documents/personal/diary.txt`]: file("diary.txt", "Dear diary,\nToday I learned about terminal!\n"),
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
    [`${HOME}/projects/app/index.html`]: file("index.html", "<!DOCTYPE html>\n<html>\n<body>Hello World</body>\n</html>\n"),
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
    [`${HOME}/projects/mysite/index.html`]: file("index.html", "<!DOCTYPE html>\n<html>\n<head><title>My Site</title></head>\n<body>\n<h1>Welcome</h1>\n<p>This is my website.</p>\n</body>\n</html>\n"),
    [`${HOME}/projects/mysite/style.css`]: file("style.css", "body {\n  font-family: sans-serif;\n  background: #f0f0f0;\n  color: #333;\n}\n\nh1 {\n  color: navy;\n}\n"),
    [`${HOME}/projects/mysite/app.js`]: file("app.js", "console.log('Hello from app.js');\n\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n"),
    [`${HOME}/Documents/log.txt`]: file("log.txt", Array.from({ length: 20 }, (_, i) => `[${String(i + 1).padStart(2, "0")}] Log entry number ${i + 1}`).join("\n") + "\n"),
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
    [`${HOME}/projects/webapp/src/index.js`]: file("index.js", "import { App } from './App';\n\nconst root = document.getElementById('root');\n// TODO: Add error handling\n"),
    [`${HOME}/projects/webapp/src/App.js`]: file("App.js", "export function App() {\n  // TODO: Implement main app\n  return '<div>Hello</div>';\n}\n"),
    [`${HOME}/projects/webapp/src/utils.js`]: file("utils.js", "export function formatDate(date) {\n  return date.toLocaleDateString();\n}\n\n// TODO: Add more utilities\n"),
    [`${HOME}/projects/webapp/README.md`]: file("README.md", "# Web App\n\nA simple web application.\n\n## Getting Started\n\nRun `npm start` to begin.\n"),
    [`${HOME}/projects/webapp/package.json`]: file("package.json", '{\n  "name": "webapp",\n  "version": "1.0.0",\n  "scripts": {\n    "start": "node src/index.js"\n  }\n}\n'),
    [`${HOME}/Documents/notes.txt`]: file("notes.txt", "Meeting notes:\n- Review TODO items\n- Plan next sprint\n- TODO: Follow up with team\n"),
  });
}

// ── Level 7: Power User ──
export function createLevel7FS(): Map<string, FSNode> {
  return buildFS({
    [`${HOME}/Desktop`]: dir("Desktop"),
    [`${HOME}/Documents`]: dir("Documents"),
    [`${HOME}/projects`]: dir("projects"),
    [`${HOME}/scripts`]: dir("scripts"),
    [`${HOME}/scripts/deploy.sh`]: file("deploy.sh", "#!/bin/bash\necho 'Deploying...'\nnpm run build\necho 'Done!'\n", "rw-r--r--"),
    [`${HOME}/scripts/backup.sh`]: file("backup.sh", "#!/bin/bash\necho 'Backing up...'\ncp -r ~/projects ~/backup\necho 'Backup complete!'\n", "rw-r--r--"),
    [`${HOME}/projects/config.json`]: file("config.json", '{\n  "port": 3000,\n  "debug": true\n}\n'),
    [`${HOME}/.zshrc`]: file(".zshrc", "# Zsh configuration\nexport PATH=$PATH:/usr/local/bin\nalias ll='ls -la'\nalias gs='git status'\n"),
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
