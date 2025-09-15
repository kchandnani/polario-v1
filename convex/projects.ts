import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Create a new project
export const create = mutation({
  args: {
    title: v.string(),
    businessInfo: v.object({
      name: v.string(),
      type: v.string(),
      audience: v.string(),
    }),
    features: v.array(
      v.object({
        title: v.string(),
        desc: v.string(),
      })
    ),
    clerkId: v.optional(v.string()), // For local development
  },
  handler: async (ctx, { title, businessInfo, features, clerkId }) => {
    let user = await getCurrentUser(ctx);
    
    // For local development without JWT auth
    if (!user && clerkId) {
      user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
        .first();
    }
    
    if (!user) {
      throw new Error("Not authenticated - user not found");
    }

    const projectId = await ctx.db.insert("projects", {
      title,
      userId: user._id,
      businessInfo,
      features,
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return projectId;
  },
});

// Get user's projects
export const getUserProjects = query({
  args: {
    clerkId: v.optional(v.string()), // For local development
  },
  handler: async (ctx, { clerkId }) => {
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

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return projects;
  },
});

// Get a specific project by ID
export const getById = query({
  args: { 
    projectId: v.id("projects"),
    includeAssets: v.optional(v.boolean()),
    clerkId: v.optional(v.string()), // For local development
  },
  handler: async (ctx, { projectId, includeAssets = false, clerkId }) => {
    let user = await getCurrentUser(ctx);
    
    // For local development without JWT auth
    if (!user && clerkId) {
      user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
        .first();
    }

    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if user owns this project (skip for local development if no user)
    if (user && project.userId !== user._id) {
      throw new Error("Not authorized to view this project");
    }

    if (includeAssets) {
      // Get project assets
      const assets = await ctx.db
        .query("assets")
        .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
        .collect();
      
      return {
        ...project,
        assets,
      };
    }

    return project;
  },
});

// Update project
export const update = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.optional(v.string()),
    businessInfo: v.optional(
      v.object({
        name: v.string(),
        type: v.string(),
        audience: v.string(),
      })
    ),
    features: v.optional(
      v.array(
        v.object({
          title: v.string(),
          desc: v.string(),
        })
      )
    ),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("processing"),
        v.literal("completed"),
        v.literal("error")
      )
    ),
  },
  handler: async (ctx, { projectId, ...updates }) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if user owns this project
    if (project.userId !== user._id) {
      throw new Error("Not authorized to update this project");
    }

    await ctx.db.patch(projectId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return projectId;
  },
});

// Delete project (soft delete by updating status)
export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if user owns this project
    if (project.userId !== user._id) {
      throw new Error("Not authorized to delete this project");
    }

    // For now, we'll actually delete it, but in production you might want soft delete
    await ctx.db.delete(projectId);

    return { success: true };
  },
});

// Get projects by status
export const getByStatus = query({
  args: {
    status: v.union(
      v.literal("draft"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("error")
    ),
  },
  handler: async (ctx, { status }) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), status))
      .order("desc")
      .collect();

    return projects;
  },
});
