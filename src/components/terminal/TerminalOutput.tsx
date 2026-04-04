"use client";

import { TerminalLine } from "@/hooks/useTerminal";

// Hardcoded — terminal always dark with real macOS Terminal colors
const TYPE_COLORS: Record<string, string> = {
  stdout: "text-term-text",
  stderr: "text-[#ff6b6b]",
  info: "text-[#6ec2e8]",
  success: "text-term-prompt",
};

export function TerminalOutput({ line }: { line: TerminalLine }) {
  if (line.type === "input") {
    return (
      <div className="flex">
        <span className="text-term-prompt whitespace-pre">{line.prompt}</span>
        <span className="text-term-text">{line.content}</span>
      </div>
    );
  }

  const colorClass = TYPE_COLORS[line.type] || "text-term-text";

  return (
    <div className={`${colorClass} whitespace-pre-wrap break-all`}>
      {renderContent(line.content)}
    </div>
  );
}

function renderContent(content: string) {
  const parts = content.split(/(\x1bDIR:[^\x1b]+\x1b)/);
  return parts.map((part, i) => {
    const dirMatch = part.match(/\x1bDIR:([^\x1b]+)\x1b/);
    if (dirMatch) {
      return (
        <span key={i} className="text-[#5cb3ff] font-medium">
          {dirMatch[1]}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
