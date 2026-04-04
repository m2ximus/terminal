"use client";

import { useCallback, useState, useEffect } from "react";
import { Level } from "@/lib/lessons/types";
import { useVirtualFS } from "@/hooks/useVirtualFS";
import { useTerminal } from "@/hooks/useTerminal";
import { useLesson } from "@/hooks/useLesson";
import { useDraggable } from "@/hooks/useDraggable";
import { completeLevel } from "@/lib/progress";
import { Terminal } from "@/components/terminal/Terminal";
import { FinderWindow } from "@/components/finder/FinderWindow";
import { TaskCard } from "./TaskCard";
import { LevelComplete } from "./LevelComplete";
import { WelcomeModal } from "./WelcomeModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LevelIcon } from "@/lib/level-icons";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function LessonShell({ level }: { level: Level }) {
  const { fs, version } = useVirtualFS(level.initialFS);
  const [isDesktop, setIsDesktop] = useState(false);
  const [zOrder, setZOrder] = useState<("task" | "terminal" | "finder")[]>([
    "task",
    "terminal",
    "finder",
  ]);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const bringToFront = useCallback(
    (id: "task" | "terminal" | "finder") => {
      setZOrder((prev) => [...prev.filter((w) => w !== id), id]);
    },
    []
  );

  const getZ = (id: "task" | "terminal" | "finder") =>
    zOrder.indexOf(id) + 10;

  // Draggable positions — mostly side by side, ~10% overlap
  const taskDrag = useDraggable({
    initialPosition: { x: 16, y: 16 },
    onFocus: () => bringToFront("task"),
  });
  const termDrag = useDraggable({
    initialPosition: { x: 290, y: 12 },
    onFocus: () => bringToFront("terminal"),
  });
  const finderDrag = useDraggable({
    initialPosition: { x: 720, y: 24 },
    onFocus: () => bringToFront("finder"),
  });

  const {
    currentTask,
    taskIndex,
    totalTasks,
    lastResult,
    showHint,
    isComplete,
    validateCommand,
    hint,
  } = useLesson(level, fs);

  const terminal = useTerminal(fs, level.availableCommands);

  const handleSubmit = useCallback(
    (input: string) => {
      terminal.executeCommand(input);
      if (input.trim()) {
        validateCommand(input.trim());
      }
    },
    [terminal, validateCommand]
  );

  const handleComplete = useCallback(() => {
    completeLevel(level.id);
  }, [level.id]);

  const handleFinderNavigate = useCallback(
    (path: string) => {
      try {
        fs.setCwd(path);
      } catch {
        // Path might not exist
      }
    },
    [fs]
  );

  // ── Mobile layout ──
  if (!isDesktop) {
    return (
      <div className="flex flex-col h-screen bg-bg">
        <WelcomeModal />
        <div className="flex items-center justify-between px-4 py-2 border-b border-card-border bg-bg-elevated shrink-0">
          <Link
            href="/"
            className="text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={12} strokeWidth={1.5} />
            Levels
          </Link>
          <ThemeToggle />
        </div>
        <TaskCard
          task={currentTask}
          taskIndex={taskIndex}
          totalTasks={totalTasks}
          lastResult={lastResult}
          showHint={showHint}
          hint={hint}
          levelId={level.id}
          levelTitle={level.title}
          mobile
        />
        <div className="flex flex-col flex-1 gap-2 p-2 min-h-0">
          <div className="flex-1 min-h-0">
            <Terminal
              lines={terminal.lines}
              inputValue={terminal.inputValue}
              prompt={terminal.prompt}
              onInput={terminal.setInputValue}
              onSubmit={handleSubmit}
              onKeyDown={terminal.handleKeyDown}
            />
          </div>
          <div className="flex-1 min-h-0">
            <FinderWindow fs={fs} version={version} onNavigate={handleFinderNavigate} />
          </div>
        </div>
        {isComplete && (
          <LevelComplete level={level} onComplete={handleComplete} />
        )}
      </div>
    );
  }

  // ── Desktop layout — free-floating draggable windows ──
  return (
    <div className="relative h-screen bg-bg overflow-hidden">
      <WelcomeModal />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-bg/80 backdrop-blur-sm border-b border-card-border z-50">
        <Link
          href="/"
          className="text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={12} strokeWidth={1.5} />
          Levels
        </Link>
        <span className="text-[11px] text-text-muted">
          Level {level.id} / {level.title}
        </span>
        <ThemeToggle />
      </div>

      {/* Task card — draggable */}
      <div
        className="absolute"
        style={{
          ...taskDrag.style,
          zIndex: getZ("task"),
          top: 48,
          left: 0,
          width: 280,
        }}
        onMouseDown={taskDrag.handleMouseDown}
      >
        <TaskCard
          task={currentTask}
          taskIndex={taskIndex}
          totalTasks={totalTasks}
          lastResult={lastResult}
          showHint={showHint}
          hint={hint}
          levelId={level.id}
          levelTitle={level.title}
        />
      </div>

      {/* Terminal — draggable */}
      <div
        className="absolute"
        style={{
          ...termDrag.style,
          zIndex: getZ("terminal"),
          top: 48,
          left: 0,
          width: "min(42vw, 560px)",
          height: "min(75vh, 560px)",
        }}
        onMouseDown={termDrag.handleMouseDown}
      >
        <Terminal
          lines={terminal.lines}
          inputValue={terminal.inputValue}
          prompt={terminal.prompt}
          onInput={terminal.setInputValue}
          onSubmit={handleSubmit}
          onKeyDown={terminal.handleKeyDown}
          onFocus={() => bringToFront("terminal")}
        />
      </div>

      {/* Finder — draggable, offset to overlap */}
      <div
        className="absolute"
        style={{
          ...finderDrag.style,
          zIndex: getZ("finder"),
          top: 48,
          left: 0,
          width: "min(42vw, 540px)",
          height: "min(70vh, 520px)",
        }}
        onMouseDown={finderDrag.handleMouseDown}
      >
        <FinderWindow
          fs={fs}
          version={version}
          onFocus={() => bringToFront("finder")}
          onNavigate={handleFinderNavigate}
        />
      </div>

      {isComplete && (
        <LevelComplete level={level} onComplete={handleComplete} />
      )}
    </div>
  );
}
