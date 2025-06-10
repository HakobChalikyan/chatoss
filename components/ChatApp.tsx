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

  const chats = useQuery(api.chats.getUserChats, { searchQuery }) || [];
  const selectedChat = useQuery(
    api.chats.getChat,
    // The query will be skipped if initialChatId is undefined
    initialChatId ? { chatId: initialChatId } : "skip",
  );

  const handleSelectChat = (chatId: Id<"chats"> | null) => {
    if (chatId) {
      router.push(`/chat/${chatId}`);
    } else {
      router.push("/chat");
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
        onNewChat={() => handleSelectChat(null)} // Or a dedicated function to navigate to '/chat'
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main chat area */}
      <SidebarInset>
        <ChatInterface
          // Pass the chatId directly from the URL props
          conversationId={initialChatId || "default"}
          onChatCreated={handleNewChat}
        />
      </SidebarInset>
    </>
  );
}
