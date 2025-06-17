import { useState, useCallback } from "react";
import type { Id } from "@/convex/_generated/dataModel";

export function useFolderExpansion(initialExpanded: Set<string> = new Set()) {
  const [expandedFolders, setExpandedFolders] =
    useState<Set<string>>(initialExpanded);

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
