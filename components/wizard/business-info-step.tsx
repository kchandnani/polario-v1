"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { BusinessInfo } from "@/lib/types"

interface BusinessInfoStepProps {
  data: BusinessInfo
  onChange: (data: BusinessInfo) => void
}

export function BusinessInfoStep({ data, onChange }: BusinessInfoStepProps) {
  const handleChange = (field: keyof BusinessInfo, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="business-name">Business Name *</Label>
        <Input
          id="business-name"
          placeholder="Enter your business name"
          value={data.name}
          onChange={(e) => handleChange("name", e.target.value)}
          maxLength={90}
        />
        <p className="text-xs text-muted-foreground">{data.name.length}/90 characters</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="business-type">Business Type *</Label>
        <Input
          id="business-type"
          placeholder="e.g., SaaS, Restaurant, Consulting"
          value={data.type}
          onChange={(e) => handleChange("type", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">What industry or category best describes your business?</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="target-audience">Target Audience *</Label>
        <Textarea
          id="target-audience"
          placeholder="Describe your ideal customers"
          value={data.audience}
          onChange={(e) => handleChange("audience", e.target.value)}
          maxLength={140}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">{data.audience.length}/140 characters</p>
      </div>
    </div>
  )
}
