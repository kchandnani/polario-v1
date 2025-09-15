"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Container } from "@/components/container"
import { JobProgress } from "@/components/job-progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface JobPageProps {
  params: Promise<{ id: string }>
}

export default function JobPage({ params }: JobPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useUser()
  
  // Use React.use() for Next.js 15 params
  const { id: jobId } = React.use(params)
  
  const job = useQuery(api.jobs.getById, 
    user ? { jobId: jobId as any, clerkId: user.id } : "skip"
  )
  
  const isLoading = job === undefined
  const error = job === null

  useEffect(() => {
    if (job?.status === "done" && job.resultId) {
      toast({
        title: "Brochure ready!",
        description: "Your brochure has been generated successfully.",
      })

      // Auto-redirect after a short delay
      setTimeout(() => {
        router.push(`/renders/${job.resultId}`)
      }, 2000)
    } else if (job?.status === "error") {
      toast({
        title: "Generation failed",
        description: job.error || "There was an error generating your brochure.",
        variant: "destructive",
      })
    }
  }, [job, router, toast])

  if (isLoading) {
    return (
      <div className="py-8">
        <Container>
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="pt-8 pb-6 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Loading job status...</p>
              </CardContent>
            </Card>
          </div>
        </Container>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="py-8">
        <Container>
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <Card>
              <CardContent className="pt-8 pb-6">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
                <p className="text-muted-foreground mb-6">The job you're looking for doesn't exist or has expired.</p>
                <Button asChild>
                  <Link href="/dashboard">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </Container>
      </div>
    )
  }

  const getStatusIcon = () => {
    switch (job.status) {
      case "queued":
        return <Clock className="w-6 h-6 text-blue-600" />
      case "running":
        return <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      case "done":
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case "error":
        return <AlertCircle className="w-6 h-6 text-destructive" />
      default:
        return <Clock className="w-6 h-6 text-muted-foreground" />
    }
  }

  const getStatusColor = () => {
    switch (job.status) {
      case "queued":
        return "bg-blue-100 text-blue-800"
      case "running":
        return "bg-yellow-100 text-yellow-800"
      case "done":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusMessage = () => {
    switch (job.status) {
      case "queued":
        return "Your brochure is in the queue and will be processed shortly."
      case "running":
        return "AI is generating your professional brochure. This usually takes 1-2 minutes."
      case "done":
        return "Your brochure has been generated successfully! Redirecting to results..."
      case "error":
        return job.error || "An error occurred during generation. Please try again."
      default:
        return "Processing your request..."
    }
  }

  return (
    <div className="py-8">
      <Container>
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Generating Your Brochure</h1>
            <p className="text-muted-foreground">Please wait while we create your professional brochure</p>
          </div>

          {/* Job Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  {getStatusIcon()}
                  Job Status
                </CardTitle>
                <Badge className={getStatusColor()}>{job.status.charAt(0).toUpperCase() + job.status.slice(1)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">{getStatusMessage()}</p>

              {job.status !== "error" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} className="h-3" />
                </div>
              )}

              <JobProgress status={job.status} progress={job.progress} />

              <div className="flex gap-3 flex-wrap">
                <Button variant="outline" asChild>
                  <Link href="/dashboard">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>

                {job.status === "done" && job.resultId && (
                  <Button asChild>
                    <Link href={`/renders/${job.resultId}`}>View Results</Link>
                  </Button>
                )}

                {job.status === "error" && (
                  <Button asChild>
                    <Link href="/create">Try Again</Link>
                  </Button>
                )}
                
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Job ID:</span>
                <span className="font-mono text-sm">{job._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Started:</span>
                <span className="text-sm">Just now</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated time:</span>
                <span className="text-sm">1-2 minutes</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  )
}
