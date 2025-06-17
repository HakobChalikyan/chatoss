import { useMemo } from "react";
import type { Id } from "@/convex/_generated/dataModel";

interface Chat {
  _id: Id<"chats">;
  title: string;
  lastMessageAt: number;
  parentChatId?: Id<"chats">;
  pinned?: boolean;
  folderId?: Id<"folders">;
}

interface Folder {
  _id: Id<"folders">;
  name: string;
  parentFolderId?: Id<"folders">;
}

export function useFolderSearch(
  chats: Chat[] | undefined,
  folders: Folder[] | undefined,
  searchQuery: string,
) {
  return useMemo(() => {
    if (!searchQuery.trim()) {
      return { filteredChats: chats, filteredFolders: folders };
    }

    const query = searchQuery.toLowerCase();

    const filteredChats = chats?.filter((chat) =>
      chat.title.toLowerCase().includes(query),
    );

    const filteredFolders = folders?.filter((folder) =>
      folder.name.toLowerCase().includes(query),
    );

    return { filteredChats, filteredFolders };
  }, [chats, folders, searchQuery]);
}
