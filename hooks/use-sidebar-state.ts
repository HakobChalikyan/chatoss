"use client";

import { useCallback, useEffect, useState } from "react";

const SIDEBAR_LOCALSTORAGE_KEY = "sidebar:state";
const SIDEBAR_WIDTH_KEY = "sidebar:width";
const DEFAULT_WIDTH = 256; // 16rem in pixels
const MIN_WIDTH = 200;
const MAX_WIDTH = 500;

export function useSidebarState(defaultOpen: boolean = true) {
  const [isOpen, setIsOpenState] = useState(defaultOpen);
  const [width, setWidthState] = useState(DEFAULT_WIDTH);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize state from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(SIDEBAR_LOCALSTORAGE_KEY);
      const savedWidth = localStorage.getItem(SIDEBAR_WIDTH_KEY);

      if (savedState !== null) {
        setIsOpenState(JSON.parse(savedState));
      }

      if (savedWidth !== null) {
        const parsedWidth = parseInt(savedWidth);
        if (
          !isNaN(parsedWidth) &&
          parsedWidth >= MIN_WIDTH &&
          parsedWidth <= MAX_WIDTH
        ) {
          setWidthState(parsedWidth);
        }
      }
    } catch (error) {
      console.warn("Failed to load sidebar state from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced localStorage save for width
  const saveWidthToStorage = useCallback((newWidth: number) => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(SIDEBAR_WIDTH_KEY, newWidth.toString());
      } catch (error) {
        console.warn("Failed to save sidebar width to localStorage:", error);
      }
    }, 100); // Debounce by 100ms

    return () => clearTimeout(timeoutId);
  }, []);

  const setIsOpen = useCallback((open: boolean) => {
    setIsOpenState(open);
    try {
      localStorage.setItem(SIDEBAR_LOCALSTORAGE_KEY, JSON.stringify(open));
    } catch (error) {
      console.warn("Failed to save sidebar state to localStorage:", error);
    }
  }, []);

  const setWidth = useCallback(
    (newWidth: number) => {
      const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
      setWidthState(clampedWidth);
      saveWidthToStorage(clampedWidth);
    },
    [saveWidthToStorage],
  );

  const toggleSidebar = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  return {
    isOpen,
    setIsOpen,
    width,
    setWidth,
    toggleSidebar,
    isLoading,
    minWidth: MIN_WIDTH,
    maxWidth: MAX_WIDTH,
  };
}
