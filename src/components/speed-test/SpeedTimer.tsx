"use client";

import { useState, useEffect, useRef } from "react";
import { Timer } from "lucide-react";

function formatTime(ms: number) {
  const secs = ms / 1000;
  if (secs < 60) return `${secs.toFixed(1)}s`;
  const mins = Math.floor(secs / 60);
  const remainder = (secs % 60).toFixed(1);
  return `${mins}m ${remainder}s`;
}

interface SpeedTimerProps {
  startTime: number;
  running: boolean;
  finalTime?: number;
}

export function SpeedTimer({ startTime, running, finalTime }: SpeedTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (running && startTime > 0) {
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 50);
    }
    return () => clearInterval(timerRef.current);
  }, [running, startTime]);

  const displayTime = finalTime ?? elapsed;

  return (
    <div className="flex items-center gap-2">
      <Timer size={14} strokeWidth={1.5} className="text-text-muted" />
      <span className="text-lg font-bold text-accent tabular-nums">{formatTime(displayTime)}</span>
    </div>
  );
}
