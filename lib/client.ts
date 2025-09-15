import useSWR from "swr"
import type { PipelineStartResponse, JobStatus, RenderRecord, Project } from "./types"

// TODO(Cursor): Replace these mock endpoints with real FastAPI proxy calls
const API_BASE = "/api"

// Mock data store (replace with real backend)
const mockProjects: Project[] = [
  {
    id: "1",
    name: "Tech Startup Brochure",
    businessType: "SaaS",
    audience: "Enterprise",
    createdAt: "2024-01-15T10:00:00Z",
    status: "completed",
    renderId: "render-1",
  },
  {
    id: "2",
    name: "Restaurant Menu",
    businessType: "Food & Beverage",
    audience: "Local Customers",
    createdAt: "2024-01-10T14:30:00Z",
    status: "draft",
  },
]

const mockJobs = new Map<string, JobStatus>()

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch")
  }
  return response.json()
}

// API client functions
export const apiClient = {
  // Projects
  getProjects: () => useSWR<Project[]>("/api/projects", fetcher),
  getProject: (id: string) => useSWR<Project>(id ? `/api/projects/${id}` : null, fetcher),

  // Pipeline
  startPipeline: async (data: any): Promise<PipelineStartResponse> => {
    // TODO(Cursor): Replace with real API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    const jobId = `job-${Date.now()}`
    mockJobs.set(jobId, {
      id: jobId,
      status: "queued",
      progress: 0,
    })
    return { jobId }
  },

  // Jobs
  getJob: (jobId: string) => useSWR<JobStatus>(jobId ? `/api/jobs/${jobId}` : null, fetcher, { refreshInterval: 1000 }),

  // Renders
  getRender: (renderId: string) => useSWR<RenderRecord>(renderId ? `/api/renders/${renderId}` : null, fetcher),
}

// Mock implementations for development
export const mockApi = {
  projects: mockProjects,
  jobs: mockJobs,
}
