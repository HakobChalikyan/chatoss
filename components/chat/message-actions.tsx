import { cn } from "@/lib/utils";
import {
  Check,
  Copy,
  Pencil,
  GitBranch,
  ClipboardList,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RetryDropdown } from "./retry-dropdown";
import { AIModel } from "@/lib/ai-models";
import { Button } from "@/components/ui/button";

interface MessageActionsProps {
  content: string;
  role: "user" | "assistant";
  onEdit?: () => void;
  onBranch?: () => void;
  messageId?: Id<"messages">;
  currentModel?: AIModel;
  onRetrySame?: () => void;
  onRetryModel?: (model: AIModel) => void;
}

export function MessageActions({
  content,
  role,
  onEdit,
  onBranch,
  messageId,
  currentModel,
  onRetrySame,
  onRetryModel,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  const copyAsPlainText = async () => {
    // Remove markdown formatting
    let plainText = content
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, (match) => match.replace(/```/g, "").trim())
      // Remove inline code
      .replace(/`([^`]+)`/g, "$1")
      // Remove bold/italic
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      // Remove links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Remove headers
      .replace(/^#{1,6}\s+/gm, "")
      // Remove horizontal rules
      .replace(/^[-*_]{3,}$/gm, "")
      // Remove blockquotes
      .replace(/^>\s+/gm, "")
      // Remove list markers
      .replace(/^[-*+]\s+/gm, "")
      .replace(/^\d+\.\s+/gm, "")
      // Remove empty lines (more robust than the previous version)
      .replace(/^\s*[\r\n]+/gm, "\n")
      // Condense multiple spaces within a line, but preserve newlines
      .replace(/  +/g, " "); // Replace 2+ spaces with 1.  Crucial.

    plainText = plainText.trim(); //trim leading and trailing spaces
    await navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAsMarkdown = async () => {
    await navigator.clipboard.writeText(content);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  return (
    <div
      className={cn(
        "flex gap-2 p-2",
        role === "user" ? "self-end" : "self-start",
      )}
    >
      {role === "user" && onEdit && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onEdit}
              className={cn(
                "p-1 rounded-md hover:bg-neutral-200/50 transition-colors",
              )}
            >
              <Pencil className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Edit message</TooltipContent>
        </Tooltip>
      )}
      {role === "user" && currentModel && onRetrySame && onRetryModel && (
        <RetryDropdown
          currentModel={currentModel}
          onRetrySame={onRetrySame}
          onSelect={onRetryModel}
        >
          <Button
            variant="ghost"
            size="icon"
            className="p-1 rounded-md hover:bg-neutral-200/50 transition-colors"
            aria-label="Retry message"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </RetryDropdown>
      )}
      {role === "assistant" && onBranch && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onBranch}
              className={cn(
                "p-1 rounded-md hover:bg-neutral-200/50 transition-colors",
              )}
            >
              <GitBranch className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Branch conversation</TooltipContent>
        </Tooltip>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={copyAsPlainText}
            className={cn(
              "p-1 rounded-md hover:bg-neutral-200/50 transition-colors",
            )}
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {copied ? "Copied!" : "Copy as plain text"}
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={copyAsMarkdown}
            className={cn(
              "p-1 rounded-md hover:bg-neutral-200/50 transition-colors",
            )}
          >
            {copiedMarkdown ? (
              <Check className="w-4 h-4" />
            ) : (
              <ClipboardList className="w-4 h-4" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {copiedMarkdown ? "Copied!" : "Copy as markdown"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
