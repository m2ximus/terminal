"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TerminalSquare,
  Eye,
  Rocket,
  ArrowRight,
  ChevronRight,
  Keyboard,
  FolderOpen,
  Layers,
  GitBranch,
  Zap,
} from "lucide-react";
import { levels } from "@/lib/lessons";
import { loadProgress, isLevelUnlocked, ProgressData } from "@/lib/progress";
import { LevelSlider } from "@/components/landing/LevelSlider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ClaudeMark } from "@/components/ClaudeLogo";
import { Clawd } from "@/components/Clawd";

export default function Home() {
  const [progress, setProgress] = useState<ProgressData | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const nextLevel = progress
    ? levels.find(
        (l) =>
          !progress.completedLevels.includes(l.id) &&
          isLevelUnlocked(l.id, progress)
      ) ?? levels[0]
    : levels[0];

  const completedCount = progress?.completedLevels.length ?? 0;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-card-border max-w-[1400px] mx-auto w-full">
        <span className="text-accent font-bold text-sm tracking-tight">
          &gt;_ tryterminal
        </span>
        <div className="flex items-center gap-4">
          <a
            href="#how-it-works"
            className="text-xs text-text-muted hover:text-text transition-colors hidden sm:block"
          >
            How it works
          </a>
          <a
            href="#levels"
            className="text-xs text-text-muted hover:text-text transition-colors hidden sm:block"
          >
            Levels
          </a>
          <Link
            href="/speed-test"
            className="text-xs text-term-yellow hover:text-term-yellow/80 transition-colors hidden sm:flex items-center gap-1"
          >
            <Zap size={11} strokeWidth={1.5} />
            Speed Test
          </Link>
          <ThemeToggle />
          <Link
            href={`/learn/${nextLevel.slug}`}
            className="bg-accent hover:bg-accent-hover text-black font-bold py-1.5 px-4 rounded-lg transition-colors text-xs active:scale-[0.98]"
          >
            {completedCount > 0 ? "Continue" : "Start"}
          </Link>
        </div>
      </nav>

      {/* ── Hero — left-aligned per taste-skill Rule 3 ── */}
      <header className="max-w-[1400px] mx-auto w-full px-6 pt-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Free forever. No account needed.
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-text-bright tracking-tighter leading-none mb-5">
              Learn the terminal.
              <br />
              <span className="text-claude">Unlock Claude Code.</span>
            </h1>

            <p className="text-base text-text-muted leading-relaxed max-w-[50ch] mb-8">
              An interactive course that teaches you command line basics
              through a visual, hands-on experience. Type commands on the left,
              watch files appear on the right.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/learn/${nextLevel.slug}`}
                className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-black font-bold py-3 px-7 rounded-lg transition-colors text-sm active:scale-[0.98]"
              >
                {completedCount > 0
                  ? `Continue Level ${nextLevel.id}`
                  : "Start Learning"}
                <ArrowRight size={14} strokeWidth={2} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 border border-card-border hover:border-accent/30 text-text py-3 px-7 rounded-lg transition-colors text-sm"
              >
                How it works
                <ChevronRight size={14} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Right: Terminal preview with Clawd */}
          <div className="hidden lg:block">
            <div className="rounded-xl overflow-hidden border border-white/10 bg-[#1a1a1e] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#141416] border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                </div>
                <span className="text-[10px] text-[#71717a] ml-1">Terminal</span>
              </div>
              <div className="p-5 text-[12px] leading-[22px]">
                {/* Clawd mascot greeting */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/[0.06]">
                  <Clawd size={40} animated />
                  <div className="text-[11px] text-[#9e9e9e]">
                    <span className="text-[#d97757] font-bold">Claude Code</span>{" "}
                    v2.1
                  </div>
                </div>
                <div>
                  <span className="text-[#33ff00]">learner@mac ~ % </span>
                  <span className="text-[#cccccc]">mkdir my-project</span>
                </div>
                <div>
                  <span className="text-[#33ff00]">learner@mac ~ % </span>
                  <span className="text-[#cccccc]">cd my-project</span>
                </div>
                <div>
                  <span className="text-[#33ff00]">learner@mac my-project % </span>
                  <span className="text-[#cccccc]">npm init -y</span>
                </div>
                <div className="text-[#9e9e9e]">Wrote to package.json</div>
                <div>
                  <span className="text-[#33ff00]">learner@mac my-project % </span>
                  <span className="text-[#cccccc]">git init</span>
                </div>
                <div className="text-[#33ff00]">Initialized empty Git repository</div>
                <div>
                  <span className="text-[#33ff00]">learner@mac my-project % </span>
                  <span className="text-[#cccccc]">claude</span>
                </div>
                <div className="text-[#d97757]">Welcome to Claude Code!</div>
                <div className="mt-1">
                  <span className="text-[#33ff00]">learner@mac my-project % </span>
                  <span className="text-[#cccccc]/60 animate-cursor-blink">_</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── How it works ── */}
      <section id="how-it-works" className="bg-section-bg border-y border-card-border">
        <div className="max-w-[1400px] mx-auto w-full px-6 py-20">
          <p className="text-xs text-accent uppercase tracking-wider mb-3">
            How it works
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-text-bright tracking-tighter mb-12 max-w-md">
            Zero to terminal-confident in 30 minutes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
                <Keyboard size={18} strokeWidth={1.5} className="text-accent" />
              </div>
              <h3 className="text-sm font-bold text-text-bright mb-2">
                Type real commands
              </h3>
              <p className="text-sm text-text-muted leading-relaxed max-w-[40ch]">
                Our interactive terminal accepts real commands.
                Start with{" "}
                <code className="text-accent text-xs">ls</code> and{" "}
                <code className="text-accent text-xs">cd</code>, then
                build up to pipes, grep, and git.
              </p>
            </div>

            <div>
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
                <FolderOpen size={18} strokeWidth={1.5} className="text-accent" />
              </div>
              <h3 className="text-sm font-bold text-text-bright mb-2">
                See what happens visually
              </h3>
              <p className="text-sm text-text-muted leading-relaxed max-w-[40ch]">
                A Finder window mirrors your filesystem in real time.
                Type{" "}
                <code className="text-accent text-xs">mkdir</code> and
                watch the folder appear. Finally see what terminal
                commands actually do.
              </p>
            </div>

            <div>
              <div className="w-10 h-10 rounded-xl bg-claude/10 border border-claude/20 flex items-center justify-center mb-4">
                <ClaudeMark size={18} className="text-claude" />
              </div>
              <h3 className="text-sm font-bold text-text-bright mb-2">
                Install Claude Code
              </h3>
              <p className="text-sm text-text-muted leading-relaxed max-w-[40ch]">
                By Level 8, you know enough to install and run{" "}
                <a
                  href="https://claude.ai/code"
                  className="text-accent hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Claude Code
                </a>{" "}
                 — Anthropic&apos;s AI tool that lives in your terminal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features — 2-column asymmetric per taste-skill Rule 3 ── */}
      <section className="max-w-[1400px] mx-auto w-full px-6 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-xl border border-card-border bg-card-bg">
            <TerminalSquare size={20} strokeWidth={1.5} className="text-accent mb-3" />
            <h3 className="text-sm font-bold text-text-bright mb-1">
              Interactive terminal
            </h3>
            <p className="text-xs text-text-muted leading-relaxed max-w-[40ch]">
              Tab completion, command history, colored output.
              A real terminal experience in your browser.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-card-border bg-card-bg">
            <Eye size={20} strokeWidth={1.5} className="text-accent mb-3" />
            <h3 className="text-sm font-bold text-text-bright mb-1">
              Visual file system
            </h3>
            <p className="text-xs text-text-muted leading-relaxed max-w-[40ch]">
              A macOS Finder window updates in real time. The
              bridge between command line and the GUI you know.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-card-border bg-card-bg">
            <Layers size={20} strokeWidth={1.5} className="text-accent mb-3" />
            <h3 className="text-sm font-bold text-text-bright mb-1">
              8 progressive levels
            </h3>
            <p className="text-xs text-text-muted leading-relaxed max-w-[40ch]">
              From &quot;what is pwd?&quot; to git repos and npm.
              Each level builds on the last. Unlock as you go.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-card-border bg-card-bg">
            <GitBranch size={20} strokeWidth={1.5} className="text-accent mb-3" />
            <h3 className="text-sm font-bold text-text-bright mb-1">
              Built for Claude Code
            </h3>
            <p className="text-xs text-text-muted leading-relaxed max-w-[40ch]">
              The whole course gets you ready. Level 8 walks
              you through installing and launching Claude Code.
            </p>
          </div>
        </div>
      </section>

      {/* ── Level slider ── */}
      <section id="levels" className="bg-section-bg border-y border-card-border">
        <div className="max-w-[1400px] mx-auto w-full px-6 py-20">
          <p className="text-xs text-accent uppercase tracking-wider mb-3">
            Curriculum
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-text-bright tracking-tighter mb-3">
            8 levels to terminal mastery
          </h2>
          <p className="text-sm text-text-muted mb-10 max-w-md">
            Each level unlocks as you complete the last.
            Scroll through to see what you&apos;ll learn.
          </p>

          <LevelSlider
            levels={levels}
            progress={progress}
            nextLevelId={nextLevel.id}
          />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-[1400px] mx-auto w-full px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ClaudeMark size={28} className="text-claude" />
              <Rocket size={20} strokeWidth={1.5} className="text-text-muted" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-text-bright tracking-tighter mb-3">
              Ready to start?
            </h2>
            <p className="text-sm text-text-muted leading-relaxed max-w-[45ch] mb-6">
              Takes about 30 minutes. You&apos;ll go from never having
              used a terminal to being ready for Claude Code.
            </p>
            <Link
              href={`/learn/${nextLevel.slug}`}
              className="inline-flex items-center gap-2 bg-claude hover:bg-claude-hover text-white font-bold py-3 px-8 rounded-lg transition-colors text-sm active:scale-[0.98]"
            >
              {completedCount > 0
                ? `Continue Level ${nextLevel.id}`
                : "Start Level 1"}
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
          <div className="hidden lg:flex justify-end items-center">
            <Clawd size={160} animated color="#d97757" className="opacity-20" />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-card-border py-6 px-6">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <p className="text-xs text-text-muted">
            Built for{" "}
            <a
              href="https://claude.ai/code"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Claude Code
            </a>{" "}
            users
          </p>
          <p className="text-xs text-text-muted">
            Made by Max
          </p>
        </div>
      </footer>
    </div>
  );
}
