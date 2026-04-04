"use client";

import { useRef, useEffect } from "react";
import { TerminalLine } from "@/hooks/useTerminal";
import { TerminalOutput } from "./TerminalOutput";

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
  }, [lines, inputValue]);

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
      className="terminal-always-dark flex flex-col h-full rounded-lg overflow-hidden border border-white/[0.08] bg-[#1c1c1e] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
      onClick={focusInput}
    >
      {/* Title bar — draggable handle */}
      <div
        data-drag-handle
        className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2c] border-b border-white/[0.06] cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex gap-[6px]">
          <div className="w-[12px] h-[12px] rounded-full bg-[#ff5f57] border border-[#e0443e]/50" />
          <div className="w-[12px] h-[12px] rounded-full bg-[#febc2e] border border-[#d4a123]/50" />
          <div className="w-[12px] h-[12px] rounded-full bg-[#28c840] border border-[#1aab29]/50" />
        </div>
        <span className="flex-1 text-center text-[11px] text-[#9e9e9e]">
          Terminal
        </span>
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
          <span className="text-[#33ff00] whitespace-pre">{prompt}</span>
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
            <span className="text-[#cccccc]">{inputValue}</span>
            <span className="inline-block w-[7px] h-[14px] bg-[#cccccc]/70 align-middle ml-px animate-cursor-blink" />
          </div>
        </div>
      </div>
    </div>
  );
}
