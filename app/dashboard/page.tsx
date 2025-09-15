"use client"

import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/container"
import { EmptyState } from "@/components/empty-state"
import { SignInButton } from "@clerk/nextjs"
import { Plus, FileText, Calendar, MoreHorizontal, TrendingUp, CheckCircle, Clock } from "lucide-react"

export default function DashboardPage() {
  const { user, isLoaded } = useUser()

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  // Redirect to auth if not signed in
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-20">
        <Container>
          <div className="max-w-md mx-auto text-center space-y-6">
            <h1 className="text-2xl font-bold">Sign In Required</h1>
            <p className="text-muted-foreground">
              You need to be signed in to access your dashboard
            </p>
            <SignInButton mode="modal">
              <Button size="lg">
                Sign In to Continue
              </Button>
            </SignInButton>
          </div>
        </Container>
      </div>
    )
  }

  const projects = useQuery(api.projects.getUserProjects, 
    user ? { clerkId: user.id } : "skip"
  ) || []

  const getStatusColor = (status: "draft" | "processing" | "completed" | "error") => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getStatusIcon = (status: "draft" | "processing" | "completed" | "error") => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "processing":
        return <Clock className="w-4 h-4" />
      case "draft":
        return <FileText className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="py-8 lg:py-12">
      <Container>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold">Dashboard</h1>
              <p className="text-lg text-muted-foreground">Manage your brochure projects and track their progress</p>
            </div>
            <Button asChild size="lg" className="h-12 px-6">
              <Link href="/create">
                <Plus className="w-5 h-5 mr-2" />
                New Brochure
              </Link>
            </Button>
          </div>

          {/* Quick Stats */}
          {projects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{projects.length}</p>
                      <p className="text-sm text-muted-foreground">Total Projects</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{projects.filter((p) => p.status === "completed").length}</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{projects.filter((p) => p.status === "processing").length}</p>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Projects Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Your Projects</h2>
              <p className="text-sm text-muted-foreground">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Projects Grid */}
            {projects.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Card key={project._id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1 min-w-0">
                        <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{project.businessInfo.type}</p>
                      </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {formatDate(new Date(project.createdAt).toISOString())}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={getStatusColor(project.status)}>
                            {getStatusIcon(project.status)}
                            <span className="ml-1">{project.status.charAt(0).toUpperCase() + project.status.slice(1)}</span>
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {project.status === "completed" ? (
                          <Button size="sm" asChild className="flex-1">
                            <Link href={`/renders/${project._id}`}>
                              <FileText className="w-4 h-4 mr-2" />
                              View Result
                            </Link>
                          </Button>
                        ) : project.status === "processing" ? (
                          <Button size="sm" variant="outline" asChild className="flex-1">
                            <Link href={`/jobs/${project._id}`}>View Progress</Link>
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" asChild className="flex-1">
                            <Link href={`/create?project=${project._id}`}>Continue Editing</Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FileText}
                title="No brochures yet"
                description="Create your first professional brochure to get started"
                action={
                  <Button asChild size="lg">
                    <Link href="/create">
                      <Plus className="w-5 h-5 mr-2" />
                      Create Your First Brochure
                    </Link>
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </Container>
    </div>
  )
}
