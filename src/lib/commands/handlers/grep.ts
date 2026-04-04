import { CommandHandler } from "../types";

export const grep: CommandHandler = ({ fs, args, flags, stdin }) => {
  if (args.length === 0) {
    return { output: "grep: missing pattern", outputType: "stderr" };
  }

  const caseInsensitive = flags.i;
  const recursive = flags.r || flags.R;
  const pattern = args[0];

  // If we have stdin from a pipe, filter it
  if (stdin) {
    try {
      const regex = new RegExp(pattern, caseInsensitive ? "i" : "");
      const lines = stdin.split("\n").filter((line) => regex.test(line));
      return { output: lines.join("\n"), outputType: "stdout" };
    } catch (err) {
      return { output: `grep: ${(err as Error).message}`, outputType: "stderr" };
    }
  }

  const target = args[1] || (recursive ? "." : "");

  if (!target) {
    return { output: "grep: missing file or directory", outputType: "stderr" };
  }

  try {
    const regex = new RegExp(pattern, caseInsensitive ? "i" : "");
    const searchPath = fs.resolvePath(target);
    const results = fs.grep(searchPath, regex, recursive);

    if (results.length === 0) {
      return { output: "", outputType: "stdout" };
    }

    const lines = results.map((r) => {
      const displayPath = r.path.replace(fs.cwd + "/", "");
      return recursive || args.length > 2
        ? `${displayPath}:${r.content}`
        : r.content;
    });

    return { output: lines.join("\n"), outputType: "stdout" };
  } catch (err) {
    return { output: `grep: ${(err as Error).message}`, outputType: "stderr" };
  }
};
