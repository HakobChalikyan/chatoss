"use client";

import type * as React from "react";
import { Plus, Search } from "lucide-react";
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
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ChatListView } from "./chat-list-view";
import { FolderListView } from "./folder-list-view";
import { useViewPreference } from "@/hooks/use-view-preference";

interface Chat {
  _id: Id<"chats">;
  title: string;
  lastMessageAt: number;
  parentChatId?: Id<"chats">;
  pinned?: boolean;
  folderId?: Id<"folders">;
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
  const { view, updateView } = useViewPreference();
  const deleteChat = useMutation(api.chats.deleteChat);
  const togglePinChat = useMutation(api.chats.togglePinChat);
  const updateChatTitle = useMutation(api.chats.updateChatTitle);
  const folders = useQuery(api.folders.getUserFolders);

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

  const handleRenameChat = async (chatId: Id<"chats">, newTitle: string) => {
    try {
      await updateChatTitle({ chatId, title: newTitle });
      toast.success("Chat renamed successfully");
    } catch (error) {
      toast.error("Failed to rename chat");
    }
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between py-2 pl-10">
          <h1 className="text-xl font-semibold text-primary">ChatOSS</h1>
        </div>

        <Button
          className={cn(
            "w-full mb-4 rounded-xl h-12 font-semibold transition-all duration-300 hover-lift",
            "bg-gradient-to-r from-neutral-500 to-neutral-600 hover:from-neutral-600 hover:to-neutral-700",
            "text-white shadow-lg hover:shadow-xl",
          )}
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
              placeholder="Search your threads..."
              className={cn(
                "pl-8 rounded-xl glass bg-white/10",
                "placeholder:text-muted-foreground/70",
              )}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <Tabs
          value={view}
          onValueChange={(value) => updateView(value as "chats" | "folders")}
          className="w-full"
        >
          <TabsList className="w-full">
            <TabsTrigger value="chats" className="flex-1">
              Chats
            </TabsTrigger>
            <TabsTrigger value="folders" className="flex-1">
              Folders
            </TabsTrigger>
          </TabsList>
          <TabsContent value="chats" className="mt-0">
            <SidebarMenu>
              <div className="flex-1 overflow-y-auto">
                <ChatListView
                  chats={chats}
                  selectedChatId={selectedChatId}
                  onSelectChat={onSelectChat}
                  deletingChatId={deletingChatId}
                  handleDeleteChat={handleDeleteChat}
                  handleTogglePin={handleTogglePin}
                  handleRenameChat={handleRenameChat}
                  searchQuery={searchQuery}
                />
              </div>
            </SidebarMenu>
          </TabsContent>
          <TabsContent value="folders" className="mt-0">
            <FolderListView
              chats={chats}
              folders={folders}
              selectedChatId={selectedChatId}
              onSelectChat={onSelectChat}
              deletingChatId={deletingChatId}
              handleDeleteChat={handleDeleteChat}
              handleTogglePin={handleTogglePin}
              handleRenameChat={handleRenameChat}
            />
          </TabsContent>
        </Tabs>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
