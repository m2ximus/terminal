"use client";

import { useState } from "react";
import { Level } from "@/lib/tracks/types";
import { LevelIcon } from "@/lib/level-icons";
import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface LevelCompleteProps {
  level: Level;
  trackSlug: string;
  trackTitle: string;
  nextLevel: Level | null;
  onComplete: () => void;
}

const CONFETTI_COLORS = ["#4ade80", "#22c55e", "#86efac", "#16a34a", "#22d3ee", "#a7f3d0"];

export function LevelComplete({
  level,
  trackSlug,
  trackTitle,
  nextLevel,
  onComplete,
}: LevelCompleteProps) {
  const [confettiParticles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `-${Math.random() * 10}%`,
      backgroundColor: CONFETTI_COLORS[i % 6],
      animation: `confetti-fall ${2 + Math.random() * 2}s ${Math.random() * 0.5}s ease-in forwards`,
    })),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Confetti particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confettiParticles.map((style, i) => (
          <div key={i} className="absolute w-2 h-2 rounded-sm" style={style} />
        ))}
      </div>

      <div className="relative bg-bg-elevated border border-card-border rounded-2xl p-8 max-w-sm w-full mx-4 text-center animate-scale-in shadow-2xl">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <LevelIcon icon={level.icon} size={32} className="text-accent" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-text-bright mb-2">Level Complete!</h2>
        <h3 className="text-base text-text mb-1">{level.title}</h3>
        <p className="text-sm text-text-muted mb-6">You&apos;ve mastered {level.subtitle}</p>

        <div className="flex flex-col gap-3">
          {nextLevel ? (
            <Link
              href={`/track/${trackSlug}/${nextLevel.slug}`}
              onClick={onComplete}
              className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-black font-bold py-2.5 px-6 rounded-lg transition-colors text-sm active:scale-[0.98]"
            >
              Next: {nextLevel.title}
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-accent font-medium">
                <CheckCircle size={18} strokeWidth={1.5} />
                <span>Track complete!</span>
              </div>
              <p className="text-xs text-text-muted">
                You&apos;ve finished the {trackTitle} track.
              </p>
            </div>
          )}

          <Link
            href={`/track/${trackSlug}`}
            onClick={onComplete}
            className="text-text-muted hover:text-text text-sm transition-colors"
          >
            Back to {trackTitle}
          </Link>
        </div>
      </div>
    </div>
  );
}
