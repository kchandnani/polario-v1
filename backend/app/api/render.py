"""
Brochure rendering endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials
import time

from app.models.content import RenderRequest, RenderResponse
from app.services.render_service import RenderService
from app.core.auth import verify_clerk_token

router = APIRouter()

# Initialize render service
render_service = RenderService()

@router.post("/generate", response_model=RenderResponse)
async def generate_brochure(
    request: RenderRequest,
    auth: dict = Depends(verify_clerk_token)
) -> RenderResponse:
    """
    Generate PDF and PNG brochure from content and assets
    
    This endpoint:
    1. Renders HTML template with provided content and assets
    2. Generates PDF using Playwright
    3. Creates PNG thumbnail
    4. Uploads files to Convex storage
    5. Updates job status
    """
    
    try:
        start_time = time.time()
        
        # Generate brochure using render service
        response = await render_service.generate_brochure(request)
        
        # Add timing information
        render_time = time.time() - start_time
        response.render_time = render_time
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Brochure generation failed: {str(e)}"
        )

@router.get("/templates")
async def list_templates() -> dict:
    """List available brochure templates"""
    
    return {
        "templates": [
            {
                "id": "product_a",
                "name": "Product A",
                "description": "Hero + 3 Features + CTA layout",
                "preview_url": "/templates/product_a/preview.png"
            }
        ],
        "default": "product_a"
    }
