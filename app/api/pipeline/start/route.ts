import { type NextRequest, NextResponse } from "next/server"
import { mockApi } from "@/lib/client"

export async function POST(request: NextRequest) {
  try {
    // TODO(Cursor): Replace with real FastAPI proxy call
    await new Promise((resolve) => setTimeout(resolve, 500))

    const jobId = `job-${Date.now()}`

    // Store mock job status
    mockApi.jobs.set(jobId, {
      id: jobId,
      status: "queued",
      progress: 0,
    })

    return NextResponse.json({ jobId })
  } catch (error) {
    return NextResponse.json({ error: "Failed to start pipeline" }, { status: 500 })
  }
}
