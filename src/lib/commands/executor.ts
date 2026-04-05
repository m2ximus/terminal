import { VirtualFS } from "@/lib/filesystem/VirtualFS";
import { ParsedCommand, CommandHandler, CommandResult } from "./types";
import { parseCommand } from "./parser";
import { findCommandTrack } from "@/lib/tracks";

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
import { npm, npx } from "./handlers/level8";
import { git } from "./handlers/git";
import { claudeCode } from "./handlers/claude";

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

  execute(input: string, fs: VirtualFS, availableCommands: string[]): CommandResult {
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
    availableCommands: string[],
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
        output: getTrackAwareLockedMessage(parsed.command),
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
        availableCommands,
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

export function getTrackAwareLockedMessage(cmd: string): string {
  const result = findCommandTrack(cmd);
  if (result) {
    return `'${cmd}' is covered in the ${result.track.title} track. Head there to unlock it!`;
  }
  const fallbacks = [
    `'${cmd}' isn't available here. Try the Speed Test if this is too easy — tryterminal.dev/speed-test`,
    `'${cmd}'? Nice try — but it's not part of this level.`,
    `Hold up — '${cmd}' isn't unlocked yet. Keep going!`,
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}
