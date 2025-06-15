import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Markdown } from "../markdown";
import { PreviewAttachment } from "../preview-attachment";
import { MessageActions } from "./message-actions";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface MessageProps {
  message: {
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
  };
  chatId: Id<"chats">;
}

const StreamingIndicator = () => (
  <div className="flex items-center gap-1 text-gray-400">
    <div className="flex space-x-1">
      <div
        className="w-1 h-1 bg-current rounded-full animate-bounce"
        style={{ animationDelay: "0ms" }}
      ></div>
      <div
        className="w-1 h-1 bg-current rounded-full animate-bounce"
        style={{ animationDelay: "150ms" }}
      ></div>
      <div
        className="w-1 h-1 bg-current rounded-full animate-bounce"
        style={{ animationDelay: "300ms" }}
      ></div>
    </div>
    <span className="text-xs ml-1">AI is typing...</span>
  </div>
);

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function Message({ message, chatId }: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const sendMessage = useMutation(api.chats.sendMessage);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(message.content);
  };

  const handleResubmit = async () => {
    if (editedContent.trim() === "") return;

    await sendMessage({
      chatId,
      content: editedContent,
      fileIds:
        message.files && message.files.length > 0
          ? message.files.map((f) => f.id)
          : undefined,
    });

    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleResubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditedContent(message.content);
    }
  };

  const renderMessageFiles = (files: MessageProps["message"]["files"]) => {
    if (!files || files.length === 0) return null;

    return (
      <div className="mt-2 space-y-2">
        {files.map((file, index) => (
          <PreviewAttachment
            key={index}
            attachment={{
              url: file.url || "",
              name: file.metadata?.fileName || "File",
              contentType: file.metadata?.contentType || "",
            }}
            isUploading={false}
          />
        ))}
      </div>
    );
  };

  const isCancelled = message.content.endsWith("*Response was cancelled*");

  return (
    <div
      className={cn(
        "flex flex-col max-w-3xl mx-auto",
        message.role === "user" ? "items-end" : "items-start",
      )}
    >
      <div
        className={cn(
          "rounded-lg px-4 py-2 relative group",
          message.role === "user"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-800",
        )}
      >
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full min-h-[100px] p-2 rounded-md bg-white text-gray-800 resize-y"
              placeholder="Edit your message..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(message.content);
                }}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleResubmit}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Resubmit
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="whitespace-pre-wrap">
              <Markdown>
                {isCancelled
                  ? message.content.replace("*Response was cancelled*", "")
                  : message.content}
              </Markdown>
            </div>
            {renderMessageFiles(message.files)}

            {isCancelled && (
              <div className="text-xs mt-2 text-black bg-red-300 p-4 rounded-xl italic">
                Response stopped by user
              </div>
            )}
            <div
              className={cn(
                "text-xs mt-1",
                message.role === "user" ? "text-blue-100" : "text-gray-500",
              )}
            >
              {!message.isStreaming && (
                <span>{formatTime(message._creationTime)}</span>
              )}
              {message.isStreaming && !message.content && (
                <StreamingIndicator />
              )}
            </div>
          </>
        )}
      </div>
      <MessageActions
        content={message.content}
        role={message.role}
        onEdit={message.role === "user" ? handleEdit : undefined}
      />
    </div>
  );
}
