import { CommandHandler } from "../types";

export const touch: CommandHandler = ({ fs, args }) => {
  if (args.length === 0) {
    return { output: "touch: missing file operand", outputType: "stderr" };
  }

  for (const arg of args) {
    try {
      const path = fs.resolvePath(arg);
      fs.createFile(path);
    } catch (err) {
      return { output: `touch: ${(err as Error).message}`, outputType: "stderr" };
    }
  }

  return { output: "", outputType: "stdout" };
};
