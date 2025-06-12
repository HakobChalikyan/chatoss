import * as React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Message } from "./message";

interface MessagesProps {
  messages: Array<{
    _id: Id<"messages">;
    role: "user" | "assistant";
    content: string;
    _creationTime: number;
    isStreaming?: boolean;
    files?: Array<{
      id: Id<"_storage">;
      url: string | null;
      metadata: any;
    }>;
  }>;
}

export function Messages({ messages }: MessagesProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (messages) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
      });
    }
  }, [messages]);

  return (
    <div className="space-y-6 pb-4">
      {messages.map((message) => (
        <Message key={message._id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
