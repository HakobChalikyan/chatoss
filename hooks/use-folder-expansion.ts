import { useState, useCallback, useEffect } from "react";
import type { Id } from "@/convex/_generated/dataModel";

const EXPANDED_FOLDERS_KEY = "expanded_folders";

export function useFolderExpansion(initialExpanded: Set<string> = new Set()) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    // Try to load from localStorage on initial render
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(EXPANDED_FOLDERS_KEY);
        if (saved) {
          return new Set(JSON.parse(saved));
        }
      } catch (error) {
        console.warn(
          "Failed to load expanded folders from localStorage:",
          error,
        );
      }
    }
    return initialExpanded;
  });

  // Save to localStorage whenever expandedFolders changes
  useEffect(() => {
    try {
      localStorage.setItem(
        EXPANDED_FOLDERS_KEY,
        JSON.stringify(Array.from(expandedFolders)),
      );
    } catch (error) {
      console.warn("Failed to save expanded folders to localStorage:", error);
    }
  }, [expandedFolders]);

  const toggleFolder = useCallback((folderId: Id<"folders">) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  const expandFolder = useCallback((folderId: Id<"folders">) => {
    setExpandedFolders((prev) => new Set(prev).add(folderId));
  }, []);

  const collapseFolder = useCallback((folderId: Id<"folders">) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.delete(folderId);
      return next;
    });
  }, []);

  const expandAll = useCallback((folderIds: Id<"folders">[]) => {
    setExpandedFolders(new Set(folderIds));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedFolders(new Set());
  }, []);

  return {
    expandedFolders,
    toggleFolder,
    expandFolder,
    collapseFolder,
    expandAll,
    collapseAll,
  };
}
