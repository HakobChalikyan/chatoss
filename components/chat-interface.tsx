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
  Check,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSidebar } from "@/components/ui/sidebar";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const AI_MODELS = [
  {
    id: "google/gemma-3-27b-it:free",
    name: "Gemma 3 27b",
    description: "Free model",
  },
  {
    id: "google/gemini-2.0-flash-exp:free",
    name: "Gemini 2.0 Flash",
    description: "Free experimental model",
  },
  {
    id: "qwen/qwq-32b:free",
    name: "Qwen qwq-32b",
    description: "Free testing model",
  },
];

// const CodeBlock = ({ content }: { content: string }) => {
//   // Extract language from the first line if it exists
//   const lines = content.split("\n");
//   let language = "";
//   let code = content;

//   if (lines[0].startsWith("```")) {
//     language = lines[0].slice(3).trim();
//     code = lines.slice(1, -1).join("\n");
//   }

//   return (
//     <div className="relative group">
//       <SyntaxHighlighter
//         language={language || "text"}
//         style={vscDarkPlus}
//         customStyle={{
//           margin: 0,
//           borderRadius: "0.5rem",
//           padding: "1rem",
//         }}
//       >
//         {code}
//       </SyntaxHighlighter>
//       {language && (
//         <div className="absolute top-2 right-2 text-xs text-gray-400">
//           {language}
//         </div>
//       )}
//     </div>
//   );
// };

// const MessageContent = ({ content }: { content: string }) => {
//   const customSyntaxHighlighterStyle = {
//     ...vscDarkPlus,
//     'pre[class*=\"language-\"]': {
//       ...(vscDarkPlus['pre[class*="language-"]'] || {}),
//       margin: 0,
//       borderRadius: "0.5rem",
//       padding: "1rem",
//     },
//     'code[class*=\"language-\"]': {
//       ...(vscDarkPlus['code[class*="language-"]'] || {}),
//       backgroundColor: "transparent",
//     },
//   };

//   return (
//     <div className="prose dark:prose-invert max-w-none">
//       <ReactMarkdown
//         remarkPlugins={[remarkGfm]}
//         components={{
//           code({ inline, className, children, ...props }: CodeProps) {
//             const match = /language-(\w+)/.exec(className || "");
//             if (inline) {
//               return (
//                 <code className={className} {...props}>
//                   {children}
//                 </code>
//               );
//             }
//             return (
//               <SyntaxHighlighter
//                 style={customSyntaxHighlighterStyle}
//                 language={match?.[1] || "text"}
//                 PreTag="div"
//                 {...props}
//               >
//                 {String(children).replace(/\n$/, "")}
//               </SyntaxHighlighter>
//             );
//           },
//         }}
//       >
//         {content}
//       </ReactMarkdown>
//     </div>
//   );
// };

export function ChatInterface({
  conversationId,
  onChatCreated,
}: ChatInterfaceProps) {
  const [input, setInput] = React.useState("");
  const [selectedModel, setSelectedModel] = React.useState(AI_MODELS[0]);
  const [uploadedFiles, setUploadedFiles] = React.useState<
    Array<{
      file: File;
    }>
  >([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isNewChat, setIsNewChat] = React.useState(true);
  const [isCreating, setIsCreating] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { isMobile, state } = useSidebar();

  const createChat = useMutation(api.chats.createChat);
  const sendMessage = useMutation(api.chats.sendMessage);
  const generateUploadUrl = useMutation(api.chats.generateUploadUrl);
  const saveFileToChat = useMutation(api.chats.saveFileToChat);
  const chat = useQuery(
    api.chats.getChat,
    conversationId !== undefined
      ? { chatId: conversationId as Id<"chats"> }
      : "skip",
  );

  // Scroll to bottom when messages change or when switching chats
  React.useEffect(() => {
    if (chat?.messages) {
      // Use requestAnimationFrame to ensure the DOM has updated
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
      });
    }
  }, [chat?.messages, conversationId]);

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
      toast.success(`${newFiles.length} file(s) selected`);
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
        toast.success("Chat created successfully");
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

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderFilePreview = (file: { file: File }, index: number) => {
    return (
      <PreviewAttachment
        key={index}
        attachment={{
          url: URL.createObjectURL(file.file),
          name: file.file.name,
          contentType: file.file.type,
        }}
        isUploading={false}
      />
    );
  };

  const renderMessageFiles = (files: Message["files"]) => {
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
          <div className="space-y-6 pb-4">
            {chat?.messages.map((message) => (
              <div
                key={message._id}
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
                      message.role === "user"
                        ? "text-blue-100"
                        : "text-gray-500",
                    )}
                  >
                    <span>{formatTime(message._creationTime)}</span>
                    {message.isStreaming && !message.content && (
                      <StreamingIndicator />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div
        className={cn(
          "fixed bottom-0 p-4 bg-white",
          isMobile
            ? "left-0 right-0"
            : state === "expanded"
              ? "left-[var(--sidebar-width)] right-0"
              : "left-0 right-0",
        )}
      >
        <div className="relative">
          <div className="rounded-lg border bg-background">
            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
              <div className="p-3 w-full">
                <div className="flex flex-wrap gap-4">
                  {uploadedFiles.map((file, index) => (
                    <PreviewAttachment
                      key={index}
                      attachment={{
                        url: URL.createObjectURL(file.file),
                        name: file.file.name,
                        contentType: file.file.type,
                      }}
                      isUploading={false}
                      onDelete={() => removeUploadedFile(index)}
                    />
                  ))}
                </div>
              </div>
            )}

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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        <Sparkles className="h-3.5 w-3.5 mr-1" />
                        {selectedModel.name}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px]">
                      {AI_MODELS.map((model) => (
                        <DropdownMenuItem
                          key={model.id}
                          onClick={() => setSelectedModel(model)}
                          className="flex items-center justify-between"
                        >
                          <span>{model.name}</span>
                          {selectedModel.id === model.id && (
                            <Check className="h-4 w-4" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-xs px-2"
                  >
                    <Search className="h-4 w-4" />
                    <span className="ml-1">Search</span>
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) =>
                      e.target.files && handleFileUpload(e.target.files)
                    }
                    multiple
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="px-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                    ) : (
                      <Paperclip className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  onClick={handleSubmit}
                  size="sm"
                  disabled={
                    (!input.trim() && uploadedFiles.length === 0) || isCreating
                  }
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
