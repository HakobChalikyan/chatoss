"use client";

import type React from "react";

import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Markdown } from "../markdown";
import { PreviewAttachment } from "../preview-attachment";
import { MessageActions } from "./message-actions";
import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Edit3,
  Check,
  X,
  GitBranch,
  RotateCcw,
  Sparkles,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface MessageProps {
  message: {
    _id: Id<"messages">;
    role: "user" | "assistant";
    content: string;
    reasoning?: string;
    _creationTime: number;
    isStreaming?: boolean;
    model: string;
    files?: Array<{
      id: Id<"_storage">;
      url: string | null;
      metadata: any;
    }>;
  };
  chatId: Id<"chats">;
  branchedChats?: Array<{
    _id: Id<"chats">;
    branchedFromMessageId?: Id<"messages">;
    title: string;
  }>;
}

const StreamingIndicator = () => (
  <div className="flex items-center justify-center">
    <div className="flex space-x-1">
      <div
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "0ms" }}
      ></div>
      <div
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "150ms" }}
      ></div>
      <div
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "300ms" }}
      ></div>
    </div>
  </div>
);

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function Message({ message, chatId, branchedChats }: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const createBranchedChat = useMutation(api.chats.createBranchedChat);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const sendMessage = useMutation(api.messages.sendMessage);
  const currentChat = useQuery(api.chats.getChat, { chatId });
  const router = useRouter();

  // Auto-resize textarea and focus when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length,
      );
      // Auto-resize
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(message.content);
  };

  const handleEditConfirm = (branch: boolean) => {
    setShowEditDialog(false);
    handleResubmit(branch);
  };

  const handleBranch = async () => {
    if (message.role === "assistant") {
      try {
        const newChatId = await createBranchedChat({
          parentChatId: chatId,
          branchedFromMessageId: message._id,
          editedContent: "",
          fileIds: undefined,
          model: message.model,
        });
        router.push(`/chat/${newChatId}`);
      } catch (error) {
        console.error("Error creating branched chat:", error);
      }
    }
  };

  const handleResubmit = async (shouldBranch: boolean) => {
    if (editedContent.trim() === "") return;

    if (message.role === "user") {
      try {
        if (shouldBranch) {
          // Create a new branched chat
          const newChatId = await createBranchedChat({
            parentChatId: chatId,
            branchedFromMessageId: message._id,
            editedContent,
            fileIds:
              message.files && message.files.length > 0
                ? message.files.map((f) => f.id)
                : undefined,
            model: message.model,
          });
          router.push(`/chat/${newChatId}`);
        } else {
          // Delete the original message and create a new one
          await deleteMessage({ messageId: message._id });
          await sendMessage({
            chatId,
            content: editedContent,
            fileIds:
              message.files && message.files.length > 0
                ? message.files.map((f) => f.id)
                : undefined,
            model: message.model,
          });
        }
      } catch (error) {
        console.error("Error handling message edit:", error);
      }
    }

    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // Allow Shift+Enter to create a new line
        return;
      }
      // Regular Enter submits
      e.preventDefault();
      setShowEditDialog(true);
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditedContent(message.content);
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditedContent(message.content);
  };

  const renderMessageFiles = (files: MessageProps["message"]["files"]) => {
    if (!files || files.length === 0) return null;

    return (
      <div className="flex flex-wrap mt-3 gap-2">
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
    <>
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-gray-600" />
              Edit Message
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Choose how you'd like to handle your edited message:
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div
              onClick={() => handleEditConfirm(false)}
              className="cursor-pointer flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-gray-600" />
              <div>
                <p className="font-medium text-sm">Edit & Resubmit</p>
                <p className="text-xs text-gray-500 mt-1">
                  Replace the original message and regenerate the conversation
                </p>
              </div>
            </div>

            <div
              onClick={() => handleEditConfirm(true)}
              className="cursor-pointer flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <GitBranch className="w-4 h-4 text-gray-500" />
              <div>
                <p className="font-medium text-sm text-gray-900">Branch Off</p>
                <p className="text-xs text-gray-500 mt-1">
                  Create a new conversation thread from this point
                </p>
              </div>
            </div>

            <div
              onClick={() => setShowEditDialog(false)}
              className="cursor-pointer flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500 mt-1" />
              <div>
                <p className="font-medium text-sm text-gray-900">Cancel</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div
        className={cn(
          "flex flex-col max-w-3xl mx-auto transition-all duration-200",
          message.role === "user" ? "items-end" : "items-start",
          isEditing && "max-w-4xl",
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-5 py-4 relative group shadow-lg",
            message.role === "user"
              ? "bg-gradient-to-br from-gray-500 to-slate-600 text-white glass border border-white/20"
              : "glass bg-white/20 backdrop-blur-xl border border-white/30 text-foreground hover:bg-white/25 w-full",
            isEditing && "ring-2 ring-gray-400 shadow-xl pulse-glow",
          )}
        >
          {isEditing ? (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={editedContent}
                  onChange={handleTextareaInput}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    "w-full min-h-[120px] p-4 rounded-xl resize-none",
                    "glass bg-white/10 border border-white/30 focus:border-gray-400 focus:ring-2 focus:ring-gray-200",
                    "text-foreground placeholder:text-muted-foreground/70",
                    "transition-all duration-300 font-sans text-sm leading-relaxed backdrop-blur-sm",
                  )}
                  placeholder="Edit your message..."
                  style={{
                    minWidth: "400px",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                />
                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground glass bg-white/20 px-3 py-1 rounded-lg">
                  Enter to submit
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-white/80 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Press Escape to cancel
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={cancelEdit}
                    className="flex items-center gap-1 h-8 px-3 rounded-xl glass bg-white/20 hover:bg-white/30 border border-white/30"
                  >
                    <X className="w-3 h-3" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowEditDialog(true)}
                    className="flex items-center gap-1 h-8 px-3 rounded-xl bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700"
                    disabled={editedContent.trim() === ""}
                  >
                    <Check className="w-3 h-3" />
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {message.reasoning && (
                <div className="mt-4 mb-4">
                  <button
                    onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-xl",
                      "glass bg-gradient-to-r from-indigo-200/50 to-blue-200/50 hover:from-indigo-300/60 hover:to-blue-300/60",
                      "border border-indigo-400/30 hover:border-indigo-500/40 backdrop-blur-sm",
                      "group",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 group-hover:from-indigo-700 group-hover:to-blue-700 transition-all duration-300 shadow-lg">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-indigo-900">
                        AI Reasoning
                      </span>
                      <span className="text-xs text-indigo-900 glass bg-indigo-300/40 px-3 py-1 rounded-full border border-indigo-400/30">
                        {isReasoningExpanded ? "Hide" : "Show"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {isReasoningExpanded ? (
                        <ChevronUp className="w-5 h-5 text-indigo-800 group-hover:text-indigo-900 transition-colors" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-indigo-800 group-hover:text-indigo-900 transition-colors" />
                      )}
                    </div>
                  </button>

                  {isReasoningExpanded && (
                    <div className="mt-4 p-5 glass bg-slate-100/30 rounded-xl border border-slate-300/20 shadow-sm backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-300/20">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-500 to-slate-600 animate-pulse shadow-lg"></div>
                        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Thought Process
                        </span>
                      </div>
                      <div className="prose prose-sm prose-slate max-w-none">
                        <div className="text-slate-700 leading-relaxed">
                          <Markdown>{message.reasoning}</Markdown>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="prose prose-sm max-w-none">
                <Markdown>
                  {isCancelled
                    ? message.content.replace("*Response was cancelled*", "")
                    : message.content}
                </Markdown>
              </div>
              {renderMessageFiles(message.files)}

              {branchedChats && branchedChats.length > 0 && (
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/20">
                  <span
                    className={cn(
                      "text-xs flex items-center gap-2 font-medium",
                      message.role === "user"
                        ? "text-white/90"
                        : "text-muted-foreground",
                    )}
                  >
                    <GitBranch className="w-3 h-3" />
                    Branches:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {branchedChats.map((branch) => (
                      <a
                        key={branch._id}
                        target="_blank"
                        href={`/chat/${branch._id}`}
                        className={cn(
                          "text-xs px-3 py-2 rounded-xl",
                          message.role === "user"
                            ? "glass bg-white/20 text-white hover:bg-white/30 border border-white/30 hover:border-white/40"
                            : "glass bg-gray-100/50 text-gray-700 hover:bg-gray-200/60 hover:shadow-lg border border-gray-200/50 hover:border-gray-300/60",
                          "flex items-center gap-2 font-medium backdrop-blur-sm",
                        )}
                        rel="noreferrer"
                      >
                        <MessageSquare className="w-3 h-3" />
                        {branch.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {isCancelled && (
                <div className="text-xs mt-4 glass bg-red-100/30 text-red-800 border border-red-200/30 p-4 rounded-xl flex items-center gap-3 backdrop-blur-sm">
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </div>
                  <span className="font-medium">Response stopped by user</span>
                </div>
              )}

              <div
                className={cn(
                  "text-xs mt-3 flex items-center gap-2 font-medium",
                  message.role === "user"
                    ? "text-white/70"
                    : "text-muted-foreground dark:text-gray-300",
                )}
              >
                {!message.isStreaming && (
                  <span className="glass bg-white/30 px-2 py-1 rounded-lg border border-white/40 dark:bg-gray-800/50 dark:border-gray-700/60">
                    {formatTime(message._creationTime)}
                  </span>
                )}
                {message.isStreaming && !message.content && (
                  <div className="glass bg-white/10 px-3 py-2 rounded-lg border border-white/20 flex items-center gap-2">
                    <StreamingIndicator />
                    <span>AI is thinking...</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {!isEditing && (
          <MessageActions
            content={message.content}
            role={message.role}
            onEdit={message.role === "user" ? handleEdit : undefined}
            onBranch={message.role === "assistant" ? handleBranch : undefined}
            messageId={message._id}
          />
        )}
      </div>
    </>
  );
}
