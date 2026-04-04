import { CommandHandler } from "../types";

export const cat: CommandHandler = ({ fs, args }) => {
  if (args.length === 0) {
    return { output: "cat: missing file operand", outputType: "stderr" };
  }

  const outputs: string[] = [];
  for (const arg of args) {
    try {
      const path = fs.resolvePath(arg);
      outputs.push(fs.readFile(path));
    } catch (err) {
      return { output: `cat: ${(err as Error).message}`, outputType: "stderr" };
    }
  }

  return { output: outputs.join(""), outputType: "stdout" };
};
