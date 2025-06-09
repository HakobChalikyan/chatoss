"use client";

import * as React from "react";
import {
  Sparkles,
  Code,
  BookOpen,
  Compass,
  ArrowUp,
  Search,
  Paperclip,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatInterfaceProps {
  conversationId?: string;
}

export function ChatInterface({
  conversationId = "default",
}: ChatInterfaceProps) {
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isNewChat, setIsNewChat] = React.useState(true);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset state when conversation changes
  React.useEffect(() => {
    if (conversationId === "today-1") {
      setIsNewChat(false);
      setMessages([
        {
          id: "1",
          content: "explain --force vs --legacy-peer-deps",
          role: "user",
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
        },
        {
          id: "2",
          content: `When managing Node.js packages, you'll sometimes encounter issues with peerDependencies. These are dependencies that a package expects its host environment (your project) to provide, rather than providing them itself. This allows for more flexible dependency trees and prevents multiple instances of the same dependency, which can cause problems, especially with UI frameworks.

The flags --force and --legacy-peer-deps are used with npm install (and yarn install, though yarn has its own slight variations) to handle these peerDependency conflicts.

Let's break down each:

--force (or -f)

The --force flag is a much more aggressive and generally less recommended approach for resolving dependency conflicts. It tells npm to install all dependencies, even if it means ignoring warnings and potential issues, including peerDependency conflicts.`,
          role: "assistant",
          timestamp: new Date(Date.now() - 1000 * 60 * 4),
        },
      ]);
    } else {
      setIsNewChat(true);
      setMessages([]);
    }
  }, [conversationId]);

  const handleSubmit = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsNewChat(false);

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Thanks for your message! This is a simulated response to: "${input}"`,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {isNewChat ? (
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-3xl font-bold mb-8">
              How can I help you, Hakob?
            </h1>

            {/* Horizontal category buttons */}
            <div className="flex gap-3 mb-12">
              <Button
                variant="outline"
                className="px-6 py-3 flex items-center gap-2 rounded-full"
              >
                <Sparkles className="h-4 w-4" />
                <span>Create</span>
              </Button>
              <Button
                variant="outline"
                className="px-6 py-3 flex items-center gap-2 rounded-full"
              >
                <BookOpen className="h-4 w-4" />
                <span>Explore</span>
              </Button>
              <Button
                variant="outline"
                className="px-6 py-3 flex items-center gap-2 rounded-full"
              >
                <Code className="h-4 w-4" />
                <span>Code</span>
              </Button>
              <Button
                variant="outline"
                className="px-6 py-3 flex items-center gap-2 rounded-full"
              >
                <Compass className="h-4 w-4" />
                <span>Learn</span>
              </Button>
            </div>

            {/* Suggested questions */}
            <div className="space-y-4 w-full max-w-2xl">
              <Button
                variant="ghost"
                className="w-full justify-start text-left h-auto py-3"
              >
                How does AI work?
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-left h-auto py-3"
              >
                Are black holes real?
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-left h-auto py-3"
              >
                How many Rs are in the word "strawberry"?
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-left h-auto py-3"
              >
                What is the meaning of life?
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col max-w-3xl mx-auto",
                  message.role === "user" ? "items-end" : "items-start",
                )}
              >
                {message.role === "user" && (
                  <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2">
                    <p>{message.content}</p>
                  </div>
                )}
                {message.role === "assistant" && (
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                )}
                <span className="text-xs text-muted-foreground mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="relative">
          <div className="rounded-lg border bg-background">
            <div className="flex flex-col">
              <Textarea
                placeholder="Type your message here..."
                className="min-h-24 resize-none border-0 p-3 focus-visible:ring-0 shadow-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <div className="flex items-center justify-between p-3 pt-0">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    Gemini 2.5 Flash
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-xs px-2"
                  >
                    <Search className="h-4 w-4" />
                    <span className="ml-1">Search</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="px-2"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleSubmit}
                  size="sm"
                  disabled={!input.trim()}
                >
                  <ArrowUp className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
