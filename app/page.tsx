"use client";
import { ChatApp } from "@/components/ChatApp";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/chat");
}
