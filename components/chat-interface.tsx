"use client";

import * as React from "react";
import { Sparkles, ArrowDown } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Messages } from "./chat/messages";
import { ChatInput } from "./chat/chat-input";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { AI_MODELS } from "@/lib/ai-models";
import { categories, suggestedQuestions } from "@/lib/suggested-questions-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [showApiKeyDialog, setShowApiKeyDialog] = React.useState(false);
  const [chatInputHeight, setChatInputHeight] = React.useState(150);
  const chatInputRef = React.useRef<HTMLDivElement>(null);
  const { isAtBottom, scrollToBottom } = useScrollToBottom();
  const [selectedCategory, setSelectedCategory] = React.useState(
    categories[0].id,
  );

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

  const isNewChat = conversationId === undefined ? true : false;

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

  const suggestedQuestionsFiltered = React.useMemo(() => {
    return suggestedQuestions.filter(
      (question) => question.category === selectedCategory,
    );
  }, [selectedCategory]);

  React.useEffect(() => {
    const observeHeight = () => {
      if (chatInputRef.current) {
        const height = chatInputRef.current.offsetHeight;
        setChatInputHeight(height + 8); // Add some padding
      }
    };

    // Initial measurement
    observeHeight();

    // Create ResizeObserver to watch for height changes
    const resizeObserver = new ResizeObserver(observeHeight);
    if (chatInputRef.current) {
      resizeObserver.observe(chatInputRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [uploadedFiles]);

  return (
    <div className="flex flex-col h-full relative">
      {/* Enhanced background decoration for dark mode */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-neutral-400/10 to-neutral-400/10 dark:from-neutral-600/20 dark:to-neutral-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-stone-400/10 to-zinc-400/10 dark:from-stone-600/20 dark:to-zinc-600/20 rounded-full blur-3xl"></div>
      </div>

      <div
        className="flex-1 overflow-y-auto p-10 relative z-10"
        style={{ paddingBottom: `${chatInputHeight}px` }}
      >
        {isNewChat ? (
          <div className="flex flex-col items-center justify-center h-full">
            {/* Hero Section */}
            <div className="text-center mb-6 space-y-2">
              <div className="inline-flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-500 to-neutral-600 dark:from-neutral-400 dark:to-neutral-500 flex items-center justify-center float">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold gradient-text">
                  Hey there! 👋
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-xl">
                Ready to explore, create, and discover? Let's dive into
                something amazing together!
              </p>
            </div>

            {/* Category buttons with enhanced dark mode styling */}
            <div className="flex flex-wrap gap-3 mb-6 justify-center">
              {categories.map((category, index) => (
                <Button
                  key={category.id}
                  variant="outline"
                  className={cn(
                    "px-8 py-4 rounded-2xl border hover-lift glass",
                    "bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30",
                    "dark:bg-neutral-800/30 dark:hover:bg-neutral-700/40 dark:border-neutral-600/30 dark:hover:border-neutral-500/40",
                    "backdrop-blur-sm transition-all duration-300",
                    selectedCategory === category.id &&
                      "bg-white/40 dark:bg-neutral-600/60 border-white/40 dark:border-neutral-400/60 shadow-lg",
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-lg bg-gradient-to-br flex items-center justify-center mr-3",
                      category.color,
                    )}
                  >
                    <category.icon className="h-3 w-3 text-white" />
                  </div>
                  <span className="font-semibold">{category.label}</span>
                </Button>
              ))}
            </div>

            {/* Enhanced suggested questions with better dark mode support */}
            <div className="space-y-2 w-full max-w-2xl">
              {suggestedQuestionsFiltered.map((question, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left h-auto py-2 px-4 rounded-xl cursor-pointer hover-lift",
                    "glass bg-white/5 hover:bg-white/25 border border-white/10 hover:border-white/40",
                    "dark:bg-neutral-800/20 dark:hover:bg-neutral-700/30 dark:border-neutral-600/20 dark:hover:border-neutral-500/30",
                    "transition-all duration-300",
                  )}
                  onClick={() => setInput(question.text)}
                  style={{ animationDelay: `${(index + 4) * 100}ms` }}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center mr-3",
                      question.gradient,
                    )}
                  >
                    <question.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{question.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Click to ask this question
                    </p>
                  </div>
                </Button>
              ))}
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
        ref={chatInputRef}
        className={cn(
          "fixed bottom-0 bg-transparent z-20 px-4 max-w-4xl mx-auto transition-all duration-200 ease-linear",
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
              className={cn(
                "rounded-full shadow-lg glass pulse-glow",
                "bg-white/10 hover:bg-white/20 border border-white/20",
                "dark:bg-neutral-800/30 dark:hover:bg-neutral-700/40 dark:border-neutral-600/30",
              )}
              size="icon"
              variant="outline"
              onClick={() => scrollToBottom("smooth")}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div
          className={cn(
            "glass rounded-2xl rounded-b-none backdrop-blur-xl",
            "bg-white/10 border border-white/20",
            "dark:bg-neutral-800/30 dark:border-neutral-600/30",
          )}
        >
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
        <DialogContent
          className={cn(
            "glass backdrop-blur-xl border",
            "bg-white/95 border-neutral-200/50",
            "dark:bg-neutral-800/95 dark:border-neutral-700/50",
          )}
        >
          <DialogHeader>
            <DialogTitle className="gradient-text">
              API Key Required
            </DialogTitle>
            <DialogDescription>
              To use the chat functionality, you need to provide an API key. You
              can either enter it below or go to settings.
            </DialogDescription>
          </DialogHeader>
          <ApiKeyForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}
