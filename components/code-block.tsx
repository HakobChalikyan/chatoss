"use client";

import { useState, ReactNode } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy, Download } from "lucide-react";
import { LANGUAGE_EXTENSIONS } from "@/lib/language-extensions";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CodeBlockProps {
  className?: string;
  children: ReactNode;
  inline?: boolean;
}

// Extend Window interface to include showSaveFilePicker
declare global {
  interface Window {
    showSaveFilePicker?: (options: {
      suggestedName?: string;
      types?: Array<{
        description: string;
        accept: Record<string, string[]>;
      }>;
    }) => Promise<FileSystemFileHandle>;
  }
}

export function CodeBlock({
  className = "",
  children,
  inline,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(String(children));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    const code = String(children);
    const extension = LANGUAGE_EXTENSIONS[language.toLowerCase()] || "txt";
    const defaultName = `code.${extension}`;

    // Check if the File System Access API is supported
    if ("showSaveFilePicker" in window) {
      try {
        const fileHandle = await window.showSaveFilePicker!({
          suggestedName: defaultName,
          types: [
            {
              description: `${language || "Text"} files`,
              accept: {
                "text/plain": [`.${extension}`],
              },
            },
          ],
        });

        const writable = await fileHandle.createWritable();
        await writable.write(code);
        await writable.close();
      } catch (err) {
        // User cancelled or error occurred
        if ((err as Error).name !== "AbortError") {
          console.error("Error saving file:", err);
          // Fallback to traditional download
          fallbackDownload(code, defaultName);
        }
      }
    } else {
      // Fallback for browsers that don't support File System Access API
      fallbackDownload(code, defaultName);
    }
  };

  const fallbackDownload = (code: string, defaultName: string) => {
    const fileName = prompt("Enter file name:", defaultName);
    if (!fileName) return; // User cancelled

    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Block code (multiline)
  if (
    !inline &&
    (language ||
      className.includes("language-") ||
      String(children).includes("\n"))
  ) {
    return (
      <div className="not-prose flex flex-col relative group rounded-lg overflow-hidden">
        <div className="flex items-center justify-between bg-zinc-800 px-4 py-2">
          <span className="text-xs text-zinc-400">
            {language
              ? language.charAt(0).toUpperCase() + language.slice(1)
              : "Text"}
          </span>
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleDownload}
                  className="p-1 rounded-md hover:bg-zinc-700 text-zinc-200"
                >
                  <Download className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Download</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={copyToClipboard}
                  className="p-1 rounded-md hover:bg-zinc-700 text-zinc-200"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "1rem",
            borderRadius: "0 0 0.75rem 0.75rem",
            fontSize: "0.875rem",
            lineHeight: "1.5",
            backgroundColor: "#1e1e1e",
          }}
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    );
  }

  // Inline code
  return (
    <code
      className={`${className} text-sm bg-neutral-300 dark:bg-neutral-600 p-0.5 px-1.5 rounded-sm font-mono`}
      {...props}
    >
      {children}
    </code>
  );
}
