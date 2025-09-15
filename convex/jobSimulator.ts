import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Simulate job progress for testing (remove when FastAPI is integrated)
export const simulateJobProgress = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => {
    const job = await ctx.db.get(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    // Don't update if job is already done or errored
    if (job.status === "done" || job.status === "error") {
      return job;
    }

    let newStatus = job.status;
    let newProgress = job.progress;

    // Simulate progression: queued -> running -> done
    if (job.status === "queued") {
      newStatus = "running";
      newProgress = 10;
    } else if (job.status === "running" && job.progress < 100) {
      // Increase progress by 15-30% each time
      newProgress = Math.min(job.progress + Math.random() * 15 + 15, 100);
      
      if (newProgress >= 100) {
        newStatus = "done";
        newProgress = 100;
        
        // Create a mock render record with all required fields
        const renderId = await ctx.db.insert("renders", {
          jobId: job._id,
          projectId: job.projectId,
          userId: job.userId,
          pdfStorageId: `mock-pdf-${Date.now()}` as any, // Mock storage ID
          pngStorageId: undefined,
          copyData: {
            headline: "Your Professional Brochure",
            subheadline: "Generated with AI-powered content",
            bullets: [
              { title: "Feature 1", desc: "Amazing feature description" },
              { title: "Feature 2", desc: "Another great feature" },
              { title: "Feature 3", desc: "The best feature yet" }
            ],
            cta: {
              label: "Get Started Today",
              sub: "Contact us for more information"
            }
          },
          layoutData: {
            template: "product_a",
            palette: {
              primary: "#2563eb",
              accent: "#3b82f6"
            }
          },
          createdAt: Date.now(),
        });
        
        // Update project status to completed
        await ctx.db.patch(job.projectId, {
          status: "completed",
          updatedAt: Date.now(),
        });
        
        // Update job with result
        await ctx.db.patch(jobId, {
          status: newStatus,
          progress: newProgress,
          resultId: renderId,
          updatedAt: Date.now(),
        });
        
        return await ctx.db.get(jobId);
      }
    }

    // Update job progress
    await ctx.db.patch(jobId, {
      status: newStatus,
      progress: Math.round(newProgress),
      updatedAt: Date.now(),
    });

    return await ctx.db.get(jobId);
  },
});

// Auto-progress all running jobs (for demo purposes)
export const progressAllJobs = mutation({
  args: {},
  handler: async (ctx) => {
    const runningJobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "queued"))
      .collect();
    
    const queuedJobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "running"))
      .collect();
    
    const allJobs = [...runningJobs, ...queuedJobs];
    
    for (const job of allJobs) {
      try {
        await ctx.db.patch(job._id, {});
        // Trigger the progress simulation
        // This would normally be done by the FastAPI backend
      } catch (error) {
        console.error(`Failed to progress job ${job._id}:`, error);
      }
    }
    
    return { progressedJobs: allJobs.length };
  },
});
