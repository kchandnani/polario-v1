# 🛡️ Polario Security Implementation Guide

## 🎯 Overview
This guide provides specific implementation details for all security measures mentioned in the development roadmap. Every feature should be implemented with security as a first-class concern.

---

## 🔒 Phase 1: Authentication & Authorization Security

### Clerk Configuration
```typescript
// middleware.ts - Secure authentication middleware
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/create(.*)',
  '/jobs(.*)',
  '/renders(.*)'
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### Webhook Security
```typescript
// app/api/clerk/webhook/route.ts
import { headers } from 'next/headers';
import { Webhook } from 'svix';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET');
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing required headers', { status: 400 });
  }

  const payload = await req.text();
  const body = JSON.parse(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  // Process webhook securely...
}
```

---

## 🔒 Phase 2: File Upload Security

### File Validation
```typescript
// lib/file-security.ts
import { z } from 'zod';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/svg+xml'
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const fileValidationSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, 'File too large (max 10MB)')
    .refine((file) => ALLOWED_MIME_TYPES.includes(file.type as any), 'Invalid file type')
    .refine(async (file) => await validateFileContent(file), 'Potentially malicious file'),
});

async function validateFileContent(file: File): Promise<boolean> {
  // Check file headers match extension
  const buffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(buffer);
  
  // JPEG validation
  if (file.type === 'image/jpeg') {
    return uint8Array[0] === 0xFF && uint8Array[1] === 0xD8;
  }
  
  // PNG validation  
  if (file.type === 'image/png') {
    return uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && 
           uint8Array[2] === 0x4E && uint8Array[3] === 0x47;
  }
  
  // SVG validation (basic)
  if (file.type === 'image/svg+xml') {
    const text = new TextDecoder().decode(uint8Array);
    return text.includes('<svg') && !text.includes('<script');
  }
  
  return false;
}
```

### Rate Limiting
```typescript
// lib/rate-limiter.ts
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface RateLimit {
  userId: string;
  action: string;
  count: number;
  windowStart: number;
}

export async function checkRateLimit(
  userId: string, 
  action: string, 
  limit: number, 
  windowMs: number
): Promise<boolean> {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Get recent actions for this user
  const recentActions = await convex.query("rateLimits:getRecentActions", {
    userId,
    action,
    windowStart
  });
  
  if (recentActions.length >= limit) {
    return false; // Rate limit exceeded
  }
  
  // Record this action
  await convex.mutation("rateLimits:recordAction", {
    userId,
    action,
    timestamp: now
  });
  
  return true;
}

// Usage in API routes
export async function POST(req: Request) {
  const { userId } = auth();
  
  const allowed = await checkRateLimit(userId, 'file_upload', 10, 60 * 60 * 1000); // 10 per hour
  if (!allowed) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
  
  // Process upload...
}
```

---

## 🔒 Phase 3: API Security

### Input Validation
```typescript
// lib/validation.ts
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

export const businessInfoSchema = z.object({
  name: z.string()
    .min(1, 'Business name required')
    .max(90, 'Business name too long')
    .transform((val) => DOMPurify.sanitize(val.trim())),
  type: z.string()
    .min(1, 'Business type required')
    .max(50, 'Business type too long')
    .transform((val) => DOMPurify.sanitize(val.trim())),
  audience: z.string()
    .min(1, 'Target audience required')
    .max(140, 'Target audience too long')
    .transform((val) => DOMPurify.sanitize(val.trim())),
});

export const featureSchema = z.object({
  title: z.string()
    .min(1, 'Feature title required')
    .max(28, 'Feature title too long')
    .transform((val) => DOMPurify.sanitize(val.trim())),
  desc: z.string()
    .min(1, 'Feature description required')
    .max(120, 'Feature description too long')
    .transform((val) => DOMPurify.sanitize(val.trim())),
});

export const projectSchema = z.object({
  businessInfo: businessInfoSchema,
  features: z.array(featureSchema).length(3, 'Exactly 3 features required'),
});
```

### FastAPI Security
```python
# fastapi_security.py
from fastapi import HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import httpx
import asyncio
from functools import wraps

security = HTTPBearer()

class SecurityConfig:
    CLERK_PEM_PUBLIC_KEY = "your-clerk-public-key"
    RATE_LIMIT_REQUESTS = 100
    RATE_LIMIT_WINDOW = 3600  # 1 hour

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    
    try:
        payload = jwt.decode(
            token, 
            SecurityConfig.CLERK_PEM_PUBLIC_KEY, 
            algorithms=["RS256"]
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def rate_limit(max_calls: int = 100, window_seconds: int = 3600):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            user_id = kwargs.get('current_user')
            
            # Check rate limit (implement with Redis or similar)
            if not await check_rate_limit(user_id, max_calls, window_seconds):
                raise HTTPException(status_code=429, detail="Rate limit exceeded")
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

@app.post("/api/ai/generate-copy")
@rate_limit(max_calls=10, window_seconds=3600)  # 10 requests per hour
async def generate_copy(
    request: CopyGenerationRequest,
    current_user: str = Depends(verify_token)
):
    # Validate and sanitize input
    sanitized_input = sanitize_ai_input(request.business_info)
    
    # Generate copy with Gemini
    result = await generate_with_gemini(sanitized_input)
    
    return result

def sanitize_ai_input(business_info: dict) -> dict:
    """Remove potentially dangerous content from AI prompts"""
    dangerous_patterns = [
        r'<script.*?</script>',
        r'javascript:',
        r'data:text/html',
        r'eval\(',
        r'exec\(',
    ]
    
    sanitized = {}
    for key, value in business_info.items():
        if isinstance(value, str):
            for pattern in dangerous_patterns:
                value = re.sub(pattern, '', value, flags=re.IGNORECASE)
            sanitized[key] = value.strip()[:1000]  # Limit length
        else:
            sanitized[key] = value
    
    return sanitized
```

---

## 🔒 Phase 4: Template & Rendering Security

### Template Security
```python
# template_security.py
from jinja2 import Environment, FileSystemLoader, select_autoescape
from jinja2.sandbox import SandboxedEnvironment
import bleach

class SecureTemplateRenderer:
    def __init__(self):
        self.env = SandboxedEnvironment(
            loader=FileSystemLoader('templates'),
            autoescape=select_autoescape(['html', 'xml']),
            # Disable dangerous functions
            finalize=self.secure_finalize
        )
    
    def secure_finalize(self, value):
        """Sanitize all template outputs"""
        if isinstance(value, str):
            return bleach.clean(
                value,
                tags=['b', 'i', 'u', 'strong', 'em', 'p', 'br'],
                attributes={},
                strip=True
            )
        return value
    
    def render_template(self, template_name: str, context: dict) -> str:
        # Validate context data
        sanitized_context = self.sanitize_context(context)
        
        template = self.env.get_template(template_name)
        return template.render(sanitized_context)
    
    def sanitize_context(self, context: dict) -> dict:
        """Sanitize template context to prevent XSS"""
        sanitized = {}
        for key, value in context.items():
            if isinstance(value, str):
                sanitized[key] = bleach.clean(value, strip=True)
            elif isinstance(value, dict):
                sanitized[key] = self.sanitize_context(value)
            elif isinstance(value, list):
                sanitized[key] = [
                    bleach.clean(item, strip=True) if isinstance(item, str) else item
                    for item in value
                ]
            else:
                sanitized[key] = value
        return sanitized
```

### Rendering Security
```python
# rendering_security.py
import docker
import tempfile
import os
import subprocess
from pathlib import Path

class SecureRenderer:
    def __init__(self):
        self.docker_client = docker.from_env()
        self.temp_dir = Path("/tmp/polario_render")
        self.temp_dir.mkdir(exist_ok=True)
    
    async def render_pdf(self, html_content: str) -> bytes:
        # Create secure temporary directory
        with tempfile.TemporaryDirectory(dir=self.temp_dir) as temp_dir:
            html_file = Path(temp_dir) / "input.html"
            pdf_file = Path(temp_dir) / "output.pdf"
            
            # Write HTML to secure location
            html_file.write_text(html_content, encoding='utf-8')
            
            # Run Playwright in Docker container for isolation
            container = self.docker_client.containers.run(
                'mcr.microsoft.com/playwright:v1.40.0-focal',
                command=[
                    'node', '-e', 
                    f"""
                    const {{ chromium }} = require('playwright');
                    (async () => {{
                        const browser = await chromium.launch();
                        const page = await browser.newPage();
                        await page.goto('file:///tmp/input.html');
                        await page.pdf({{ 
                            path: '/tmp/output.pdf',
                            format: 'A4',
                            printBackground: true
                        }});
                        await browser.close();
                    }})();
                    """
                ],
                volumes={
                    temp_dir: {'bind': '/tmp', 'mode': 'rw'}
                },
                # Security constraints
                mem_limit='512m',
                cpu_quota=50000,  # 0.5 CPU
                network_disabled=True,
                remove=True,
                detach=False,
                user='1000:1000'  # Non-root user
            )
            
            if pdf_file.exists():
                pdf_content = pdf_file.read_bytes()
                
                # Validate PDF file
                if self.is_valid_pdf(pdf_content):
                    return pdf_content
                else:
                    raise Exception("Generated PDF failed validation")
            else:
                raise Exception("PDF generation failed")
    
    def is_valid_pdf(self, content: bytes) -> bool:
        """Validate PDF file integrity"""
        if len(content) < 100:
            return False
        
        # Check PDF header
        if not content.startswith(b'%PDF-'):
            return False
        
        # Check for PDF trailer
        if b'%%EOF' not in content[-100:]:
            return False
        
        return True
```

---

## 🔒 Production Security Headers

### Next.js Security Headers
```typescript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.dev;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https:;
              font-src 'self';
              connect-src 'self' https://api.clerk.dev https://*.convex.cloud;
              frame-src https://clerk.dev;
            `.replace(/\s+/g, ' ').trim()
          }
        ]
      }
    ];
  }
};
```

---

## 🔒 Environment Security

### Secure Environment Setup
```bash
# .env.production (example - use your actual values)
# Never commit this file!

# Convex (Production)
CONVEX_DEPLOYMENT=your-prod-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-prod-deployment.convex.cloud

# Clerk (Production)  
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# FastAPI
FASTAPI_URL=https://api.yourdomain.com
FASTAPI_SECRET_KEY=your-256-bit-secret-key

# Google AI
GOOGLE_AI_API_KEY=your-production-api-key

# Additional Security
SESSION_SECRET=your-session-secret-256-bits
ENCRYPTION_KEY=your-encryption-key-256-bits
```

### Environment Validation
```typescript
// lib/env-validation.ts
import { z } from 'zod';

const envSchema = z.object({
  CONVEX_DEPLOYMENT: z.string().min(1),
  NEXT_PUBLIC_CONVEX_URL: z.string().url(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  CLERK_SECRET_KEY: z.string().startsWith('sk_'),
  CLERK_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  FASTAPI_URL: z.string().url(),
  FASTAPI_SECRET_KEY: z.string().min(32),
  GOOGLE_AI_API_KEY: z.string().min(1),
});

export const env = envSchema.parse(process.env);
```

---

This security implementation guide ensures that every aspect of Polario is built with production-grade security from day one. Each code example can be directly implemented in your project to maintain the highest security standards while delivering the core functionality.

Remember: **Security is not optional** - it's a fundamental requirement for any application handling user data and payments.

