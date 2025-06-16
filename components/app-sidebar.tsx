import * as React from "react";
import { Plus, Search, GitBranch, Trash2 } from "lucide-react";
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

interface Chat {
  _id: Id<"chats">;
  title: string;
  model: string;
  lastMessageAt: number;
  parentChatId?: Id<"chats">;
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
                {chats &&
                  chats.map((chat) => (
                    <div
                      key={chat._id}
                      onClick={() => onSelectChat(chat._id)}
                      className={`
                  group relative p-3 rounded-lg cursor-pointer transition-colors mb-1
                  ${
                    selectedChatId === chat._id
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50 border border-transparent"
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
                      </div>
                    </div>
                  ))}
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
