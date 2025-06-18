import { LoaderIcon, X } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DialogDescription } from "@radix-ui/react-dialog";

interface Attachment {
  url: string;
  name?: string;
  contentType?: string;
}

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
  onDelete,
}: {
  attachment: Attachment;
  isUploading?: boolean;
  onDelete?: () => void;
}) => {
  const { name, url, contentType } = attachment;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isImage = contentType?.startsWith("image");

  return (
    <>
      <div data-testid="input-attachment-preview" className="size-16">
        <div
          className={cn(
            "size-16 aspect-square bg-white dark:bg-muted rounded-md relative flex items-center justify-center border border-muted overflow-hidden",
            isImage && "cursor-pointer hover:opacity-90 transition-opacity",
          )}
          onClick={() => isImage && setIsDialogOpen(true)}
        >
          {isImage && url ? (
            <img
              key={url}
              src={url}
              alt={name ?? "An image attachment"}
              className="rounded-md size-full object-cover"
            />
          ) : (
            <span className="text-xs text-muted-foreground">No Preview</span>
          )}

          {isUploading && (
            <div
              data-testid="input-attachment-loader"
              className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-muted/70"
            >
              <LoaderIcon className="animate-spin text-zinc-500" />
            </div>
          )}

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="absolute -top-2 -right-2 bg-white dark:bg-muted rounded-full p-1 shadow hover:bg-neutral-100 transition"
            >
              <X className="h-4 w-4 text-neutral-600" />
            </button>
          )}
        </div>
      </div>

      {isImage && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTitle className="sr-only">Image</DialogTitle>
          <DialogDescription className="sr-only">
            Image attached to message
          </DialogDescription>
          <DialogContent
            showCloseButton={false}
            className="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-transparent flex items-center justify-center shadow-none"
          >
            {/* X button at top right of screen */}
            <button
              onClick={() => setIsDialogOpen(false)}
              className="fixed top-6 right-6 z-50 bg-white dark:bg-zinc-800 rounded-full p-2 shadow-md hover:bg-neutral-100 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Close preview"
            >
              <X className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
            </button>
            {/* Card-like dialog */}
            <div className="relative z-10 w-full max-w-xs bg-transparent flex flex-col items-center">
              <img
                src={url}
                alt={name ?? "An image attachment"}
                className="max-w-full max-h-[60vh] object-contain rounded-xl mt-6 mb-2"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
