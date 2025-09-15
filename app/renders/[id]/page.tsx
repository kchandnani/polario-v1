"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/container"
import { Download, Eye, Share2, ArrowLeft, CheckCircle } from "lucide-react"
import { apiClient } from "@/lib/client"
import Link from "next/link"

interface RenderPageProps {
  params: { id: string }
}

export default function RenderPage({ params }: RenderPageProps) {
  const { data: render, error, isLoading } = apiClient.getRender(params.id)

  if (isLoading) {
    return (
      <div className="py-8">
        <Container>
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="pt-8 pb-6 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Loading render...</p>
              </CardContent>
            </Card>
          </div>
        </Container>
      </div>
    )
  }

  if (error || !render) {
    return (
      <div className="py-8">
        <Container>
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <Card>
              <CardContent className="pt-8 pb-6">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Render Not Found</h2>
                <p className="text-muted-foreground mb-6">
                  The render you're looking for doesn't exist or has expired.
                </p>
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="py-8">
      <Container>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold">Brochure Ready!</h1>
            <p className="text-muted-foreground">Your professional brochure has been generated successfully</p>
            <Badge variant="secondary">Generated on {formatDate(render.createdAt)}</Badge>
          </div>

          {/* Preview and Download */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {render.pngUrl ? (
                  <div className="space-y-4">
                    <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                      <img
                        src={render.pngUrl || "/placeholder.svg"}
                        alt="Brochure preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <a href={render.pngUrl} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Size
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Eye className="w-8 h-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">Preview not available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Download Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Download Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">PDF Version</h4>
                      <Badge variant="secondary">Print Ready</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      High-quality PDF perfect for printing and professional distribution
                    </p>
                    <Button className="w-full" asChild>
                      <a href={render.pdfUrl} download>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </a>
                    </Button>
                  </div>

                  {render.pngUrl && (
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">PNG Preview</h4>
                        <Badge variant="outline">Web Ready</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Image version ideal for web use and social media sharing
                      </p>
                      <Button variant="outline" className="w-full bg-transparent" asChild>
                        <a href={render.pngUrl} download>
                          <Download className="w-4 h-4 mr-2" />
                          Download PNG
                        </a>
                      </Button>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full bg-transparent" disabled>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Link (Coming Soon)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <Button asChild>
              <Link href="/create">Create Another Brochure</Link>
            </Button>
          </div>

          {/* Render Details */}
          <Card>
            <CardHeader>
              <CardTitle>Render Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Render ID:</span>
                <span className="font-mono text-sm">{render.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Generated:</span>
                <span className="text-sm">{formatDate(render.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Format:</span>
                <span className="text-sm">PDF + PNG Preview</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  )
}
