import * as React from "react";
import { GitBranch, Trash2, Pin } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Chat {
  _id: Id<"chats">;
  title: string;
  lastMessageAt: number;
  parentChatId?: Id<"chats">;
  pinned?: boolean;
}

interface SidebarChatProps {
  chat: Chat;
  selectedChatId: Id<"chats"> | null;
  onSelectChat: (chatId: Id<"chats">) => void;
  deletingChatId: Id<"chats"> | null;
  handleDeleteChat: (chatId: Id<"chats">, e: React.MouseEvent) => Promise<void>;
  handleTogglePin: (chatId: Id<"chats">, e: React.MouseEvent) => Promise<void>;
}

export function SidebarChat({
  chat,
  selectedChatId,
  onSelectChat,
  deletingChatId,
  handleDeleteChat,
  handleTogglePin,
}: SidebarChatProps) {
  return (
    <div
      key={chat._id}
      onClick={() => onSelectChat(chat._id)}
      className={`
        group relative p-3 rounded-lg cursor-pointer transition-colors mb-1
        ${
          selectedChatId === chat._id
            ? "bg-blue-50 border border-blue-200"
            : "hover:bg-gray-200 border border-transparent"
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 flex items-center gap-1">
          {chat.parentChatId && (
            <GitBranch className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
          <h3 className="font-medium text-sm text-gray-900 truncate">
            {chat.title}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => handleTogglePin(chat._id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition-all"
              >
                <Pin
                  className={`size-4 ${chat.pinned ? "fill-blue-500 text-blue-500" : ""}`}
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
                onClick={(e) => handleDeleteChat(chat._id, e)}
                disabled={deletingChatId === chat._id}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
              >
                {deletingChatId === chat._id ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
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
  );
}
