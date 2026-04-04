import { CommandHandler } from "../types";

export const rm: CommandHandler = ({ fs, args, flags }) => {
  if (args.length === 0) {
    return { output: "rm: missing operand", outputType: "stderr" };
  }

  const recursive = flags.r || flags.R || flags.recursive;
  const force = flags.f;

  for (const arg of args) {
    const path = fs.resolvePath(arg);
    try {
      if (!fs.exists(path)) {
        if (force) continue;
        return { output: `rm: ${arg}: No such file or directory`, outputType: "stderr" };
      }
      fs.removeNode(path, recursive);
    } catch (err) {
      return { output: `rm: ${(err as Error).message}`, outputType: "stderr" };
    }
  }

  return { output: "", outputType: "stdout" };
};
