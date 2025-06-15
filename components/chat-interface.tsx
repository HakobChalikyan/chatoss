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
import { AI_MODELS } from "./chat/ai-model-selector";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";

interface Message {
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
}

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
  const [isNewChat, setIsNewChat] = React.useState(true);
  const [isCreating, setIsCreating] = React.useState(false);
  const { isAtBottom, scrollToBottom } = useScrollToBottom();

  const { isMobile, state } = useSidebar();

  const createChat = useMutation(api.chats.createChat);
  const sendMessage = useMutation(api.chats.sendMessage);
  const generateUploadUrl = useMutation(api.chats.generateUploadUrl);
  const saveFileToChat = useMutation(api.chats.saveFileToChat);
  const cancelStream = useMutation(api.chats.cancelStream);
  const chat = useQuery(
    api.chats.getChat,
    conversationId !== undefined
      ? { chatId: conversationId as Id<"chats"> }
      : "skip",
  );

  // Check if there's a streaming message
  const isStreaming = React.useMemo(() => {
    if (!chat?.messages) return false;
    return chat.messages.some((message) => message.isStreaming);
  }, [chat?.messages]);

  // Reset state when conversation changes
  React.useEffect(() => {
    if (conversationId === undefined) {
      setIsNewChat(true);
      setUploadedFiles([]);
    } else {
      setIsNewChat(false);
    }
  }, [conversationId]);

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
    if (!input.trim() && uploadedFiles.length === 0) return;

    if (isNewChat) {
      setIsCreating(true);
      try {
        // First create the chat
        const chatId = await createChat({
          title: input.trim().slice(0, 50) + (input.length > 50 ? "..." : ""),
          model: selectedModel.id,
          initialMessage: input.trim(),
        });

        // Then upload files and save them to the chat
        if (uploadedFiles.length > 0) {
          const fileIds: Id<"_storage">[] = [];
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

            await saveFileToChat({
              chatId,
              storageId,
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
            });
          }

          // Update the chat with file IDs
          await sendMessage({
            chatId,
            content: input.trim() || "📎 Files attached",
            fileIds,
          });
        }

        onChatCreated?.(chatId);
        setIsNewChat(false);
      } catch (error) {
        toast.error("Failed to create chat");
      } finally {
        setIsCreating(false);
      }
    } else {
      try {
        const messageText = input.trim() || "📎 Files attached";
        const fileIds: Id<"_storage">[] = [];

        // Upload files and save them to the chat
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

            await saveFileToChat({
              chatId: conversationId as Id<"chats">,
              storageId,
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
            });
          }
        }

        await sendMessage({
          chatId: conversationId as Id<"chats">,
          content: messageText,
          fileIds: fileIds.length > 0 ? fileIds : undefined,
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
    </div>
  );
}
