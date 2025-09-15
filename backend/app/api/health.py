"""
Health check endpoints
"""

from fastapi import APIRouter
from typing import Dict, Any
import time
import os

router = APIRouter()

@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "service": "Polario API",
        "version": "1.0.0"
    }

@router.get("/health/detailed")
async def detailed_health_check() -> Dict[str, Any]:
    """Detailed health check with service dependencies"""
    
    status = "healthy"
    checks = {}
    
    # Check Google AI API key
    checks["google_ai"] = {
        "status": "ok" if os.getenv("GOOGLE_AI_API_KEY") else "missing",
        "message": "Google AI API key configured" if os.getenv("GOOGLE_AI_API_KEY") else "Google AI API key missing"
    }
    
    # Check Clerk configuration
    checks["clerk_auth"] = {
        "status": "ok" if os.getenv("CLERK_SECRET_KEY") else "missing",
        "message": "Clerk authentication configured" if os.getenv("CLERK_SECRET_KEY") else "Clerk keys missing"
    }
    
    # Check Playwright
    try:
        from playwright.async_api import async_playwright
        checks["playwright"] = {
            "status": "ok",
            "message": "Playwright available"
        }
    except ImportError:
        checks["playwright"] = {
            "status": "error",
            "message": "Playwright not installed"
        }
        status = "degraded"
    
    # Overall status
    if any(check["status"] == "error" for check in checks.values()):
        status = "unhealthy"
    elif any(check["status"] == "missing" for check in checks.values()):
        status = "degraded"
    
    return {
        "status": status,
        "timestamp": time.time(),
        "service": "Polario API",
        "version": "1.0.0",
        "checks": checks
    }
