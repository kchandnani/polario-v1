"""
Polario FastAPI Backend
Enhanced AI-powered brochure generation service
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv

from app.api import ai, render, health
from app.core.config import settings
from app.core.auth import verify_clerk_token

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("🚀 Polario Backend starting up...")
    
    # Install Playwright browsers if needed
    try:
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            # Check if browsers are installed
            browser = await p.chromium.launch()
            await browser.close()
            print("✅ Playwright browsers ready")
    except Exception as e:
        print(f"⚠️  Playwright setup needed: {e}")
        print("Run: playwright install chromium")
    
    yield
    
    # Shutdown
    print("👋 Polario Backend shutting down...")

app = FastAPI(
    title="Polario API",
    description="Enhanced AI-powered brochure generation service",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - Allow all origins for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local development (includes Convex actions)
    allow_credentials=False,  # Must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer(auto_error=False)

# Routes
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(render.router, prefix="/api/render", tags=["render"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Polario API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
