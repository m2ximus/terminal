import { CommandHandler } from "../types";

const PERM_MAP: Record<string, string> = {
  "755": "rwxr-xr-x",
  "644": "rw-r--r--",
  "700": "rwx------",
  "600": "rw-------",
  "777": "rwxrwxrwx",
  "444": "r--r--r--",
  "500": "r-x------",
};

export const chmod: CommandHandler = ({ fs, args }) => {
  if (args.length < 2) {
    return { output: "chmod: missing operand", outputType: "stderr" };
  }

  const mode = args[0];
  const target = fs.resolvePath(args[1]);

  const permStr = PERM_MAP[mode];
  if (!permStr) {
    // Handle +x
    if (mode === "+x") {
      const node = fs.getNode(target);
      if (!node) return { output: `chmod: ${args[1]}: No such file or directory`, outputType: "stderr" };
      const perms = node.permissions.split("");
      perms[2] = "x";
      perms[5] = "x";
      perms[8] = "x";
      fs.setPermissions(target, perms.join(""));
      return { output: "", outputType: "stdout" };
    }
    return { output: `chmod: invalid mode: '${mode}'`, outputType: "stderr" };
  }

  try {
    fs.setPermissions(target, permStr);
    return { output: "", outputType: "stdout" };
  } catch (err) {
    return { output: `chmod: ${(err as Error).message}`, outputType: "stderr" };
  }
};
