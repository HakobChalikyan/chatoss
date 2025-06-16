import * as React from "react";
import { ArrowUp, Paperclip, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PreviewAttachment } from "../preview-attachment";
import { AIModelSelector } from "./ai-model-selector";
import { AIModel } from "@/lib/ai-models";

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

  // Create and cleanup object URLs
  React.useEffect(() => {
    const urls: Record<number, string> = {};
    uploadedFiles.forEach((file, index) => {
      urls[index] = URL.createObjectURL(file.file);
    });

    setFileUrls(urls);

    // Cleanup function
    return () => {
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [uploadedFiles]);

  return (
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
            placeholder="Type your message here..."
            className="min-h-24 resize-none border-0 p-3 focus-visible:ring-0 shadow-none"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit(e);
              }
            }}
          />
          <div className="flex items-center justify-between p-3 pt-0">
            <div className="flex items-center gap-2">
              <AIModelSelector
                selectedModel={selectedModel}
                onModelSelect={onModelSelect}
              />
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
                onChange={(e) => e.target.files && onFileUpload(e.target.files)}
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
                disabled={isUploading || isStreaming}
              >
                {isUploading ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                ) : (
                  <Paperclip className="h-4 w-4" />
                )}
              </Button>
            </div>
            {isStreaming ? (
              <Button onClick={onCancel} size="sm" variant="destructive">
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
              >
                <ArrowUp className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
