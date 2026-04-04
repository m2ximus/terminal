import { CommandHandler } from "../types";

export const help: CommandHandler = () => {
  const lines = [
    "Available commands:",
    "",
    "  pwd          Print working directory",
    "  ls           List directory contents",
    "  cd <dir>     Change directory",
    "  mkdir <dir>  Create a directory",
    "  touch <file> Create a file",
    "  cat <file>   Display file contents",
    "  echo <text>  Print text (use > or >> to write to files)",
    "  cp <s> <d>   Copy files",
    "  mv <s> <d>   Move or rename files",
    "  rm <file>    Remove files (-r for directories)",
    "  head <file>  Show first lines of a file",
    "  tail <file>  Show last lines of a file",
    "  find <dir>   Find files by name",
    "  grep <pat>   Search for text in files",
    "  chmod <mode> Change file permissions",
    "  which <cmd>  Show command location",
    "  history      Show command history",
    "  clear        Clear the terminal",
    "  open .       Open current directory in Finder",
    "",
    "Tips: Use Tab for autocomplete, Up/Down for history",
  ];
  return { output: lines.join("\n"), outputType: "stdout" };
};
