import { LoaderIcon, X } from "lucide-react";

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

  return (
    <div data-testid="input-attachment-preview" className="size-16">
      <div className="size-16 aspect-video bg-white dark:bg-muted rounded-md relative flex flex-col items-center justify-center border border-muted">
        {contentType && contentType.startsWith("image") && url ? (
          // NOTE: it is recommended to use next/image for images
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={url}
            src={url}
            alt={name ?? "An image attachment"}
            className="rounded-md size-full object-cover"
          />
        ) : (
          <div className="" />
        )}

        {isUploading && (
          <div
            data-testid="input-attachment-loader"
            className="animate-spin absolute text-zinc-500"
          >
            <LoaderIcon />
          </div>
        )}

        {onDelete && (
          <button
            onClick={onDelete}
            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100 transition-colors"
          >
            <X className="h-3 w-3 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
};
