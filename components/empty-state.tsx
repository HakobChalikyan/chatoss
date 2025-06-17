import React from "react";
import { MessageSquare, FolderPlus, Search } from "lucide-react";
import { Button } from "./ui/button";

interface EmptyStateProps {
  type: "no-chats" | "no-folders" | "no-results" | "empty-folder";
  onAction?: () => void;
  actionLabel?: string;
  folderName?: string;
}

export function EmptyState({
  type,
  onAction,
  actionLabel,
  folderName,
}: EmptyStateProps) {
  const getContent = () => {
    switch (type) {
      case "no-chats":
        return {
          icon: MessageSquare,
          title: "No chats yet",
          description: "Start a new conversation to see your chats here.",
          actionLabel: actionLabel || "Start first chat",
        };
      case "no-folders":
        return {
          icon: FolderPlus,
          title: "No folders yet",
          description:
            "Create folders to organize your chats and keep them tidy.",
          actionLabel: actionLabel || "Create folder",
        };
      case "no-results":
        return {
          icon: Search,
          title: "No results found",
          description: "Try adjusting your search terms or browse all chats.",
          actionLabel: actionLabel || "Clear search",
        };
      case "empty-folder":
        return {
          icon: MessageSquare,
          title: `No chats in ${folderName || "this folder"}`,
          description:
            "Move chats to this folder or start a new conversation here.",
          actionLabel: actionLabel || "Start new chat",
        };
      default:
        return {
          icon: MessageSquare,
          title: "Nothing here",
          description: "This space is empty.",
          actionLabel: actionLabel || "Take action",
        };
    }
  };

  const { icon: Icon, title, description, actionLabel: label } = getContent();

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted/50 mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium text-foreground mb-2">{title}</h3>
      <p className="text-xs text-muted-foreground mb-4 max-w-[200px]">
        {description}
      </p>
      {onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {label}
        </Button>
      )}
    </div>
  );
}
