import type React from "react";
import { Pin, Search } from "lucide-react";
import { SidebarChat } from "./sidebar-chat";
import { Skeleton } from "./ui/skeleton";
import type { Id } from "@/convex/_generated/dataModel";

interface Chat {
  _id: Id<"chats">;
  title: string;
  lastMessageAt: number;
  parentChatId?: Id<"chats">;
  pinned?: boolean;
  folderId?: Id<"folders">;
}

interface ChatListViewProps {
  chats: Chat[] | undefined;
  selectedChatId: Id<"chats"> | null;
  onSelectChat: (chatId: Id<"chats">) => void;
  deletingChatId: Id<"chats"> | null;
  handleDeleteChat: (chatId: Id<"chats">, e: React.MouseEvent) => Promise<void>;
  handleTogglePin: (chatId: Id<"chats">, e: React.MouseEvent) => Promise<void>;
  handleRenameChat: (chatId: Id<"chats">, newTitle: string) => Promise<void>;
  searchQuery: string;
}

const isToday = (timestamp: number) => {
  const today = new Date();
  const date = new Date(timestamp);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isYesterday = (timestamp: number) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date = new Date(timestamp);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

export function ChatListView({
  chats,
  selectedChatId,
  onSelectChat,
  deletingChatId,
  handleDeleteChat,
  handleTogglePin,
  handleRenameChat,
  searchQuery,
}: ChatListViewProps) {
  if (!chats) {
    return (
      <div className="p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-3">
            <Skeleton className="h-8 w-full bg-white/10 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neutral-400/20 to-neutral-500/20 flex items-center justify-center mx-auto mb-3">
          <Search className="w-6 h-6" />
        </div>
        {searchQuery ? "No chats found" : "No chats yet"}
      </div>
    );
  }

  const sortedChats = chats.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.lastMessageAt - a.lastMessageAt;
  });

  const pinnedChats = sortedChats.filter((chat) => chat.pinned);
  const unpinnedChats = sortedChats.filter((chat) => !chat.pinned);

  const todayChats = unpinnedChats.filter((chat) =>
    isToday(chat.lastMessageAt),
  );
  const yesterdayChats = unpinnedChats.filter((chat) =>
    isYesterday(chat.lastMessageAt),
  );
  const olderChats = unpinnedChats.filter(
    (chat) => !isToday(chat.lastMessageAt) && !isYesterday(chat.lastMessageAt),
  );

  return (
    <div className="p-2">
      {pinnedChats.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2 px-2">
            <Pin className="size-3" /> Pinned
          </h2>
          {pinnedChats.map((chat) => (
            <SidebarChat
              key={chat._id}
              chat={chat}
              selectedChatId={selectedChatId}
              onSelectChat={onSelectChat}
              deletingChatId={deletingChatId}
              handleDeleteChat={handleDeleteChat}
              handleTogglePin={handleTogglePin}
              handleRenameChat={handleRenameChat}
            />
          ))}
        </div>
      )}

      {todayChats.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 mt-4 px-2">
            Today
          </h2>
          {todayChats.map((chat) => (
            <SidebarChat
              key={chat._id}
              chat={chat}
              selectedChatId={selectedChatId}
              onSelectChat={onSelectChat}
              deletingChatId={deletingChatId}
              handleDeleteChat={handleDeleteChat}
              handleTogglePin={handleTogglePin}
              handleRenameChat={handleRenameChat}
            />
          ))}
        </div>
      )}

      {yesterdayChats.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 mt-4 px-2">
            Yesterday
          </h2>
          {yesterdayChats.map((chat) => (
            <SidebarChat
              key={chat._id}
              chat={chat}
              selectedChatId={selectedChatId}
              onSelectChat={onSelectChat}
              deletingChatId={deletingChatId}
              handleDeleteChat={handleDeleteChat}
              handleTogglePin={handleTogglePin}
              handleRenameChat={handleRenameChat}
            />
          ))}
        </div>
      )}

      {olderChats.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 mt-4 px-2">
            Older
          </h2>
          {olderChats.map((chat) => (
            <SidebarChat
              key={chat._id}
              chat={chat}
              selectedChatId={selectedChatId}
              onSelectChat={onSelectChat}
              deletingChatId={deletingChatId}
              handleDeleteChat={handleDeleteChat}
              handleTogglePin={handleTogglePin}
              handleRenameChat={handleRenameChat}
            />
          ))}
        </div>
      )}
    </div>
  );
}
