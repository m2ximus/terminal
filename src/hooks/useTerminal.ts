"use client";

import { useState, useCallback, useRef } from "react";
import { VirtualFS, HOME } from "@/lib/filesystem/VirtualFS";
import { CommandExecutor } from "@/lib/commands/executor";

export type LineType = "input" | "stdout" | "stderr" | "info" | "success";

export interface TerminalLine {
  id: string;
  type: LineType;
  content: string;
  prompt?: string;
}

let lineId = 0;

function getPrompt(cwd: string): string {
  let dir = cwd;
  if (cwd === HOME) dir = "~";
  else if (cwd.startsWith(HOME + "/")) dir = "~" + cwd.slice(HOME.length);
  const base = dir.split("/").pop() || dir;
  const display = cwd === HOME ? "~" : base;
  return `learner@mac ${display} % `;
}

export function useTerminal(fs: VirtualFS, availableCommands: string[]) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const executorRef = useRef(new CommandExecutor());
  const commandHistoryRef = useRef<string[]>([]);

  const prompt = getPrompt(fs.cwd);

  const executeCommand = useCallback(
    (input: string) => {
      const trimmed = input.trim();
      if (!trimmed) {
        // Just add an empty prompt line
        setLines((prev) => [
          ...prev,
          { id: `line-${lineId++}`, type: "input", content: "", prompt },
        ]);
        setInputValue("");
        return null;
      }

      commandHistoryRef.current.push(trimmed);
      setHistoryIndex(-1);

      // Add the input line
      const inputLine: TerminalLine = {
        id: `line-${lineId++}`,
        type: "input",
        content: trimmed,
        prompt,
      };

      const result = executorRef.current.execute(trimmed, fs, availableCommands);

      if (result.clear) {
        setLines([]);
        setInputValue("");
        return result;
      }

      const newLines: TerminalLine[] = [inputLine];

      if (result.output) {
        newLines.push({
          id: `line-${lineId++}`,
          type: result.outputType,
          content: result.output,
        });
      }

      setLines((prev) => [...prev, ...newLines]);
      setInputValue("");
      return result;
    },
    [fs, availableCommands, prompt]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const hist = commandHistoryRef.current;
        if (hist.length === 0) return;
        const newIdx =
          historyIndex === -1 ? hist.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIdx);
        setInputValue(hist[newIdx]);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const hist = commandHistoryRef.current;
        if (historyIndex === -1) return;
        const newIdx = historyIndex + 1;
        if (newIdx >= hist.length) {
          setHistoryIndex(-1);
          setInputValue("");
        } else {
          setHistoryIndex(newIdx);
          setInputValue(hist[newIdx]);
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        // Tab completion
        const parts = inputValue.split(" ");
        const lastPart = parts[parts.length - 1];
        if (!lastPart) return;

        // Resolve the directory and prefix
        let dirPath: string;
        let prefix: string;

        if (lastPart.includes("/")) {
          const lastSlash = lastPart.lastIndexOf("/");
          const dirPart = lastPart.slice(0, lastSlash) || "/";
          dirPath = fs.resolvePath(dirPart);
          prefix = lastPart.slice(lastSlash + 1);
        } else {
          dirPath = fs.cwd;
          prefix = lastPart;
        }

        const children = fs.getChildNames(dirPath);
        const matches = children.filter((name) =>
          name.toLowerCase().startsWith(prefix.toLowerCase())
        );

        if (matches.length === 1) {
          const completed = matches[0];
          const completedPath = lastPart.includes("/")
            ? lastPart.slice(0, lastPart.lastIndexOf("/") + 1) + completed
            : completed;

          // Check if it's a directory to append /
          const fullPath = fs.resolvePath(completedPath);
          const suffix = fs.isDirectory(fullPath) ? "/" : " ";

          parts[parts.length - 1] = completedPath + suffix;
          setInputValue(parts.join(" "));
        } else if (matches.length > 1) {
          // Show options
          setLines((prev) => [
            ...prev,
            { id: `line-${lineId++}`, type: "input", content: inputValue, prompt },
            {
              id: `line-${lineId++}`,
              type: "stdout",
              content: matches.join("  "),
            },
          ]);
        }
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        setLines([]);
      } else if (e.key === "c" && e.ctrlKey) {
        e.preventDefault();
        setLines((prev) => [
          ...prev,
          { id: `line-${lineId++}`, type: "input", content: inputValue + "^C", prompt },
        ]);
        setInputValue("");
      }
    },
    [inputValue, historyIndex, fs, prompt]
  );

  return {
    lines,
    inputValue,
    setInputValue,
    executeCommand,
    handleKeyDown,
    prompt,
  };
}
