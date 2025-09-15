import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Generate upload URL for file upload
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

// Commit asset after successful upload
export const createAsset = mutation({
  args: {
    projectId: v.id("projects"),
    storageId: v.id("_storage"),
    mimeType: v.string(),
    size: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    isLogo: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Verify the project belongs to the user
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) {
      throw new Error("Project not found or not authorized");
    }

    // Validate file size (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (args.size > MAX_FILE_SIZE) {
      throw new Error("File too large (max 10MB)");
    }

    // Validate MIME type
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (!ALLOWED_TYPES.includes(args.mimeType)) {
      throw new Error("Invalid file type. Only JPEG, PNG, and SVG are allowed.");
    }

    const assetId = await ctx.db.insert("assets", {
      ...args,
      uploadedAt: Date.now(),
    });

    return assetId;
  },
});

// Get assets for a project
export const getProjectAssets = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Verify the project belongs to the user
    const project = await ctx.db.get(projectId);
    if (!project || project.userId !== user._id) {
      throw new Error("Project not found or not authorized");
    }

    const assets = await ctx.db
      .query("assets")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .collect();

    // Get URLs for each asset
    const assetsWithUrls = await Promise.all(
      assets.map(async (asset) => ({
        ...asset,
        url: await ctx.storage.getUrl(asset.storageId),
      }))
    );

    return assetsWithUrls;
  },
});

// Get specific asset by type (logo or hero)
export const getAssetByType = query({
  args: {
    projectId: v.id("projects"),
    isLogo: v.boolean(),
  },
  handler: async (ctx, { projectId, isLogo }) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Verify the project belongs to the user
    const project = await ctx.db.get(projectId);
    if (!project || project.userId !== user._id) {
      throw new Error("Project not found or not authorized");
    }

    const asset = await ctx.db
      .query("assets")
      .withIndex("by_projectId_isLogo", (q) =>
        q.eq("projectId", projectId).eq("isLogo", isLogo)
      )
      .first();

    if (!asset) {
      return null;
    }

    return {
      ...asset,
      url: await ctx.storage.getUrl(asset.storageId),
    };
  },
});

// Delete asset
export const deleteAsset = mutation({
  args: { assetId: v.id("assets") },
  handler: async (ctx, { assetId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const asset = await ctx.db.get(assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }

    // Verify the project belongs to the user
    const project = await ctx.db.get(asset.projectId);
    if (!project || project.userId !== user._id) {
      throw new Error("Not authorized to delete this asset");
    }

    // Delete the file from storage
    await ctx.storage.delete(asset.storageId);

    // Delete the asset record
    await ctx.db.delete(assetId);

    return { success: true };
  },
});

// Get asset URL by storage ID (helper function)
export const getAssetUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});
