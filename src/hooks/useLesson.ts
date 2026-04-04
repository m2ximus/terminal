"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { VirtualFS } from "@/lib/filesystem/VirtualFS";
import { Level } from "@/lib/lessons/types";
import { LessonEngine, ValidationResult } from "@/lib/lessons/engine";
import { parseCommand } from "@/lib/commands/parser";
import { saveTaskProgress, incrementCommands } from "@/lib/progress";

export function useLesson(level: Level, fs: VirtualFS) {
  const engineRef = useRef<LessonEngine>(new LessonEngine(level));
  const [taskIndex, setTaskIndex] = useState(0);
  const [lastResult, setLastResult] = useState<ValidationResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const engine = engineRef.current;

  // Restore task progress
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("tryterminal-progress");
      if (raw) {
        const data = JSON.parse(raw);
        const saved = data.taskProgress?.[level.id];
        if (saved && saved > 0) {
          engine.setTaskIndex(saved);
          setTaskIndex(saved);
        }
      }
    } catch {
      // ignore
    }
  }, [level.id, engine]);

  const validateCommand = useCallback(
    (input: string) => {
      if (engine.isComplete) return;

      incrementCommands();
      const parsed = parseCommand(input);
      if (!parsed) return;

      const result = engine.validate(
        parsed.command,
        parsed.args,
        parsed.flags,
        fs
      );

      setLastResult(result);

      if (result.passed) {
        setShowHint(false);
        const newIndex = engine.currentTaskIndex;
        setTaskIndex(newIndex);
        saveTaskProgress(level.id, newIndex);

        if (engine.isComplete) {
          setIsComplete(true);
        }
      } else if (result.showHint) {
        setShowHint(true);
      }
    },
    [engine, fs, level.id]
  );

  return {
    currentTask: engine.currentTask,
    taskIndex,
    totalTasks: level.tasks.length,
    lastResult,
    showHint,
    isComplete,
    validateCommand,
    hint: engine.currentTask?.hint || null,
  };
}
