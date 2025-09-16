import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - stores Clerk user information
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  // Projects table - brochure projects (simplified for MVP)
  projects: defineTable({
    title: v.string(),
    userId: v.id("users"), // Direct user ownership for MVP
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
    status: v.union(
      v.literal("draft"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("error")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  // Assets table - logos, hero images, etc.
  assets: defineTable({
    projectId: v.id("projects"),
    storageId: v.id("_storage"),
    mimeType: v.string(),
    size: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    isLogo: v.boolean(), // true for logo, false for hero image
    uploadedAt: v.number(),
  })
    .index("by_projectId", ["projectId"])
    .index("by_projectId_isLogo", ["projectId", "isLogo"]),

  // Jobs table - tracks brochure generation progress
  jobs: defineTable({
    type: v.literal("generate"), // could expand to other job types later
    projectId: v.id("projects"),
    userId: v.id("users"), // Simplified for MVP
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("done"),
      v.literal("error")
    ),
    progress: v.number(), // 0-100
    error: v.optional(v.string()),
    resultId: v.optional(v.id("renders")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_projectId", ["projectId"])
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  // Renders table - final PDF/PNG outputs
  renders: defineTable({
    jobId: v.id("jobs"),
    projectId: v.id("projects"),
    userId: v.id("users"), // Simplified for MVP
    pdfUrl: v.string(), // External URL from HTMLCSStoImage
    pngUrl: v.optional(v.string()), // External URL from HTMLCSStoImage
    copyData: v.object({
      headline: v.string(),
      subheadline: v.optional(v.string()),
      bullets: v.array(
        v.object({
          title: v.string(),
          desc: v.string(),
        })
      ),
      cta: v.optional(
        v.object({
          label: v.string(),
          sub: v.optional(v.string()),
        })
      ),
      palette: v.optional(v.string()),
    }),
    layoutData: v.object({
      template: v.string(),
      palette: v.optional(
        v.object({
          primary: v.string(),
          accent: v.optional(v.string()),
        })
      ),
    }),
    createdAt: v.number(),
  })
    .index("by_jobId", ["jobId"])
    .index("by_projectId", ["projectId"])
    .index("by_userId", ["userId"]),
});
