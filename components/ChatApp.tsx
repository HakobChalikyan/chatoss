"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChatInterface } from "./chat-interface";
import { SidebarInset } from "./ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { useRouter } from "next/navigation";

interface ChatAppProps {
  initialChatId?: Id<"chats">;
}

export function ChatApp({ initialChatId }: ChatAppProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const chats = useQuery(api.chats.getUserChats, { searchQuery });

  const handleSelectChat = (chatId: Id<"chats"> | null) => {
    if (chatId) {
      router.push(`/chat/${chatId}`);
    } else {
      router.push("/");
    }
  };

  const handleNewChat = (chatId: Id<"chats">) => {
    router.push(`/chat/${chatId}`);
  };

  return (
    <>
      <AppSidebar
        chats={chats}
        selectedChatId={initialChatId || null}
        onSelectChat={handleSelectChat}
        onNewChat={() => handleSelectChat(null)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <SidebarInset>
        <ChatInterface
          conversationId={initialChatId}
          onChatCreated={handleNewChat}
        />
      </SidebarInset>
    </>
  );
}
