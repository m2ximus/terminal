import { Level } from "../types";
import { createLevel2FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const level2: Level = {
  id: 2,
  slug: "moving-around",
  title: "Moving Around",
  subtitle: "cd, cd .., cd ~",
  description:
    "Learn to move between folders. It's like clicking into folders in Finder, but with text.",
  initialFS: createLevel2FS,
  initialCwd: HOME,
  availableCommands: ["pwd", "ls", "clear", "help", "cd"],
  tasks: [
    {
      id: "2-1",
      instruction:
        'In Finder, you\'d double-click a folder to open it. In the terminal, you type `cd` followed by the folder name. It stands for "change directory" (directory is just another word for folder). Type **`cd Documents`** to go into your Documents folder. Watch the Finder window follow along!',
      validation: { type: "cwd_equals", path: `${HOME}/Documents` },
    },
    {
      id: "2-2",
      instruction:
        "You're now inside Documents. The Finder on the right should be showing this folder too. Type **`ls`** to see what's in here.",
      validation: { type: "command", command: "ls" },
    },
    {
      id: "2-3",
      instruction:
        "You can see two folders: `work` and `personal`. Go deeper — type **`cd work`** to go into the work folder.",
      validation: { type: "cwd_equals", path: `${HOME}/Documents/work` },
    },
    {
      id: "2-4",
      instruction:
        'Now, how do you go back? In Finder you\'d click the back button. In the terminal, two dots `..` means "the folder above me" — the parent folder. Type **`cd ..`** to go back up to Documents.',
      hint: 'That\'s cd, then a space, then two dots. The two dots always mean "go up one level".',
      validation: { type: "cwd_equals", path: `${HOME}/Documents` },
    },
    {
      id: "2-5",
      instruction:
        'No matter how deep you go into folders, you can always jump straight home. The `~` symbol (called tilde — it\'s on the top-left of your keyboard) is a shortcut for your home folder. Type **`cd ~`** to go home instantly.',
      hint: "The ~ key is usually next to the number 1 on your keyboard, or press Shift + ` (the backtick key)",
      validation: { type: "cwd_equals", path: HOME },
    },
    {
      id: "2-6",
      instruction:
        'Here\'s a time-saver: the Tab key auto-completes folder names. Type **`cd Dow`** and then press the **Tab** key on your keyboard — it\'ll fill in "Downloads" for you. Then press Enter.',
      hint: "Start typing cd Dow and press the Tab key (above Caps Lock) — the terminal will finish the word for you",
      validation: { type: "cwd_equals", path: `${HOME}/Downloads` },
    },
  ],
};
