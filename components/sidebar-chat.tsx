"use client";

import type * as React from "react";
import { GitBranch, Trash2, Pin } from "lucide-react";
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
import { useState } from "react";

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
  level?: number;
}

export function SidebarChat({
  chat,
  selectedChatId,
  onSelectChat,
  deletingChatId,
  handleDeleteChat,
  handleTogglePin,
  level = 0,
}: SidebarChatProps) {
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    event: React.MouseEvent | null;
  }>({ isOpen: false, event: null });

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

  return (
    <TooltipProvider>
      <FolderContextMenu chatId={chat._id} currentFolderId={chat.folderId}>
        <div
          key={chat._id}
          onClick={() => onSelectChat(chat._id)}
          className={cn(
            "group/chat items-center relative px-2 py-1 rounded-lg cursor-pointer mb-2 transition-all duration-200",
            selectedChatId === chat._id
              ? "glass bg-gradient-to-r from-neutral-400/20 to-neutral-500/20 border border-neutral-400/30 dark:from-neutral-600/30 dark:to-neutral-700/30 dark:border-neutral-500/40"
              : "bg-transparent border border-transparent hover:bg-neutral-200/30 hover:border-neutral-300/40  dark:hover:bg-neutral-700/40  dark:hover:border-neutral-500/40",
            level > 0 && "ml-6",
          )}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 flex items-center gap-2">
              {chat.parentChatId && (
                <GitBranch className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
              <h3
                className={cn(
                  "font-medium text-sm truncate transition-colors",
                  selectedChatId === chat._id
                    ? "text-foreground"
                    : "text-foreground/90 group-hover/chat:text-foreground",
                )}
              >
                {chat.title}
              </h3>
            </div>
            <div className="flex items-center gap-1">
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
