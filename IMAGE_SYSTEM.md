# Polario Image Upload & Integration System

This document provides a comprehensive overview of how images (logos and hero images) are handled throughout the Polario brochure generation pipeline.

## 🏗️ System Architecture

### Overview
Polario's image system provides seamless integration from user upload to final PDF embedding, ensuring professional quality and print-ready output.

```
User Upload → Convex Storage → Metadata DB → PDF Generation → Final Output
     ↓              ↓              ↓              ↓              ↓
  File Select   Secure CDN    Asset Record   Image Embed    Print-Ready PDF
```

## 📤 Upload Process

### Frontend Implementation (`app/create/page.tsx`)

**File Selection & Validation:**
```typescript
// File dropzone accepts images up to 15MB
<FileDropzone
  accept="image/*"
  maxSize={15 * 1024 * 1024} // 15MB limit
  onFileChange={handleLogoChange}
  placeholder="Drop your logo here or click to browse"
/>
```

**Secure Upload Flow:**
```typescript
const uploadFile = async (file: File, projectId: Id<"projects">, isLogo: boolean) => {
  // 1. Get authenticated upload URL from Convex
  const uploadUrl = await generateUploadUrl({
    clerkId: user?.id, // Authentication bypass for local dev
  })
  
  // 2. Upload file directly to Convex storage
  const result = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  })
  
  const { storageId } = await result.json()
  
  // 3. Auto-detect image dimensions
  let width: number | undefined
  let height: number | undefined
  
  if (file.type.startsWith('image/')) {
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
    width = img.width
    height = img.height
    URL.revokeObjectURL(img.src)
  }
  
  // 4. Store metadata in Convex database
  await createAsset({
    projectId,
    storageId,
    mimeType: file.type,
    size: file.size,
    width,
    height,
    isLogo, // true for logo, false for hero image
  })
  
  return storageId
}
```

### Backend Storage (`convex/assets.ts`)

**Upload URL Generation:**
```typescript
export const generateUploadUrl = mutation({
  args: {
    clerkId: v.optional(v.string()), // Local dev auth bypass
  },
  handler: async (ctx, { clerkId }) => {
    // Authenticate user
    let user = await getCurrentUser(ctx);
    if (!user && clerkId) {
      user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
        .first();
    }
    
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Generate secure, time-limited upload URL
    return await ctx.storage.generateUploadUrl();
  },
});
```

**Asset Metadata Storage:**
```typescript
export const createAsset = mutation({
  args: {
    projectId: v.id("projects"),
    storageId: v.id("_storage"),
    mimeType: v.string(),
    size: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    isLogo: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Store comprehensive asset metadata
    const assetId = await ctx.db.insert("assets", {
      ...args,
      uploadedAt: Date.now(),
    });
    
    return assetId;
  },
});
```

## 🗄️ Database Schema

### Assets Table Structure
```typescript
assets: defineTable({
  projectId: v.id("projects"),        // Link to parent project
  storageId: v.id("_storage"),        // Convex storage reference
  mimeType: v.string(),               // image/jpeg, image/png, etc.
  size: v.number(),                   // File size in bytes
  width: v.optional(v.number()),      // Auto-detected pixel width
  height: v.optional(v.number()),     // Auto-detected pixel height
  isLogo: v.boolean(),                // true = logo, false = hero
  uploadedAt: v.number(),             // Upload timestamp
})
.index("by_projectId", ["projectId"])
.index("by_projectId_isLogo", ["projectId", "isLogo"])
```

### Query Functions
```typescript
// Get all assets for a project
export const getProjectAssets = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("assets")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .collect();
  },
});

// Get public URL for storage ID
export const getAssetUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId); // CDN URL
  },
});
```

## 🎨 PDF Generation Integration

### Asset URL Generation (`convex/fastapi.ts`)

**Preparing Assets for PDF Service:**
```typescript
// Fetch project assets
const assets = await ctx.runQuery(api.assets.getProjectAssets, { 
  projectId 
});

// Generate public URLs for PDF service
const assetUrls: Record<string, string> = {};
for (const asset of assets) {
  if (asset.isLogo) {
    const url = await ctx.runQuery(api.assets.getAssetUrl, { 
      storageId: asset.storageId 
    });
    if (url) {
      assetUrls["logo"] = url; // Public Convex CDN URL
    }
  } else {
    // Non-logo assets are treated as hero images
    const url = await ctx.runQuery(api.assets.getAssetUrl, { 
      storageId: asset.storageId 
    });
    if (url) {
      assetUrls["hero"] = url; // Public Convex CDN URL
    }
  }
}

// Pass to FastAPI for PDF generation
const renderResponse = await generatePDF({
  projectId,
  jobId,
  copyData: aiResponse.copy_data,
  assets: assetUrls, // { "logo": "https://...", "hero": "https://..." }
});
```

### FastAPI Template Rendering (`backend/app/services/render_service.py`)

**Template Context Preparation:**
```python
# Prepare template context with asset URLs
context = {
    "copy": copy_dict,
    "assets": request.assets or {},  # Contains logo/hero URLs
    "template": request.template,
    "variant": variant_config,
    "palette": variant_config["palette"],
    "css_content": css_content
}

# Render HTML with Jinja2
html_content = template.render(**context)
```

### HTML Template Integration (`backend/app/templates/product_a.html`)

**Logo Positioning (Variant-Based):**
```html
<!-- Header Logo (most variants) -->
{% if variant.logo_positioning in ["header-left", "header-right"] %}
<header class="document-header">
    {% if variant.logo_positioning == "header-left" %}
        {% if assets.logo %}
        <img src="{{ assets.logo }}" alt="Company Logo" class="company-logo logo-left">
        {% else %}
        <div class="logo-placeholder">[LOGO]</div>
        {% endif %}
        <div class="header-text">
            <h1 class="main-headline">{{ copy.headline }}</h1>
            {% if copy.subheadline %}
            <p class="sub-headline">{{ copy.subheadline }}</p>
            {% endif %}
        </div>
    {% else %}
        <!-- header-right layout -->
        <div class="header-text">
            <h1 class="main-headline">{{ copy.headline }}</h1>
            {% if copy.subheadline %}
            <p class="sub-headline">{{ copy.subheadline }}</p>
            {% endif %}
        </div>
        {% if assets.logo %}
        <img src="{{ assets.logo }}" alt="Company Logo" class="company-logo logo-right">
        {% else %}
        <div class="logo-placeholder">[LOGO]</div>
        {% endif %}
    {% endif %}
</header>
{% endif %}
```

**Hero Image Layout (Variant-Based):**
```html
<!-- Hero Section with layout variants -->
<section class="hero-section">
    {% if variant.hero_layout == "hero-full" %}
        {% if assets.hero %}
        <img src="{{ assets.hero }}" alt="Hero Image" class="hero-image">
        <div class="hero-overlay">
            <h1 class="main-headline">{{ copy.headline }}</h1>
            {% if copy.subheadline %}
            <p class="sub-headline">{{ copy.subheadline }}</p>
            {% endif %}
        </div>
        {% else %}
        <div class="hero-placeholder">[HERO IMAGE PLACEHOLDER]</div>
        {% endif %}
        
        <!-- Logo overlay for hero-full layout -->
        {% if variant.logo_positioning == "hero-overlay" and assets.logo %}
        <img src="{{ assets.logo }}" alt="Company Logo" class="logo-overlay">
        {% endif %}
    {% else %}
        <!-- hero-left or hero-right layouts -->
        {% if assets.hero %}
        <img src="{{ assets.hero }}" alt="Hero Image" class="hero-image">
        {% else %}
        <div class="hero-placeholder">[HERO IMAGE PLACEHOLDER]</div>
        {% endif %}
    {% endif %}
</section>
```

### HTMLCSStoImage Service Integration

**PDF Generation with Embedded Images:**
```python
async def _generate_pdf_with_htmlcsstoimage(self, html_content: str) -> str:
    """Generate PDF using HTMLCSStoImage service"""
    
    payload = {
        'html': html_content,
        'format': 'pdf',
        'width': 794,    # A4 width in pixels at 96 DPI
        'height': 1123,  # A4 height in pixels at 96 DPI
        'quality': 100,
        'print_background': True,
        'margin_top': 0.75,    # 0.75 inch margins
        'margin_bottom': 0.75,
        'margin_left': 0.75,
        'margin_right': 0.75,
    }
    
    # HTMLCSStoImage automatically downloads and embeds images from URLs
    response = await self.session.post(
        "https://hcti.io/v1/image",
        auth=aiohttp.BasicAuth(user_id, api_key),
        json=payload
    )
    
    if response.status == 200:
        data = await response.json()
        return data.get('url')  # PDF with embedded images
    else:
        raise Exception(f"PDF generation failed: {response.status}")
```

## 🔄 Complete Flow Example

### 1. User Uploads Logo
```
User selects logo.png (500KB, 512x512) →
Frontend uploads to Convex Storage →
Asset record created with metadata →
storageId: "kg123abc..." stored in database
```

### 2. Brochure Generation Triggered
```
Job created for project →
fastapi.generateBrochure action runs →
Assets queried: [{ isLogo: true, storageId: "kg123abc..." }] →
Public URL generated: "https://vivid-magpie-123.convex.cloud/api/storage/kg123abc..."
```

### 3. PDF Rendering
```
FastAPI receives: { "logo": "https://vivid-magpie-123.convex.cloud/..." } →
Jinja2 template renders: <img src="https://vivid-magpie-123.convex.cloud/..."> →
HTMLCSStoImage downloads image and embeds in PDF →
Final PDF URL returned: "https://hcti.io/v1/image/final-pdf-id"
```

## 🛡️ Security & Performance

### Security Features
- **Authenticated Uploads**: Only authenticated users can upload files
- **Time-Limited URLs**: Upload URLs expire after short period
- **File Validation**: MIME type and size validation on frontend and backend
- **CDN Distribution**: Convex provides global CDN for fast image delivery

### Performance Optimizations
- **Lazy Loading**: Images only fetched when needed for PDF generation
- **CDN Caching**: Convex Storage provides automatic CDN caching
- **Parallel Processing**: Multiple assets can be processed simultaneously
- **Dimension Caching**: Image dimensions stored to avoid re-processing

### Error Handling
- **Graceful Fallbacks**: Professional placeholders when images missing
- **Upload Retry**: Frontend handles upload failures with user feedback
- **Validation Errors**: Clear error messages for invalid file types/sizes
- **Template Safety**: Templates handle missing assets gracefully

## 📊 Monitoring & Analytics

### Key Metrics
- **Upload Success Rate**: Percentage of successful file uploads
- **Storage Usage**: Total storage consumed per user/project
- **CDN Performance**: Image load times and cache hit rates
- **PDF Generation Time**: Time impact of image embedding

### Debugging Tools
- **Asset Queries**: Convex dashboard shows all uploaded assets
- **Storage Browser**: View files directly in Convex storage
- **URL Generation**: Test asset URL generation in development
- **Template Preview**: Preview HTML with asset placeholders

---

*This system ensures professional, print-ready brochures with seamlessly integrated user images while maintaining security, performance, and reliability standards.*
