"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Container } from "@/components/container"
import { FileDropzone } from "@/components/file-dropzone"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, Sparkles } from "lucide-react"

export default function CreatePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useUser()
  const [isGenerating, setIsGenerating] = useState(false)

  // Convex mutations
  const createProject = useMutation(api.projects.create)
  const createJob = useMutation(api.jobs.create)

  const [businessName, setBusinessName] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [feature1Title, setFeature1Title] = useState("")
  const [feature1Desc, setFeature1Desc] = useState("")
  const [feature2Title, setFeature2Title] = useState("")
  const [feature2Desc, setFeature2Desc] = useState("")
  const [feature3Title, setFeature3Title] = useState("")
  const [feature3Desc, setFeature3Desc] = useState("")
  const [logo, setLogo] = useState<File | undefined>()
  const [heroImage, setHeroImage] = useState<File | undefined>()

  const handleLogoChange = (files: File[]) => {
    if (files.length > 0) {
      setLogo(files[0])
    }
  }

  const handleHeroChange = (files: File[]) => {
    if (files.length > 0) {
      setHeroImage(files[0])
    }
  }

  const validateForm = (): boolean => {
    return (
      businessName.trim() !== "" &&
      businessType.trim() !== "" &&
      targetAudience.trim() !== "" &&
      feature1Title.trim() !== "" &&
      feature1Desc.trim() !== "" &&
      feature2Title.trim() !== "" &&
      feature2Desc.trim() !== "" &&
      feature3Title.trim() !== "" &&
      feature3Desc.trim() !== ""
    )
  }

  const handleGenerate = async () => {
    if (!validateForm()) {
      toast({
        title: "Please fill in all required fields",
        description: "All business information and features are required.",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to create a brochure.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Create project in Convex
      const projectId = await createProject({
        title: `${businessName} Brochure`,
        businessInfo: {
          name: businessName,
          type: businessType,
          audience: targetAudience,
        },
        features: [
          { title: feature1Title, desc: feature1Desc },
          { title: feature2Title, desc: feature2Desc },
          { title: feature3Title, desc: feature3Desc },
        ],
      })

      // Create a job for this project
      const jobId = await createJob({
        projectId,
        type: "generate",
      })

      toast({
        title: "Brochure generation started!",
        description: "We'll process your request and notify you when it's ready.",
      })

      router.push(`/jobs/${jobId}`)
    } catch (error) {
      console.error("Generation error:", error)
      toast({
        title: "Generation failed",
        description: "There was an error starting the brochure generation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="py-8 lg:py-12">
      <Container>
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
              <h1 className="text-3xl lg:text-4xl font-bold">Create Your Brochure</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Drop your images, add some text, and let AI create a professional brochure in minutes
            </p>
          </div>

          {/* Main Form */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Brochure Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Business Name */}
              <div className="space-y-3">
                <Label htmlFor="business-name" className="text-base font-medium">
                  Business Name *
                </Label>
                <Input
                  id="business-name"
                  placeholder="Enter your business name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="h-12 text-base"
                  maxLength={90}
                />
                <p className="text-xs text-muted-foreground">{businessName.length}/90 characters</p>
              </div>

              {/* Business Type */}
              <div className="space-y-3">
                <Label htmlFor="business-type" className="text-base font-medium">
                  Business Type *
                </Label>
                <Input
                  id="business-type"
                  placeholder="e.g., SaaS, Restaurant, Consulting, E-commerce"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="h-12 text-base"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">What industry best describes your business?</p>
              </div>

              {/* Target Audience */}
              <div className="space-y-3">
                <Label htmlFor="target-audience" className="text-base font-medium">
                  Target Audience *
                </Label>
                <Textarea
                  id="target-audience"
                  placeholder="Describe your ideal customers (e.g., 'Small business owners', 'Tech-savvy millennials')"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  rows={3}
                  className="text-base resize-none"
                  maxLength={140}
                />
                <p className="text-xs text-muted-foreground">{targetAudience.length}/140 characters</p>
              </div>

              {/* Features Section */}
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Key Features</h3>
                  <p className="text-sm text-muted-foreground">Highlight exactly 3 features that make your business special</p>
                </div>

                {/* Feature 1 */}
                <div className="p-4 border rounded-lg space-y-4">
                  <h4 className="font-medium">Feature 1</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="feature1-title" className="text-sm font-medium">Title *</Label>
                      <Input
                        id="feature1-title"
                        placeholder="e.g., Fast Delivery"
                        value={feature1Title}
                        onChange={(e) => setFeature1Title(e.target.value)}
                        maxLength={28}
                      />
                      <p className="text-xs text-muted-foreground">{feature1Title.length}/28 characters</p>
                    </div>
                    <div>
                      <Label htmlFor="feature1-desc" className="text-sm font-medium">Description *</Label>
                      <Textarea
                        id="feature1-desc"
                        placeholder="Describe this feature and its benefits"
                        value={feature1Desc}
                        onChange={(e) => setFeature1Desc(e.target.value)}
                        rows={3}
                        maxLength={120}
                      />
                      <p className="text-xs text-muted-foreground">{feature1Desc.length}/120 characters</p>
                    </div>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="p-4 border rounded-lg space-y-4">
                  <h4 className="font-medium">Feature 2</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="feature2-title" className="text-sm font-medium">Title *</Label>
                      <Input
                        id="feature2-title"
                        placeholder="e.g., 24/7 Support"
                        value={feature2Title}
                        onChange={(e) => setFeature2Title(e.target.value)}
                        maxLength={28}
                      />
                      <p className="text-xs text-muted-foreground">{feature2Title.length}/28 characters</p>
                    </div>
                    <div>
                      <Label htmlFor="feature2-desc" className="text-sm font-medium">Description *</Label>
                      <Textarea
                        id="feature2-desc"
                        placeholder="Describe this feature and its benefits"
                        value={feature2Desc}
                        onChange={(e) => setFeature2Desc(e.target.value)}
                        rows={3}
                        maxLength={120}
                      />
                      <p className="text-xs text-muted-foreground">{feature2Desc.length}/120 characters</p>
                    </div>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="p-4 border rounded-lg space-y-4">
                  <h4 className="font-medium">Feature 3</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="feature3-title" className="text-sm font-medium">Title *</Label>
                      <Input
                        id="feature3-title"
                        placeholder="e.g., Easy Integration"
                        value={feature3Title}
                        onChange={(e) => setFeature3Title(e.target.value)}
                        maxLength={28}
                      />
                      <p className="text-xs text-muted-foreground">{feature3Title.length}/28 characters</p>
                    </div>
                    <div>
                      <Label htmlFor="feature3-desc" className="text-sm font-medium">Description *</Label>
                      <Textarea
                        id="feature3-desc"
                        placeholder="Describe this feature and its benefits"
                        value={feature3Desc}
                        onChange={(e) => setFeature3Desc(e.target.value)}
                        rows={3}
                        maxLength={120}
                      />
                      <p className="text-xs text-muted-foreground">{feature3Desc.length}/120 characters</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo Upload */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Logo (Optional)</Label>
                <FileDropzone
                  onFilesChange={handleLogoChange}
                  accept={{ "image/*": [".png", ".jpg", ".jpeg", ".svg"] }}
                  maxFiles={1}
                  className="h-32 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors"
                >
                  {logo ? (
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <p className="font-medium text-sm">{logo.name}</p>
                      <p className="text-xs text-muted-foreground">Logo uploaded successfully</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-muted rounded-lg mx-auto flex items-center justify-center">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-sm">Drop your logo here</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, or SVG</p>
                    </div>
                  )}
                </FileDropzone>
              </div>

              {/* Hero Image Upload */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Hero Image (Optional)</Label>
                <FileDropzone
                  onFilesChange={handleHeroChange}
                  accept={{ "image/*": [".png", ".jpg", ".jpeg"] }}
                  maxFiles={1}
                  className="h-32 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors"
                >
                  {heroImage ? (
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <p className="font-medium text-sm">{heroImage.name}</p>
                      <p className="text-xs text-muted-foreground">Hero image uploaded successfully</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-muted rounded-lg mx-auto flex items-center justify-center">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-sm">Drop your hero image here</p>
                      <p className="text-xs text-muted-foreground">PNG or JPG</p>
                    </div>
                  )}
                </FileDropzone>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={!validateForm() || isGenerating}
              className="w-full sm:w-auto h-14 px-12 text-lg font-semibold"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Brochure
                </>
              )}
            </Button>
          </div>
        </div>
      </Container>
    </div>
  )
}
