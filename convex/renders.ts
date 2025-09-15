import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Create a new render record
export const create = mutation({
  args: {
    jobId: v.id("jobs"),
    projectId: v.id("projects"),
    copyData: v.object({
      headline: v.string(),
      subheadline: v.optional(v.string()),
      bullets: v.array(v.object({
        title: v.string(),
        desc: v.string(),
      })),
      cta: v.optional(v.object({
        label: v.string(),
        sub: v.optional(v.string()),
      })),
    }),
    layoutData: v.object({
      template: v.string(),
      palette: v.optional(v.object({
        primary: v.string(),
        accent: v.optional(v.string()),
      })),
    }),
    pdfUrl: v.string(),
    pngUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get user (for authorization)
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Verify the project belongs to the user
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) {
      throw new Error("Project not found or not authorized");
    }

    // Verify the job belongs to the user
    const job = await ctx.db.get(args.jobId);
    if (!job || job.userId !== user._id) {
      throw new Error("Job not found or not authorized");
    }

    // Create render record
    const renderId = await ctx.db.insert("renders", {
      jobId: args.jobId,
      projectId: args.projectId,
      userId: user._id,
      copyData: args.copyData,
      layoutData: args.layoutData,
      pdfUrl: args.pdfUrl,
      pngUrl: args.pngUrl,
      createdAt: Date.now(),
    });

    return renderId;
  },
});

// Get render by ID
export const getById = query({
  args: { 
    renderId: v.id("renders"),
    clerkId: v.optional(v.string()), // For local development
  },
  handler: async (ctx, { renderId, clerkId }) => {
    let user = await getCurrentUser(ctx);
    
    // For local development without JWT auth
    if (!user && clerkId) {
      user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
        .first();
    }

    const render = await ctx.db.get(renderId);
    if (!render) {
      throw new Error("Render not found");
    }

    // Check if user owns this render (skip for local development if no user)
    if (user && render.userId !== user._id) {
      throw new Error("Not authorized to view this render");
    }

    return render;
  },
});

// Get renders for a project
export const getProjectRenders = query({
  args: { 
    projectId: v.id("projects"),
    clerkId: v.optional(v.string()), // For local development
  },
  handler: async (ctx, { projectId, clerkId }) => {
    let user = await getCurrentUser(ctx);
    
    // For local development without JWT auth
    if (!user && clerkId) {
      user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
        .first();
    }

    // Verify the project belongs to the user (skip check for local dev if no user)
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    if (user && project.userId !== user._id) {
      throw new Error("Project not found or not authorized");
    }

    const renders = await ctx.db
      .query("renders")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();

    return renders;
  },
});

// Get render by job ID
export const getByJobId = query({
  args: { 
    jobId: v.id("jobs"),
    clerkId: v.optional(v.string()), // For local development
  },
  handler: async (ctx, { jobId, clerkId }) => {
    let user = await getCurrentUser(ctx);
    
    // For local development without JWT auth
    if (!user && clerkId) {
      user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
        .first();
    }

    const render = await ctx.db
      .query("renders")
      .withIndex("by_jobId", (q) => q.eq("jobId", jobId))
      .first();

    if (!render) {
      return null;
    }

    // Check if user owns this render (skip for local development if no user)
    if (user && render.userId !== user._id) {
      throw new Error("Not authorized to view this render");
    }

    return render;
  },
});

// Get user's recent renders
export const getUserRenders = query({
  args: {
    limit: v.optional(v.number()),
    clerkId: v.optional(v.string()), // For local development
  },
  handler: async (ctx, { limit = 10, clerkId }) => {
    let user = await getCurrentUser(ctx);
    
    // For local development without JWT auth
    if (!user && clerkId) {
      user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
        .first();
    }

    if (!user) {
      return [];
    }

    const renders = await ctx.db
      .query("renders")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);

    return renders;
  },
});

// Delete render
export const deleteRender = mutation({
  args: { renderId: v.id("renders") },
  handler: async (ctx, { renderId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const render = await ctx.db.get(renderId);
    if (!render) {
      throw new Error("Render not found");
    }

    // Check if user owns this render
    if (render.userId !== user._id) {
      throw new Error("Not authorized to delete this render");
    }

    await ctx.db.delete(renderId);
    
    return { success: true };
  },
});
