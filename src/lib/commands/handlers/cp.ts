import { CommandHandler } from "../types";

export const cp: CommandHandler = ({ fs, args, flags }) => {
  if (args.length < 2) {
    return { output: "cp: missing destination", outputType: "stderr" };
  }

  const src = fs.resolvePath(args[0]);
  const dest = fs.resolvePath(args[1]);
  const recursive = flags.r || flags.R || flags.recursive;

  try {
    fs.copyNode(src, dest, recursive);
    return { output: "", outputType: "stdout" };
  } catch (err) {
    return { output: `cp: ${(err as Error).message}`, outputType: "stderr" };
  }
};
