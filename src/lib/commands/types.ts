import { VirtualFS } from "@/lib/filesystem/VirtualFS";

export interface ParsedCommand {
  raw: string;
  command: string;
  args: string[];
  flags: Record<string, boolean>;
  redirect?: { type: ">" | ">>"; target: string };
  pipe?: ParsedCommand;
  stdin?: string;
}

export interface CommandContext {
  fs: VirtualFS;
  args: string[];
  flags: Record<string, boolean>;
  stdin?: string;
  history: string[];
}

export type OutputType = "stdout" | "stderr" | "info" | "success";

export interface CommandResult {
  output: string;
  outputType: OutputType;
  clear?: boolean;
}

export type CommandHandler = (ctx: CommandContext) => CommandResult;
