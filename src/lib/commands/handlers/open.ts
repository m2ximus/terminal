import { CommandHandler } from "../types";

export const open: CommandHandler = ({ fs, args }) => {
  const target = args[0] || ".";
  const resolved = fs.resolvePath(target);

  if (!fs.exists(resolved)) {
    return { output: `open: ${target}: No such file or directory`, outputType: "stderr" };
  }

  if (fs.isDirectory(resolved)) {
    return {
      output: `Opening ${resolved} in Finder... (look at the Finder view on the right! →)`,
      outputType: "info",
    };
  }

  return {
    output: `Opening ${fs.getNode(resolved)!.name}...`,
    outputType: "info",
  };
};
