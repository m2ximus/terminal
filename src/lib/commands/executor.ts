import { VirtualFS } from "@/lib/filesystem/VirtualFS";
import { ParsedCommand, CommandHandler, CommandResult } from "./types";
import { parseCommand } from "./parser";

// Import all handlers
import { pwd } from "./handlers/pwd";
import { ls } from "./handlers/ls";
import { cd } from "./handlers/cd";
import { clear } from "./handlers/clear";
import { help } from "./handlers/help";
import { mkdir } from "./handlers/mkdir";
import { touch } from "./handlers/touch";
import { cat } from "./handlers/cat";
import { echo } from "./handlers/echo";
import { cp } from "./handlers/cp";
import { mv } from "./handlers/mv";
import { rm } from "./handlers/rm";
import { head } from "./handlers/head";
import { tail } from "./handlers/tail";
import { findCmd } from "./handlers/find";
import { grep } from "./handlers/grep";
import { chmod } from "./handlers/chmod";
import { which } from "./handlers/which";
import { history } from "./handlers/history";
import { open } from "./handlers/open";
import { alias } from "./handlers/alias";
import { npm, npx, git, claudeCode } from "./handlers/level8";

const ALL_COMMANDS: Record<string, CommandHandler> = {
  pwd,
  ls,
  cd,
  clear,
  help,
  mkdir,
  touch,
  cat,
  echo,
  cp,
  mv,
  rm,
  head,
  tail,
  find: findCmd,
  grep,
  chmod,
  which,
  history,
  open,
  alias,
  npm,
  npx,
  git,
  claude: claudeCode,
};

export class CommandExecutor {
  private commandHistory: string[] = [];

  execute(
    input: string,
    fs: VirtualFS,
    availableCommands: string[]
  ): CommandResult {
    const parsed = parseCommand(input);
    if (!parsed) {
      return { output: "", outputType: "stdout" };
    }

    this.commandHistory.push(input);
    return this.executeParsed(parsed, fs, availableCommands);
  }

  private executeParsed(
    parsed: ParsedCommand,
    fs: VirtualFS,
    availableCommands: string[]
  ): CommandResult {
    const handler = ALL_COMMANDS[parsed.command];

    if (!handler) {
      return {
        output: `command not found: ${parsed.command}`,
        outputType: "stderr",
      };
    }

    // Check if command is available in current level
    if (!availableCommands.includes(parsed.command)) {
      return {
        output: getLockedMessage(parsed.command),
        outputType: "info",
      };
    }

    try {
      let result = handler({
        fs,
        args: parsed.args,
        flags: parsed.flags,
        stdin: parsed.stdin,
        history: this.commandHistory,
      });

      // Handle redirect
      if (parsed.redirect && result.output && result.outputType === "stdout") {
        const target = fs.resolvePath(parsed.redirect.target);
        fs.writeFile(target, result.output + "\n", parsed.redirect.type === ">>");
        result = { output: "", outputType: "stdout" };
      }

      // Handle pipe - pass output as stdin to next command
      if (parsed.pipe && result.output) {
        const nextParsed = { ...parsed.pipe, raw: parsed.raw, stdin: result.output };
        return this.executeParsed(nextParsed, fs, availableCommands);
      }

      return result;
    } catch (err) {
      return {
        output: `${parsed.command}: ${(err as Error).message}`,
        outputType: "stderr",
      };
    }
  }

  getHistory(): string[] {
    return [...this.commandHistory];
  }
}

// ── Sarcastic locked command messages ──

const SNARKY_MESSAGES = [
  (cmd: string) =>
    `Whoa there, hotshot — '${cmd}' is locked. Someone's been using Terminal before, huh?`,
  (cmd: string) =>
    `'${cmd}'? Bit ahead of ourselves, aren't we? Finish this level first, speedrunner.`,
  (cmd: string) =>
    `Nice try with '${cmd}'. If this is too easy, try the Speed Test — tryterminal.dev/speed-test`,
  (cmd: string) =>
    `'${cmd}' isn't available yet. But respect for jumping the gun. Keep going and you'll unlock it soon.`,
  (cmd: string) =>
    `Hold up — '${cmd}' is a few levels away. Patience, young terminal warrior.`,
  (cmd: string) =>
    `'${cmd}'? Look at you, already thinking ahead. Complete this level and it's all yours.`,
  (cmd: string) =>
    `Slow down, hacker. '${cmd}' unlocks later. If you already know this stuff, go try the Speed Test.`,
  (cmd: string) =>
    `Someone knows their way around a terminal... '${cmd}' is locked here though. Skip ahead?`,
  (cmd: string) =>
    `'${cmd}' is locked. If you're too cool for this level, the Speed Test is waiting for you.`,
  (cmd: string) =>
    `Ooh, '${cmd}' — fancy. You'll get there. One level at a time.`,
];

let lastSnarkIndex = -1;

function getLockedMessage(cmd: string): string {
  let idx = Math.floor(Math.random() * SNARKY_MESSAGES.length);
  // Avoid repeating the same message twice in a row
  if (idx === lastSnarkIndex) {
    idx = (idx + 1) % SNARKY_MESSAGES.length;
  }
  lastSnarkIndex = idx;
  return SNARKY_MESSAGES[idx](cmd);
}
