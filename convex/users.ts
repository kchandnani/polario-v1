import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { UserJSON } from "@clerk/backend";

// Helper function to get current user from Clerk
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .first();

  return user;
}

// Create or update user from Clerk webhook
export const createOrUpdateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, { clerkId, email, name, imageUrl }) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    const userData = {
      email,
      name,
      imageUrl,
      updatedAt: Date.now(),
    };

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, userData);
      return existingUser._id;
    } else {
      // Create new user (simplified for MVP)
      const userId = await ctx.db.insert("users", {
        clerkId,
        ...userData,
        createdAt: Date.now(),
      });

      return userId;
    }
  },
});

// Get current user profile
export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }

    return user;
  },
});

// Delete user (for Clerk webhook)
export const deleteUser = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      return;
    }

    // Delete the user (Convex will handle cascading deletes for related data)
    await ctx.db.delete(user._id);
  },
});
