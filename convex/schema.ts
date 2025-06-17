import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),
  apiKeys: defineTable({
    userId: v.string(),
    apiKey: v.string(),
    model: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  chats: defineTable({
    userId: v.id("users"),
    title: v.string(),
    lastMessageAt: v.number(),
    parentChatId: v.optional(v.id("chats")),
    branchedFromMessageId: v.optional(v.id("messages")),
    pinned: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_last_message", ["userId", "lastMessageAt"])
    .index("by_parent_chat_and_message", [
      "parentChatId",
      "branchedFromMessageId",
    ])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["userId"],
    }),

  messages: defineTable({
    chatId: v.id("chats"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    reasoning: v.optional(v.string()),
    model: v.string(),
    fileIds: v.optional(v.array(v.id("_storage"))),
    isStreaming: v.optional(v.boolean()),
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
  }).index("by_chat", ["chatId"]),

  messages_v2: defineTable({
    chatId: v.id("chats"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    parts: v.any(),
    fileIds: v.optional(v.array(v.id("_storage"))),
    isStreaming: v.optional(v.boolean()),
  }).index("by_chat", ["chatId"]),

  documents: defineTable({
    title: v.string(),
    content: v.optional(v.string()),
    kind: v.union(
      v.literal("text"),
      v.literal("code"),
      v.literal("image"),
      v.literal("sheet"),
    ),
    userId: v.id("users"),
  }),

  streamControllers: defineTable({
    chatId: v.id("chats"),
    messageId: v.id("messages"),
    createdAt: v.number(),
  })
    .index("by_chat", ["chatId"])
    .index("by_creation", ["createdAt"]),
});
