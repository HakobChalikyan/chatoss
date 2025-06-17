"use client";

import * as React from "react";
import { ArrowUp, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PreviewAttachment } from "../preview-attachment";
import { AIModelSelector } from "./ai-model-selector";
import type { AIModel } from "@/lib/ai-models";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent | React.KeyboardEvent) => void;
  onCancel?: () => void;
  uploadedFiles: Array<{ file: File }>;
  onFileUpload: (files: FileList) => void;
  onRemoveFile: (index: number) => void;
  isUploading: boolean;
  isCreating: boolean;
  isStreaming?: boolean;
  selectedModel: AIModel;
  onModelSelect: (model: AIModel) => void;
}

export function ChatInput({
  input,
  onInputChange,
  onSubmit,
  onCancel,
  uploadedFiles,
  onFileUpload,
  onRemoveFile,
  isUploading,
  isCreating,
  isStreaming,
  selectedModel,
  onModelSelect,
}: ChatInputProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [fileUrls, setFileUrls] = React.useState<Record<number, string>>({});

  React.useEffect(() => {
    const urls: Record<number, string> = {};
    uploadedFiles.forEach((file, index) => {
      urls[index] = URL.createObjectURL(file.file);
    });

    setFileUrls(urls);

    return () => {
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [uploadedFiles]);

  return (
    <div className="relative transition-all duration-200">
      <div className="rounded-2xl rounded-b-none border-0 bg-transparent shadow-2xl">
        {/* Uploaded Files Preview */}
        {uploadedFiles.length > 0 && (
          <div className="p-4 w-full">
            <div className="flex flex-wrap gap-4">
              {uploadedFiles.map((file, index) => (
                <PreviewAttachment
                  key={index}
                  attachment={{
                    url: fileUrls[index] || "",
                    name: file.file.name,
                    contentType: file.file.type,
                  }}
                  isUploading={false}
                  onDelete={() => onRemoveFile(index)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col">
          <Textarea
            placeholder="Type your message here... ✨"
            className={cn(
              "min-h-24 resize-none border-0 p-4 focus-visible:ring-0 shadow-none",
              "bg-transparent text-foreground placeholder:text-gray-600 dark:placeholder:text-muted-foreground/70",
              "text-base leading-relaxed",
              "dark:bg-transparent",
            )}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e);
              }
            }}
          />
          <div className="flex items-center justify-between p-4 pt-0 bg-transparent">
            <div className="flex items-center gap-2">
              <AIModelSelector
                selectedModel={selectedModel}
                onModelSelect={onModelSelect}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files && onFileUpload(e.target.files)}
                multiple
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={cn(
                  "text-xs transition-colors glass bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30",
                  "dark:bg-gray-800/20 dark:border-gray-600/30 dark:hover:bg-gray-700/30 dark:hover:border-gray-500/40",
                )}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isStreaming}
              >
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-gray-500 rounded-full animate-spin" />
                ) : (
                  <Paperclip className="h-4 w-4" />
                )}
              </Button>
            </div>
            {isStreaming ? (
              <Button
                onClick={onCancel}
                size="sm"
                variant="destructive"
                className="rounded-xl hover-lift"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Cancel</span>
              </Button>
            ) : (
              <Button
                onClick={onSubmit}
                size="sm"
                disabled={
                  (!input.trim() && uploadedFiles.length === 0) || isCreating
                }
                className={cn(
                  "rounded-xl hover-lift transition-all duration-300",
                  "bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700",
                  "text-white shadow-lg hover:shadow-xl",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                {isCreating ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
                <span className="sr-only">Send</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
