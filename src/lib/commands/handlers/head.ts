import { CommandHandler } from "../types";

export const head: CommandHandler = ({ fs, args, flags }) => {
  let n = 10;
  const remaining = [...args];

  // Handle -n <count>
  if (flags.n && remaining.length > 0) {
    const parsed = parseInt(remaining[0], 10);
    if (!isNaN(parsed)) {
      n = parsed;
      remaining.shift();
    }
  }

  const filePath = remaining[0];
  if (!filePath) return { output: "head: missing file operand", outputType: "stderr" };

  try {
    const path = fs.resolvePath(filePath);
    const content = fs.readFile(path);
    const lines = content.split("\n").slice(0, n);
    return { output: lines.join("\n"), outputType: "stdout" };
  } catch (err) {
    return { output: `head: ${(err as Error).message}`, outputType: "stderr" };
  }
};
