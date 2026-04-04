import { Level } from "../types";
import { createLevel4FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const level4: Level = {
  id: 4,
  slug: "file-operations",
  title: "File Operations",
  subtitle: "cp, mv, rm",
  description:
    "Copy, move, rename, and delete files — the same things you do in Finder, but faster.",
  initialFS: createLevel4FS,
  initialCwd: HOME,
  availableCommands: [
    "pwd",
    "ls",
    "clear",
    "help",
    "cd",
    "mkdir",
    "touch",
    "open",
    "cp",
    "mv",
    "rm",
  ],
  tasks: [
    {
      id: "4-1",
      instruction:
        'Let\'s copy a file — just like dragging a file while holding Option in Finder. The command is `cp` (copy), followed by the original, then where you want the copy. Type **`cp Documents/notes.txt Desktop/notes.txt`**',
      validation: { type: "fs_exists", path: `${HOME}/Desktop/notes.txt` },
    },
    {
      id: "4-2",
      instruction:
        'Now let\'s rename a file. There\'s no "rename" command — instead, `mv` (move) doubles as rename. If you "move" a file to the same folder but with a new name, it renames it. Type **`mv Documents/old-file.txt Documents/archive.txt`**',
      validation: {
        type: "fs_exists",
        path: `${HOME}/Documents/archive.txt`,
      },
    },
    {
      id: "4-3",
      instruction:
        '`mv` also moves files between folders (that\'s what it\'s really for). When the destination ends with `/`, it moves the file into that folder, keeping its name. Type **`mv Downloads/image.png Desktop/`**',
      hint: "The trailing / after Desktop tells the terminal you mean a folder, not a new filename",
      validation: {
        type: "fs_exists",
        path: `${HOME}/Desktop/image.png`,
      },
    },
    {
      id: "4-4",
      instruction:
        "Time to clean up. The `rm` command deletes a file — and unlike putting something in the Trash, this is permanent. There's no undo. Type **`rm Documents/archive.txt`** to delete it.",
      validation: {
        type: "fs_not_exists",
        path: `${HOME}/Documents/archive.txt`,
      },
    },
    {
      id: "4-5",
      instruction:
        'To delete an entire folder (and everything in it), you need the `-r` flag, which stands for "recursive" — meaning it goes through every file inside. Type **`rm -r projects/app`** to remove the whole app folder.',
      hint: "rm by itself won't delete folders — you need rm -r (recursive) to remove a folder and all its contents",
      validation: {
        type: "fs_not_exists",
        path: `${HOME}/projects/app`,
      },
    },
  ],
};
