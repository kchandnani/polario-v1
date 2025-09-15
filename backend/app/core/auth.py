"""
Authentication utilities for Clerk integration
"""

from jose import jwt
from fastapi import HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from typing import Optional, Dict, Any

from .config import settings

class ClerkAuthError(Exception):
    """Custom exception for Clerk authentication errors"""
    pass

async def verify_clerk_token(credentials: Optional[HTTPAuthorizationCredentials]) -> Optional[Dict[str, Any]]:
    """
    Verify Clerk JWT token and return user information
    
    Args:
        credentials: HTTP Authorization credentials
        
    Returns:
        User information from JWT payload
        
    Raises:
        HTTPException: If token is invalid or missing
    """
    
    if not credentials:
        return None  # Allow unauthenticated for development
    
    token = credentials.credentials
    
    if not settings.CLERK_SECRET_KEY:
        # Development mode - skip verification
        print("⚠️  Development mode: Skipping Clerk token verification")
        return {"sub": "dev_user", "email": "dev@polario.com"}
    
    try:
        # Decode JWT token
        payload = jwt.decode(
            token,
            settings.CLERK_SECRET_KEY,
            algorithms=["RS256"],
            issuer=settings.CLERK_JWT_ISSUER_DOMAIN,
            options={"verify_signature": True}
        )
        
        return {
            "user_id": payload.get("sub"),
            "email": payload.get("email"),
            "clerk_id": payload.get("sub"),
        }
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication error: {str(e)}"
        )
