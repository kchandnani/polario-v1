# Polario FastAPI Backend

Enhanced AI-powered brochure generation service with multi-stage copywriting intelligence.

## Features

- **Multi-Stage AI Processing**: Business analysis → Copywriting → Validation
- **Industry Intelligence**: Industry-specific copywriting patterns and optimization
- **Professional Templates**: Print-ready HTML/CSS templates with Jinja2
- **PDF Generation**: High-quality PDF rendering using Playwright
- **Clerk Authentication**: Secure JWT-based authentication
- **Convex Integration**: Direct integration with Convex database and storage

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
playwright install chromium
```

### 2. Environment Setup

```bash
cp env.example .env
# Edit .env with your API keys
```

### 3. Run Development Server

```bash
python main.py
```

The API will be available at `http://localhost:8000`

- **API Documentation**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/api/health`

## API Endpoints

### Health & Status
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed service status

### AI Content Generation
- `POST /api/ai/generate-copy` - Generate marketing copy with AI
- `POST /api/ai/test-analysis` - Test business analysis stage

### Brochure Rendering  
- `POST /api/render/generate` - Generate PDF/PNG brochure
- `GET /api/render/templates` - List available templates

## AI Processing Pipeline

### Stage 1: Business Analysis
- Analyzes business info and selected features
- Identifies target audience pain points
- Determines unique value proposition
- Creates strategic positioning

### Stage 2: Copywriting Intelligence
- Transforms features into customer benefits
- Applies industry-specific power words
- Creates emotional resonance
- Optimizes for conversion

### Stage 3: Validation & Conformance
- Enforces character limits
- Ensures exactly 3 bullet points
- Validates content structure
- Applies fallbacks if needed

## Template System

Templates are located in `app/templates/` and use Jinja2 templating:

- **Base CSS**: `base.css` - Print-optimized styles
- **Product A**: `product_a.html` - Hero + 3 Features + CTA
- **Registry**: `registry.json` - Template constraints and metadata

### Adding New Templates

1. Create new HTML template in `app/templates/`
2. Add entry to `registry.json`
3. Update `RenderService` if needed

## Industry Intelligence

The system includes built-in intelligence for:

- Software/SaaS
- Restaurants  
- Healthcare
- Professional Services
- Retail
- Education
- Fitness

Each industry has specific:
- Pain points
- Power words
- Social proof patterns
- CTA patterns
- Messaging tone

## Development

### Project Structure

```
backend/
├── app/
│   ├── api/          # FastAPI routes
│   ├── core/         # Configuration and auth
│   ├── models/       # Pydantic models
│   ├── services/     # Business logic
│   └── templates/    # Jinja2 templates
├── main.py           # Application entry point
└── requirements.txt  # Dependencies
```

### Environment Variables

```bash
# Required
GOOGLE_AI_API_KEY=your_gemini_api_key
CLERK_SECRET_KEY=your_clerk_secret

# Optional
CLERK_JWT_ISSUER_DOMAIN=your_domain.clerk.accounts.dev
CONVEX_DEPLOYMENT=your_convex_deployment
ALLOWED_ORIGINS=http://localhost:3000
```

### Testing

```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Test AI generation (requires auth)
curl -X POST http://localhost:8000/api/ai/generate-copy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "business_info": {
      "name": "Test Company",
      "type": "Software",
      "description": "We build great software"
    },
    "selected_features": ["Fast", "Reliable", "Secure"]
  }'
```

## Production Deployment

### Docker (Recommended)

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
RUN playwright install chromium

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Security Checklist

- [ ] Set strong `CLERK_SECRET_KEY`
- [ ] Configure `CLERK_JWT_ISSUER_DOMAIN`
- [ ] Restrict `ALLOWED_ORIGINS` to your domain
- [ ] Enable HTTPS in production
- [ ] Set up proper logging and monitoring
- [ ] Configure rate limiting
- [ ] Validate all file uploads
- [ ] Use environment-specific configs

## Troubleshooting

### Common Issues

**Playwright Installation**:
```bash
playwright install chromium
```

**Missing API Keys**:
Check `.env` file has all required variables

**CORS Issues**:
Update `ALLOWED_ORIGINS` in settings

**Template Rendering Errors**:
Check template syntax and required context variables
