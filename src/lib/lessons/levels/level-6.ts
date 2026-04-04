import { Level } from "../types";
import { createLevel6FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const level6: Level = {
  id: 6,
  slug: "finding-things",
  title: "Finding Things",
  subtitle: "find, grep, pipes",
  description:
    "Search for files by name, search inside files for text, and chain commands together like a pro.",
  initialFS: createLevel6FS,
  initialCwd: HOME,
  availableCommands: [
    "pwd", "ls", "clear", "help", "cd", "mkdir", "touch", "open",
    "cp", "mv", "rm", "cat", "head", "tail", "echo", "find", "grep",
  ],
  tasks: [
    {
      id: "6-1",
      instruction:
        'Imagine you have hundreds of files and need to find all the JavaScript ones. The `find` command searches by filename. The `*` is a wildcard — it means "anything". Type **`find projects -name "*.js"`** to find all files ending in .js.',
      hint: 'The * matches any characters. So *.js means "anything that ends with .js"',
      validation: {
        type: "command",
        command: "find",
        argsContain: ["*.js"],
      },
    },
    {
      id: "6-2",
      instruction:
        'That found files by name. But what if you want to search inside files for specific text? That\'s what `grep` does — it finds lines containing a word or phrase. Type **`grep "TODO" projects/webapp/src/index.js`** to find any TODO comments in that file.',
      validation: {
        type: "command",
        command: "grep",
        argsContain: ["TODO"],
      },
    },
    {
      id: "6-3",
      instruction:
        'Even more powerful — add `-r` to search through every file in a folder and all its subfolders. Type **`grep -r "TODO" projects`** to find every TODO comment across your entire project.',
      hint: "The -r flag stands for recursive — it digs through all subfolders",
      validation: {
        type: "command",
        command: "grep",
        argsContain: ["-r", "TODO"],
      },
    },
    {
      id: "6-4",
      instruction:
        "Add `-i` to ignore uppercase vs lowercase. Type **`grep -ri \"todo\" Documents`** — this finds TODO, todo, Todo, and any other capitalisation.",
      validation: {
        type: "command",
        command: "grep",
        argsContain: ["-i"],
      },
    },
    {
      id: "6-5",
      instruction:
        'Here\'s one of the most powerful ideas in the terminal: **pipes**. The `|` symbol (called "pipe") takes the output of one command and feeds it into another. Type: **`ls projects/webapp/src | grep js`** — this lists the files, then filters to only show ones containing "js".',
      hint: 'The | character is usually on the same key as the backslash \\, above the Enter key',
      validation: {
        type: "custom",
        check: (_fs, cmd) => cmd === "ls",
      },
    },
  ],
};
