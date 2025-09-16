# Polario - AI-Powered Professional Brochure Generator

Transform your business information into stunning, print-ready marketing brochures using advanced AI copywriting and professional templates.

## 🚀 Features

- **🧠 Enhanced AI Copywriting**: Multi-stage AI processing with industry-specific intelligence
- **🎨 Dynamic Variant System**: 6+ professional design styles with deterministic randomness
- **📄 PDF Generation**: High-quality PDF output with PNG thumbnails (A4 print-ready)
- **🖼️ Image Integration**: Logo and hero image upload with automatic embedding
- **🏭 Industry Intelligence**: Tailored messaging for 7+ business types
- **🎭 Smart Style Analysis**: AI-generated design hints based on business context
- **🔐 Secure Authentication**: Clerk-based user management
- **📊 Real-time Progress**: Live job tracking with WebSocket updates
- **☁️ Cloud Storage**: Convex-powered file storage and database

## 🏗️ Architecture

### Frontend (Next.js 15)
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: Clerk
- **Database**: Convex (real-time, serverless)
- **File Storage**: Convex Storage

### Backend (FastAPI)
- **API**: FastAPI with async support
- **AI**: Google Gemini 2.5 Flash
- **PDF Generation**: HTMLCSStoImage (serverless)
- **Templates**: Jinja2 + HTML/CSS with dynamic variants
- **Image Processing**: Automatic embedding with fallback placeholders
- **Industry Intelligence**: Built-in copywriting patterns
- **Variant System**: Deterministic design variations with professional palettes

## 🎨 Design Variant System

Polario uses a sophisticated variant system to ensure each brochure has a unique, professional appearance:

### **6 Professional Styles**
- **Minimal Steel**: Clean corporate design with steel/copper palette
- **Agency Copper**: Warm, personal style with copper accents
- **Editorial Nickel**: Modern, tech-focused with nickel tones
- **Executive Tungsten**: Luxury feel with tungsten/brown palette
- **Bold Charcoal**: High-contrast with charcoal/bronze
- **Classic Pewter**: Traditional with pewter/gold accents

### **Dynamic Features**
- **Deterministic Selection**: Same project always gets same style (reproducible)
- **AI Style Hints**: Business analysis influences design choices
- **Professional Palettes**: Metallic color schemes (no bright colors)
- **Layout Variations**: Hero positioning, logo placement, card styles
- **Print Optimization**: A4-ready with proper margins and typography

### **Customization Dimensions**
- Hero layout (left/right/full-width)
- Logo positioning (header-left/right/hero-overlay)  
- Feature card styles (outline/soft/divided)
- Icon treatments (numbers/checks/text-only)
- CTA styles (filled/outline/panel)
- Typography scaling (compact/normal/comfort)

## 🖼️ Image Upload & Integration

Polario seamlessly integrates user-uploaded images into professional brochures:

### **Upload Process**
- **Logo Upload**: Square format recommended, up to 15MB
- **Hero Image**: 16:9 aspect ratio recommended, up to 15MB
- **Secure Storage**: Files stored in Convex's built-in CDN storage
- **Auto-Processing**: Automatic dimension detection and metadata extraction

### **PDF Integration**
- **Dynamic Embedding**: Images automatically embedded in generated PDFs
- **Smart Positioning**: Logo and hero placement varies by design variant
- **Fallback System**: Professional placeholders when images not provided
- **Print Optimization**: Images sized and positioned for A4 layout

### **Technical Flow**
1. **Frontend**: Secure file upload via Convex `generateUploadUrl()`
2. **Storage**: Files stored with metadata in Convex database
3. **Generation**: Public URLs generated for PDF rendering service
4. **Rendering**: HTMLCSStoImage downloads and embeds images in final PDF
5. **Delivery**: High-quality PDFs with properly embedded images

## 🚦 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Python 3.11+
- Google AI API key
- Clerk account
- Convex account
- HTMLCSStoImage account (free tier available)

### 1. Frontend Setup

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Deploy Convex schema
npx convex dev

# Start development server
pnpm dev
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Configure environment
cp env.example .env
# Edit .env with your API keys (including HTMLCSStoImage credentials)

# Start FastAPI server
python main.py
```

## 🔑 Environment Variables

### Frontend (.env.local)
```bash
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Backend (.env)
```bash
GOOGLE_AI_API_KEY=your_gemini_api_key
CLERK_SECRET_KEY=sk_test_...
CONVEX_DEPLOYMENT=your-deployment-name
```

## 🎯 Usage

1. **Sign Up/Login**: Create account via Clerk authentication
2. **Create Project**: Enter business information and select features
3. **Upload Assets**: Add logo and hero images
4. **AI Generation**: Let AI create professional marketing copy
5. **Download**: Get PDF brochure and PNG thumbnail

## 🧠 AI Copywriting Pipeline

### Stage 1: Business Analysis
- Analyzes business type and target audience
- Identifies pain points and value propositions
- Determines optimal messaging tone

### Stage 2: Content Generation  
- Transforms features into customer benefits
- Applies industry-specific power words
- Creates emotional resonance and urgency

### Stage 3: Validation & Conformance
- Enforces character limits and constraints
- Ensures exactly 3 bullet points
- Applies fallback content if needed

## 🎨 Template System

### Product A Template
- **Layout**: Hero + 3 Features + CTA
- **Format**: A4/Letter print-ready
- **Assets**: 16:9 hero image, logo (160x64px max)
- **Constraints**: Headline ≤90 chars, bullets exactly 3

### Content Limits
- **Headline**: ≤90 characters
- **Subheadline**: ≤140 characters
- **Bullet Title**: ≤28 characters
- **Bullet Description**: ≤120 characters
- **CTA Label**: ≤25 characters

## 🏭 Industry Intelligence

Supports specialized copywriting for:
- **Software/SaaS**: Focus on automation, efficiency, scalability
- **Professional Services**: Emphasize expertise, results, ROI
- **Healthcare**: Highlight care quality, expertise, trust
- **Restaurants**: Feature freshness, convenience, experience
- **Retail**: Promote selection, value, convenience
- **Education**: Stress skill development, certification, flexibility
- **Fitness**: Motivate transformation, results, support

## 📁 Project Structure

```
polario/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── create/            # Brochure creation wizard
│   ├── dashboard/         # User dashboard
│   └── jobs/[id]/         # Job status pages
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── api/          # FastAPI routes
│   │   ├── services/     # Business logic
│   │   ├── models/       # Pydantic models
│   │   └── templates/    # Jinja2 templates
│   └── main.py           # FastAPI app
├── components/            # React components
├── convex/               # Convex functions
└── lib/                  # Utilities
```

## 🚀 Development Workflow

### Phase 1: Environment Setup ✅
- [x] Clerk authentication
- [x] Convex database
- [x] File upload system

### Phase 2: Core Features ✅  
- [x] Project creation wizard
- [x] Asset management
- [x] Job tracking system

### Phase 3: AI Integration ✅
- [x] FastAPI backend
- [x] Multi-stage AI pipeline
- [x] Industry intelligence
- [x] Professional templates

### Phase 4: Production (Next)
- [ ] Full integration testing
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Deployment setup

## 🔒 Security Features

- **Input Validation**: Pydantic models with strict validation
- **File Security**: MIME type checking, size limits (15MB)
- **Authentication**: JWT-based with Clerk
- **Rate Limiting**: API endpoint protection
- **CORS**: Configured for production domains
- **Environment Isolation**: Separate configs for dev/prod

## 📊 API Endpoints

### Frontend (Next.js API Routes)
- `GET /api/jobs/[id]` - Job status
- `POST /api/clerk/webhook` - User sync

### Backend (FastAPI)
- `GET /api/health` - Health check
- `POST /api/ai/generate-copy` - AI content generation
- `POST /api/render/generate` - PDF generation
- `GET /api/render/templates` - Template listing

## 🧪 Testing

### Frontend
```bash
pnpm test
```

### Backend
```bash
cd backend
python -m pytest
```

### End-to-End
```bash
pnpm test:e2e
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
vercel --prod
```

### Backend (Docker)
```bash
cd backend
docker build -t polario-api .
docker run -p 8000:8000 polario-api
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/kchandnani/polario-v1/issues)
- **Discussions**: [GitHub Discussions](https://github.com/kchandnani/polario-v1/discussions)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [FastAPI](https://fastapi.tiangolo.com/) - Python web framework
- [Convex](https://convex.dev/) - Real-time database
- [Clerk](https://clerk.dev/) - Authentication
- [Google AI](https://ai.google.dev/) - Gemini AI model
- [Playwright](https://playwright.dev/) - Browser automation
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components

---

**Built with ❤️ for creating professional marketing materials**
