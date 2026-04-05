"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Trophy, Zap, RotateCcw } from "lucide-react";
import { SpeedTimer } from "@/components/speed-test/SpeedTimer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Terminal } from "@/components/terminal/Terminal";
import { useTerminal } from "@/hooks/useTerminal";
import { useVirtualFS } from "@/hooks/useVirtualFS";
import { parseCommand } from "@/lib/commands/parser";
import {
  Challenge,
  generateRound,
  loadLeaderboard,
  saveToLeaderboard,
  LeaderboardEntry,
} from "@/lib/speed-test";
import { createLevel1FS } from "@/lib/filesystem/initial-states";

const ALL_COMMANDS = [
  "pwd",
  "ls",
  "clear",
  "help",
  "cd",
  "mkdir",
  "touch",
  "open",
  "cp",
  "mv",
  "rm",
  "cat",
  "head",
  "tail",
  "echo",
  "find",
  "grep",
  "chmod",
  "which",
  "history",
  "alias",
  "npm",
  "npx",
  "git",
  "claude",
];

type GameState = "idle" | "playing" | "finished";

function formatTime(ms: number) {
  const secs = ms / 1000;
  if (secs < 60) return `${secs.toFixed(1)}s`;
  const mins = Math.floor(secs / 60);
  const remainder = (secs % 60).toFixed(1);
  return `${mins}m ${remainder}s`;
}

const diffColor: Record<string, string> = {
  easy: "text-accent",
  medium: "text-term-yellow",
  hard: "text-term-red",
};

export default function SpeedTestPage() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [saved, setSaved] = useState(false);

  const { fs } = useVirtualFS(createLevel1FS);
  const terminal = useTerminal(fs, ALL_COMMANDS);

  useEffect(() => {
    // Load from localStorage (external system) — update via scheduled callback
    const id = requestAnimationFrame(() => setLeaderboard(loadLeaderboard()));
    return () => cancelAnimationFrame(id);
  }, []);

  const startGame = useCallback(() => {
    const round = generateRound(10);
    setChallenges(round);
    setCurrentIndex(0);
    setStartTime(Date.now());
    setFinalTime(0);
    setGameState("playing");
    setSaved(false);
    setPlayerName("");
  }, []);

  const handleSubmit = useCallback(
    (input: string) => {
      terminal.executeCommand(input);

      if (gameState !== "playing") return;

      const trimmed = input.trim();
      if (!trimmed) return;

      const parsed = parseCommand(trimmed);
      if (!parsed) return;

      const challenge = challenges[currentIndex];
      if (!challenge) return;

      const passed = challenge.check(fs, parsed.command, parsed.args);

      if (passed) {
        const next = currentIndex + 1;
        if (next >= challenges.length) {
          // Done!
          const final_ = Date.now() - startTime;
          setFinalTime(final_);
          setGameState("finished");
        } else {
          setCurrentIndex(next);
        }
      }
    },
    [terminal, gameState, challenges, currentIndex, fs, startTime],
  );

  const handleSave = useCallback(() => {
    if (!playerName.trim()) return;
    const lb = saveToLeaderboard({
      name: playerName.trim(),
      time: finalTime,
      challenges: challenges.length,
      date: new Date().toISOString().split("T")[0],
    });
    setLeaderboard(lb);
    setSaved(true);
  }, [playerName, finalTime, challenges.length]);

  const currentChallenge = challenges[currentIndex];

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-3 border-b border-card-border">
        <Link
          href="/"
          className="text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={12} strokeWidth={1.5} />
          Back
        </Link>
        <span className="text-sm font-bold text-text-bright flex items-center gap-2">
          <Zap size={14} strokeWidth={1.5} className="text-term-yellow" />
          Speed Test
        </span>
        <ThemeToggle />
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left panel — challenge + leaderboard */}
        <div className="w-full lg:w-[380px] shrink-0 border-r border-card-border flex flex-col">
          {/* Challenge area */}
          <div className="p-6 flex-1">
            {gameState === "idle" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-text-bright tracking-tighter mb-2">
                    Terminal Speed Test
                  </h1>
                  <p className="text-sm text-text-muted leading-relaxed">
                    10 challenges. All commands unlocked. How fast can you go?
                  </p>
                </div>

                <button
                  onClick={startGame}
                  className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-black font-bold py-3 px-6 rounded-lg transition-colors text-sm active:scale-[0.98]"
                >
                  <Play size={16} strokeWidth={2} />
                  Start
                </button>

                {/* Leaderboard */}
                {leaderboard.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy size={14} strokeWidth={1.5} className="text-term-yellow" />
                      <span className="text-xs font-bold text-text-bright uppercase tracking-wider">
                        Leaderboard
                      </span>
                    </div>
                    <div className="space-y-1">
                      {leaderboard.slice(0, 10).map((entry, i) => (
                        <div
                          key={`${entry.name}-${entry.time}-${i}`}
                          className="flex items-center gap-2 text-[11px] py-1 px-2 rounded bg-card-bg border border-card-border"
                        >
                          <span
                            className={`w-5 font-bold tabular-nums ${i < 3 ? "text-term-yellow" : "text-text-muted"}`}
                          >
                            {i + 1}.
                          </span>
                          <span className="flex-1 text-text truncate">{entry.name}</span>
                          <span className="text-accent font-bold tabular-nums">
                            {formatTime(entry.time)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {gameState === "playing" && currentChallenge && (
              <div className="space-y-4">
                {/* Timer + progress */}
                <div className="flex items-center justify-between">
                  <SpeedTimer startTime={startTime} running={gameState === "playing"} />
                  <span className="text-xs text-text-muted tabular-nums">
                    {currentIndex + 1} / {challenges.length}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-accent/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-300"
                    style={{ width: `${(currentIndex / challenges.length) * 100}%` }}
                  />
                </div>

                {/* Challenge */}
                <div className="bg-card-bg border border-card-border rounded-lg p-4">
                  <span
                    className={`text-[10px] uppercase tracking-wider font-bold ${diffColor[currentChallenge.difficulty]}`}
                  >
                    {currentChallenge.difficulty}
                  </span>
                  <p className="text-base font-bold text-text-bright mt-1">
                    {currentChallenge.prompt}
                  </p>
                </div>
              </div>
            )}

            {gameState === "finished" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                    <Zap size={28} strokeWidth={1.5} className="text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold text-text-bright">{formatTime(finalTime)}</h2>
                  <p className="text-sm text-text-muted mt-1">
                    {challenges.length} challenges completed
                  </p>
                </div>

                {/* Save score */}
                {!saved ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSave()}
                      placeholder="Your name"
                      maxLength={20}
                      className="w-full bg-card-bg border border-card-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-accent/40 transition-colors"
                      autoFocus
                    />
                    <button
                      onClick={handleSave}
                      disabled={!playerName.trim()}
                      className="w-full bg-accent hover:bg-accent-hover disabled:opacity-40 text-black font-bold py-2.5 rounded-lg transition-colors text-sm active:scale-[0.98]"
                    >
                      Save to Leaderboard
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-accent text-center font-medium">Score saved</p>
                )}

                <button
                  onClick={startGame}
                  className="w-full flex items-center justify-center gap-2 border border-card-border hover:border-accent/30 text-text font-medium py-2.5 rounded-lg transition-colors text-sm"
                >
                  <RotateCcw size={14} strokeWidth={1.5} />
                  Play Again
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right panel — terminal */}
        <div className="flex-1 p-3 min-h-[400px] lg:min-h-0">
          <Terminal
            lines={terminal.lines}
            inputValue={terminal.inputValue}
            prompt={terminal.prompt}
            onInput={terminal.setInputValue}
            onSubmit={handleSubmit}
            onKeyDown={terminal.handleKeyDown}
          />
        </div>
      </div>
    </div>
  );
}
