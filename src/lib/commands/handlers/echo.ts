import { CommandHandler } from "../types";

export const echo: CommandHandler = ({ args }) => {
  return { output: args.join(" "), outputType: "stdout" };
};
