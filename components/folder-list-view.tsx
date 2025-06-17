"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { FolderPlus } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useFolderExpansion } from "@/hooks/use-folder-expansion";
import { useFolderSearch } from "@/hooks/use-folder-search";
import { ConfirmationDialog } from "./confirmation-dialog";
import { EmptyState } from "./empty-state";
import { FolderItem } from "./folder-item";
import { SidebarChat } from "./sidebar-chat";

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

interface FolderListViewProps {
  chats: Chat[] | undefined;
  folders: Folder[] | undefined;
  selectedChatId: Id<"chats"> | null;
  onSelectChat: (chatId: Id<"chats">) => void;
  deletingChatId: Id<"chats"> | null;
  handleDeleteChat: (chatId: Id<"chats">, e: React.MouseEvent) => Promise<void>;
  handleTogglePin: (chatId: Id<"chats">, e: React.MouseEvent) => Promise<void>;
  handleRenameChat: (chatId: Id<"chats">, newTitle: string) => Promise<void>;
}

export function FolderListView({
  chats,
  folders,
  selectedChatId,
  onSelectChat,
  deletingChatId,
  handleDeleteChat,
  handleTogglePin,
  handleRenameChat,
}: FolderListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [parentFolderId, setParentFolderId] = useState<
    Id<"folders"> | undefined
  >();
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    folderId: Id<"folders"> | null;
    folderName: string;
  }>({ isOpen: false, folderId: null, folderName: "" });

  const { expandedFolders, toggleFolder, expandFolder } = useFolderExpansion();
  const { filteredChats, filteredFolders } = useFolderSearch(
    chats,
    folders,
    searchQuery,
  );

  const createFolder = useMutation(api.folders.createFolder);
  const updateFolder = useMutation(api.folders.updateFolder);
  const deleteFolder = useMutation(api.folders.deleteFolder);

  const handleCreateFolder = useCallback(
    async (parentId?: Id<"folders">) => {
      if (!newFolderName.trim()) return;

      try {
        await createFolder({
          name: newFolderName.trim(),
          parentFolderId: parentId,
        });
        setNewFolderName("");
        setCreatingFolder(false);
        setParentFolderId(undefined);

        if (parentId) {
          expandFolder(parentId);
        }
      } catch (error) {
        console.error("Failed to create folder:", error);
      }
    },
    [newFolderName, createFolder, expandFolder],
  );

  const handleRenameFolder = useCallback(
    async (folderId: Id<"folders">, name: string) => {
      try {
        await updateFolder({ folderId, name });
      } catch (error) {
        console.error("Failed to rename folder:", error);
      }
    },
    [updateFolder],
  );

  const handleDeleteFolder = useCallback(
    async (folderId: Id<"folders">) => {
      try {
        await deleteFolder({ folderId });
        setDeleteConfirmation({
          isOpen: false,
          folderId: null,
          folderName: "",
        });
      } catch (error) {
        console.error("Failed to delete folder:", error);
      }
    },
    [deleteFolder],
  );

  const confirmDeleteFolder = useCallback(
    (folderId: Id<"folders">, folderName: string) => {
      setDeleteConfirmation({ isOpen: true, folderId, folderName });
    },
    [],
  );

  const getChatsByFolder = useCallback(
    (folderId: Id<"folders"> | undefined) => {
      if (!filteredChats) return [];
      return filteredChats
        .filter((chat) => chat.folderId === folderId)
        .sort((a, b) => {
          // Pinned chats first
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          // Then by last message time
          return b.lastMessageAt - a.lastMessageAt;
        });
    },
    [filteredChats],
  );

  const getFolderChatCount = useCallback(
    (folderId: Id<"folders">) => {
      return getChatsByFolder(folderId).length;
    },
    [getChatsByFolder],
  );

  const renderChats = useCallback(
    (folderId: Id<"folders"> | undefined, level = 0) => {
      const folderChats = getChatsByFolder(folderId);

      if (folderChats.length === 0) {
        return null;
      }

      return (
        <div className="space-y-1">
          {folderChats.map((chat) => (
            <SidebarChat
              key={chat._id}
              chat={chat}
              selectedChatId={selectedChatId}
              onSelectChat={onSelectChat}
              deletingChatId={deletingChatId}
              handleDeleteChat={handleDeleteChat}
              handleTogglePin={handleTogglePin}
              handleRenameChat={handleRenameChat}
              level={level}
            />
          ))}
        </div>
      );
    },
    [
      selectedChatId,
      onSelectChat,
      deletingChatId,
      handleDeleteChat,
      handleTogglePin,
      handleRenameChat,
      getChatsByFolder,
    ],
  );

  const renderFolder = useCallback(
    (folder: Folder, level = 0) => {
      const childFolders =
        filteredFolders?.filter((f) => f.parentFolderId === folder._id) || [];
      const isExpanded = expandedFolders.has(folder._id);
      const chatCount = getFolderChatCount(folder._id);

      return (
        <FolderItem
          key={folder._id}
          folder={folder}
          level={level}
          isExpanded={isExpanded}
          onToggle={() => toggleFolder(folder._id)}
          onRename={(name) => handleRenameFolder(folder._id, name)}
          onDelete={() => confirmDeleteFolder(folder._id, folder.name)}
          onCreateSubfolder={() => {
            setParentFolderId(folder._id);
            setCreatingFolder(true);
          }}
          chatCount={chatCount}
        >
          {isExpanded && (
            <>
              {renderChats(folder._id, level + 1)}
              {childFolders.map((childFolder) =>
                renderFolder(childFolder, level + 1),
              )}
            </>
          )}
        </FolderItem>
      );
    },
    [
      filteredFolders,
      expandedFolders,
      getFolderChatCount,
      toggleFolder,
      handleRenameFolder,
      confirmDeleteFolder,
      renderChats,
    ],
  );

  if (!chats || !folders) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  const rootFolders =
    filteredFolders?.filter((folder) => !folder.parentFolderId) || [];
  const uncategorizedChats = getChatsByFolder(undefined);
  const hasContent = rootFolders.length > 0 || uncategorizedChats.length > 0;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {/* Create Folder Button */}
        <div className="px-2">
          {creatingFolder ? (
            <div className="flex items-center gap-2">
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateFolder(parentFolderId);
                  } else if (e.key === "Escape") {
                    setCreatingFolder(false);
                    setNewFolderName("");
                    setParentFolderId(undefined);
                  }
                }}
                placeholder="Folder name"
                className="h-8 text-sm"
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCreatingFolder(false);
                  setNewFolderName("");
                  setParentFolderId(undefined);
                }}
                className="h-8 px-2"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 h-8 text-muted-foreground hover:text-foreground"
              onClick={() => setCreatingFolder(true)}
            >
              <FolderPlus className="h-4 w-4" />
              New folder
            </Button>
          )}
        </div>

        {/* Content */}
        {searchQuery && !hasContent ? (
          <EmptyState
            type="no-results"
            onAction={() => setSearchQuery("")}
            actionLabel="Clear search"
          />
        ) : !hasContent ? (
          <EmptyState
            type="no-chats"
            onAction={() => setCreatingFolder(true)}
            actionLabel="Create folder"
          />
        ) : (
          <div className="space-y-2">
            {rootFolders.map((folder) => renderFolder(folder))}

            {uncategorizedChats.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2 py-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {searchQuery ? "Matching Chats" : "Uncategorized"}
                  </h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {uncategorizedChats.length}
                  </span>
                </div>
                {renderChats(undefined)}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() =>
          setDeleteConfirmation({
            isOpen: false,
            folderId: null,
            folderName: "",
          })
        }
        onConfirm={() =>
          deleteConfirmation.folderId &&
          handleDeleteFolder(deleteConfirmation.folderId)
        }
        title="Delete folder"
        description={`Are you sure you want to delete "${deleteConfirmation.folderName}"? This action cannot be undone. Chats in this folder will be moved to uncategorized.`}
        confirmText="Delete"
        isDestructive
      />
    </div>
  );
}
