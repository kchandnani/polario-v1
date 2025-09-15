"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, X, File } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileDropzoneProps {
  accept?: string
  maxSize?: number
  onFileChange: (file: File | undefined) => void
  currentFile?: File | string
  placeholder?: string
}

export function FileDropzone({
  accept = "image/*",
  maxSize = 15 * 1024 * 1024, // 15MB default
  onFileChange,
  currentFile,
  placeholder = "Drop files here or click to browse",
}: FileDropzoneProps) {
  const [error, setError] = useState<string>("")

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError("")

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0]
        if (rejection.errors[0]?.code === "file-too-large") {
          setError(`File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`)
        } else if (rejection.errors[0]?.code === "file-invalid-type") {
          setError("Invalid file type. Please upload an image file.")
        } else {
          setError("File upload failed. Please try again.")
        }
        return
      }

      if (acceptedFiles.length > 0) {
        onFileChange(acceptedFiles[0])
      }
    },
    [maxSize, onFileChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { [accept]: [] },
    maxSize,
    multiple: false,
  })

  const handleRemove = () => {
    onFileChange(undefined)
    setError("")
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (currentFile) {
    const fileName = typeof currentFile === "string" ? "Uploaded file" : currentFile.name
    const fileSize = typeof currentFile === "string" ? "" : formatFileSize(currentFile.size)

    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <File className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">{fileName}</p>
              {fileSize && <p className="text-xs text-muted-foreground">{fileSize}</p>}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRemove}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          error && "border-destructive",
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">{placeholder}</p>
        <p className="text-xs text-muted-foreground">
          PNG, JPG, JPEG, WEBP up to {Math.round(maxSize / 1024 / 1024)}MB
        </p>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
