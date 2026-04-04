import { CommandHandler } from "../types";

export const mv: CommandHandler = ({ fs, args }) => {
  if (args.length < 2) {
    return { output: "mv: missing destination", outputType: "stderr" };
  }

  const src = fs.resolvePath(args[0]);
  const dest = fs.resolvePath(args[1]);

  try {
    fs.moveNode(src, dest);
    return { output: "", outputType: "stdout" };
  } catch (err) {
    return { output: `mv: ${(err as Error).message}`, outputType: "stderr" };
  }
};
