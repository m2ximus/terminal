import { CommandHandler } from "../types";

export const history: CommandHandler = ({ history: hist }) => {
  if (hist.length === 0) {
    return { output: "No commands in history yet.", outputType: "stdout" };
  }

  const lines = hist.map((cmd, i) => `  ${String(i + 1).padStart(4)}  ${cmd}`);
  return { output: lines.join("\n"), outputType: "stdout" };
};
