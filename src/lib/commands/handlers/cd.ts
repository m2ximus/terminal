import { CommandHandler } from "../types";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const cd: CommandHandler = ({ fs, args }) => {
  const target = args[0] || "~";
  try {
    fs.setCwd(target);
    return { output: "", outputType: "stdout" };
  } catch (err) {
    return { output: (err as Error).message, outputType: "stderr" };
  }
};
