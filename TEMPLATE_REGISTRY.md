# Polario Template Registry

This document defines the constraints, variants, and behavior of the Polario brochure template system.

## 📋 Content Constraints

### Text Limits
- **Headline**: ≤90 characters
- **Subheadline**: ≤140 characters  
- **Bullet Titles**: ≤28 characters each
- **Bullet Descriptions**: ≤120 characters each
- **CTA Label**: ≤25 characters
- **CTA Subtitle**: ≤50 characters (optional)
- **Bullet Count**: Exactly 3 required

### Asset Requirements
- **Logo**: Square format recommended, PNG/JPG, ≤15MB
- **Hero Image**: 16:9 aspect ratio recommended, PNG/JPG, ≤15MB, ≥1600px width optimal
- **Storage**: Convex built-in storage with CDN delivery
- **Processing**: Automatic dimension detection and metadata extraction
- **Fallbacks**: Professional placeholders for missing images

### Print Specifications
- **Page Size**: A4 (8.27" × 11.69")
- **Margins**: 0.75" on all sides
- **Typography**: 10-12pt base, print-safe fonts
- **Colors**: Professional metallic palettes only

## 🎨 Variant Dimensions

### Hero Layout Options
- `hero-right`: Copy left, image right (50/50 split)
- `hero-left`: Copy right, image left (50/50 split)  
- `hero-full`: Full-width image with overlay text

### Header Emphasis Styles
- `underline`: Steel rule under headline
- `accent-bar`: Thin accent band above headline
- `none`: Clean, minimal header

### Feature Card Styles
- `outline`: 1px border with clean lines
- `soft`: Subtle shadow, no border
- `divided`: Top accent border with extra whitespace

### Feature Icon Treatments
- `number-badges`: Numbered circles (1, 2, 3)
- `check-icons`: Minimal checkmark icons
- `no-icons`: Text-only with typographic emphasis

### CTA Band Styles
- `filled-steel`: Primary color background, white text
- `copper-outline`: White background, accent border
- `light-panel`: Light gray panel with dark button

### Logo Positioning
- `header-left`: Logo in header left, text right
- `header-right`: Logo in header right, text left
- `hero-overlay`: Logo overlaid on hero image (bottom-right)

### Visual Details
- **Card Corners**: `rounded-md` (8px) or `rounded-lg` (12px)
- **Separators**: `none`, `subtle` (lines), or `dotted` (dashed lines)
- **Typography Scale**: `type-compact` (-1pt), `type-normal`, `type-comfort` (+1pt)
- **Micro-texture**: `paper-none`, `paper-subtle` (grain), `paper-grid` (dots)

## 🖼️ Image Integration System

### Upload & Storage Architecture
- **Frontend Upload**: Secure file upload via `generateUploadUrl()` mutation
- **Convex Storage**: Built-in file storage with CDN distribution
- **Metadata Tracking**: Asset records with dimensions, MIME type, size
- **Security**: Time-limited upload URLs with authentication

### Database Schema (Assets Table)
```typescript
assets: {
  projectId: v.id("projects"),
  storageId: v.id("_storage"),  // Convex storage reference
  mimeType: v.string(),         // image/jpeg, image/png, etc.
  size: v.number(),             // File size in bytes
  width: v.optional(v.number()), // Auto-detected image width
  height: v.optional(v.number()), // Auto-detected image height
  isLogo: v.boolean(),          // true for logo, false for hero
  uploadedAt: v.number(),       // Upload timestamp
}
```

### PDF Generation Flow
1. **Asset Retrieval**: `getAssetUrl()` generates public Convex URLs
2. **URL Mapping**: Assets mapped to `{ "logo": "url", "hero": "url" }`
3. **Template Rendering**: Jinja2 templates receive asset URLs
4. **Image Embedding**: HTMLCSStoImage downloads and embeds images
5. **Final Output**: PDF with properly positioned, embedded images

### Template Integration
```html
<!-- Logo positioning (varies by variant) -->
{% if assets.logo %}
<img src="{{ assets.logo }}" alt="Company Logo" class="company-logo">
{% else %}
<div class="logo-placeholder">[LOGO PLACEHOLDER]</div>
{% endif %}

<!-- Hero image (layout varies by variant) -->
{% if assets.hero %}
<img src="{{ assets.hero }}" alt="Hero Image" class="hero-image">
{% else %}
<div class="hero-placeholder">[HERO IMAGE PLACEHOLDER]</div>
{% endif %}
```

### Variant-Based Positioning
- **Logo**: Header-left/right or hero-overlay based on variant
- **Hero**: Left/right/full-width layout based on variant selection
- **Responsive**: Images scale appropriately for A4 print dimensions
- **Fallbacks**: Professional placeholders maintain layout integrity

### Quality Assurance
- **Format Support**: PNG, JPG, WebP, and other web formats
- **Size Limits**: 15MB maximum to ensure reasonable upload times
- **Dimension Validation**: Automatic detection prevents layout issues
- **Print Safety**: Images optimized for A4 print resolution

## 🎯 Palette Packs

### Classic Graphite
- **Primary**: #6C757D (Steel)
- **Accent**: #8D7A67 (Copper)
- **Light**: #F3F4F6
- **Use Case**: Professional, corporate

### Polished Nickel  
- **Primary**: #7A8087 (Nickel)
- **Accent**: #A18C7A (Warm metal)
- **Light**: #F5F6F8
- **Use Case**: Modern, tech-focused

### Slate & Copper
- **Primary**: #5B636B (Dark slate)
- **Accent**: #8C715E (Rich copper)
- **Light**: #EEF1F4
- **Use Case**: Bold, confident brands

### Soft Tungsten
- **Primary**: #6E6E72 (Tungsten)
- **Accent**: #9B8676 (Warm brown)
- **Light**: #F2F3F5
- **Use Case**: Luxury, premium

### Charcoal Bronze
- **Primary**: #4A5568 (Dark charcoal)
- **Accent**: #A0785C (Bronze)
- **Light**: #F7FAFC
- **Use Case**: High contrast, bold

### Pewter Gold
- **Primary**: #718096 (Pewter)
- **Accent**: #B7956D (Muted gold)
- **Light**: #F9FAFB
- **Use Case**: Classic, traditional

## 🎲 Variant Sets (Pre-approved Combinations)

### 1. Minimal Steel
- Hero: `hero-right` | Header: `underline` | Cards: `outline`
- Icons: `number-badges` | CTA: `copper-outline` | Logo: `header-left`
- Corners: `rounded-md` | Separators: `none` | Type: `type-normal`
- Texture: `paper-none` | Palette: `classic_graphite`

### 2. Agency Copper
- Hero: `hero-left` | Header: `accent-bar` | Cards: `soft`
- Icons: `check-icons` | CTA: `filled-steel` | Logo: `header-right`
- Corners: `rounded-lg` | Separators: `subtle` | Type: `type-comfort`
- Texture: `paper-subtle` | Palette: `slate_copper`

### 3. Editorial Nickel
- Hero: `hero-full` | Header: `none` | Cards: `divided`
- Icons: `no-icons` | CTA: `light-panel` | Logo: `hero-overlay`
- Corners: `rounded-md` | Separators: `dotted` | Type: `type-compact`
- Texture: `paper-grid` | Palette: `polished_nickel`

### 4. Executive Tungsten
- Hero: `hero-right` | Header: `accent-bar` | Cards: `soft`
- Icons: `number-badges` | CTA: `filled-steel` | Logo: `header-left`
- Corners: `rounded-lg` | Separators: `subtle` | Type: `type-normal`
- Texture: `paper-subtle` | Palette: `soft_tungsten`

### 5. Bold Charcoal
- Hero: `hero-left` | Header: `underline` | Cards: `outline`
- Icons: `check-icons` | CTA: `copper-outline` | Logo: `header-right`
- Corners: `rounded-md` | Separators: `none` | Type: `type-comfort`
- Texture: `paper-none` | Palette: `charcoal_bronze`

### 6. Classic Pewter
- Hero: `hero-full` | Header: `accent-bar` | Cards: `divided`
- Icons: `no-icons` | CTA: `light-panel` | Logo: `hero-overlay`
- Corners: `rounded-lg` | Separators: `dotted` | Type: `type-compact`
- Texture: `paper-grid` | Palette: `pewter_gold`

## ⚙️ Selection Algorithm

### Deterministic Seeding
```
seed = sha256(projectId + userId + createdAt).int % 6
variant = VARIANT_SETS[seed]
```

### AI Style Hints (Optional)
The AI can influence variant selection through style hints:

```json
{
  "style_hints": {
    "tone": "professional|minimal|bold",
    "variant_bias": "steel|copper|nickel|tungsten|charcoal|pewter",
    "layout_bias": "hero-left|hero-right|hero-full"
  }
}
```

### Fallback Behavior
- **Missing Logo**: `hero-overlay` falls back to `header-left`
- **Missing Hero Image**: All layouts show placeholder with proper dimensions
- **Invalid Hints**: System falls back to deterministic selection
- **Same Seed**: Always produces identical visual output (reproducible)

## ✅ Quality Assurance

### Print Safety Checklist
- [ ] All colors meet AA contrast standards on white background
- [ ] Typography is 10pt+ for print readability
- [ ] Page content fits within A4 margins (0.75")
- [ ] No content breaks across page boundaries awkwardly
- [ ] All images have appropriate fallback placeholders

### Variant Testing
- [ ] Each variant produces visually distinct output
- [ ] Same project ID generates identical results across renders
- [ ] Missing assets degrade gracefully
- [ ] All palette combinations are professional and print-safe
- [ ] Text length constraints are enforced

### Browser Compatibility
- [ ] PDF generation works in HTMLCSStoImage service
- [ ] Print media queries apply correctly
- [ ] Color preservation works (`color-adjust: exact`)
- [ ] Typography scales appropriately across variants

## 🔄 Future Enhancements

### Planned Features
- **"Regenerate Look" Button**: Increment seed for new variant
- **User Style Preferences**: Remember preferred variants per user
- **Industry-Specific Defaults**: Map business types to preferred palettes
- **Template A/B Testing**: Track which variants perform best

### Template Expansion
- **Multi-page Support**: Extend system for 2-page brochures
- **Additional Layouts**: Tri-fold, business card, flyer variants
- **Seasonal Palettes**: Holiday or seasonal color schemes
- **Brand Consistency**: Lock variants for enterprise customers

---

*This registry ensures consistent, professional brochure generation while providing visual variety and maintaining print quality standards.*
