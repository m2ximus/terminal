import { Level } from "../types";
import { createLevel7FS } from "@/lib/filesystem/initial-states";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const level7: Level = {
  id: 7,
  slug: "power-user",
  title: "Power User",
  subtitle: "chmod, which, history",
  description:
    "Learn about file permissions, where programs live on your computer, and handy shortcuts.",
  initialFS: createLevel7FS,
  initialCwd: HOME,
  availableCommands: [
    "pwd", "ls", "clear", "help", "cd", "mkdir", "touch", "open",
    "cp", "mv", "rm", "cat", "head", "tail", "echo", "find", "grep",
    "chmod", "which", "history", "alias",
  ],
  tasks: [
    {
      id: "7-1",
      instruction:
        'Every file on your computer has "permissions" — rules about who can read it, edit it, or run it. Let\'s check the permissions on a script file. Type **`ls -l scripts/deploy.sh`** — the `-l` flag shows the detailed view with permissions.',
      validation: {
        type: "command",
        command: "ls",
        argsContain: ["-l", "deploy.sh"],
      },
    },
    {
      id: "7-2",
      instruction:
        'See those letters like `rw-r--r--`? The `r` means read, `w` means write, and there\'s no `x` — which means nobody can "execute" (run) this file as a program. To make a script runnable, type **`chmod +x scripts/deploy.sh`** — `chmod` changes permissions, and `+x` adds execute permission.',
      hint: "chmod stands for 'change mode'. The +x part means 'add execute permission'",
      validation: {
        type: "custom",
        check: (fs) => {
          const node = fs.getNode(fs.resolvePath("scripts/deploy.sh"));
          return node ? node.permissions.includes("x") : false;
        },
      },
    },
    {
      id: "7-3",
      instruction:
        'When you type a command like `ls`, your computer finds and runs a program called `ls` that lives somewhere on your hard drive. The `which` command tells you where. Type **`which ls`** to find out where the ls program lives.',
      validation: {
        type: "command",
        command: "which",
        argsContain: ["ls"],
      },
    },
    {
      id: "7-4",
      instruction:
        "Try **`which node`** — this tells you where Node.js is installed. If a program isn't working, `which` helps you check if it's installed and where.",
      validation: {
        type: "command",
        command: "which",
        argsContain: ["node"],
      },
    },
    {
      id: "7-5",
      instruction:
        "The terminal remembers every command you've typed. Type **`history`** to see the full list. On a real Mac, you can also press the up arrow key to cycle through previous commands — try it!",
      validation: { type: "command", command: "history" },
    },
    {
      id: "7-6",
      instruction:
        "Tired of typing long commands? You can create shortcuts called aliases. Type **`alias`** to see some examples. On your real computer, you'd add these to your `~/.zshrc` file to make them permanent.",
      validation: { type: "command", command: "alias" },
    },
  ],
};
