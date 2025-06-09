import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { encrypt, decrypt } from "../lib/encryption";
import { getAuthUserId } from "@convex-dev/auth/server";

export const saveApiKey = mutation({
  args: {
    apiKey: v.string(),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const now = Date.now();

    // Encrypt the API key before storing
    const encryptedApiKey = await encrypt(args.apiKey);

    // Check if user already has an API key for this model
    const existingKey = await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("model"), args.model))
      .first();

    if (existingKey) {
      // Update existing key
      await ctx.db.patch(existingKey._id, {
        apiKey: encryptedApiKey,
        updatedAt: now,
      });
      return existingKey._id;
    } else {
      // Create new key
      return await ctx.db.insert("apiKeys", {
        userId,
        apiKey: encryptedApiKey,
        model: args.model,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

export const getApiKey = query({
  args: {
    userId: v.optional(v.id("users")),
    // model: v.string(),
  },
  handler: async (ctx, args) => {
    let userId;
    if (!args.userId) {
      userId = await getAuthUserId(ctx);
      if (!userId) {
        throw new Error("Not authenticated");
      }
    } else {
      userId = args.userId;
    }
    const apiKey = await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      // .filter((q) => q.eq(q.field("model"), args.model))
      .first();
    if (!apiKey) {
      return null;
    }

    // Decrypt the API key before returning
    const decryptedApiKey = await decrypt(apiKey.apiKey);
    return {
      ...apiKey,
      apiKey: decryptedApiKey,
    };
  },
});
