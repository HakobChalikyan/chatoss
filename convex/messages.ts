import { v } from "convex/values";
import {
  mutation,
  internalQuery,
  internalMutation,
  internalAction,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";

export const sendMessage = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
    model: v.string(),
    fileIds: v.optional(v.array(v.id("_storage"))),
    parts: v.optional(
      v.array(
        v.union(
          v.object({
            type: v.literal("text"),
            text: v.string(),
          }),
          v.object({
            type: v.literal("image_url"),
            image_url: v.object({
              url: v.string(),
            }),
          }),
        ),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== userId) {
      throw new Error("Chat not found or unauthorized");
    }

    // Create message parts from content and fileIds
    const parts = args.parts || [
      {
        type: "text",
        text: args.content,
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
      chatId: args.chatId,
      role: "user",
      content: args.content,
      model: args.model,
      fileIds: args.fileIds,
      parts,
    });

    await ctx.db.patch(args.chatId, {
      lastMessageAt: Date.now(),
    });

    await ctx.scheduler.runAfter(
      0,
      internal.messages.generateAIResponseStreaming,
      {
        userId,
        chatId: args.chatId,
        model: args.model,
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
    const messages = await ctx.runQuery(internal.messages.getChatMessages, {
      chatId: args.chatId,
    });

    const openaiMessages = messages.map((msg: any) => {
      if (msg.parts) {
        return {
          role: msg.role as "user" | "assistant",
          content: msg.parts,
        };
      }
      // For backward compatibility with old messages
      return {
        role: msg.role as "user" | "assistant",
        content: [
          {
            type: "text",
            text: msg.content,
          },
        ],
      };
    });

    let fullContent = "";
    let fullReasoning = "";

    // Create a placeholder message for streaming
    const messageId = await ctx.runMutation(
      internal.messages.createStreamingMessage,
      {
        chatId: args.chatId,
        model: args.model,
      },
    );

    try {
      // Get the user's API key
      const apiKeyData = await ctx.runQuery(api.apiKeys.getApiKey, {
        userId: args.userId,
      });

      if (!apiKeyData?.apiKey) {
        throw new Error("No API key found");
      }

      const controller = new AbortController();

      // Store the controller in a way that can be accessed by the cancel mutation
      await ctx.runMutation(internal.messages.storeStreamController, {
        chatId: args.chatId,
        controllerId: messageId,
      });

      // Check for cancellation before making the request
      const isCancelled = await ctx.runQuery(
        internal.messages.checkStreamCancelled,
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
            reasoning: {
              enabled: true,
            },
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
          internal.messages.checkStreamCancelled,
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
              const reasoning = parsed.choices[0]?.delta?.reasoning || "";

              if (content) {
                fullContent += content;
              }
              if (reasoning) {
                fullReasoning += reasoning;
              }

              if (content || reasoning) {
                await ctx.runMutation(internal.messages.updateStreamingMessage, {
                  messageId,
                  content: fullContent,
                  reasoning: fullReasoning,
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
      await ctx.runMutation(internal.messages.updateStreamingMessage, {
        messageId,
        content: fullContent,
        reasoning: fullReasoning,
        isComplete: true,
      });

      // Clean up the controller
      await ctx.runMutation(internal.messages.removeStreamController, {
        chatId: args.chatId,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Stream cancelled");
        await ctx.runMutation(internal.messages.updateStreamingMessage, {
          messageId,
          content: fullContent + "\n\n*Response was cancelled*",
          reasoning: fullReasoning,
          isComplete: true,
        });
      } else if (
        error instanceof Error &&
        error.message === "Stream cancelled"
      ) {
        await ctx.runMutation(internal.messages.updateStreamingMessage, {
          messageId,
          content: fullContent + "\n\n*Response was cancelled*",
          reasoning: fullReasoning,
          isComplete: true,
        });
      } else {
        console.error("AI response error:", error);
        await ctx.runMutation(internal.messages.updateStreamingMessage, {
          messageId,
          content: "I apologize, but I encountered an error generating a response. Please try again." + "\n\n" + error,
          isComplete: true,
        });
      }
    }
  },
});

export const createStreamingMessage = internalMutation({
  args: {
    chatId: v.id("chats"),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      role: "assistant",
      content: "", // Keep for backward compatibility
      reasoning: "",
      model: args.model,
      isStreaming: true,
      parts: [
        {
          type: "text",
          text: "",
        },
      ],
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
    reasoning: v.optional(v.string()),
    isComplete: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      content: args.content, // Keep for backward compatibility
      reasoning: args.reasoning,
      isStreaming: !args.isComplete,
      parts: [
        {
          type: "text",
          text: args.content,
        },
      ],
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
    model: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      chatId: args.chatId,
      role: "assistant",
      content: args.content, // Keep for backward compatibility
      model: args.model,
      parts: [
        {
          type: "text",
          text: args.content,
        },
      ],
    });

    await ctx.db.patch(args.chatId, {
      lastMessageAt: Date.now(),
    });
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.storage.generateUploadUrl();
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