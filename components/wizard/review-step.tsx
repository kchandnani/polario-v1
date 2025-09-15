import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, Star, ImageIcon } from "lucide-react"
import type { BusinessInfo, Feature, Assets } from "@/lib/types"

interface ReviewStepProps {
  businessInfo: BusinessInfo
  features: Feature[]
  assets: Assets
}

export function ReviewStep({ businessInfo, features, assets }: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-muted-foreground">Review your information before generating your brochure</p>
      </div>

      {/* Business Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="font-medium">{businessInfo.name}</p>
            <p className="text-sm text-muted-foreground">{businessInfo.type}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Target Audience:</p>
            <p className="text-sm text-muted-foreground">{businessInfo.audience}</p>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Key Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="border-l-2 border-primary pl-4">
              <h4 className="font-medium">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Assets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Assets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Logo:</p>
              {assets.logo ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Uploaded</Badge>
                  <span className="text-sm text-muted-foreground">{(assets.logo as File).name}</span>
                </div>
              ) : (
                <Badge variant="outline">Not provided</Badge>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Hero Image:</p>
              {assets.hero ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Uploaded</Badge>
                  <span className="text-sm text-muted-foreground">{(assets.hero as File).name}</span>
                </div>
              ) : (
                <Badge variant="outline">Not provided</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
