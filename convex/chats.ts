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
import OpenAI from "openai";

export const createChat = mutation({
  args: {
    title: v.string(),
    model: v.string(),
    initialMessage: v.string(),
    fileIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const chatId = await ctx.db.insert("chats", {
      userId,
      title: args.title,
      model: args.model,
      lastMessageAt: Date.now(),
    });

    await ctx.db.insert("messages", {
      chatId,
      role: "user",
      content: args.initialMessage,
      fileIds: args.fileIds,
    });

    await ctx.scheduler.runAfter(
      0,
      internal.chats.generateAIResponseStreaming,
      {
        userId,
        chatId,
        model: args.model,
      },
    );

    return chatId;
  },
});

export const sendMessage = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
    fileIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== userId) {
      throw new Error("Chat not found or unauthorized");
    }

    await ctx.db.insert("messages", {
      chatId: args.chatId,
      role: "user",
      content: args.content,
      fileIds: args.fileIds,
    });

    await ctx.db.patch(args.chatId, {
      lastMessageAt: Date.now(),
    });

    await ctx.scheduler.runAfter(
      0,
      internal.chats.generateAIResponseStreaming,
      {
        userId,
        chatId: args.chatId,
        model: chat.model,
      },
    );

    return null;
  },
});

export const generateAIResponseStreaming = internalAction({
  args: {
    userId: v.id("users"),
    chatId: v.id("chats"),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.runQuery(internal.chats.getChatMessages, {
      chatId: args.chatId,
    });

    const openaiMessages = messages.map((msg: any) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    try {
      // Get the user's API key
      const apiKeyData = await ctx.runQuery(api.apiKeys.getApiKey, {
        userId: args.userId,
        // model: args.model,
      });

      if (!apiKeyData?.apiKey) {
        throw new Error("No API key found for this model");
      }

      // Initialize OpenAI client with user's API key
      const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: apiKeyData.apiKey,
      });

      // Create a placeholder message for streaming
      const messageId = await ctx.runMutation(
        internal.chats.createStreamingMessage,
        {
          chatId: args.chatId,
        },
      );

      const response = await openai.chat.completions.create({
        // model: args.model === "gpt-4o-mini" ? "gpt-4o-mini" : "gpt-4.1-nano",
        // model: "qwen/qwq-32b:free",
        // model: "google/gemini-2.0-flash-exp:free",
        model: "google/gemma-3-27b-it:free",
        messages: openaiMessages,
        stream: true,
      });

      let fullContent = "";

      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullContent += content;

          // Update the streaming message with accumulated content
          await ctx.runMutation(internal.chats.updateStreamingMessage, {
            messageId,
            content: fullContent,
            isComplete: false,
          });
        }
      }

      // Mark the message as complete
      await ctx.runMutation(internal.chats.updateStreamingMessage, {
        messageId,
        content: fullContent,
        isComplete: true,
      });
    } catch (error) {
      console.error("AI response error:", error);
      await ctx.runMutation(internal.chats.addAIMessage, {
        chatId: args.chatId,
        content:
          "I apologize, but I encountered an error generating a response. Please try again.",
      });
    }
  },
});

export const createStreamingMessage = internalMutation({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      role: "assistant",
      content: "",
      isStreaming: true,
    });

    await ctx.db.patch(args.chatId, {
      lastMessageAt: Date.now(),
    });

    return messageId;
  },
});

export const updateStreamingMessage = internalMutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
    isComplete: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      content: args.content,
      isStreaming: !args.isComplete,
    });
  },
});

export const getChatMessages = internalQuery({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();
  },
});

export const addAIMessage = internalMutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      chatId: args.chatId,
      role: "assistant",
      content: args.content,
    });

    await ctx.db.patch(args.chatId, {
      lastMessageAt: Date.now(),
    });
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

    return {
      ...chat,
      messages: messagesWithFiles,
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

    // Delete all messages in the chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete chat files
    const chatFiles = await ctx.db
      .query("chatFiles")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    for (const file of chatFiles) {
      await ctx.storage.delete(file.storageId);
      await ctx.db.delete(file._id);
    }

    // Delete the chat
    await ctx.db.delete(args.chatId);
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.storage.generateUploadUrl();
  },
});

export const saveFileToChat = mutation({
  args: {
    chatId: v.id("chats"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== userId) {
      throw new Error("Chat not found or unauthorized");
    }

    await ctx.db.insert("chatFiles", {
      chatId: args.chatId,
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
    });

    return args.storageId;
  },
});
