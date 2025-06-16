"use client";

import * as React from "react";
import { Sparkles, Code, BookOpen, Compass, ArrowDown } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Messages } from "./chat/messages";
import { ChatInput } from "./chat/chat-input";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { AI_MODELS } from "@/lib/ai-models";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Import Dialog components
import { ApiKeyForm } from "@/app/settings/api-key-form";

interface ChatInterfaceProps {
  conversationId?: Id<"chats"> | undefined;
  onChatCreated?: (chatId: Id<"chats">) => void;
}

export function ChatInterface({
  conversationId,
  onChatCreated,
}: ChatInterfaceProps) {
  const [input, setInput] = React.useState("");
  const [selectedModel, setSelectedModel] = React.useState(AI_MODELS[0]);
  const [uploadedFiles, setUploadedFiles] = React.useState<
    Array<{ file: File }>
  >([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = React.useState(false); // State for dialog visibility
  const { isAtBottom, scrollToBottom } = useScrollToBottom();

  const { isMobile, state } = useSidebar();

  const createChat = useMutation(api.chats.createChat);
  const sendMessage = useMutation(api.messages.sendMessage);
  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);
  const cancelStream = useMutation(api.messages.cancelStream);
  const chat = useQuery(
    api.chats.getChat,
    conversationId !== undefined
      ? { chatId: conversationId as Id<"chats"> }
      : "skip",
  );
  const existingKey = useQuery(api.apiKeys.getApiKey, { userId: undefined });

  let isNewChat = conversationId === undefined ? true : false;

  // Check if there's a streaming message
  const isStreaming = React.useMemo(() => {
    if (!chat?.messages) return false;
    return chat.messages.some((message) => message.isStreaming);
  }, [chat?.messages]);

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setIsUploading(true);
    const newFiles: Array<{ file: File }> = [];

    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          toast.error(`File ${file.name} is too large (max 10MB)`);
          continue;
        }

        newFiles.push({ file });
      }

      setUploadedFiles((prev) => [...prev, ...newFiles]);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to process files");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();

    if (existingKey === null) {
      setShowApiKeyDialog(true);
      return;
    }

    if (!input.trim() && uploadedFiles.length === 0) return;

    if (isNewChat) {
      setIsCreating(true);
      try {
        // Upload files first if any
        const fileIds: Id<"_storage">[] = [];
        if (uploadedFiles.length > 0) {
          for (const { file } of uploadedFiles) {
            const uploadUrl = await generateUploadUrl();
            const result = await fetch(uploadUrl, {
              method: "POST",
              headers: { "Content-Type": file.type },
              body: file,
            });

            if (!result.ok) {
              throw new Error(`Upload failed for ${file.name}`);
            }

            const { storageId } = await result.json();
            fileIds.push(storageId);
          }
        }

        // Create chat with files
        const chatId = await createChat({
          title: input.trim().slice(0, 50) + (input.length > 50 ? "..." : ""),
          initialMessage: input.trim() || "📎 Files attached",
          model: selectedModel.id,
          fileIds: fileIds.length > 0 ? fileIds : undefined,
        });

        onChatCreated?.(chatId);
      } catch (error) {
        toast.error("Failed to create chat");
      } finally {
        setIsCreating(false);
      }
    } else {
      try {
        const messageText = input.trim() || "📎 Files attached";
        const fileIds: Id<"_storage">[] = [];

        // Upload files if any
        if (uploadedFiles.length > 0) {
          for (const { file } of uploadedFiles) {
            const uploadUrl = await generateUploadUrl();
            const result = await fetch(uploadUrl, {
              method: "POST",
              headers: { "Content-Type": file.type },
              body: file,
            });

            if (!result.ok) {
              throw new Error(`Upload failed for ${file.name}`);
            }

            const { storageId } = await result.json();
            fileIds.push(storageId);
          }
        }

        await sendMessage({
          chatId: conversationId as Id<"chats">,
          content: messageText,
          fileIds: fileIds.length > 0 ? fileIds : undefined,
          model: selectedModel.id,
        });
      } catch (error) {
        toast.error("Failed to send message");
      }
    }

    setInput("");
    setUploadedFiles([]);
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancel = async () => {
    if (conversationId) {
      await cancelStream({ chatId: conversationId });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-10 pb-[150px]">
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
                onClick={() => setInput("How does AI work?")}
              >
                How does AI work?
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => setInput("Are black holes real?")}
              >
                Are black holes real?
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() =>
                  setInput('How many Rs are in the word "strawberry"?')
                }
              >
                How many Rs are in the word "strawberry"?
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => setInput("What is the meaning of life?")}
              >
                What is the meaning of life?
              </Button>
            </div>
          </div>
        ) : (
          <Messages
            messages={chat?.messages || []}
            chatId={conversationId as Id<"chats">}
            branchedChats={chat?.branchedChats?.map((branch) => ({
              _id: branch._id,
              branchedFromMessageId: branch.branchedFromMessageId,
              title: branch.title,
            }))}
          />
        )}
      </div>

      <div
        className={cn(
          "fixed bottom-0 bg-transparent",
          isMobile
            ? "left-0 right-0"
            : state === "expanded"
              ? "left-[var(--sidebar-width)] right-0"
              : "left-0 right-0",
        )}
      >
        {!isNewChat && !isAtBottom && (
          <div className="flex justify-center mb-2">
            <Button
              data-testid="scroll-to-bottom-button"
              className="rounded-full shadow-lg"
              size="icon"
              variant="outline"
              onClick={() => scrollToBottom("smooth")}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="p-4 pt-0 bg-white">
          <ChatInput
            input={input}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            uploadedFiles={uploadedFiles}
            onFileUpload={handleFileUpload}
            onRemoveFile={removeUploadedFile}
            isUploading={isUploading}
            isCreating={isCreating}
            isStreaming={isStreaming}
            selectedModel={selectedModel}
            onModelSelect={setSelectedModel}
          />
        </div>
      </div>

      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Required</DialogTitle>
            <DialogDescription>
              To use the chat functionality, you need to provide an API key. You
              can either enter it below or go to settings.
            </DialogDescription>
          </DialogHeader>
          <ApiKeyForm/>
        </DialogContent>
      </Dialog>
    </div>
  );
}