"use client";

import { ChatApp } from "@/components/ChatApp";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useParams } from "next/navigation";

export default function ChatPage() {
  const params = useParams();
  const chatId = params?.chatId as string;

  return (
    <SidebarProvider>
      {/* Fixed position sidebar trigger that stays visible */}
      <div className="fixed left-4 top-4 z-50">
        <SidebarTrigger className="bg-sidebar hover:bg-neutral-300 cursor-pointer" />
      </div>

      <ChatApp initialChatId={chatId} />
    </SidebarProvider>
  );
}
