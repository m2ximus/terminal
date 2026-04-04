"use client";

import { useState, useEffect } from "react";
import { TerminalSquare, Apple, Monitor as WinIcon } from "lucide-react";

const STORAGE_KEY = "tryterminal-welcome-seen";

export function WelcomeModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-bg-elevated border border-card-border rounded-2xl p-6 max-w-md w-full mx-4 animate-scale-in shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <TerminalSquare size={20} strokeWidth={1.5} className="text-accent" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-bright">
              Before you start
            </h2>
            <p className="text-xs text-text-muted">
              Open your real terminal alongside this window
            </p>
          </div>
        </div>

        <div className="space-y-2.5 mb-5">
          <div className="flex items-start gap-3 bg-accent/5 border border-accent/10 rounded-lg p-3">
            <Apple size={14} strokeWidth={1.5} className="text-text-muted shrink-0 mt-0.5" />
            <div className="text-sm text-text">
              Press{" "}
              <code className="bg-accent/15 border border-accent/30 px-1.5 py-0.5 rounded text-accent text-xs font-bold">
                Cmd + Space
              </code>{" "}
              and type <strong className="text-text-bright">Terminal</strong>,
              then press Enter
            </div>
          </div>
          <div className="flex items-start gap-3 bg-accent/5 border border-accent/10 rounded-lg p-3">
            <WinIcon size={14} strokeWidth={1.5} className="text-text-muted shrink-0 mt-0.5" />
            <div className="text-sm text-text">
              Press{" "}
              <code className="bg-accent/15 border border-accent/30 px-1.5 py-0.5 rounded text-accent text-xs font-bold">
                Win key
              </code>{" "}
              and search for{" "}
              <strong className="text-text-bright">Command Prompt</strong> or{" "}
              <strong className="text-text-bright">PowerShell</strong>
            </div>
          </div>
        </div>

        <p className="text-xs text-text-muted mb-4">
          Practice the commands here first, then try them for real.
          You&apos;ll learn faster by doing both.
        </p>

        <button
          onClick={dismiss}
          className="w-full bg-accent hover:bg-accent-hover text-black font-bold py-2.5 px-6 rounded-lg transition-colors text-sm active:scale-[0.98]"
        >
          Got it, let&apos;s go
        </button>
      </div>
    </div>
  );
}
