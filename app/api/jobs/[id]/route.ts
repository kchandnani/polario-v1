import { type NextRequest, NextResponse } from "next/server"
import { mockApi } from "@/lib/client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const jobId = params.id
    let job = mockApi.jobs.get(jobId)

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Simulate job progress
    if (job.status === "queued") {
      job = { ...job, status: "running", progress: 10 }
      mockApi.jobs.set(jobId, job)
    } else if (job.status === "running" && job.progress < 100) {
      const newProgress = Math.min(job.progress + Math.random() * 20, 100)
      job = { ...job, progress: Math.round(newProgress) }

      if (job.progress >= 100) {
        job = {
          ...job,
          status: "done",
          progress: 100,
          resultId: `render-${Date.now()}`,
        }
      }

      mockApi.jobs.set(jobId, job)
    }

    return NextResponse.json(job)
  } catch (error) {
    return NextResponse.json({ error: "Failed to get job status" }, { status: 500 })
  }
}
