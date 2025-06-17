import React, { useState } from "react";
import {
  ChevronRight,
  Folder,
  FolderOpen,
  MoreVertical,
  Plus,
  Trash2,
  Edit3,
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

interface Folder {
  _id: Id<"folders">;
  name: string;
  parentFolderId?: Id<"folders">;
}

interface FolderItemProps {
  folder: Folder;
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onCreateSubfolder: () => void;
  children?: React.ReactNode;
  chatCount?: number;
  isDropTarget?: boolean;
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
}: FolderItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);

  const handleRename = () => {
    if (editName.trim() && editName !== folder.name) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setEditName(folder.name);
      setIsEditing(false);
    }
  };

  return (
    <div className="group">
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-2 rounded-lg transition-all duration-200 hover:bg-muted/50",
          isDropTarget &&
            "bg-primary/10 border-2 border-dashed border-primary/30",
          level > 0 && "ml-6",
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
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

          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              className="h-6 text-sm flex-1 min-w-0"
              autoFocus
            />
          ) : (
            <span
              className="text-sm font-medium truncate flex-1 min-w-0 cursor-pointer"
              onClick={onToggle}
            >
              {folder.name}
            </span>
          )}

          {chatCount > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {chatCount}
            </span>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => {
                setEditName(folder.name);
                setIsEditing(true);
              }}
              className="gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Rename folder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCreateSubfolder} className="gap-2">
              <Plus className="h-4 w-4" />
              New subfolder
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="gap-2 text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isExpanded && children && (
        <div className="mt-1 space-y-1">{children}</div>
      )}
    </div>
  );
}
