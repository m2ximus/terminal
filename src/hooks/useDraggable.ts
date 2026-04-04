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
  const isDraggingRef = useRef(false);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });
  const posRef = useRef(initialPosition);
  const elementRef = useRef<HTMLDivElement | null>(null);

  // Callback ref — avoids react-hooks/refs lint rule
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    elementRef.current = node;
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only drag from the title bar (data-drag-handle)
      const target = e.target as HTMLElement;
      const handle = target.closest("[data-drag-handle]");
      if (!handle) return;

      e.preventDefault();
      onFocus?.();
      isDraggingRef.current = true;
      dragOffset.current = {
        x: e.clientX - posRef.current.x,
        y: e.clientY - posRef.current.y,
      };
      // Set grabbing cursor on body during drag
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    },
    [onFocus],
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      posRef.current = { x: newX, y: newY };
      // Direct DOM manipulation — bypasses React entirely
      if (elementRef.current) {
        elementRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
      }
    };

    const handleMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      // Commit final position to React state
      setPosition({ ...posRef.current });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return {
    position,
    containerRef,
    handleMouseDown,
    style: {
      transform: `translate(${position.x}px, ${position.y}px)`,
    } as React.CSSProperties,
  };
}
