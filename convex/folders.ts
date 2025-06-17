import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createFolder = mutation({
  args: {
    name: v.string(),
    parentFolderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Validate parent folder if provided
    if (args.parentFolderId) {
      const parentFolder = await ctx.db.get(args.parentFolderId);
      if (!parentFolder || parentFolder.userId !== userId) {
        throw new Error("Parent folder not found or unauthorized");
      }
    }

    return await ctx.db.insert("folders", {
      userId,
      name: args.name,
      parentFolderId: args.parentFolderId,
      updatedAt: Date.now(),
    });
  },
});

export const updateFolder = mutation({
  args: {
    folderId: v.id("folders"),
    name: v.optional(v.string()),
    parentFolderId: v.optional(v.union(v.id("folders"), v.null())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== userId) {
      throw new Error("Folder not found or unauthorized");
    }

    // Validate parent folder if provided
    if (args.parentFolderId !== undefined) {
      if (args.parentFolderId) {
        const parentFolder = await ctx.db.get(args.parentFolderId);
        if (!parentFolder || parentFolder.userId !== userId) {
          throw new Error("Parent folder not found or unauthorized");
        }
        // Prevent circular references
        if (args.parentFolderId === args.folderId) {
          throw new Error("Cannot move folder into itself");
        }
        // Check if the target folder is a descendant of the current folder
        let currentParent = await ctx.db.get(args.parentFolderId);
        while (currentParent?.parentFolderId) {
          if (currentParent.parentFolderId === args.folderId) {
            throw new Error("Cannot move folder into its own descendant");
          }
          currentParent = await ctx.db.get(currentParent.parentFolderId);
        }
      }
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      updates.name = args.name;
    }
    if (args.parentFolderId !== undefined) {
      updates.parentFolderId = args.parentFolderId;
    }

    await ctx.db.patch(args.folderId, updates);
  },
});

export const deleteFolder = mutation({
  args: {
    folderId: v.id("folders"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== userId) {
      throw new Error("Folder not found or unauthorized");
    }

    // Move all chats in this folder to no folder
    const chats = await ctx.db
      .query("chats")
      .withIndex("by_folder", (q) => q.eq("folderId", args.folderId))
      .collect();

    for (const chat of chats) {
      await ctx.db.patch(chat._id, { folderId: undefined });
    }

    // Move all subfolders to parent folder
    const subfolders = await ctx.db
      .query("folders")
      .withIndex("by_parent", (q) => q.eq("parentFolderId", args.folderId))
      .collect();

    for (const subfolder of subfolders) {
      await ctx.db.patch(subfolder._id, {
        parentFolderId: folder.parentFolderId,
      });
    }

    await ctx.db.delete(args.folderId);
  },
});

export const moveChatToFolder = mutation({
  args: {
    chatId: v.id("chats"),
    folderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== userId) {
      throw new Error("Chat not found or unauthorized");
    }

    if (args.folderId) {
      const folder = await ctx.db.get(args.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error("Folder not found or unauthorized");
      }
    }

    await ctx.db.patch(args.chatId, {
      folderId: args.folderId,
    });
  },
});

export const getUserFolders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getFolderContents = query({
  args: {
    folderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { folders: [], chats: [] };

    const folders = await ctx.db
      .query("folders")
      .withIndex("by_parent", (q) => q.eq("parentFolderId", args.folderId))
      .collect();

    const chats = await ctx.db
      .query("chats")
      .withIndex("by_folder", (q) => q.eq("folderId", args.folderId))
      .collect();

    return { folders, chats };
  },
});
