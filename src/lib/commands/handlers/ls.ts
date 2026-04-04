import { CommandHandler } from "../types";
import { HOME } from "@/lib/filesystem/VirtualFS";

export const ls: CommandHandler = ({ fs, args, flags }) => {
  const target = args[0] ? fs.resolvePath(args[0]) : fs.cwd;

  if (!fs.exists(target)) {
    return { output: `ls: ${args[0] || target}: No such file or directory`, outputType: "stderr" };
  }

  if (fs.isFile(target)) {
    const node = fs.getNode(target)!;
    return { output: node.name, outputType: "stdout" };
  }

  const children = fs.listDirectory(target);
  const showHidden = flags.a || flags.all;
  const longFormat = flags.l;

  let filtered = showHidden
    ? children
    : children.filter((c) => !c.name.startsWith("."));

  if (longFormat) {
    const lines: string[] = [];
    if (showHidden) {
      lines.push("drwxr-xr-x  .  ");
      lines.push("drwxr-xr-x  .. ");
    }
    for (const { name, node } of filtered) {
      const perm = node.type === "directory" ? "d" + node.permissions : "-" + node.permissions;
      const size = node.type === "file" ? String(node.content.length).padStart(6) : "    --";
      const date = new Date(node.modifiedAt);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
      lines.push(`${perm}  ${size}  ${dateStr}  ${name}`);
    }
    return { output: lines.join("\n"), outputType: "stdout" };
  }

  const names = filtered.map(({ name, node }) => {
    if (node.type === "directory") return `\x1bDIR:${name}\x1b`;
    return name;
  });

  return { output: names.join("  "), outputType: "stdout" };
};
