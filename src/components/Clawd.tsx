"use client";

import { useState, useEffect } from "react";

// Clawd — the Claude Code mascot
// Pixel-perfect recreation from the official Claude Code terminal art
// A wide blocky creature in Anthropic orange with white rectangular eyes and 4 legs

interface ClawdProps {
  size?: number;
  className?: string;
  animated?: boolean;
  color?: string;
}

export function Clawd({
  size = 64,
  className = "",
  animated = false,
  color = "#d97757",
}: ClawdProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!animated) return;
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 3);
    }, 500);
    return () => clearInterval(interval);
  }, [animated]);

  // Pixel grid based on the screenshot:
  // Wide body with two small rectangular white eyes
  // Arms/extensions on the sides
  // 4 legs underneath (2 inner, 2 outer with gaps)
  //
  // Grid: 16 wide x 12 tall (each cell = 1 unit)

  const bobY = animated ? [0, -0.4, 0][frame] : 0;

  return (
    <svg
      width={size}
      height={size * 0.75}
      viewBox="0 0 16 12"
      className={className}
      role="img"
      aria-label="Clawd, the Claude Code mascot"
    >
      <g transform={`translate(0, ${bobY})`}>
        {/* Head / main body block — rows 0-6 */}
        <rect x={3} y={0} width={10} height={7} fill={color} />

        {/* Side arms — row 4-5, extending past body */}
        <rect x={0} y={4} width={3} height={2} fill={color} />
        <rect x={13} y={4} width={3} height={2} fill={color} />

        {/* Eyes — white rectangles */}
        <rect x={5} y={3} width={1.5} height={2} fill="#ffffff" />
        <rect x={9.5} y={3} width={1.5} height={2} fill="#ffffff" />

        {/* Legs — 4 legs with gaps */}
        {/* Left outer leg */}
        <rect x={3} y={7} width={2} height={3} fill={color} />
        {/* Left inner leg */}
        <rect x={6} y={7} width={2} height={3} fill={color} />
        {/* Right inner leg */}
        <rect x={9} y={7} width={2} height={3} fill={color} />
        {/* Right outer leg */}
        <rect x={12} y={7} width={2} height={3} fill={color} />
      </g>
    </svg>
  );
}

// Inline ASCII version for terminal contexts
export function ClawdASCII({ className = "" }: { className?: string }) {
  return (
    <pre
      className={`leading-none text-[#d97757] select-none ${className}`}
      aria-label="Clawd mascot"
    >
      {`   ██████████
   ██ ██  ██ ██
██████████████████
██████████████████
   ██ ██  ██ ██`}
    </pre>
  );
}
