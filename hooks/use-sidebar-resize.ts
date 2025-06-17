"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseSidebarResizeProps {
  width: number;
  setWidth: (width: number) => void;
  minWidth: number;
  maxWidth: number;
  isOpen: boolean;
}

export function useSidebarResize({
  width,
  setWidth,
  minWidth,
  maxWidth,
  isOpen,
}: UseSidebarResizeProps) {
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const rafRef = useRef<number | undefined>(undefined);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const lastUpdateRef = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isOpen) return;

      e.preventDefault();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = width;

      // Add cursor style to body and disable transitions
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      // Disable transitions on sidebar elements during resize
      const sidebarElements = document.querySelectorAll(
        '[data-slot="sidebar-container"], [data-slot="sidebar-gap"]',
      );
      sidebarElements.forEach((el) => {
        (el as HTMLElement).style.transition = "none";
      });
    },
    [isOpen, width],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      // Cancel previous animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const deltaX = e.clientX - startXRef.current;
        const newWidth = Math.max(
          minWidth,
          Math.min(maxWidth, startWidthRef.current + deltaX),
        );

        // Update CSS custom property directly for immediate visual feedback
        document.documentElement.style.setProperty(
          "--sidebar-width",
          `${newWidth}px`,
        );

        // Throttle state updates to every 16ms (60fps)
        const now = Date.now();
        if (now - lastUpdateRef.current > 16) {
          setWidth(newWidth);
          lastUpdateRef.current = now;
        }
      });
    },
    [isResizing, setWidth, minWidth, maxWidth],
  );

  const handleMouseUp = useCallback(() => {
    if (!isResizing) return;

    setIsResizing(false);

    // Cancel any pending animation frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Remove cursor style from body
    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    // Re-enable transitions
    const sidebarElements = document.querySelectorAll(
      '[data-slot="sidebar-container"], [data-slot="sidebar-gap"]',
    );
    sidebarElements.forEach((el) => {
      (el as HTMLElement).style.transition = "";
    });

    // Final state update to ensure consistency
    const currentWidth = Number.parseInt(
      document.documentElement.style.getPropertyValue("--sidebar-width") ||
        `${width}`,
    );
    if (currentWidth !== width) {
      setWidth(currentWidth);
    }
  }, [isResizing, width, setWidth]);

  // Add global mouse event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove, {
        passive: true,
      });
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    isResizing,
    handleMouseDown,
    sidebarRef,
  };
}
