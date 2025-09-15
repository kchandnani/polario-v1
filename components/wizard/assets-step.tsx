import { FileDropzone } from "@/components/file-dropzone"
import type { Assets } from "@/lib/types"

interface AssetsStepProps {
  data: Assets
  onChange: (data: Assets) => void
}

export function AssetsStep({ data, onChange }: AssetsStepProps) {
  const handleLogoChange = (file: File | undefined) => {
    onChange({ ...data, logo: file })
  }

  const handleHeroChange = (file: File | undefined) => {
    onChange({ ...data, hero: file })
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <p className="text-muted-foreground">Upload your logo and hero image to personalize your brochure (optional)</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="font-medium">Logo</h3>
          <FileDropzone
            accept="image/*"
            maxSize={15 * 1024 * 1024} // 15MB
            onFileChange={handleLogoChange}
            currentFile={data.logo}
            placeholder="Drop your logo here or click to browse"
          />
          <p className="text-xs text-muted-foreground">Recommended: Square format, PNG or JPG, max 15MB</p>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">Hero Image</h3>
          <FileDropzone
            accept="image/*"
            maxSize={15 * 1024 * 1024} // 15MB
            onFileChange={handleHeroChange}
            currentFile={data.hero}
            placeholder="Drop your hero image here or click to browse"
          />
          <p className="text-xs text-muted-foreground">Recommended: 16:9 aspect ratio, PNG or JPG, max 15MB</p>
        </div>
      </div>
    </div>
  )
}
