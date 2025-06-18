import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { FolderMinus, Folder } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FolderContextMenuProps {
  chatId: Id<"chats">;
  children: React.ReactNode;
  currentFolderId?: Id<"folders">;
}

export function FolderContextMenu({
  chatId,
  children,
  currentFolderId,
}: FolderContextMenuProps) {
  const folders = useQuery(api.folders.getUserFolders);
  const moveChatToFolder = useMutation(api.folders.moveChatToFolder);

  const handleMoveToFolder = async (folderId: Id<"folders"> | undefined) => {
    try {
      await moveChatToFolder({ chatId, folderId });
      toast.success("Chat moved successfully");
    } catch (error) {
      console.error("Failed to move chat:", error);
      toast.error("Failed to move chat");
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {currentFolderId && (
          <>
            <ContextMenuItem
              onClick={() => handleMoveToFolder(undefined)}
              className="flex items-center gap-2"
            >
              <FolderMinus className="h-4 w-4" />
              Remove from folder
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        {folders?.map((folder) => (
          <ContextMenuItem
            key={folder._id}
            onClick={() => handleMoveToFolder(folder._id)}
            className={cn(
              "flex items-center gap-2",
              currentFolderId === folder._id && "bg-accent",
            )}
          >
            <Folder className="h-4 w-4" />
            {folder.name}
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
}
