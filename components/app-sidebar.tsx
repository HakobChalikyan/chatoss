import * as React from "react";
import { Plus, Search, Pin } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { useState } from "react";
import { Label } from "./ui/label";
import { NavUser } from "./nav-user";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "./ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarChat } from "./sidebar-chat";

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

interface Chat {
  _id: Id<"chats">;
  title: string;
  lastMessageAt: number;
  parentChatId?: Id<"chats">;
  pinned?: boolean;
}

interface ChatSidebarProps {
  chats: Chat[] | undefined;
  selectedChatId: Id<"chats"> | null;
  onSelectChat: (chatId: Id<"chats">) => void;
  onNewChat: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function AppSidebar({
  chats,
  selectedChatId,
  onSelectChat,
  onNewChat,
  searchQuery,
  onSearchChange,
  ...props
}: ChatSidebarProps) {
  const [deletingChatId, setDeletingChatId] = useState<Id<"chats"> | null>(
    null,
  );
  const deleteChat = useMutation(api.chats.deleteChat);
  const togglePinChat = useMutation(api.chats.togglePinChat);

  const handleDeleteChat = async (chatId: Id<"chats">, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deletingChatId) return;

    setDeletingChatId(chatId);
    try {
      await deleteChat({ chatId });
      if (selectedChatId === chatId) {
        onSelectChat(
          chats?.find((c) => c._id !== chatId)?._id || (null as any),
        );
      }
    } catch (error) {
      toast.error("Failed to delete chat");
    } finally {
      setDeletingChatId(null);
    }
  };

  const handleTogglePin = async (chatId: Id<"chats">, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await togglePinChat({ chatId });
    } catch (error) {
      toast.error("Failed to pin/unpin chat");
    }
  };

  const sortedChats = chats?.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.lastMessageAt - a.lastMessageAt;
  });

  const pinnedChats = sortedChats?.filter((chat) => chat.pinned) || [];
  const unpinnedChats = sortedChats?.filter((chat) => !chat.pinned) || [];

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
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between py-2 pl-10">
          <h1 className="text-xl font-semibold text-primary">ChatOSS</h1>
        </div>
        <Button
          className="w-full bg-primary/90 hover:bg-primary mb-2"
          size="sm"
          onClick={onNewChat}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>

        <SidebarGroup className="py-0">
          <SidebarGroupContent className="relative">
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <SidebarInput
              id="search"
              placeholder={"Search your threads..."}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarMenu>
          <div className="flex-1 overflow-y-auto">
            {!chats ? (
              <div className="p-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-3">
                    <Skeleton className="h-8 w-full bg-neutral-300" />
                  </div>
                ))}
              </div>
            ) : chats.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchQuery ? "No chats found" : "No chats yet"}
              </div>
            ) : (
              <div className="p-2">
                <TooltipProvider>
                  {pinnedChats.length > 0 && (
                    <div className="mb-4">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
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
                        />
                      ))}
                    </div>
                  )}

                  {todayChats.length > 0 && (
                    <div className="mb-4">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 mt-4">
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
                        />
                      ))}
                    </div>
                  )}

                  {yesterdayChats.length > 0 && (
                    <div className="mb-4">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 mt-4">
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
                        />
                      ))}
                    </div>
                  )}

                  {olderChats.length > 0 && (
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 mt-4">
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
                        />
                      ))}
                    </div>
                  )}
                </TooltipProvider>
              </div>
            )}
          </div>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
