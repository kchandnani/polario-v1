"""
Configuration settings for Polario Backend
"""

import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Polario API"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://localhost:3000",
        "http://127.0.0.1:3000",
        "*",  # Allow all origins for local development (Convex actions)
    ]
    
    # Clerk Authentication
    CLERK_SECRET_KEY: str = os.getenv("CLERK_SECRET_KEY", "")
    CLERK_JWT_ISSUER_DOMAIN: str = os.getenv("CLERK_JWT_ISSUER_DOMAIN", "")
    
    # Google AI
    GOOGLE_AI_API_KEY: str = os.getenv("GOOGLE_AI_API_KEY", "")
    
    # Convex
    CONVEX_DEPLOYMENT: str = os.getenv("CONVEX_DEPLOYMENT", "")
    CONVEX_DEPLOY_KEY: str = os.getenv("CONVEX_DEPLOY_KEY", "")
    
    # File Processing
    MAX_FILE_SIZE: int = 15 * 1024 * 1024  # 15MB
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"]
    
    # Rendering
    RENDER_TIMEOUT: int = 60  # seconds
    PDF_QUALITY: str = "print"  # print, screen
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
