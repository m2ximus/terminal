import { Level } from "../types";
import { createLevel5FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const level5: Level = {
  id: 5,
  slug: "reading-and-writing",
  title: "Reading & Writing",
  subtitle: "cat, head, tail, echo",
  description:
    "Read what's inside files and write new content — all without opening an app.",
  initialFS: createLevel5FS,
  initialCwd: HOME,
  availableCommands: [
    "pwd", "ls", "clear", "help", "cd", "mkdir", "touch", "open",
    "cp", "mv", "rm", "cat", "head", "tail", "echo",
  ],
  tasks: [
    {
      id: "5-1",
      instruction:
        "Let's look inside some files. First, navigate to your project by typing **`cd projects/mysite`** — you can go multiple folders deep in one command by separating them with `/`.",
      validation: {
        type: "cwd_equals",
        path: `${HOME}/projects/mysite`,
      },
    },
    {
      id: "5-2",
      instruction:
        'Now let\'s read a file. The `cat` command prints out everything inside a file (the name comes from "concatenate" but just think of it as "show me what\'s in this file"). Type **`cat index.html`**',
      validation: {
        type: "command",
        command: "cat",
        argsContain: ["index.html"],
      },
    },
    {
      id: "5-3",
      instruction:
        "Go back to your home folder with **`cd ~`**, then try **`head Documents/log.txt`** — this shows only the first 10 lines of a file. Really useful when a file is hundreds of lines long and you just want a quick peek.",
      hint: "First type cd ~ and press Enter, then type head Documents/log.txt",
      validation: {
        type: "command",
        command: "head",
        argsContain: ["log.txt"],
      },
    },
    {
      id: "5-4",
      instruction:
        "`tail` is the opposite — it shows the last 10 lines. This is great for reading the latest entries in a log file. Type **`tail Documents/log.txt`**",
      validation: {
        type: "command",
        command: "tail",
        argsContain: ["log.txt"],
      },
    },
    {
      id: "5-5",
      instruction:
        'Now let\'s write to a file. The `echo` command just repeats text, but when you add `>` after it, the text gets saved to a file instead. The `>` symbol means "send the output into this file". Type: **`echo "Hello World" > greeting.txt`**',
      hint: 'The > symbol creates a new file (or replaces the old one). Make sure to include the quotes around Hello World.',
      validation: {
        type: "file_contains",
        path: `${HOME}/greeting.txt`,
        content: "Hello World",
      },
    },
    {
      id: "5-6",
      instruction:
        'What if you want to add more text without erasing what\'s already there? Use `>>` (double arrow) instead of `>`. This adds to the end of the file. Type: **`echo "Goodbye World" >> greeting.txt`**',
      hint: ">> adds to the file. > would replace it. Two arrows = append.",
      validation: {
        type: "file_contains",
        path: `${HOME}/greeting.txt`,
        content: "Goodbye World",
      },
    },
  ],
};
