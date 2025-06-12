import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Markdown } from "../markdown";
import { PreviewAttachment } from "../preview-attachment";

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

export function Message({ message }: MessageProps) {
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

  return (
    <div
      className={cn(
        "flex flex-col max-w-3xl mx-auto",
        message.role === "user" ? "items-end" : "items-start",
      )}
    >
      <div
        className={cn(
          "rounded-lg px-4 py-2",
          message.role === "user"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-800",
        )}
      >
        <div className="whitespace-pre-wrap">
          <Markdown>{message.content}</Markdown>
          {message.isStreaming && message.content && (
            <span className="inline-block w-2 h-5 bg-current ml-1 animate-pulse"></span>
          )}
        </div>
        {renderMessageFiles(message.files)}
        <div
          className={cn(
            "text-xs mt-1",
            message.role === "user" ? "text-blue-100" : "text-gray-500",
          )}
        >
          <span>{formatTime(message._creationTime)}</span>
          {message.isStreaming && !message.content && <StreamingIndicator />}
        </div>
      </div>
    </div>
  );
}
