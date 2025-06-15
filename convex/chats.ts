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
      model: args.model,
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
        fileIds: args.fileIds,
      });

      // Trigger AI response for the new message in the branched chat
      await ctx.scheduler.runAfter(
        0,
        internal.chats.generateAIResponseStreaming,
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

    let fullContent = "";

    // Create a placeholder message for streaming
    const messageId = await ctx.runMutation(
      internal.chats.createStreamingMessage,
      {
        chatId: args.chatId,
      },
    );

    try {
      // Get the user's API key
      const apiKeyData = await ctx.runQuery(api.apiKeys.getApiKey, {
        userId: args.userId,
      });

      if (!apiKeyData?.apiKey) {
        throw new Error("No API key found for this model");
      }

      const controller = new AbortController();

      // Store the controller in a way that can be accessed by the cancel mutation
      await ctx.runMutation(internal.chats.storeStreamController, {
        chatId: args.chatId,
        controllerId: messageId,
      });

      // Check for cancellation before making the request
      const isCancelled = await ctx.runQuery(
        internal.chats.checkStreamCancelled,
        {
          chatId: args.chatId,
        },
      );

      if (isCancelled) {
        throw new Error("Stream cancelled");
      }

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKeyData.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: args.model,
            messages: openaiMessages,
            stream: true,
          }),
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No reader available");
      }

      while (true) {
        // Check for cancellation before reading the next chunk
        const isCancelled = await ctx.runQuery(
          internal.chats.checkStreamCancelled,
          {
            chatId: args.chatId,
          },
        );

        if (isCancelled) {
          throw new Error("Stream cancelled");
        }

        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || "";
              if (content) {
                fullContent += content;
                await ctx.runMutation(internal.chats.updateStreamingMessage, {
                  messageId,
                  content: fullContent,
                  isComplete: false,
                });
              }
            } catch (e) {
              console.error("Error parsing chunk:", e);
            }
          }
        }
      }

      // Mark the message as complete
      await ctx.runMutation(internal.chats.updateStreamingMessage, {
        messageId,
        content: fullContent,
        isComplete: true,
      });

      // Clean up the controller
      await ctx.runMutation(internal.chats.removeStreamController, {
        chatId: args.chatId,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Stream cancelled");
        await ctx.runMutation(internal.chats.updateStreamingMessage, {
          messageId,
          content: fullContent + "\n\n*Response was cancelled*",
          isComplete: true,
        });
      } else if (
        error instanceof Error &&
        error.message === "Stream cancelled"
      ) {
        await ctx.runMutation(internal.chats.updateStreamingMessage, {
          messageId,
          content: fullContent + "\n\n*Response was cancelled*",
          isComplete: true,
        });
      } else {
        console.error("AI response error:", error);
        await ctx.runMutation(internal.chats.addAIMessage, {
          chatId: args.chatId,
          content:
            "I apologize, but I encountered an error generating a response. Please try again.",
        });
      }
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

export const storeStreamController = internalMutation({
  args: {
    chatId: v.id("chats"),
    controllerId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("streamControllers", {
      chatId: args.chatId,
      messageId: args.controllerId,
      createdAt: Date.now(),
    });
  },
});

export const removeStreamController = internalMutation({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const controllers = await ctx.db
      .query("streamControllers")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    for (const controller of controllers) {
      await ctx.db.delete(controller._id);
    }
  },
});

export const cancelStream = mutation({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== userId) {
      throw new Error("Chat not found or unauthorized");
    }

    const controllers = await ctx.db
      .query("streamControllers")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    if (controllers.length > 0) {
      // The actual cancellation will be handled by the AbortController in the streaming action
      await ctx.db.delete(controllers[0]._id);
    }
  },
});

export const checkStreamCancelled = internalQuery({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const controllers = await ctx.db
      .query("streamControllers")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    return controllers.length === 0;
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    const chat = await ctx.db.get(message.chatId);
    if (!chat || chat.userId !== userId) {
      throw new Error("Chat not found or unauthorized");
    }

    // If this is a user message, find and delete the assistant's reply
    if (message.role === "user") {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_chat", (q) => q.eq("chatId", message.chatId))
        .collect();

      // Find the index of the current message
      const messageIndex = messages.findIndex((m) => m._id === args.messageId);

      // If there's a next message and it's from the assistant, delete it
      if (messageIndex !== -1 && messageIndex + 1 < messages.length) {
        const nextMessage = messages[messageIndex + 1];
        if (nextMessage.role === "assistant") {
          await ctx.db.delete(nextMessage._id);
        }
      }
    }

    await ctx.db.delete(args.messageId);
  },
});
