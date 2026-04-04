"use client";

import { useRef, useEffect } from "react";
import { Level } from "@/lib/lessons/types";
import { LevelIcon } from "@/lib/level-icons";

interface MatrixCardProps {
  level: Level;
  completed: boolean;
  unlocked: boolean;
  isCurrent: boolean;
}

const MATRIX_CHARS = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

export function MatrixCard({ level, completed, unlocked, isCurrent }: MatrixCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !unlocked) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const fontSize = 11;
    const columns = Math.floor(rect.width / fontSize);
    const drops: number[] = Array(columns).fill(0).map(() => Math.random() * -50);

    // Which characters in the title show at which column
    const title = level.title.toUpperCase();
    const titleStartCol = Math.floor((columns - title.length) / 2);

    const draw = () => {
      ctx.fillStyle = "rgba(10, 10, 11, 0.08)";
      ctx.fillRect(0, 0, rect.width, rect.height);

      for (let i = 0; i < drops.length; i++) {
        const y = drops[i] * fontSize;

        // Check if this column/row should show a title character
        const titleCharIdx = i - titleStartCol;
        const titleRow = Math.floor(rect.height * 0.45 / fontSize);
        const isOnTitleRow = Math.floor(drops[i]) === titleRow;
        const isTitleChar = titleCharIdx >= 0 && titleCharIdx < title.length && isOnTitleRow;

        if (isTitleChar) {
          ctx.fillStyle = completed ? "#22c55e" : "#4ade80";
          ctx.font = `bold ${fontSize}px monospace`;
          ctx.fillText(title[titleCharIdx], i * fontSize, y);
          ctx.font = `${fontSize}px monospace`;
        } else {
          // Random matrix character
          const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
          // Brighter at the head of the drop
          const brightness = Math.max(0, 1 - (titleRow - drops[i]) * 0.05);
          if (drops[i] > titleRow - 3 && drops[i] < titleRow + 1) {
            ctx.fillStyle = `rgba(74, 222, 128, ${0.6 * brightness})`;
          } else {
            ctx.fillStyle = `rgba(74, 222, 128, ${0.15 + Math.random() * 0.1})`;
          }
          ctx.fillText(char, i * fontSize, y);
        }

        if (y > rect.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.3 + Math.random() * 0.2;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [level.title, unlocked, completed]);

  return (
    <div
      className={`relative flex-shrink-0 w-48 h-72 rounded-xl overflow-hidden border transition-all group ${
        completed
          ? "border-accent/30"
          : unlocked
          ? "border-accent/20 hover:border-accent/50"
          : "border-card-border opacity-40"
      } ${isCurrent && !completed ? "ring-1 ring-accent/40" : ""}`}
    >
      {/* Matrix rain canvas */}
      {unlocked ? (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ background: "#0a0a0b" }}
        />
      ) : (
        <div className="absolute inset-0 bg-card-bg" />
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-4 justify-between">
        {/* Top: level number + status */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-accent/70 uppercase tracking-wider">
            Level {level.id}
          </span>
          {completed && (
            <span className="text-[10px] text-accent font-bold uppercase tracking-wide">
              Done
            </span>
          )}
          {!unlocked && (
            <span className="text-[10px] text-white/30 uppercase tracking-wide">Locked</span>
          )}
        </div>

        {/* Bottom: title + subtitle */}
        <div>
          <div className="mb-2">
            <LevelIcon levelId={level.id} size={28} className="text-accent/80" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">{level.title}</h3>
          <p className="text-[10px] text-white/50">{level.subtitle}</p>
        </div>
      </div>
    </div>
  );
}
