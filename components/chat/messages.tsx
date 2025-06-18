import * as React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Message } from "./message";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";

interface MessagesProps {
  messages: Array<{
    _id: Id<"messages">;
    role: "user" | "assistant";
    content: string;
    reasoning?: string;
    _creationTime: number;
    model: string;
    isStreaming?: boolean;
    files?: Array<{
      id: Id<"_storage">;
      url: string | null;
      metadata: {
        _id: Id<"_storage">;
        _creationTime: number;
        contentType?: string | undefined | undefined;
        sha256: string;
        size: number;
      };
    }>;
  }>;
  chatId: Id<"chats">;
  branchedChats?: Array<{
    _id: Id<"chats">;
    branchedFromMessageId?: Id<"messages">;
    title: string;
    _creationTime: number;
  }>;
}

export function Messages({ messages, chatId, branchedChats }: MessagesProps) {
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
      <div className="space-y-6">
        {messages.map((message) => (
          <Message
            key={message._id}
            message={message}
            chatId={chatId}
            branchedChats={branchedChats?.filter(
              (
                chat,
              ): chat is typeof chat & {
                branchedFromMessageId: Id<"messages">;
              } =>
                chat.branchedFromMessageId !== undefined &&
                chat.branchedFromMessageId === message._id,
            )}
          />
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
