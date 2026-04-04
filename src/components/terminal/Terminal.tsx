"use client";

import { useRef, useEffect } from "react";
import { TerminalLine } from "@/hooks/useTerminal";
import { TerminalOutput } from "./TerminalOutput";
import { TrafficLights } from "@/components/ui/TrafficLights";

interface TerminalProps {
  lines: TerminalLine[];
  inputValue: string;
  prompt: string;
  onInput: (value: string) => void;
  onSubmit: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onFocus?: () => void;
}

export function Terminal({
  lines,
  inputValue,
  prompt,
  onInput,
  onSubmit,
  onKeyDown,
  onFocus,
}: TerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const focusInput = () => {
    inputRef.current?.focus();
    onFocus?.();
  };

  useEffect(() => {
    // Small delay to not steal focus from welcome modal
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="terminal-always-dark flex flex-col h-full rounded-lg overflow-hidden border border-white/[0.08] bg-term-bg shadow-window-heavy"
      onClick={focusInput}
    >
      {/* Title bar — draggable handle */}
      <div
        data-drag-handle
        className="flex items-center gap-2 px-3 py-2 bg-term-titlebar border-b border-white/[0.06] cursor-grab active:cursor-grabbing select-none"
      >
        <TrafficLights />
        <span className="flex-1 text-center text-[11px] text-term-dim">Terminal</span>
      </div>

      {/* Content — real terminal sizing */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-2 text-[12px] leading-[18px] min-h-0"
      >
        {lines.map((line) => (
          <TerminalOutput key={line.id} line={line} />
        ))}

        {/* Active input line */}
        <div className="flex items-center">
          <span className="text-term-prompt whitespace-pre">{prompt}</span>
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => onInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSubmit(inputValue);
                } else {
                  onKeyDown(e);
                }
              }}
              className="absolute inset-0 w-full bg-transparent text-transparent caret-transparent outline-none text-[12px]"
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
            />
            <span className="text-term-text">{inputValue}</span>
            <span className="inline-block w-[7px] h-[14px] bg-term-text/70 align-middle ml-px animate-cursor-blink" />
          </div>
        </div>
      </div>
    </div>
  );
}
