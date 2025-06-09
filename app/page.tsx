"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ChatInterface } from "@/components/chat-interface";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Page() {
  return (
    <SidebarProvider>
      {/* Fixed position sidebar trigger that stays visible */}
      <div className="fixed left-4 top-4 z-50">
        <SidebarTrigger className="bg-sidebar hover:bg-neutral-300 cursor-pointer" />
      </div>

      <AppSidebar />
      <SidebarInset>
        <ChatInterface />
      </SidebarInset>
    </SidebarProvider>
  );
}
