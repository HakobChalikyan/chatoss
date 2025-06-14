import * as React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Message } from "./message";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";

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
  const {
    containerRef,
    endRef,
    scrollToBottom,
    onViewportEnter,
    onViewportLeave,
  } = useScrollToBottom();

  React.useEffect(() => {
    // Scroll to bottom when new messages are added
    if (messages.length > 0) {
      scrollToBottom("instant");
    }
  }, [messages.length, scrollToBottom]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onViewportEnter();
        } else {
          onViewportLeave();
        }
      },
      { threshold: 1.0 },
    );

    if (endRef.current) {
      observer.observe(endRef.current);
    }

    return () => observer.disconnect();
  }, [onViewportEnter, onViewportLeave]);

  return (
    <div
      ref={containerRef}
      className="relative w-full flex flex-col gap-4 h-full overflow-y-auto"
    >
      <div className="space-y-6 pb-4">
        {messages.map((message) => (
          <Message key={message._id} message={message} />
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
