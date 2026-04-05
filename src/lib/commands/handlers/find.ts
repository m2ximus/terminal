import { CommandHandler } from "../types";

export const findCmd: CommandHandler = ({ fs, args }) => {
  let startPath = fs.cwd;
  let namePattern = "*";

  // Parse: find <path> -name <pattern> OR find . -name <pattern>
  const nameIdx = args.indexOf("-name");
  if (nameIdx !== -1 && args[nameIdx + 1]) {
    namePattern = args[nameIdx + 1];
    if (nameIdx > 0) {
      startPath = fs.resolvePath(args[0]);
    }
  } else if (args.length > 0 && args[0] !== "-name") {
    startPath = fs.resolvePath(args[0]);
  }

  try {
    const results = fs.find(startPath, namePattern);
    return { output: results.join("\n"), outputType: "stdout" };
  } catch (err) {
    return { output: `find: ${(err as Error).message}`, outputType: "stderr" };
  }
};
