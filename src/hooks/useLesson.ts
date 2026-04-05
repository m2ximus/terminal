"use client";

import { useState, useCallback, useEffect } from "react";
import { VirtualFS } from "@/lib/filesystem/VirtualFS";
import { Level } from "@/lib/tracks/types";
import { LessonEngine, ValidationResult } from "@/lib/lessons/engine";
import { parseCommand } from "@/lib/commands/parser";
import { saveTaskProgress, incrementCommands } from "@/lib/progress";

export function useLesson(level: Level, trackSlug: string, fs: VirtualFS) {
  const [engine] = useState(() => new LessonEngine(level));
  const [taskIndex, setTaskIndex] = useState(0);
  const [lastResult, setLastResult] = useState<ValidationResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentTask, setCurrentTask] = useState(engine.currentTask);

  // Restore task progress
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("tryterminal-progress");
      if (raw) {
        const data = JSON.parse(raw);
        const saved = data.tracks?.[trackSlug]?.taskProgress?.[level.slug];
        if (saved && saved > 0) {
          engine.setTaskIndex(saved);
          const id = requestAnimationFrame(() => {
            setTaskIndex(saved);
            setCurrentTask(engine.currentTask);
          });
          return () => cancelAnimationFrame(id);
        }
      }
    } catch {
      // ignore
    }
  }, [trackSlug, level.slug, engine]);

  const validateCommand = useCallback(
    (input: string) => {
      if (engine.isComplete) return;

      incrementCommands();
      const parsed = parseCommand(input);
      if (!parsed) return;

      const result = engine.validate(parsed.command, parsed.args, parsed.flags, fs);

      setLastResult(result);

      if (result.passed) {
        setShowHint(false);
        const newIndex = engine.currentTaskIndex;
        setTaskIndex(newIndex);
        setCurrentTask(engine.currentTask);
        saveTaskProgress(trackSlug, level.slug, newIndex);

        if (engine.isComplete) {
          setIsComplete(true);
        }
      } else if (result.showHint) {
        setShowHint(true);
      }
    },
    [engine, fs, trackSlug, level.slug],
  );

  return {
    currentTask,
    taskIndex,
    totalTasks: level.tasks.length,
    lastResult,
    showHint,
    isComplete,
    validateCommand,
    hint: currentTask?.hint || null,
  };
}
