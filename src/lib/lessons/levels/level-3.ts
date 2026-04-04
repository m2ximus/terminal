import { Level } from "../types";
import { createLevel3FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const level3: Level = {
  id: 3,
  slug: "creating-your-world",
  title: "Creating Your World",
  subtitle: "mkdir, touch, open",
  description:
    "Start building! Create folders and files from the terminal and watch them appear in the Finder.",
  initialFS: createLevel3FS,
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
  ],
  tasks: [
    {
      id: "3-1",
      instruction:
        'You know how you\'d right-click in Finder and choose "New Folder"? In the terminal, the command is `mkdir` — short for "make directory". Type **`mkdir projects`** to create a new folder called "projects". Watch it appear in the Finder!',
      validation: { type: "fs_exists", path: `${HOME}/projects` },
    },
    {
      id: "3-2",
      instruction:
        "A new folder just appeared in your Finder! Now go into it by typing **`cd projects`**",
      validation: { type: "cwd_equals", path: `${HOME}/projects` },
    },
    {
      id: "3-3",
      instruction:
        'Here\'s something cool — you can create a folder inside a folder that doesn\'t exist yet. The `-p` flag tells mkdir to create all the folders in the path. Type **`mkdir -p my-app/src`** — this creates "my-app" AND "src" inside it, all at once.',
      hint: 'The -p flag stands for "parents" — it creates any parent folders that are missing along the way',
      validation: {
        type: "fs_exists",
        path: `${HOME}/projects/my-app/src`,
      },
    },
    {
      id: "3-4",
      instruction:
        'Now let\'s create a file. The `touch` command creates a new empty file (or updates the timestamp if it already exists). Type **`touch index.html`** to create an HTML file right here.',
      validation: {
        type: "fs_exists",
        path: `${HOME}/projects/index.html`,
      },
    },
    {
      id: "3-5",
      instruction:
        "You can create files inside other folders too. Type **`touch my-app/src/app.js`** to create a JavaScript file inside the src folder you made earlier.",
      validation: {
        type: "fs_exists",
        path: `${HOME}/projects/my-app/src/app.js`,
      },
    },
    {
      id: "3-6",
      instruction:
        'On a real Mac, you can type `open .` to open the current folder in Finder (the dot means "this folder"). Try it: type **`open .`**',
      validation: { type: "command", command: "open" },
    },
  ],
};
