import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { api } from "./_generated/api";

// Create a new job
export const create = mutation({
  args: {
    projectId: v.id("projects"),
    type: v.literal("generate"),
    clerkId: v.optional(v.string()), // For local development
  },
  handler: async (ctx, { projectId, type, clerkId }) => {
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

    // Verify the project belongs to the user
    const project = await ctx.db.get(projectId);
    if (!project || project.userId !== user._id) {
      throw new Error("Project not found or not authorized");
    }

    const jobId = await ctx.db.insert("jobs", {
      type,
      projectId,
      userId: user._id,
      status: "queued",
      progress: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update project status to processing
    await ctx.db.patch(projectId, {
      status: "processing",
      updatedAt: Date.now(),
    });

    // Trigger FastAPI brochure generation
    ctx.scheduler.runAfter(0, api.fastapi.generateBrochure, {
      jobId,
      projectId,
    });

    return jobId;
  },
});

// Get job by ID
export const getById = query({
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

    const job = await ctx.db.get(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    // Check if user owns this job (skip for local development if no user)
    if (user && job.userId !== user._id) {
      throw new Error("Not authorized to view this job");
    }

    return job;
  },
});

// Get jobs for a project
export const getProjectJobs = query({
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

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();

    return jobs;
  },
});

// Get user's jobs
export const getUserJobs = query({
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

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return jobs;
  },
});

// Update job status and progress
export const updateStatus = mutation({
  args: {
    jobId: v.id("jobs"),
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("done"),
      v.literal("error")
    ),
    progress: v.optional(v.number()),
    error: v.optional(v.string()),
    resultId: v.optional(v.id("renders")),
  },
  handler: async (ctx, { jobId, status, progress, error, resultId }) => {
    const job = await ctx.db.get(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    // Update job
    await ctx.db.patch(jobId, {
      status,
      progress: progress ?? job.progress,
      error,
      resultId,
      updatedAt: Date.now(),
    });

    // Update project status based on job status
    if (status === "done" && resultId) {
      await ctx.db.patch(job.projectId, {
        status: "completed",
        updatedAt: Date.now(),
      });
    } else if (status === "error") {
      await ctx.db.patch(job.projectId, {
        status: "error",
        updatedAt: Date.now(),
      });
    }

    return jobId;
  },
});

// Get jobs by status
export const getByStatus = query({
  args: {
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("done"),
      v.literal("error")
    ),
  },
  handler: async (ctx, { status }) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), status))
      .order("desc")
      .collect();

    return jobs;
  },
});

// Cancel job
export const cancel = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const job = await ctx.db.get(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    // Check if user owns this job
    if (job.userId !== user._id) {
      throw new Error("Not authorized to cancel this job");
    }

    // Only allow canceling queued or running jobs
    if (job.status === "done" || job.status === "error") {
      throw new Error("Cannot cancel completed job");
    }

    await ctx.db.patch(jobId, {
      status: "error",
      error: "Cancelled by user",
      updatedAt: Date.now(),
    });

    // Update project status back to draft
    await ctx.db.patch(job.projectId, {
      status: "draft",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
