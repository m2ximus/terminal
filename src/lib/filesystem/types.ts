export interface FSNodeBase {
  name: string;
  type: "file" | "directory";
  permissions: string;
  createdAt: number;
  modifiedAt: number;
}

export interface FSFile extends FSNodeBase {
  type: "file";
  content: string;
}

export interface FSDirectory extends FSNodeBase {
  type: "directory";
}

export type FSNode = FSFile | FSDirectory;

export interface GrepResult {
  path: string;
  line: number;
  content: string;
}
