import { type NextRequest, NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params in Next.js 15
    const { id: jobId } = await params
    
    // Get job from Convex (no clerkId for API route - will skip auth check)
    const job = await convex.query(api.jobs.getById, { jobId: jobId as any })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Transform Convex job to API format
    const apiJob = {
      id: job._id,
      status: job.status,
      progress: job.progress,
      error: job.error,
      resultId: job.resultId,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    }

    return NextResponse.json(apiJob)
  } catch (error) {
    console.error("Failed to get job status:", error)
    return NextResponse.json({ error: "Failed to get job status" }, { status: 500 })
  }
}
