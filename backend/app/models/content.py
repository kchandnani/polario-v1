"""
Pydantic models for content generation requests and responses
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class BusinessInfo(BaseModel):
    """Business information for content generation"""
    name: str = Field(..., description="Business name")
    type: str = Field(..., description="Business type/industry")
    description: str = Field(..., description="Business description")
    target_audience: Optional[str] = Field(None, description="Target audience")
    key_benefits: Optional[List[str]] = Field(None, description="Key business benefits")

class ContentRequest(BaseModel):
    """Request for AI content generation"""
    business_info: BusinessInfo
    selected_features: List[str] = Field(..., description="Selected features to highlight")
    additional_context: Optional[str] = Field(None, description="Additional context or requirements")

class BulletPoint(BaseModel):
    """A single bullet point with title and description"""
    title: str = Field(..., max_length=28, description="Bullet point title")
    desc: str = Field(..., max_length=120, description="Bullet point description")

class CallToAction(BaseModel):
    """Call to action with label and optional sub-text"""
    label: str = Field(..., max_length=25, description="CTA button text")
    sub: Optional[str] = Field(None, max_length=50, description="CTA sub-text")

class CopyData(BaseModel):
    """Generated marketing copy data"""
    headline: str = Field(..., max_length=90, description="Main headline")
    subheadline: Optional[str] = Field(None, max_length=140, description="Sub-headline")
    bullets: List[BulletPoint] = Field(..., min_items=3, max_items=3, description="Exactly 3 bullet points")
    cta: Optional[CallToAction] = Field(None, description="Call to action")

class ContentResponse(BaseModel):
    """Response from AI content generation"""
    success: bool = Field(..., description="Whether generation was successful")
    copy_data: CopyData = Field(..., description="Generated marketing copy")
    analysis: Optional[Dict[str, Any]] = Field(None, description="Business analysis data")
    message: str = Field(..., description="Status message")

# Render request models
class RenderRequest(BaseModel):
    """Request for brochure rendering"""
    project_id: str = Field(..., description="Project ID from Convex")
    job_id: str = Field(..., description="Job ID from Convex")
    copy_data: CopyData = Field(..., description="Marketing copy to render")
    assets: Dict[str, str] = Field(..., description="Asset URLs (logo, hero)")
    template: str = Field(default="product_a", description="Template to use")
    
class LayoutData(BaseModel):
    """Layout configuration data"""
    template: str = Field(..., description="Template name")
    palette: Optional[Dict[str, str]] = Field(None, description="Color palette")

class RenderResponse(BaseModel):
    """Response from brochure rendering"""
    success: bool = Field(..., description="Whether rendering was successful")
    pdf_url: Optional[str] = Field(None, description="PDF download URL")
    png_url: Optional[str] = Field(None, description="PNG thumbnail URL")
    message: str = Field(..., description="Status message")
    render_time: Optional[float] = Field(None, description="Rendering time in seconds")
