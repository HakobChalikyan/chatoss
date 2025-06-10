import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChatInterface } from "./chat-interface";
import { SidebarInset } from "./ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { useRouter } from "next/navigation";

interface ChatAppProps {
  initialChatId?: string;
}

export function ChatApp({ initialChatId }: ChatAppProps) {
  const router = useRouter();
  const [selectedChatId, setSelectedChatId] = useState<Id<"chats"> | null>(
    (initialChatId as Id<"chats">) || null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const chats = useQuery(api.chats.getUserChats, { searchQuery }) || [];
  const selectedChat = useQuery(
    api.chats.getChat,
    selectedChatId ? { chatId: selectedChatId } : "skip",
  );

  // Update URL when chat is selected
  useEffect(() => {
    if (selectedChatId) {
      router.push(`/chat/${selectedChatId}`);
    } else {
      router.push("/chat");
    }
  }, [selectedChatId, router]);

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
