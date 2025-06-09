import * as React from "react";
import { MessageSquare, Plus, Search } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";
import { NavUser } from "./nav-user";

// This is sample data.
const conversations = [
  {
    id: "today-1",
    title: "Brainstorming new project ideas",
    preview: "Let's think about our next big thing...",
    date: new Date(),
    category: "Today",
  },
  {
    id: "30days-1",
    title: "Q3 Marketing Strategy",
    preview: "Reviewing the marketing plan for the third quarter.",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    category: "Last 30 Days",
  },
  {
    id: "30days-2",
    title: "Website Redesign Feedback",
    preview: "Gathering feedback on the new website mockups.",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    category: "Last 30 Days",
  },
  {
    id: "30days-3",
    title: "New Employee Onboarding",
    preview: "How can I help you get started?",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    category: "Last 30 Days",
  },
  {
    id: "30days-4",
    title: "Competitor Analysis Report",
    preview: "An overview of the current market landscape.",
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    category: "Last 30 Days",
  },
  {
    id: "30days-5",
    title: "Customer Support Improvements",
    preview: "Discussing ways to enhance our customer service.",
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    category: "Last 30 Days",
  },
  {
    id: "30days-6",
    title: "Team Offsite Planning",
    preview: "Ideas for locations and activities for the team trip.",
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    category: "Last 30 Days",
  },
  {
    id: "30days-7",
    title: "Budget Planning for Next Year",
    preview: "Initial thoughts on the upcoming fiscal year's budget.",
    date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    category: "Last 30 Days",
  },
  {
    id: "30days-8",
    title: "Mobile App Feature Requests",
    preview: "A list of requested features from our users.",
    date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    category: "Last 30 Days",
  },
  {
    id: "older-1",
    title: "Recap of the Annual Conference",
    preview: "Summary of key takeaways and action items.",
    date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    category: "Older",
  },
  {
    id: "older-2",
    title: "Initial thoughts on product launch",
    preview: "High-level discussion about the new product launch.",
    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    category: "Older",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConversation, setActiveConversation] = useState<string | null>(
    "today-1",
  );
  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.preview.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const groupedConversations = filteredConversations.reduce<
    Record<string, typeof conversations>
  >((groups, conversation) => {
    const category = conversation.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(conversation);
    return groups;
  }, {});
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between py-2 pl-10">
          <h1 className="text-xl font-semibold text-primary">ChatOSS</h1>
        </div>
        <Button
          className="w-full bg-primary/90 hover:bg-primary mb-2"
          size="sm"
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
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarMenu>
          {Object.entries(groupedConversations).map(
            ([category, categoryConversations]) => (
              <React.Fragment key={category}>
                <h2 className="px-2 py-2 text-sm font-medium text-muted-foreground">
                  {category}
                </h2>
                {categoryConversations.map((conversation) => (
                  <SidebarMenuItem key={conversation.id}>
                    <SidebarMenuButton
                      className={cn(
                        "w-full justify-start font-normal",
                        activeConversation === conversation.id &&
                          "bg-accent text-accent-foreground",
                      )}
                      onClick={() => setActiveConversation(conversation.id)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <div className="flex-1 truncate">
                        <div className="truncate">{conversation.title}</div>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </React.Fragment>
            ),
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
