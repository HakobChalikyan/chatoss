import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChatInterface } from "./chat-interface";
import { SidebarInset } from "./ui/sidebar";
import { AppSidebar } from "./app-sidebar";

export function ChatApp() {
  const [selectedChatId, setSelectedChatId] = useState<Id<"chats"> | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const chats = useQuery(api.chats.getUserChats, { searchQuery }) || [];
  const selectedChat = useQuery(
    api.chats.getChat,
    selectedChatId ? { chatId: selectedChatId } : "skip",
  );

  const handleNewChat = (chatId: Id<"chats">) => {
    setSelectedChatId(chatId);
  };

  return (
    <>
      <AppSidebar
        chats={chats}
        selectedChatId={selectedChatId}
        onSelectChat={(chatId) => {
          setSelectedChatId(chatId);
        }}
        onNewChat={() => setSelectedChatId(null)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main chat area */}
      <SidebarInset>
        <ChatInterface
          conversationId={selectedChat ? selectedChat._id : "default"}
          onChatCreated={handleNewChat}
        />
      </SidebarInset>
    </>
  );
}
