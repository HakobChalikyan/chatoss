import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { FolderPlus, Folder, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function FolderManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<{
    id: Id<"folders">;
    name: string;
  } | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [parentFolderId, setParentFolderId] = useState<
    Id<"folders"> | undefined
  >(undefined);

  const folders = useQuery(api.folders.getUserFolders);
  const createFolder = useMutation(api.folders.createFolder);
  const updateFolder = useMutation(api.folders.updateFolder);
  const deleteFolder = useMutation(api.folders.deleteFolder);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await createFolder({ name: newFolderName, parentFolderId });
      setNewFolderName("");
      setParentFolderId(undefined);
      setIsCreateOpen(false);
      toast.success("Folder created successfully");
    } catch (error) {
      toast.error("Failed to create folder");
    }
  };

  const handleUpdateFolder = async () => {
    if (!editingFolder || !editingFolder.name.trim()) return;
    try {
      await updateFolder({
        folderId: editingFolder.id,
        name: editingFolder.name,
      });
      setEditingFolder(null);
      setIsEditOpen(false);
      toast.success("Folder updated successfully");
    } catch (error) {
      toast.error("Failed to update folder");
    }
  };

  const handleDeleteFolder = async (folderId: Id<"folders">) => {
    try {
      await deleteFolder({ folderId });
      toast.success("Folder deleted successfully");
    } catch (error) {
      toast.error("Failed to delete folder");
    }
  };

  const renderFolderTree = (
    parentId: Id<"folders"> | undefined = undefined,
    level = 0,
  ) => {
    const childFolders =
      folders?.filter((f) => f.parentFolderId === parentId) || [];
    return childFolders.map((folder) => (
      <div key={folder._id} style={{ marginLeft: `${level * 16}px` }}>
        <div className="flex items-center gap-2 py-1">
          <Folder className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{folder.name}</span>
          <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                setEditingFolder({ id: folder._id, name: folder.name });
                setIsEditOpen(true);
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-red-500"
              onClick={() => handleDeleteFolder(folder._id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {renderFolderTree(folder._id, level + 1)}
      </div>
    ));
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Folders</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <select
                className="w-full p-2 border rounded-md"
                value={parentFolderId}
                onChange={(e) =>
                  setParentFolderId(e.target.value as Id<"folders"> | undefined)
                }
              >
                <option value="">No parent folder</option>
                {folders?.map((folder) => (
                  <option key={folder._id} value={folder._id}>
                    {folder.name}
                  </option>
                ))}
              </select>
              <Button onClick={handleCreateFolder}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-1">{renderFolderTree()}</div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Folder name"
              value={editingFolder?.name || ""}
              onChange={(e) =>
                setEditingFolder((prev) =>
                  prev ? { ...prev, name: e.target.value } : null,
                )
              }
            />
            <Button onClick={handleUpdateFolder}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
