"use client";

// Claude's sparkle/asterisk mark
export function ClaudeMark({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M12 2C12 2 12.8 7.2 12 9.5C11.2 7.2 12 2 12 2ZM12 22C12 22 12.8 16.8 12 14.5C11.2 16.8 12 22 12 22ZM2 12C2 12 7.2 12.8 9.5 12C7.2 11.2 2 12 2 12ZM22 12C22 12 16.8 12.8 14.5 12C16.8 11.2 22 12 22 12ZM4.93 4.93C4.93 4.93 8.76 8.05 9.9 9.9C8.05 8.76 4.93 4.93 4.93 4.93ZM19.07 19.07C19.07 19.07 15.24 15.95 14.1 14.1C15.95 15.24 19.07 19.07 19.07 19.07ZM4.93 19.07C4.93 19.07 8.05 15.24 9.9 14.1C8.76 15.95 4.93 19.07 4.93 19.07ZM19.07 4.93C19.07 4.93 15.95 8.76 14.1 9.9C15.24 8.05 19.07 4.93 19.07 4.93Z"
        fill="currentColor"
        strokeWidth={1.5}
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Simple ">_" terminal prompt mark for the brand
export function TerminalMark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-bold ${className}`}>
      <span className="text-accent">&gt;</span>
      <span className="text-text-muted">_</span>
    </span>
  );
}
