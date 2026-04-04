import { CommandHandler } from "../types";

const KNOWN_PATHS: Record<string, string> = {
  ls: "/bin/ls",
  cd: "(shell built-in)",
  pwd: "/bin/pwd",
  mkdir: "/bin/mkdir",
  touch: "/usr/bin/touch",
  cat: "/bin/cat",
  echo: "/bin/echo",
  cp: "/bin/cp",
  mv: "/bin/mv",
  rm: "/bin/rm",
  head: "/usr/bin/head",
  tail: "/usr/bin/tail",
  find: "/usr/bin/find",
  grep: "/usr/bin/grep",
  chmod: "/bin/chmod",
  which: "/usr/bin/which",
  open: "/usr/bin/open",
  npm: "/usr/local/bin/npm",
  npx: "/usr/local/bin/npx",
  git: "/usr/bin/git",
  node: "/usr/local/bin/node",
  python: "/usr/bin/python3",
  claude: "/usr/local/bin/claude",
};

export const which: CommandHandler = ({ args }) => {
  if (args.length === 0) {
    return { output: "which: missing argument", outputType: "stderr" };
  }

  const cmd = args[0];
  const path = KNOWN_PATHS[cmd];

  if (path) {
    return { output: path, outputType: "stdout" };
  }

  return { output: `${cmd} not found`, outputType: "stderr" };
};
