import { CommandHandler } from "../types";

// Helpers for generating fake commit hashes
function fakeHash(): string {
  return Math.random().toString(16).slice(2, 9);
}

function getCurrentBranch(fs: Parameters<CommandHandler>[0]["fs"]): string {
  const headPath = fs.resolvePath(".git/HEAD");
  if (!fs.exists(headPath)) return "main";
  const content = fs.readFile(headPath).trim();
  const match = content.match(/^ref: refs\/heads\/(.+)$/);
  return match ? match[1] : "main";
}

function getGitDir(fs: Parameters<CommandHandler>[0]["fs"]): string {
  return fs.resolvePath(".git");
}

function isRepo(fs: Parameters<CommandHandler>[0]["fs"]): boolean {
  return fs.exists(getGitDir(fs));
}

function getStagedFiles(fs: Parameters<CommandHandler>[0]["fs"]): string[] {
  const indexPath = fs.resolvePath(".git/index");
  if (!fs.exists(indexPath)) return [];
  const content = fs.readFile(indexPath).trim();
  return content ? content.split("\n").filter(Boolean) : [];
}

function getUntrackedFiles(fs: Parameters<CommandHandler>[0]["fs"]): string[] {
  const cwd = fs.cwd;
  const prefix = cwd + "/";
  const staged = new Set(getStagedFiles(fs));

  // Get committed files from logs
  const committed = new Set<string>();
  const logsPath = fs.resolvePath(".git/logs");
  if (fs.exists(logsPath)) {
    try {
      const logs = JSON.parse(fs.readFile(logsPath));
      for (const commit of logs) {
        if (commit.files) {
          for (const f of commit.files) committed.add(f);
        }
      }
    } catch {
      /* empty */
    }
  }

  const allPaths = fs.getAllPaths();
  const files: string[] = [];
  const gitDir = getGitDir(fs);

  for (const p of allPaths) {
    if (!p.startsWith(prefix)) continue;
    if (p.startsWith(gitDir)) continue;
    const node = fs.getNode(p);
    if (!node || node.type !== "file") continue;
    const relative = p.slice(prefix.length);
    if (!staged.has(relative) && !committed.has(relative)) {
      files.push(relative);
    }
  }
  return files.sort();
}

function getLockedMessage(subcommand: string): string {
  const levelHints: Record<string, string> = {
    add: "Tracking Changes",
    diff: "Tracking Changes",
    commit: "Making History",
    log: "Making History",
    branch: "Branching Out",
    checkout: "Branching Out",
    merge: "Branching Out",
    worktree: "Parallel Worlds",
  };
  const hint = levelHints[subcommand];
  if (hint) {
    return `You'll learn \`git ${subcommand}\` in the "${hint}" level. Keep going!`;
  }
  return `\`git ${subcommand}\` isn't available in this level yet.`;
}

export const git: CommandHandler = ({ fs, args, flags, availableCommands }) => {
  if (args.length === 0) {
    return {
      output: [
        "git - version control",
        "",
        "Common commands:",
        "  git init       Initialize a new repository",
        "  git status     Show working tree status",
        "  git add        Stage changes for commit",
        "  git commit     Record changes to the repository",
        "  git log        Show commit history",
        "  git branch     List or create branches",
        "  git checkout   Switch branches",
        "  git merge      Merge branches together",
        "  git worktree   Manage multiple working trees",
      ].join("\n"),
      outputType: "stdout",
    };
  }

  const subcommand = args[0];

  // Subcommand gating
  if (!availableCommands.includes(`git ${subcommand}`)) {
    return { output: getLockedMessage(subcommand), outputType: "info" };
  }

  // ── git init ──
  if (subcommand === "init") {
    const gitDir = getGitDir(fs);
    if (isRepo(fs)) {
      return {
        output: `Reinitialized existing Git repository in ${fs.cwd}/.git/`,
        outputType: "stdout",
      };
    }
    fs.createDirectory(gitDir);
    fs.createDirectory(gitDir + "/refs");
    fs.createDirectory(gitDir + "/refs/heads");
    fs.createFile(gitDir + "/HEAD", "ref: refs/heads/main\n");
    fs.createFile(gitDir + "/index", "");
    fs.createFile(gitDir + "/logs", "[]");
    fs.createFile(gitDir + "/config", "[core]\n  repositoryformatversion = 0\n");
    fs.createFile(gitDir + "/refs/heads/main", "");
    return {
      output: `Initialized empty Git repository in ${fs.cwd}/.git/`,
      outputType: "success",
    };
  }

  // Everything below requires an initialized repo
  if (!isRepo(fs)) {
    return {
      output: "fatal: not a git repository (or any of the parent directories): .git",
      outputType: "stderr",
    };
  }

  // ── git status ──
  if (subcommand === "status") {
    const branch = getCurrentBranch(fs);
    const staged = getStagedFiles(fs);
    const untracked = getUntrackedFiles(fs);
    const lines: string[] = [`On branch ${branch}`];

    // Check if there are any commits
    const logsPath = fs.resolvePath(".git/logs");
    let hasCommits = false;
    if (fs.exists(logsPath)) {
      try {
        const logs = JSON.parse(fs.readFile(logsPath));
        hasCommits = logs.length > 0;
      } catch {
        /* empty */
      }
    }
    if (!hasCommits) {
      lines.push("", "No commits yet");
    }

    if (staged.length > 0) {
      lines.push("", "Changes to be committed:");
      lines.push('  (use "git restore --staged <file>..." to unstage)');
      for (const f of staged) {
        lines.push(`\tnew file:   ${f}`);
      }
    }

    if (untracked.length > 0) {
      lines.push("", "Untracked files:");
      lines.push('  (use "git add <file>..." to include in what will be committed)');
      for (const f of untracked) {
        lines.push(`\t${f}`);
      }
    }

    if (staged.length === 0 && untracked.length === 0) {
      lines.push("nothing to commit, working tree clean");
    }

    return { output: lines.join("\n"), outputType: "stdout" };
  }

  // ── git add ──
  if (subcommand === "add") {
    const target = args[1];
    if (!target) {
      return { output: "Nothing specified, nothing added.", outputType: "stderr" };
    }

    const indexPath = fs.resolvePath(".git/index");
    const currentStaged = getStagedFiles(fs);
    const stagedSet = new Set(currentStaged);

    if (target === ".") {
      // Stage all untracked files
      const untracked = getUntrackedFiles(fs);
      for (const f of untracked) {
        stagedSet.add(f);
      }
    } else {
      // Stage a specific file
      const resolved = fs.resolvePath(target);
      if (!fs.exists(resolved)) {
        return {
          output: `fatal: pathspec '${target}' did not match any files`,
          outputType: "stderr",
        };
      }
      const cwd = fs.cwd;
      const relative = resolved.startsWith(cwd + "/") ? resolved.slice(cwd.length + 1) : target;
      stagedSet.add(relative);
    }

    fs.writeFile(indexPath, Array.from(stagedSet).join("\n"));
    return { output: "", outputType: "stdout" };
  }

  // ── git diff ──
  if (subcommand === "diff") {
    const untracked = getUntrackedFiles(fs);
    if (untracked.length === 0) {
      return { output: "", outputType: "stdout" };
    }
    const lines: string[] = [];
    for (const f of untracked.slice(0, 3)) {
      lines.push(`diff --git a/${f} b/${f}`);
      lines.push("new file mode 100644");
      lines.push(`--- /dev/null`);
      lines.push(`+++ b/${f}`);
      lines.push("@@ -0,0 +1 @@");
      lines.push(`+[new file content]`);
      lines.push("");
    }
    return { output: lines.join("\n"), outputType: "stdout" };
  }

  // ── git commit ──
  if (subcommand === "commit") {
    const staged = getStagedFiles(fs);
    if (staged.length === 0) {
      return {
        output: 'nothing to commit (use "git add" to stage changes)',
        outputType: "stderr",
      };
    }

    // Extract message: parser puts -m in flags and the message in args
    let message = "Initial commit";
    if (flags.m && args[1]) {
      message = args.slice(1).join(" ");
    }

    const hash = fakeHash();
    const branch = getCurrentBranch(fs);

    // Append commit to logs
    const logsPath = fs.resolvePath(".git/logs");
    let logs: Array<{
      hash: string;
      message: string;
      author: string;
      date: string;
      files: string[];
    }> = [];
    if (fs.exists(logsPath)) {
      try {
        logs = JSON.parse(fs.readFile(logsPath));
      } catch {
        /* empty */
      }
    }
    const isFirst = logs.length === 0;
    logs.push({
      hash,
      message,
      author: "learner <learner@example.com>",
      date: new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      files: [...staged],
    });
    fs.writeFile(logsPath, JSON.stringify(logs));

    // Update branch ref
    const refPath = fs.resolvePath(`.git/refs/heads/${branch}`);
    fs.writeFile(refPath, hash);

    // Clear index
    fs.writeFile(fs.resolvePath(".git/index"), "");

    const label = isFirst ? `[${branch} (root-commit) ${hash}]` : `[${branch} ${hash}]`;
    return {
      output: `${label} ${message}\n ${staged.length} file${staged.length !== 1 ? "s" : ""} changed`,
      outputType: "stdout",
    };
  }

  // ── git log ──
  if (subcommand === "log") {
    const logsPath = fs.resolvePath(".git/logs");
    if (!fs.exists(logsPath)) {
      return {
        output: "fatal: your current branch does not have any commits yet",
        outputType: "stderr",
      };
    }
    let logs: Array<{ hash: string; message: string; author: string; date: string }> = [];
    try {
      logs = JSON.parse(fs.readFile(logsPath));
    } catch {
      /* empty */
    }
    if (logs.length === 0) {
      return {
        output: "fatal: your current branch does not have any commits yet",
        outputType: "stderr",
      };
    }

    const branch = getCurrentBranch(fs);
    const lines: string[] = [];
    for (let i = logs.length - 1; i >= 0; i--) {
      const c = logs[i];
      const isHead = i === logs.length - 1;
      lines.push(`commit ${c.hash}${isHead ? ` (HEAD -> ${branch})` : ""}`);
      lines.push(`Author: ${c.author}`);
      lines.push(`Date:   ${c.date}`);
      lines.push("");
      lines.push(`    ${c.message}`);
      if (i > 0) lines.push("");
    }
    return { output: lines.join("\n"), outputType: "stdout" };
  }

  // ── git branch ──
  if (subcommand === "branch") {
    const branchName = args[1];

    if (branchName) {
      // Create a new branch
      const refPath = fs.resolvePath(`.git/refs/heads/${branchName}`);
      if (fs.exists(refPath)) {
        return {
          output: `fatal: a branch named '${branchName}' already exists`,
          outputType: "stderr",
        };
      }
      // Copy current branch's ref
      const currentBranch = getCurrentBranch(fs);
      const currentRefPath = fs.resolvePath(`.git/refs/heads/${currentBranch}`);
      const currentHash = fs.exists(currentRefPath) ? fs.readFile(currentRefPath).trim() : "";
      fs.createFile(refPath, currentHash);
      return { output: "", outputType: "stdout" };
    }

    // List branches
    const currentBranch = getCurrentBranch(fs);
    const refsDir = fs.resolvePath(".git/refs/heads");
    const branches = fs.getChildNames(refsDir).sort();
    const lines = branches.map((b) => (b === currentBranch ? `* ${b}` : `  ${b}`));
    return { output: lines.join("\n"), outputType: "stdout" };
  }

  // ── git checkout ──
  if (subcommand === "checkout") {
    const headPath = fs.resolvePath(".git/HEAD");

    if (flags.b) {
      // git checkout -b <name> — create and switch
      const newBranch = args[1];
      if (!newBranch) {
        return { output: "fatal: branch name required", outputType: "stderr" };
      }
      const refPath = fs.resolvePath(`.git/refs/heads/${newBranch}`);
      if (fs.exists(refPath)) {
        return {
          output: `fatal: a branch named '${newBranch}' already exists`,
          outputType: "stderr",
        };
      }
      // Copy current ref
      const currentBranch = getCurrentBranch(fs);
      const currentRefPath = fs.resolvePath(`.git/refs/heads/${currentBranch}`);
      const currentHash = fs.exists(currentRefPath) ? fs.readFile(currentRefPath).trim() : "";
      fs.createFile(refPath, currentHash);
      fs.writeFile(headPath, `ref: refs/heads/${newBranch}\n`);
      return {
        output: `Switched to a new branch '${newBranch}'`,
        outputType: "success",
      };
    }

    // git checkout <branch>
    const targetBranch = args[1];
    if (!targetBranch) {
      return { output: "error: you must specify a branch", outputType: "stderr" };
    }
    const refPath = fs.resolvePath(`.git/refs/heads/${targetBranch}`);
    if (!fs.exists(refPath)) {
      return {
        output: `error: pathspec '${targetBranch}' did not match any branch`,
        outputType: "stderr",
      };
    }
    fs.writeFile(headPath, `ref: refs/heads/${targetBranch}\n`);
    return {
      output: `Switched to branch '${targetBranch}'`,
      outputType: "success",
    };
  }

  // ── git merge ──
  if (subcommand === "merge") {
    const sourceBranch = args[1];
    if (!sourceBranch) {
      return { output: "error: you must specify a branch to merge", outputType: "stderr" };
    }
    const refPath = fs.resolvePath(`.git/refs/heads/${sourceBranch}`);
    if (!fs.exists(refPath)) {
      return {
        output: `merge: ${sourceBranch} - not something we can merge`,
        outputType: "stderr",
      };
    }
    const currentBranch = getCurrentBranch(fs);
    return {
      output: `Merge made by the 'ort' strategy.\nSuccessfully merged '${sourceBranch}' into '${currentBranch}'.`,
      outputType: "success",
    };
  }

  // ── git worktree ──
  if (subcommand === "worktree") {
    const action = args[1];

    if (action === "list" || !action) {
      const worktreesDir = fs.resolvePath(".git/worktrees");
      const lines: string[] = [];
      const branch = getCurrentBranch(fs);
      lines.push(`${fs.cwd}  ${fakeHash()} [${branch}]`);

      if (fs.exists(worktreesDir)) {
        const entries = fs.getChildNames(worktreesDir);
        for (const entry of entries) {
          const infoPath = `${worktreesDir}/${entry}`;
          if (fs.isFile(infoPath)) {
            try {
              const info = JSON.parse(fs.readFile(infoPath));
              lines.push(`${info.path}  ${fakeHash()} [${info.branch}]`);
            } catch {
              /* empty */
            }
          }
        }
      }
      return { output: lines.join("\n"), outputType: "stdout" };
    }

    if (action === "add") {
      const worktreePath = args[2];
      if (!worktreePath) {
        return { output: "usage: git worktree add <path> [-b <branch>]", outputType: "stderr" };
      }

      // Branch name: from -b flag (parser puts it in args after flag stripping)
      let branchName: string;
      if (flags.b && args[3]) {
        branchName = args[3];
      } else {
        // Derive branch from path
        branchName = worktreePath.split("/").pop() || worktreePath;
      }

      const resolvedPath = fs.resolvePath(worktreePath);

      // Create the worktree directory with project files
      fs.createDirectory(resolvedPath, true);

      // Copy project files (non-.git) from cwd to worktree
      const cwd = fs.cwd;
      const cwdPrefix = cwd + "/";
      const gitDir = getGitDir(fs);
      for (const p of fs.getAllPaths()) {
        if (!p.startsWith(cwdPrefix)) continue;
        if (p.startsWith(gitDir)) continue;
        const relative = p.slice(cwdPrefix.length);
        const node = fs.getNode(p);
        if (!node) continue;
        const destPath = resolvedPath + "/" + relative;
        if (node.type === "directory") {
          fs.createDirectory(destPath, true);
        } else {
          // Ensure parent exists
          const parentParts = destPath.split("/");
          parentParts.pop();
          const parentPath = parentParts.join("/");
          if (!fs.exists(parentPath)) {
            fs.createDirectory(parentPath, true);
          }
          fs.createFile(destPath, node.type === "file" ? node.content : "");
        }
      }

      // Create branch ref
      const currentBranch = getCurrentBranch(fs);
      const currentRefPath = fs.resolvePath(`.git/refs/heads/${currentBranch}`);
      const currentHash = fs.exists(currentRefPath)
        ? fs.readFile(currentRefPath).trim()
        : fakeHash();
      const branchRefPath = fs.resolvePath(`.git/refs/heads/${branchName}`);
      if (!fs.exists(branchRefPath)) {
        fs.createFile(branchRefPath, currentHash);
      }

      // Record worktree entry
      const worktreesDir = fs.resolvePath(".git/worktrees");
      if (!fs.exists(worktreesDir)) {
        fs.createDirectory(worktreesDir);
      }
      const entryName = branchName.replace(/[^a-zA-Z0-9-]/g, "-");
      fs.createFile(
        `${worktreesDir}/${entryName}`,
        JSON.stringify({ path: resolvedPath, branch: branchName }),
      );

      return {
        output: `Preparing worktree (new branch '${branchName}')\nHEAD is now at ${currentHash.slice(0, 7) || "0000000"}`,
        outputType: "success",
      };
    }

    if (action === "remove") {
      const worktreePath = args[2];
      if (!worktreePath) {
        return { output: "usage: git worktree remove <path>", outputType: "stderr" };
      }
      const resolvedPath = fs.resolvePath(worktreePath);
      if (fs.exists(resolvedPath)) {
        fs.removeNode(resolvedPath, true);
      }

      // Remove worktree entry
      const worktreesDir = fs.resolvePath(".git/worktrees");
      if (fs.exists(worktreesDir)) {
        const entries = fs.getChildNames(worktreesDir);
        for (const entry of entries) {
          const infoPath = `${worktreesDir}/${entry}`;
          if (fs.isFile(infoPath)) {
            try {
              const info = JSON.parse(fs.readFile(infoPath));
              if (info.path === resolvedPath) {
                fs.removeNode(infoPath);
                break;
              }
            } catch {
              /* empty */
            }
          }
        }
      }

      return { output: "", outputType: "stdout" };
    }

    return { output: `git worktree ${action || ""} - unknown command`, outputType: "stderr" };
  }

  return {
    output: `git: '${subcommand}' is not a git command. See 'git --help'.`,
    outputType: "stderr",
  };
};
