"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface Position {
  x: number;
  y: number;
}

interface UseDraggableOptions {
  initialPosition: Position;
  onFocus?: () => void;
}

export function useDraggable({ initialPosition, onFocus }: UseDraggableOptions) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });
  const posRef = useRef(initialPosition);

  // Sync ref with state
  useEffect(() => {
    posRef.current = position;
  }, [position]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only drag from the title bar (data-drag-handle)
      const target = e.target as HTMLElement;
      const handle = target.closest("[data-drag-handle]");
      if (!handle) return;

      e.preventDefault();
      onFocus?.();
      setIsDragging(true);
      dragOffset.current = {
        x: e.clientX - posRef.current.x,
        y: e.clientY - posRef.current.y,
      };
    },
    [onFocus]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return {
    position,
    isDragging,
    handleMouseDown,
    style: {
      transform: `translate(${position.x}px, ${position.y}px)`,
      cursor: isDragging ? "grabbing" : undefined,
    } as React.CSSProperties,
  };
}
