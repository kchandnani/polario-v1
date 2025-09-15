export type CopyJSON = {
  headline: string
  subheadline?: string
  bullets: { title: string; desc: string }[] // exactly 3 later
  cta?: { label: string; sub?: string }
}

export type LayoutJSON = {
  template: "product_a"
  palette?: { primary: string; accent?: string }
  assets: { logo?: string; hero?: string } // URLs
  constraints?: {
    max_chars?: { headline?: number; subheadline?: number; bullet_title?: number; bullet_desc?: number }
    image_slots?: { hero?: { ratio: "16:9"; min_px: number } }
  }
}

export type PipelineStartResponse = { jobId: string }
export type JobStatus = {
  id: string
  status: "queued" | "running" | "done" | "error"
  progress: number
  resultId?: string
  error?: string
}
export type RenderRecord = {
  id: string
  pdfUrl: string
  pngUrl?: string
  createdAt: string
}

export type Project = {
  id: string
  name: string
  businessType: string
  audience: string
  createdAt: string
  status: "draft" | "processing" | "completed"
  renderId?: string
}

export type BusinessInfo = {
  name: string
  type: string
  audience: string
}

export type Feature = {
  title: string
  desc: string
}

export type Assets = {
  logo?: File | string
  hero?: File | string
}

export type BrochureData = {
  businessInfo: BusinessInfo
  features: Feature[]
  assets: Assets
  copy: CopyJSON
  layout: LayoutJSON
  aiInstructions?: string
}
