import { CommandHandler } from "../types";

export const clear: CommandHandler = () => {
  return { output: "", outputType: "stdout", clear: true };
};
