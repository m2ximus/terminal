import { CommandHandler } from "../types";

export const mkdir: CommandHandler = ({ fs, args, flags }) => {
  if (args.length === 0) {
    return { output: "mkdir: missing operand", outputType: "stderr" };
  }

  const recursive = flags.p;

  for (const arg of args) {
    try {
      const path = fs.resolvePath(arg);
      fs.createDirectory(path, recursive);
    } catch (err) {
      return { output: `mkdir: ${(err as Error).message}`, outputType: "stderr" };
    }
  }

  return { output: "", outputType: "stdout" };
};
