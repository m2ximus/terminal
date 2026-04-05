import { FSNode, FSDirectory, GrepResult } from "./types";

export const HOME = "/Users/learner";

export class VirtualFS {
  private nodes: Map<string, FSNode>;
  private _cwd: string;
  private _version: number;
  private _listeners: Set<() => void>;

  constructor(initial?: Map<string, FSNode>) {
    this.nodes = initial ? new Map(initial) : new Map();
    this._cwd = HOME;
    this._version = 0;
    this._listeners = new Set();
  }

  get cwd(): string {
    return this._cwd;
  }

  get version(): number {
    return this._version;
  }

  private notify() {
    this._version++;
    this._listeners.forEach((fn) => fn());
  }

  subscribe(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  getSnapshot(): number {
    return this._version;
  }

  // ── Path resolution ──

  resolvePath(input: string): string {
    let path: string;
    if (input.startsWith("/")) {
      path = input;
    } else if (input.startsWith("~")) {
      path = HOME + input.slice(1);
    } else {
      path = this._cwd + "/" + input;
    }
    return normalizePath(path);
  }

  setCwd(path: string): void {
    const resolved = this.resolvePath(path);
    const node = this.nodes.get(resolved);
    if (!node) throw new Error(`cd: no such file or directory: ${path}`);
    if (node.type !== "directory") throw new Error(`cd: not a directory: ${path}`);
    this._cwd = resolved;
    this.notify();
  }

  // ── Read operations ──

  getNode(path: string): FSNode | null {
    return this.nodes.get(path) ?? null;
  }

  exists(path: string): boolean {
    return this.nodes.has(path);
  }

  isDirectory(path: string): boolean {
    return this.nodes.get(path)?.type === "directory";
  }

  isFile(path: string): boolean {
    return this.nodes.get(path)?.type === "file";
  }

  readFile(path: string): string {
    const node = this.nodes.get(path);
    if (!node) throw new Error(`No such file: ${path}`);
    if (node.type !== "file") throw new Error(`Is a directory: ${path}`);
    return node.content;
  }

  listDirectory(path: string): { name: string; node: FSNode }[] {
    const dir = this.nodes.get(path);
    if (!dir) throw new Error(`No such directory: ${path}`);
    if (dir.type !== "directory") throw new Error(`Not a directory: ${path}`);

    const prefix = path === "/" ? "/" : path + "/";
    const results: { name: string; node: FSNode }[] = [];

    for (const [p, node] of this.nodes) {
      if (p === path) continue;
      if (!p.startsWith(prefix)) continue;
      // Only direct children (no deeper nesting)
      const rest = p.slice(prefix.length);
      if (rest.includes("/")) continue;
      results.push({ name: node.name, node });
    }

    return results.sort((a, b) => a.name.localeCompare(b.name));
  }

  // ── Write operations ──

  createDirectory(path: string, recursive = false): void {
    if (this.nodes.has(path)) {
      if (this.isDirectory(path) && recursive) return;
      throw new Error(`File exists: ${path}`);
    }

    if (recursive) {
      const parts = path.split("/").filter(Boolean);
      let current = "";
      for (const part of parts) {
        current += "/" + part;
        if (!this.nodes.has(current)) {
          this.nodes.set(current, mkDir(part));
        }
      }
    } else {
      const parentPath = getParent(path);
      if (!this.nodes.has(parentPath)) {
        throw new Error(`No such file or directory: ${parentPath}`);
      }
      this.nodes.set(path, mkDir(basename(path)));
    }
    this.notify();
  }

  createFile(path: string, content = ""): void {
    const parentPath = getParent(path);
    if (!this.nodes.has(parentPath)) {
      throw new Error(`No such file or directory: ${parentPath}`);
    }
    const now = Date.now();
    if (this.nodes.has(path)) {
      // touch: update modified time
      const existing = this.nodes.get(path)!;
      existing.modifiedAt = now;
      this.notify();
      return;
    }
    this.nodes.set(path, {
      name: basename(path),
      type: "file",
      permissions: "rw-r--r--",
      content,
      createdAt: now,
      modifiedAt: now,
    });
    this.notify();
  }

  writeFile(path: string, content: string, append = false): void {
    if (this.nodes.has(path)) {
      const node = this.nodes.get(path)!;
      if (node.type !== "file") throw new Error(`Is a directory: ${path}`);
      node.content = append ? node.content + content : content;
      node.modifiedAt = Date.now();
    } else {
      this.createFile(path, content);
      return;
    }
    this.notify();
  }

  copyNode(src: string, dest: string, recursive = false): void {
    const srcNode = this.nodes.get(src);
    if (!srcNode) throw new Error(`No such file or directory: ${src}`);

    if (srcNode.type === "directory") {
      if (!recursive) throw new Error(`${src} is a directory (not copied)`);
      // If dest exists and is a directory, copy into it
      let targetDir = dest;
      if (this.nodes.has(dest) && this.isDirectory(dest)) {
        targetDir = dest + "/" + basename(src);
      }
      // Copy the directory and all contents
      this.nodes.set(targetDir, mkDir(basename(targetDir)));
      const prefix = src + "/";
      for (const [p, node] of this.nodes) {
        if (p.startsWith(prefix)) {
          const newPath = targetDir + p.slice(src.length);
          this.nodes.set(newPath, { ...node, name: basename(newPath) });
        }
      }
    } else {
      // If dest is a directory, copy file into it
      let targetPath = dest;
      if (this.nodes.has(dest) && this.isDirectory(dest)) {
        targetPath = dest + "/" + srcNode.name;
      }
      this.nodes.set(targetPath, {
        ...srcNode,
        name: basename(targetPath),
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      });
    }
    this.notify();
  }

  moveNode(src: string, dest: string): void {
    const srcNode = this.nodes.get(src);
    if (!srcNode) throw new Error(`No such file or directory: ${src}`);

    let targetPath = dest;
    if (this.nodes.has(dest) && this.isDirectory(dest)) {
      targetPath = dest + "/" + basename(src);
    }

    if (srcNode.type === "directory") {
      // Move directory and all children
      const prefix = src + "/";
      const toMove: [string, FSNode][] = [];
      for (const [p, node] of this.nodes) {
        if (p === src || p.startsWith(prefix)) {
          toMove.push([p, node]);
        }
      }
      for (const [p] of toMove) {
        this.nodes.delete(p);
      }
      for (const [p, node] of toMove) {
        const newPath = p === src ? targetPath : targetPath + p.slice(src.length);
        this.nodes.set(newPath, { ...node, name: basename(newPath) });
      }
    } else {
      this.nodes.delete(src);
      this.nodes.set(targetPath, {
        ...srcNode,
        name: basename(targetPath),
        modifiedAt: Date.now(),
      });
    }
    this.notify();
  }

  removeNode(path: string, recursive = false): void {
    const node = this.nodes.get(path);
    if (!node) throw new Error(`No such file or directory: ${path}`);

    if (node.type === "directory") {
      if (!recursive) {
        // Check if empty
        const children = this.listDirectory(path);
        if (children.length > 0) {
          throw new Error(`Directory not empty: ${path}`);
        }
      }
      // Remove dir and all children
      const prefix = path + "/";
      const toDelete: string[] = [path];
      for (const p of this.nodes.keys()) {
        if (p.startsWith(prefix)) toDelete.push(p);
      }
      for (const p of toDelete) this.nodes.delete(p);
    } else {
      this.nodes.delete(path);
    }
    this.notify();
  }

  setPermissions(path: string, mode: string): void {
    const node = this.nodes.get(path);
    if (!node) throw new Error(`No such file or directory: ${path}`);
    node.permissions = mode;
    this.notify();
  }

  // ── Search operations ──

  find(startPath: string, namePattern: string): string[] {
    const results: string[] = [];
    const prefix = startPath === "/" ? "/" : startPath + "/";
    const regex = globToRegex(namePattern);

    for (const [p] of this.nodes) {
      if (p === startPath || p.startsWith(prefix)) {
        if (regex.test(basename(p))) {
          results.push(p);
        }
      }
    }
    return results.sort();
  }

  grep(path: string, pattern: RegExp, recursive = false): GrepResult[] {
    const results: GrepResult[] = [];

    const searchFile = (filePath: string) => {
      const node = this.nodes.get(filePath);
      if (!node || node.type !== "file") return;
      const lines = node.content.split("\n");
      lines.forEach((line, i) => {
        if (pattern.test(line)) {
          results.push({ path: filePath, line: i + 1, content: line });
        }
      });
    };

    const node = this.nodes.get(path);
    if (!node) throw new Error(`No such file or directory: ${path}`);

    if (node.type === "file") {
      searchFile(path);
    } else if (recursive) {
      const prefix = path === "/" ? "/" : path + "/";
      for (const [p] of this.nodes) {
        if ((p === path || p.startsWith(prefix)) && this.isFile(p)) {
          searchFile(p);
        }
      }
    } else {
      // Search files directly in the directory
      const children = this.listDirectory(path);
      for (const child of children) {
        if (child.node.type === "file") {
          const childPath = path === "/" ? "/" + child.name : path + "/" + child.name;
          searchFile(childPath);
        }
      }
    }

    return results;
  }

  // ── Utility ──

  getAllPaths(): string[] {
    return Array.from(this.nodes.keys()).sort();
  }

  getChildNames(dirPath: string): string[] {
    try {
      return this.listDirectory(dirPath).map((c) => c.name);
    } catch {
      return [];
    }
  }
}

// ── Helpers ──

function normalizePath(path: string): string {
  const parts = path.split("/");
  const resolved: string[] = [];
  for (const part of parts) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      resolved.pop();
    } else {
      resolved.push(part);
    }
  }
  return "/" + resolved.join("/");
}

function basename(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] || "";
}

function getParent(path: string): string {
  const parts = path.split("/").filter(Boolean);
  parts.pop();
  return "/" + parts.join("/");
}

function mkDir(name: string): FSDirectory {
  const now = Date.now();
  return {
    name,
    type: "directory",
    permissions: "rwxr-xr-x",
    createdAt: now,
    modifiedAt: now,
  };
}

function globToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp("^" + escaped + "$");
}
