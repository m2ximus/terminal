import { CommandHandler } from "../types";

export const pwd: CommandHandler = ({ fs }) => {
  return { output: fs.cwd, outputType: "stdout" };
};
