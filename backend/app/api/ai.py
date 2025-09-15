"""
AI content generation endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import time

from app.models.content import ContentRequest, ContentResponse
from app.services.ai_service import AIService
from app.core.auth import verify_clerk_token

router = APIRouter()

# Initialize AI service
ai_service = AIService()

# Optional auth for local development
security = HTTPBearer(auto_error=False)

@router.post("/generate-copy", response_model=ContentResponse)
async def generate_copy(
    request: ContentRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> ContentResponse:
    """
    Generate enhanced marketing copy using AI copywriting intelligence
    
    This endpoint uses multi-stage AI processing:
    1. Business analysis and strategy development
    2. Copywriting with industry-specific intelligence
    3. Validation and conformance to constraints
    """
    
    print(f"🔍 DEBUG: Received request to /api/ai/generate-copy")
    print(f"🔍 DEBUG: Request data: {request.dict()}")
    print(f"🔍 DEBUG: Credentials: {credentials}")
    
    try:
        # Verify auth (optional for local development)
        auth = await verify_clerk_token(credentials)
        
        start_time = time.time()
        
        # Generate content using enhanced AI service
        response = await ai_service.generate_content(request)
        
        # Add timing information
        generation_time = time.time() - start_time
        response.message += f" (Generated in {generation_time:.2f}s)"
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Content generation failed: {str(e)}"
        )

@router.post("/test-analysis")
async def test_business_analysis(
    request: ContentRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Test endpoint to see the business analysis stage output
    Development/debugging endpoint
    """
    
    try:
        # Verify auth (optional for local development)
        auth = await verify_clerk_token(credentials)
        
        # Only run the analysis stage
        analysis = await ai_service._analyze_business(request)
        
        return {
            "business_info": request.business_info.dict(),
            "selected_features": request.selected_features,
            "analysis": analysis
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Business analysis failed: {str(e)}"
        )

# Test endpoint removed for production
