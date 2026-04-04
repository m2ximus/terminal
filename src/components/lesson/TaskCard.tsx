"use client";

import { Task } from "@/lib/tracks/types";
import { ValidationResult } from "@/lib/lessons/engine";
import { LevelIcon } from "@/lib/level-icons";
import { Lightbulb } from "lucide-react";
import { TrafficLights } from "@/components/ui/TrafficLights";

interface TaskCardProps {
  task: Task | null;
  taskIndex: number;
  totalTasks: number;
  lastResult: ValidationResult | null;
  showHint: boolean;
  hint: string | null;
  levelIcon: string;
  levelTitle: string;
  trackTitle: string;
  mobile?: boolean;
}

export function TaskCard({
  task,
  taskIndex,
  totalTasks,
  lastResult,
  showHint,
  hint,
  levelIcon,
  levelTitle,
  trackTitle,
  mobile,
}: TaskCardProps) {
  const progress = Math.min(taskIndex, totalTasks);

  if (mobile) {
    return (
      <div className="bg-bg-elevated border-b border-card-border px-4 py-3 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <LevelIcon icon={levelIcon} size={16} className="text-accent" />
          <span className="text-xs text-text-muted">
            {trackTitle} / {levelTitle}
          </span>
          <span className="ml-auto text-[10px] text-text-muted">
            {progress}/{totalTasks}
          </span>
        </div>
        <div className="h-1 bg-accent/10 rounded-full mb-2 overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${(progress / totalTasks) * 100}%` }}
          />
        </div>
        {task && (
          <div
            className="text-xs text-text leading-relaxed task-instruction"
            dangerouslySetInnerHTML={{ __html: formatInstruction(task.instruction) }}
          />
        )}
        {showHint && hint && (
          <div className="flex items-start gap-2 text-[11px] text-term-yellow bg-term-yellow/5 rounded-lg px-2 py-1.5 mt-2 animate-fade-in">
            <Lightbulb size={11} strokeWidth={1.5} className="shrink-0 mt-0.5" />
            <span>{hint}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card-bg border border-card-border rounded-lg shadow-window overflow-hidden">
      {/* Drag handle */}
      <div
        data-drag-handle
        className="px-3 py-2 bg-bg-elevated border-b border-card-border cursor-grab active:cursor-grabbing select-none flex items-center gap-[6px]"
      >
        <TrafficLights />
        <span className="flex-1 text-center text-[11px] text-text-muted">Task</span>
      </div>

      <div className="p-4">
        {/* Level icon + title — big and prominent */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
            <LevelIcon icon={levelIcon} size={20} className="text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-bright leading-tight">{levelTitle}</h2>
            <span className="text-[10px] text-text-muted uppercase tracking-wider">
              {trackTitle}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1 bg-accent/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${(progress / totalTasks) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-text-muted tabular-nums">
            {progress}/{totalTasks}
          </span>
        </div>

        {/* Task instruction */}
        {task && (
          <div className="space-y-2">
            <div
              className="text-[12px] text-text leading-relaxed task-instruction"
              dangerouslySetInnerHTML={{
                __html: formatInstruction(task.instruction),
              }}
            />

            {lastResult?.passed && (
              <p className="text-[12px] text-accent font-medium animate-slide-up">
                {lastResult.message}
              </p>
            )}

            {showHint && hint && (
              <div className="flex items-start gap-2 text-[11px] text-term-yellow bg-term-yellow/5 rounded-lg px-2.5 py-1.5 animate-fade-in">
                <Lightbulb size={11} strokeWidth={1.5} className="shrink-0 mt-0.5" />
                <span>{hint}</span>
              </div>
            )}
          </div>
        )}

        {!task && <p className="text-[12px] text-accent font-medium">Level complete</p>}
      </div>
    </div>
  );
}

function formatInstruction(text: string): string {
  return text
    .replace(
      /\*\*`([^`]+)`\*\*/g,
      '<span class="inline-flex items-center gap-1 my-0.5"><span class="text-[9px] text-text-muted uppercase tracking-wide">type</span><code class="bg-accent/15 border border-accent/30 px-2 py-0.5 rounded text-accent font-bold text-[12px]">$1</code></span>',
    )
    .replace(
      /`([^`]+)`/g,
      '<code class="bg-accent/10 px-1 py-0.5 rounded text-accent text-[11px]">$1</code>',
    )
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-text-bright font-semibold">$1</strong>');
}
