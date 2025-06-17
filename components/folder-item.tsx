"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  MoreVertical,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface FolderType {
  _id: Id<"folders">;
  name: string;
  parentFolderId?: Id<"folders">;
}

interface FolderItemProps {
  folder: FolderType;
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onCreateSubfolder: (name: string) => void;
  children?: React.ReactNode;
  chatCount?: number;
  isDropTarget?: boolean;
  onDrop?: (e: React.DragEvent, folderId: Id<"folders">) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDragStart?: (e: React.DragEvent, folder: FolderType) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

export function FolderItem({
  folder,
  level,
  isExpanded,
  onToggle,
  onRename,
  onDelete,
  onCreateSubfolder,
  children,
  chatCount = 0,
  isDropTarget = false,
  onDrop,
  onDragOver,
  onDragLeave,
  onDragStart,
  onDragEnd,
}: FolderItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(folder.name);
  const [isCreatingSubfolder, setIsCreatingSubfolder] = useState(false);
  const [subfolderName, setSubfolderName] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const subfolderInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus and select text when entering rename mode
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  // Auto-focus when creating subfolder
  useEffect(() => {
    if (isCreatingSubfolder && subfolderInputRef.current) {
      subfolderInputRef.current.focus();
    }
  }, [isCreatingSubfolder]);

  const handleRenameStart = () => {
    setIsRenaming(true);
    setRenameValue(folder.name);
  };

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue.trim() !== folder.name) {
      onRename(renameValue.trim());
    }
    setIsRenaming(false);
  };

  const handleRenameCancel = () => {
    setIsRenaming(false);
    setRenameValue(folder.name);
  };

  const handleCreateSubfolderStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCreatingSubfolder(true);
    setSubfolderName("");
    // Expand the folder if it's not already expanded
    if (!isExpanded) {
      onToggle();
    }
  };

  const handleCreateSubfolderSubmit = () => {
    if (subfolderName.trim()) {
      onCreateSubfolder(subfolderName.trim());
    }
    setIsCreatingSubfolder(false);
    setSubfolderName("");
  };

  const handleCreateSubfolderCancel = () => {
    setIsCreatingSubfolder(false);
    setSubfolderName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleRenameSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      handleRenameCancel();
    }
  };

  const handleSubfolderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleCreateSubfolderSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      handleCreateSubfolderCancel();
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleFolderClick = () => {
    if (!isRenaming && !isCreatingSubfolder) {
      onToggle();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
    if (onDragOver) {
      onDragOver(e);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (onDragLeave) {
      onDragLeave(e);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (onDrop) {
      onDrop(e, folder._id);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    if (onDragStart) {
      onDragStart(e, folder);
    }
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ type: "folder", id: folder._id }),
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    if (onDragEnd) {
      onDragEnd(e);
    }
  };

  return (
    <div
      className={cn(
        "group",
        isDraggingOver &&
          "bg-primary/5 rounded-lg border-2 border-dashed border-primary/30",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-2 rounded-lg transition-all duration-200 hover:bg-muted/50",
          level > 0 && "ml-6",
          isRenaming && "ring-2 ring-neutral-400/50",
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFolderClick}
          className="p-0 h-6 w-6 hover:bg-muted/80"
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isExpanded ? "rotate-90" : "rotate-0",
            )}
          />
        </Button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-primary flex-shrink-0" />
          ) : (
            <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}

          {isRenaming ? (
            <div className="flex-1 flex items-center gap-2">
              <Input
                ref={inputRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={handleInputClick}
                className="h-6 text-sm flex-1 min-w-0 bg-white/50 dark:bg-neutral-800/50"
                placeholder="Folder name..."
              />
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRenameSubmit();
                  }}
                  className="h-6 w-6 p-0 hover:bg-green-500/20"
                >
                  <Check className="h-3 w-3 text-green-600" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRenameCancel();
                  }}
                  className="h-6 w-6 p-0 hover:bg-red-500/20"
                >
                  <X className="h-3 w-3 text-red-600" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              {chatCount > 0 && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {chatCount}
                </span>
              )}
              <span
                className="text-sm font-medium truncate flex-1 min-w-0 cursor-pointer"
                onClick={handleFolderClick}
              >
                {folder.name}
              </span>
            </>
          )}
        </div>

        {!isRenaming && (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCreateSubfolderStart}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-500/20"
                >
                  <Plus className="h-3 w-3 text-blue-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add subfolder</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRenameStart();
                  }}
                  className="gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Rename folder
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="mt-1 space-y-1">
          {/* Subfolder creation input */}
          {isCreatingSubfolder && (
            <div
              className="flex items-center gap-2 py-2 px-2 ml-6 rounded-lg bg-muted/30 border-2 border-dashed border-blue-300/50"
              style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <Folder className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 flex items-center gap-2">
                <Input
                  ref={subfolderInputRef}
                  value={subfolderName}
                  onChange={(e) => setSubfolderName(e.target.value)}
                  onKeyDown={handleSubfolderKeyDown}
                  onClick={handleInputClick}
                  className="h-6 text-sm flex-1 min-w-0 bg-white/50 dark:bg-neutral-800/50"
                  placeholder="New subfolder name..."
                />
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateSubfolderSubmit();
                    }}
                    className="h-6 w-6 p-0 hover:bg-green-500/20"
                    disabled={!subfolderName.trim()}
                  >
                    <Check className="h-3 w-3 text-green-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateSubfolderCancel();
                    }}
                    className="h-6 w-6 p-0 hover:bg-red-500/20"
                  >
                    <X className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {children}
        </div>
      )}
    </div>
  );
}
