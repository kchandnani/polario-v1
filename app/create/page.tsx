"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { SignInButton } from "@clerk/nextjs"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Container } from "@/components/container"
import { FileDropzone } from "@/components/file-dropzone"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, Sparkles, Loader2 } from "lucide-react"
import type { Id } from "@/convex/_generated/dataModel"

export default function CreatePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoaded } = useUser()
  const [isGenerating, setIsGenerating] = useState(false)

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
              You need to be signed in to create brochures
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

  // Convex mutations
  const createProject = useMutation(api.projects.create)
  const createJob = useMutation(api.jobs.create)
  const generateUploadUrl = useMutation(api.assets.generateUploadUrl)
  const createAsset = useMutation(api.assets.createAsset)

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
  const [logoStorageId, setLogoStorageId] = useState<Id<"_storage"> | undefined>()
  const [heroStorageId, setHeroStorageId] = useState<Id<"_storage"> | undefined>()
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingHero, setUploadingHero] = useState(false)

  // File upload handlers
  const uploadFile = async (file: File, projectId: Id<"projects">, isLogo: boolean) => {
    try {
      // Get upload URL
      const uploadUrl = await generateUploadUrl()
      
      // Upload file to Convex storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      })
      
      const { storageId } = await result.json()
      
      // Get image dimensions if it's an image
      let width: number | undefined
      let height: number | undefined
      
      if (file.type.startsWith('image/')) {
        const img = new Image()
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = URL.createObjectURL(file)
        })
        width = img.width
        height = img.height
        URL.revokeObjectURL(img.src)
      }
      
      // Create asset record in Convex
      await createAsset({
        projectId,
        storageId,
        mimeType: file.type,
        size: file.size,
        width,
        height,
        isLogo,
      })
      
      return storageId
    } catch (error) {
      console.error('File upload failed:', error)
      toast({
        title: "Upload failed",
        description: `Failed to upload ${isLogo ? 'logo' : 'hero image'}. Please try again.`,
        variant: "destructive",
      })
      throw error
    }
  }

  const handleLogoChange = async (file: File | undefined) => {
    if (!file) {
      setLogo(undefined)
      setLogoStorageId(undefined)
      return
    }
    
    setLogo(file)
    // We'll upload when the project is created
  }

  const handleHeroChange = async (file: File | undefined) => {
    if (!file) {
      setHeroImage(undefined)
      setHeroStorageId(undefined)
      return
    }
    
    setHeroImage(file)
    // We'll upload when the project is created
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
        clerkId: user.id, // Pass Clerk ID for local development
      })

      // Upload files if they exist
      const uploadPromises: Promise<any>[] = []
      
      if (logo) {
        setUploadingLogo(true)
        uploadPromises.push(
          uploadFile(logo, projectId, true).then(storageId => {
            setLogoStorageId(storageId)
            setUploadingLogo(false)
          }).catch(() => setUploadingLogo(false))
        )
      }
      
      if (heroImage) {
        setUploadingHero(true)
        uploadPromises.push(
          uploadFile(heroImage, projectId, false).then(storageId => {
            setHeroStorageId(storageId)
            setUploadingHero(false)
          }).catch(() => setUploadingHero(false))
        )
      }
      
      // Wait for all uploads to complete
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises)
        toast({
          title: "Files uploaded successfully!",
          description: "Your assets have been uploaded and processed.",
        })
      }

      // Create a job for this project
      const jobId = await createJob({
        projectId,
        type: "generate",
        clerkId: user.id, // Pass Clerk ID for local development
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
      setUploadingLogo(false)
      setUploadingHero(false)
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
                <Label className="text-base font-medium">
                  Logo (Optional)
                  {uploadingLogo && (
                    <span className="ml-2 inline-flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      Uploading...
                    </span>
                  )}
                </Label>
                <FileDropzone
                  accept="image/*"
                  maxSize={15 * 1024 * 1024} // 15MB
                  onFileChange={handleLogoChange}
                  currentFile={logo}
                  placeholder="Drop your logo here or click to browse"
                />
                <p className="text-xs text-muted-foreground">Recommended: Square format, PNG, JPG, or SVG, max 15MB</p>
              </div>

              {/* Hero Image Upload */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Hero Image (Optional)
                  {uploadingHero && (
                    <span className="ml-2 inline-flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      Uploading...
                    </span>
                  )}
                </Label>
                <FileDropzone
                  accept="image/*"
                  maxSize={15 * 1024 * 1024} // 15MB
                  onFileChange={handleHeroChange}
                  currentFile={heroImage}
                  placeholder="Drop your hero image here or click to browse"
                />
                <p className="text-xs text-muted-foreground">Recommended: 16:9 aspect ratio, PNG or JPG, max 15MB</p>
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
