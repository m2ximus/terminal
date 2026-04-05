import { CommandHandler } from "../types";

export const cd: CommandHandler = ({ fs, args }) => {
  const target = args[0] || "~";
  try {
    fs.setCwd(target);
    return { output: "", outputType: "stdout" };
  } catch (err) {
    return { output: (err as Error).message, outputType: "stderr" };
  }
};
