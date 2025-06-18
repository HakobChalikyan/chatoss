"use client";

import type * as React from "react";
import { GitBranch, Trash2, Pin, Edit3, Check, X } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { FolderContextMenu } from "./folder-context-menu";
import { ConfirmationDialog } from "./confirmation-dialog";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Chat {
  _id: Id<"chats">;
  title: string;
  lastMessageAt: number;
  parentChatId?: Id<"chats">;
  pinned?: boolean;
  folderId?: Id<"folders">;
}

interface SidebarChatProps {
  chat: Chat;
  selectedChatId: Id<"chats"> | null;
  onSelectChat: (chatId: Id<"chats">) => void;
  deletingChatId: Id<"chats"> | null;
  handleDeleteChat: (chatId: Id<"chats">, e: React.MouseEvent) => Promise<void>;
  handleTogglePin: (chatId: Id<"chats">, e: React.MouseEvent) => Promise<void>;
  handleRenameChat: (chatId: Id<"chats">, newTitle: string) => Promise<void>;
  level?: number;
  onDragStart?: (e: React.DragEvent, chat: Chat) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

export function SidebarChat({
  chat,
  selectedChatId,
  onSelectChat,
  deletingChatId,
  handleDeleteChat,
  handleTogglePin,
  handleRenameChat,
  level = 0,
  onDragStart,
  onDragEnd,
}: SidebarChatProps) {
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    event: React.MouseEvent | null;
  }>({ isOpen: false, event: null });

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(chat.title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus and select text when entering rename mode
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmation({ isOpen: true, event: e });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation.event) {
      await handleDeleteChat(chat._id, deleteConfirmation.event);
    }
    setDeleteConfirmation({ isOpen: false, event: null });
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRenaming(true);
    setRenameValue(chat.title);
  };

  const handleRenameSubmit = async () => {
    if (renameValue.trim() && renameValue.trim() !== chat.title) {
      await handleRenameChat(chat._id, renameValue.trim());
    }
    setIsRenaming(false);
  };

  const handleRenameCancel = () => {
    setIsRenaming(false);
    setRenameValue(chat.title);
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

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleChatClick = () => {
    if (!isRenaming) {
      onSelectChat(chat._id);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, chat);
    }
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ type: "chat", id: chat._id }),
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (onDragEnd) {
      onDragEnd(e);
    }
  };

  return (
    <TooltipProvider>
      <FolderContextMenu chatId={chat._id} currentFolderId={chat.folderId}>
        <div
          key={chat._id}
          onClick={handleChatClick}
          draggable={!isRenaming}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className={cn(
            "group/chat items-center relative px-2 py-1 rounded-lg cursor-pointer mb-2 transition-all duration-200",
            selectedChatId === chat._id
              ? "glass bg-gradient-to-r from-neutral-400/20 to-neutral-500/20 border border-neutral-400/30 dark:from-neutral-600/30 dark:to-neutral-700/30 dark:border-neutral-500/40"
              : "bg-transparent border border-transparent hover:bg-neutral-200/30 hover:border-neutral-300/40  dark:hover:bg-neutral-700/40  dark:hover:border-neutral-500/40",
            level > 0 && "ml-6",
            isRenaming && "ring-2 ring-neutral-400/50",
          )}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 flex items-center gap-2">
              {chat.parentChatId && (
                <GitBranch className="w-4 h-4 text-muted-foreground flex-shrink-0" />
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
                    placeholder="Chat title..."
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
                <h3
                  className={cn(
                    "font-medium text-sm truncate transition-colors flex-1 min-w-0",
                    selectedChatId === chat._id
                      ? "text-foreground"
                      : "text-foreground/90 group-hover/chat:text-foreground",
                  )}
                >
                  {chat.title}
                </h3>
              )}
            </div>

            {!isRenaming && (
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleRenameClick}
                      className={cn(
                        "opacity-0 group-hover/chat:opacity-100 p-1.5 rounded-lg transition-all duration-200",
                        "hover:bg-white/20 dark:hover:bg-neutral-600/40",
                      )}
                    >
                      <Edit3 className="size-4 text-muted-foreground hover:text-blue-500" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Rename chat</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => handleTogglePin(chat._id, e)}
                      className={cn(
                        "opacity-0 group-hover/chat:opacity-100 p-1.5 rounded-lg transition-all duration-200",
                        "hover:bg-white/20 dark:hover:bg-neutral-600/40",
                      )}
                    >
                      <Pin
                        className={cn(
                          "size-4 transition-colors",
                          chat.pinned
                            ? "fill-amber-500 text-amber-500"
                            : "text-muted-foreground hover:text-amber-500",
                        )}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {chat.pinned ? "Unpin chat" : "Pin chat"}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleDeleteClick}
                      disabled={deletingChatId === chat._id}
                      className={cn(
                        "opacity-0 group-hover/chat:opacity-100 p-1.5 rounded-lg transition-all duration-200",
                        "hover:bg-red-500/20 dark:hover:bg-red-500/30 text-muted-foreground hover:text-red-400 dark:hover:text-red-300",
                      )}
                    >
                      {deletingChatId === chat._id ? (
                        <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-red-400 rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Delete chat</TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      </FolderContextMenu>

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, event: null })}
        onConfirm={handleConfirmDelete}
        title="Delete chat"
        description={`Are you sure you want to delete "${chat.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive
      />
    </TooltipProvider>
  );
}
