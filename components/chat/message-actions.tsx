import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface MessageActionsProps {
  content: string;
  role: "user" | "assistant";
}

export function MessageActions({ content, role }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "flex gap-2 p-2",
        role === "user" ? "self-end" : "self-start",
      )}
    >
      <button
        onClick={copyToClipboard}
        className={cn("p-1 rounded-md hover:bg-gray-200/50 transition-colors")}
        title="Copy message"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
