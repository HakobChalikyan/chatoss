import { v } from "convex/values";
import {
  query,
  mutation,
  internalQuery,
  internalMutation,
  internalAction,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";

export const createChat = mutation({
  args: {
    title: v.string(),
    initialMessage: v.string(),
    model: v.string(),
    fileIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const chatId = await ctx.db.insert("chats", {
      userId,
      title: args.title,
      lastMessageAt: Date.now(),
    });

    // Create message parts from content and fileIds
    const parts: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    > = [
      {
        type: "text",
        text: args.initialMessage,
      },
    ];

    // Add image parts from fileIds
    if (args.fileIds && args.fileIds.length > 0) {
      for (const fileId of args.fileIds) {
        const url = await ctx.storage.getUrl(fileId);
        if (url) {
          parts.push({
            type: "image_url",
            image_url: {
              url,
            },
          });
        }
      }
    }

    await ctx.db.insert("messages", {
      chatId,
      role: "user",
      content: args.initialMessage,
      model: args.model,
      fileIds: args.fileIds,
      parts,
    });

    await ctx.scheduler.runAfter(
      0,
      internal.messages.generateAIResponseStreaming,
      {
        userId,
        chatId,
        model: args.model,
      },
    );

    return chatId;
  },
});

export const createBranchedChat = mutation({
  args: {
    parentChatId: v.id("chats"),
    branchedFromMessageId: v.id("messages"),
    editedContent: v.string(),
    fileIds: v.optional(v.array(v.id("_storage"))),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Fetch the parent chat to inherit its title or create a new one
    const parentChat = await ctx.db.get(args.parentChatId);
    if (!parentChat || parentChat.userId !== userId) {
      throw new Error("Parent chat not found or unauthorized");
    }

    // Get all messages from the parent chat to copy as context
    const parentMessages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.parentChatId))
      .collect();

    // Get the branched message to check its role
    const branchedMessage = await ctx.db.get(args.branchedFromMessageId);
    if (!branchedMessage) {
      throw new Error("Branched message not found");
    }

    // Create a new chat for the branch
    const newChatId = await ctx.db.insert("chats", {
      userId,
      title: `Branched: ${parentChat.title}`,
      lastMessageAt: Date.now(),
      parentChatId: args.parentChatId,
      branchedFromMessageId: args.branchedFromMessageId,
    });

    for (const message of parentMessages) {
      if (
        message._id === args.branchedFromMessageId &&
        message.role === "user"
      ) {
        break;
      }

      await ctx.db.insert("messages", {
        chatId: newChatId,
        role: message.role,
        content: message.content,
        model: message.model,
        fileIds: message.fileIds,
        isStreaming: message.isStreaming || false,
      });

      if (
        message._id === args.branchedFromMessageId &&
        message.role === "assistant"
      ) {
        break;
      }
    }

    // Only add a new message if there's edited content
    if (args.editedContent.trim()) {
      await ctx.db.insert("messages", {
        chatId: newChatId,
        role: "user",
        content: args.editedContent,
        model: args.model,
        fileIds: args.fileIds,
      });

      // Trigger AI response for the new message in the branched chat
      await ctx.scheduler.runAfter(
        0,
        internal.messages.generateAIResponseStreaming,
        {
          userId,
          chatId: newChatId,
          model: args.model,
        },
      );
    }

    return newChatId;
  },
});

export const getUserChats = query({
  args: {
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (args.searchQuery && args.searchQuery.trim()) {
      return await ctx.db
        .query("chats")
        .withSearchIndex("search_title", (q) =>
          q.search("title", args.searchQuery!).eq("userId", userId),
        )
        .collect();
    }

    return await ctx.db
      .query("chats")
      .withIndex("by_user_and_last_message", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getChat = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== userId) return null;

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    const messagesWithFiles = await Promise.all(
      messages.map(async (message) => {
        if (message.fileIds && message.fileIds.length > 0) {
          const files = await Promise.all(
            message.fileIds.map(async (fileId) => {
              const fileMetadata = await ctx.db.system.get(fileId);
              const url = await ctx.storage.getUrl(fileId);
              return {
                id: fileId,
                url,
                metadata: fileMetadata,
              };
            }),
          );
          return { ...message, files };
        }
        return { ...message, files: [] };
      }),
    );

    // Fetch branched chats if this is a parent chat
    const branchedChats = await ctx.db
      .query("chats")
      .withIndex("by_parent_chat_and_message", (q) =>
        q.eq("parentChatId", args.chatId),
      )
      .collect();

    return {
      ...chat,
      messages: messagesWithFiles,
      branchedChats: branchedChats, // Include branched chats in the result
    };
  },
});

export const deleteChat = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== userId) {
      throw new Error("Chat not found or unauthorized");
    }

    // Find all branches of this chat
    const branches = await ctx.db
      .query("chats")
      .withIndex("by_parent_chat_and_message", (q) =>
        q.eq("parentChatId", args.chatId),
      )
      .collect();

    // Update branches to remove parent reference
    for (const branch of branches) {
      await ctx.db.patch(branch._id, {
        parentChatId: undefined,
        branchedFromMessageId: undefined,
      });
    }

    // Delete all messages in the chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete the chat
    await ctx.db.delete(args.chatId);
  },
});
