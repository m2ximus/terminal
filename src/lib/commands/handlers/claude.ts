import { CommandHandler } from "../types";

function getLockedMessage(subcommand: string): string {
  const levelHints: Record<string, string> = {
    "/init": "Project Memory",
    "/help": "Meet Claude",
    "/skills": "Skills & Commands",
    "/find-skills": "Extend & Share",
    "/skill-creator": "Extend & Share",
    "/install-plugin": "Extend & Share",
  };
  const hint = levelHints[subcommand];
  if (hint) {
    return `You'll learn \`claude ${subcommand}\` in the "${hint}" level. Keep going!`;
  }
  return `\`claude ${subcommand}\` isn't available in this level yet.`;
}

export const claudeCode: CommandHandler = ({ fs, args, flags, availableCommands }) => {
  // claude --version
  if (flags.version) {
    if (!availableCommands.includes("claude --version")) {
      return { output: getLockedMessage("--version"), outputType: "info" };
    }
    return { output: "1.0.34 (Claude Code)", outputType: "stdout" };
  }

  // claude --help
  if (flags.help) {
    if (!availableCommands.includes("claude --help")) {
      return { output: getLockedMessage("--help"), outputType: "info" };
    }
    return {
      output: [
        "Usage: claude [options] [prompt]",
        "",
        "Options:",
        "  --version          Show version number",
        "  --help             Show this help message",
        "  --model <model>    Choose model (default: claude-sonnet-4-6)",
        "  --allowedTools     Restrict available tools",
        "  --print            Print response and exit (non-interactive)",
        "  --debug            Enable debug logging",
        "",
        "Examples:",
        "  claude                          Start interactive session",
        '  claude "explain this code"      One-shot prompt',
        "  claude --model opus             Use a specific model",
        "",
        "Run claude /help inside a session for slash commands.",
      ].join("\n"),
      outputType: "stdout",
    };
  }

  // No args — launch screen
  if (args.length === 0) {
    return {
      output: [
        "",
        "  ╭───────────────────────────────────────────────╮",
        "  │                                               │",
        "  │   Claude Code  v1.0.34                        │",
        "  │                                               │",
        "  │   Model: claude-sonnet-4-6                    │",
        "  │   Context: 200k tokens available              │",
        "  │                                               │",
        "  │   Tips:                                       │",
        "  │   • Type your request in natural language      │",
        "  │   • Use /help to see slash commands            │",
        "  │   • Use /init to set up project memory         │",
        "  │   • Press Ctrl+C to cancel                     │",
        "  │                                               │",
        "  ╰───────────────────────────────────────────────╯",
        "",
        "  > How can I help you today?",
        "",
      ].join("\n"),
      outputType: "success",
    };
  }

  const input = args.join(" ");

  // ── Slash commands ──

  // claude /help
  if (input === "/help") {
    if (!availableCommands.includes("claude /help")) {
      return { output: getLockedMessage("/help"), outputType: "info" };
    }
    return {
      output: [
        "Slash Commands:",
        "",
        "  /help           Show this help message",
        "  /init           Initialize CLAUDE.md for this project",
        "  /compact        Compress conversation context",
        "  /clear          Clear conversation history",
        "  /model          Switch the AI model",
        "  /cost           Show session cost summary",
        "  /memory         View and edit project memory",
        "  /skills         List available skills",
        "  /find-skills    Discover community plugins",
        "",
        "Custom skills appear as /<skill-name> once installed.",
      ].join("\n"),
      outputType: "stdout",
    };
  }

  // claude /init
  if (input === "/init") {
    if (!availableCommands.includes("claude /init")) {
      return { output: getLockedMessage("/init"), outputType: "info" };
    }

    // Scan project files to generate CLAUDE.md
    const cwd = fs.cwd;
    const prefix = cwd + "/";
    const files: string[] = [];
    for (const p of fs.getAllPaths()) {
      if (!p.startsWith(prefix)) continue;
      if (p.includes("/.git/") || p.includes("/node_modules/")) continue;
      const node = fs.getNode(p);
      if (node && node.type === "file") {
        files.push(p.slice(prefix.length));
      }
    }

    // Detect project type
    const hasPackageJson = files.includes("package.json");
    const hasJs = files.some((f) => f.endsWith(".js") || f.endsWith(".ts"));

    const claudeMd =
      [
        "# CLAUDE.md",
        "",
        "## Project",
        hasPackageJson ? "Node.js project" : "Web project",
        "",
        "## Commands",
        hasPackageJson ? "npm run dev     # Start dev server" : "",
        hasPackageJson ? "npm test        # Run tests" : "",
        "",
        "## Structure",
        ...files.slice(0, 10).map((f) => `- ${f}`),
        "",
        "## Conventions",
        hasJs ? "- Use ES modules (import/export)" : "",
        "- Write descriptive commit messages",
        "- Keep functions small and focused",
      ]
        .filter(Boolean)
        .join("\n") + "\n";

    const claudeMdPath = fs.resolvePath("CLAUDE.md");
    fs.createFile(claudeMdPath, claudeMd);

    // Create .claude/ directory structure
    const dotClaudePath = fs.resolvePath(".claude");
    if (!fs.exists(dotClaudePath)) {
      fs.createDirectory(dotClaudePath);
      fs.createDirectory(dotClaudePath + "/rules");
      fs.createFile(
        dotClaudePath + "/settings.json",
        JSON.stringify({ permissions: { allow: ["Read", "Write", "Edit"], deny: [] } }, null, 2) +
          "\n",
      );
    }

    return {
      output: [
        "⏺ Scanning project files...",
        `  Found ${files.length} files`,
        "",
        "⏺ Created CLAUDE.md with project configuration",
        "⏺ Created .claude/ directory with default settings",
        "",
        "Claude will now read CLAUDE.md at the start of every session.",
        "Edit it to add your project's conventions, commands, and architecture.",
      ].join("\n"),
      outputType: "success",
    };
  }

  // claude /skills
  if (input === "/skills") {
    if (!availableCommands.includes("claude /skills")) {
      return { output: getLockedMessage("/skills"), outputType: "info" };
    }

    // Check for installed skills
    const skillsDir = fs.resolvePath(".claude/skills");
    let skills: string[] = [];
    if (fs.exists(skillsDir)) {
      skills = fs.getChildNames(skillsDir);
    }

    if (skills.length === 0) {
      return {
        output: [
          "No custom skills installed.",
          "",
          "Create one:",
          "  mkdir -p .claude/skills/my-skill",
          "  Create a SKILL.md file inside it",
          "",
          "Or discover community skills:",
          "  claude /find-skills",
        ].join("\n"),
        outputType: "stdout",
      };
    }

    const lines = ["Installed skills:", ""];
    for (const s of skills) {
      lines.push(`  /${s}`);
    }
    return { output: lines.join("\n"), outputType: "stdout" };
  }

  // claude /find-skills
  if (input === "/find-skills") {
    if (!availableCommands.includes("claude /find-skills")) {
      return { output: getLockedMessage("/find-skills"), outputType: "info" };
    }
    return {
      output: [
        "🔍 Searching plugin registry...",
        "",
        "Popular skills:",
        "",
        "  code-review-pro     Thorough code review with security checks",
        "  deploy-helper       Guided deployment to Vercel/Netlify",
        "  test-generator      Generate test suites from source files",
        "  doc-writer          Auto-generate documentation",
        "  refactor-guide      Safe refactoring with dependency analysis",
        "",
        "Install with: claude /install-plugin <name>",
      ].join("\n"),
      outputType: "success",
    };
  }

  // claude /install-plugin <name>
  if (input.startsWith("/install-plugin")) {
    if (!availableCommands.includes("claude /install-plugin")) {
      return { output: getLockedMessage("/install-plugin"), outputType: "info" };
    }
    const pluginName = input.replace("/install-plugin", "").trim();
    if (!pluginName) {
      return { output: "Usage: claude /install-plugin <name>", outputType: "stderr" };
    }

    const skillDir = fs.resolvePath(`.claude/skills/${pluginName}`);
    fs.createDirectory(skillDir, true);
    fs.createFile(
      skillDir + "/SKILL.md",
      [
        "---",
        `name: ${pluginName}`,
        `description: ${pluginName} — installed from the plugin registry`,
        "allowed-tools: Read, Grep, Glob",
        "---",
        "",
        `# ${pluginName}`,
        "",
        "This skill was installed from the community plugin registry.",
        `Invoke with: /${pluginName}`,
      ].join("\n") + "\n",
    );

    return {
      output: [
        `📦 Installing ${pluginName}...`,
        "",
        `  ✓ Created .claude/skills/${pluginName}/SKILL.md`,
        "",
        `Skill installed! Use /${pluginName} to invoke it.`,
      ].join("\n"),
      outputType: "success",
    };
  }

  // claude /skill-creator
  if (input === "/skill-creator") {
    if (!availableCommands.includes("claude /skill-creator")) {
      return { output: getLockedMessage("/skill-creator"), outputType: "info" };
    }

    const skillDir = fs.resolvePath(".claude/skills/my-custom-skill");
    fs.createDirectory(skillDir, true);
    fs.createFile(
      skillDir + "/SKILL.md",
      [
        "---",
        "name: my-custom-skill",
        "description: A custom skill created with the skill creator",
        "allowed-tools: Read, Write, Edit, Grep, Glob",
        "---",
        "",
        "# My Custom Skill",
        "",
        "## What this skill does",
        "Describe your skill's purpose here.",
        "",
        "## Steps",
        "1. Read the relevant files",
        "2. Analyze the code",
        "3. Generate output",
        "",
        "## Usage",
        "Invoke with /my-custom-skill or let Claude detect when it's needed.",
      ].join("\n") + "\n",
    );

    return {
      output: [
        "🛠️  Skill Creator",
        "",
        "Creating a new skill template...",
        "",
        "  ✓ Created .claude/skills/my-custom-skill/SKILL.md",
        "",
        "Next steps:",
        "  1. Edit the SKILL.md to describe what your skill does",
        "  2. Add supporting files alongside it if needed",
        "  3. Test it with /my-custom-skill",
      ].join("\n"),
      outputType: "success",
    };
  }

  // claude /security-review (simulated custom skill)
  if (input === "/security-review") {
    return {
      output: [
        "⏺ Running security-review skill...",
        "",
        "  Scanning project for vulnerabilities...",
        "  ✓ No hardcoded secrets found",
        "  ✓ No SQL injection risks detected",
        "  ⚠ Consider adding input validation to form handlers",
        "",
        "Security review complete. 0 critical, 1 advisory.",
      ].join("\n"),
      outputType: "success",
    };
  }

  // ── Prompt-based commands ──

  // claude "explain <file>"
  if (input.match(/explain/i)) {
    const fileMatch = input.match(/(?:explain\s+)(\S+)/i);
    const filePath = fileMatch ? fileMatch[1] : null;

    if (filePath) {
      const resolved = fs.resolvePath(filePath);
      if (fs.exists(resolved) && fs.isFile(resolved)) {
        const content = fs.readFile(resolved);
        const ext = filePath.split(".").pop() || "";
        const langMap: Record<string, string> = {
          js: "JavaScript",
          ts: "TypeScript",
          html: "HTML",
          css: "CSS",
          json: "JSON",
        };
        const lang = langMap[ext] || ext;

        return {
          output: [
            `⏺ Analyzing ${filePath}...`,
            "",
            `This is a ${lang} file (${content.split("\n").length} lines).`,
            "",
            content.includes("function") || content.includes("=>")
              ? "It defines functions that handle the application logic."
              : content.includes("<html>") || content.includes("<div>")
                ? "It contains HTML markup that defines the page structure."
                : content.includes("{") && filePath.endsWith(".css")
                  ? "It contains CSS styles that control the visual presentation."
                  : "It contains project configuration and metadata.",
            "",
            "Key observations:",
            content.includes("export") ? "  • Uses ES module exports" : "",
            content.includes("import") ? "  • Imports from other modules" : "",
            content.includes("console.log")
              ? "  • Contains console.log statements (consider removing for production)"
              : "",
            content.includes("TODO") ? "  • Has TODO comments that need attention" : "",
          ]
            .filter(Boolean)
            .join("\n"),
          outputType: "success",
        };
      }
    }
    return {
      output:
        'I\'d be happy to explain! Please specify a file path, e.g., claude "explain src/App.js"',
      outputType: "info",
    };
  }

  // claude "review this project" (for agents level) — must be before "find bugs" handler
  if (input.match(/review.*project|review.*code/i)) {
    return {
      output: [
        "⏺ Spawning code-reviewer agent in isolated worktree...",
        "",
        "  Agent: code-reviewer",
        "  Model: claude-sonnet-4-6",
        "  Tools: Read, Grep, Glob",
        "",
        "  ⏺ Creating worktree at ../webapp-review-abc123...",
        "  ⏺ Agent is scanning project files...",
        "  ⏺ Reviewing 4 source files...",
        "",
        "  ── Agent Report ──",
        "  ✓ Code structure looks clean",
        "  ✓ No security issues found",
        "  ⚠ Consider adding error handling to App.js",
        "  💡 utils.js could benefit from input validation",
        "",
        "  ⏺ Cleaning up worktree...",
        "  ✓ Review complete",
      ].join("\n"),
      outputType: "success",
    };
  }

  // claude "find bugs in <file>"
  if (input.match(/find\s*bugs|bug/i)) {
    const fileMatch = input.match(/(?:in\s+)(\S+)/i);
    const filePath = fileMatch ? fileMatch[1] : null;

    if (filePath) {
      const resolved = fs.resolvePath(filePath);
      if (fs.exists(resolved) && fs.isFile(resolved)) {
        const content = fs.readFile(resolved);

        // Look for common "bugs" in file content
        const issues: string[] = [];
        if (content.includes("undefined"))
          issues.push(
            "  ⚠ Reference to undefined variable — this will throw a ReferenceError at runtime",
          );
        if (content.includes("TODO"))
          issues.push("  ⚠ TODO comment found — incomplete implementation");
        if (content.includes("console.log"))
          issues.push("  💡 console.log found — remove before production");
        if (!content.includes("try") && content.includes("fetch"))
          issues.push("  ⚠ No error handling around fetch call");

        if (issues.length === 0) {
          issues.push("  ✓ No obvious bugs found. Code looks clean!");
        }

        return {
          output: [`⏺ Reviewing ${filePath}...`, "", ...issues].join("\n"),
          outputType: "success",
        };
      }
    }
    return {
      output: 'Specify a file to review, e.g., claude "find bugs in src/utils.js"',
      outputType: "info",
    };
  }

  // claude "fix <description>"
  if (input.match(/fix/i)) {
    const fileMatch = input.match(/(?:in\s+)(\S+)/i);
    const filePath = fileMatch ? fileMatch[1] : null;

    if (filePath) {
      const resolved = fs.resolvePath(filePath);
      if (fs.exists(resolved) && fs.isFile(resolved)) {
        const content = fs.readFile(resolved);
        // Attempt to fix: replace "undefined" references with proper values
        const fixed = content.replace(/\bundefined\b/g, "null").replace(/\/\/ TODO:.*\n/g, "");

        if (fixed !== content) {
          fs.writeFile(resolved, fixed);
          return {
            output: [
              `⏺ Fixing ${filePath}...`,
              "",
              "Changes made:",
              "  - Fixed undefined variable references",
              "  - Removed TODO comments with completed implementations",
              "",
              `✓ File updated. Run \`cat ${filePath}\` to verify.`,
            ].join("\n"),
            outputType: "success",
          };
        }

        return {
          output: `⏺ Analyzed ${filePath} — no issues to fix automatically.`,
          outputType: "info",
        };
      }
    }
    return {
      output: 'Specify what to fix, e.g., claude "fix the bug in src/utils.js"',
      outputType: "info",
    };
  }

  // claude "create <description>"
  if (input.match(/create|make|generate|write/i)) {
    const testMatch = input.match(/test.*(?:for\s+)(\S+)/i);
    if (testMatch) {
      const sourceFile = testMatch[1];
      const testFileName = sourceFile.replace(/\.([^.]+)$/, ".test.$1");
      const testPath = fs.resolvePath(testFileName);

      // Determine the directory for the test file
      const parentDir = testPath.split("/").slice(0, -1).join("/");
      if (!fs.exists(parentDir)) {
        fs.createDirectory(parentDir, true);
      }

      fs.createFile(
        testPath,
        [
          `// Tests for ${sourceFile}`,
          `const { describe, it, expect } = require('jest');`,
          "",
          `describe('${sourceFile}', () => {`,
          "  it('should export required functions', () => {",
          `    const mod = require('./${sourceFile.replace(/\.[^.]+$/, "")}');`,
          "    expect(mod).toBeDefined();",
          "  });",
          "",
          "  it('should handle edge cases', () => {",
          "    // Add your test cases here",
          "    expect(true).toBe(true);",
          "  });",
          "});",
          "",
        ].join("\n"),
      );

      return {
        output: [
          `⏺ Creating test file for ${sourceFile}...`,
          "",
          `  ✓ Created ${testFileName}`,
          "",
          "The test file includes:",
          "  - Module import verification",
          "  - Placeholder for edge case tests",
          "",
          `Run \`cat ${testFileName}\` to see the generated tests.`,
        ].join("\n"),
        outputType: "success",
      };
    }

    return {
      output: 'I can create files for you! Try: claude "create a test file for utils.js"',
      outputType: "info",
    };
  }

  // Default: generic response
  return {
    output: [
      `⏺ Processing: "${input}"`,
      "",
      "I understand your request. In a real Claude Code session,",
      "I would analyze your codebase and help with this task.",
      "",
      "Try these commands:",
      '  claude "explain <file>"',
      '  claude "find bugs in <file>"',
      '  claude "fix the bug in <file>"',
      '  claude "create a test file for <file>"',
    ].join("\n"),
    outputType: "info",
  };
};
