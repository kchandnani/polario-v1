"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Feature } from "@/lib/types"

interface FeaturesStepProps {
  data: Feature[]
  onChange: (data: Feature[]) => void
}

export function FeaturesStep({ data, onChange }: FeaturesStepProps) {
  const handleFeatureChange = (index: number, field: keyof Feature, value: string) => {
    const newFeatures = [...data]
    newFeatures[index] = { ...newFeatures[index], [field]: value }
    onChange(newFeatures)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-muted-foreground">Highlight exactly 3 key features that make your business special</p>
      </div>

      {data.map((feature, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg">Feature {index + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`feature-title-${index}`}>Feature Title *</Label>
              <Input
                id={`feature-title-${index}`}
                placeholder="e.g., Fast Delivery, 24/7 Support"
                value={feature.title}
                onChange={(e) => handleFeatureChange(index, "title", e.target.value)}
                maxLength={28}
              />
              <p className="text-xs text-muted-foreground">{feature.title.length}/28 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`feature-desc-${index}`}>Description *</Label>
              <Textarea
                id={`feature-desc-${index}`}
                placeholder="Describe this feature and its benefits"
                value={feature.desc}
                onChange={(e) => handleFeatureChange(index, "desc", e.target.value)}
                maxLength={120}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">{feature.desc.length}/120 characters</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
