import { Level } from "../types";
import { createLevel1FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const level1: Level = {
  id: 1,
  slug: "where-am-i",
  title: "Where Am I?",
  subtitle: "pwd, ls, clear",
  description:
    "Your very first steps in the terminal. Find out where you are and what's around you.",
  initialFS: createLevel1FS,
  initialCwd: HOME,
  availableCommands: ["pwd", "ls", "clear", "help"],
  tasks: [
    {
      id: "1-1",
      instruction:
        'You just opened a terminal — it\'s like a text-based remote control for your computer. Right now you\'re "inside" a folder, but which one? Type **`pwd`** and press Enter. That stands for "print working directory" — it tells you which folder you\'re currently in.',
      validation: { type: "command", command: "pwd" },
    },
    {
      id: "1-2",
      instruction:
        'It says `/Users/learner` — that\'s your **home folder**. On a real Mac, this would be `/Users/` followed by your name (like `/Users/max`). It\'s the same folder you see when you open Finder. Now type **`ls`** to see what\'s inside this folder. Think of `ls` as "list stuff".',
      hint: 'Just type the letters ls and press Enter — it\'s short for "list"',
      validation: { type: "command", command: "ls" },
    },
    {
      id: "1-3",
      instruction:
        "Look at the Finder window on the right — those same folders (Desktop, Documents, etc.) are what `ls` just showed you. Now try **`ls -la`** to see a more detailed view, including hidden files. The `-l` means \"long format\" and `-a` means \"show all\" — even files that are normally invisible.",
      hint: "Type ls -la (that's a lowercase L, then A) and press Enter",
      validation: {
        type: "command",
        command: "ls",
        argsContain: ["-l", "-a"],
      },
    },
    {
      id: "1-4",
      instruction:
        'See those entries starting with a dot, like `.zshrc`? Those are hidden files — your computer uses them for settings. You normally can\'t see them in Finder. The screen is getting busy, so type **`clear`** to clean it up. Don\'t worry, nothing gets deleted — it just clears the screen.',
      validation: { type: "command", command: "clear" },
    },
    {
      id: "1-5",
      instruction:
        "Clean slate! Here's a trick — you can peek inside any folder without actually going into it. Type **`ls Documents`** to see what's inside your Documents folder from right here.",
      hint: "Type ls followed by a space and then Documents (capital D)",
      validation: {
        type: "command",
        command: "ls",
        argsContain: ["Documents"],
      },
    },
  ],
};
