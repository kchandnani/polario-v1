# 📖 Polario — Context & Knowledge Pack for Cursor

This document gives you *all* the context you need to restore Polario after our codebase loss. Treat it as your source of truth.  
You are not expected to guess or invent missing details — everything below defines how Polario should work.

---

## 🌐 Product Overview

Polario is an **AI-powered brochure generator**.  
User flow is simple:  
1. User signs in with **Clerk**.  
2. User fills out a **wizard** (business info, features, assets).  
3. AI (Gemini 2.5 Flash) generates structured marketing copy & layout JSON.  
4. That JSON populates a locked-down **HTML/CSS template**.  
5. Template is rendered into **PDF/PNG** by a browser engine (Playwright/Gotenberg).  
6. Outputs are stored in **Convex storage** and available via signed download links.  

---

## 🏗️ Current Architecture

- **Frontend**: Next.js 14 (App Router, TS, Tailwind, shadcn/ui)  
- **Auth**: Clerk (JWT → used in both frontend + FastAPI)  
- **Database & Storage**: Convex (real-time DB + file storage)  
- **Backend Compute**: FastAPI (stateless, handles AI calls, template render, orchestration)  
- **AI**: Google Gemini 2.5 Flash API  
- **Renderer**: Playwright (dedicated service, not inside serverless)  

---

## 📂 Core Data Contracts

### Copy JSON
```ts
{
  headline: string;
  subheadline?: string;
  bullets: { title: string; desc: string }[]; // exactly 3
  cta?: { label: string; sub?: string };
}
```

### Layout JSON
```ts
{
  template: "product_a"; // must exist in registry.json
  palette?: { primary: string; accent?: string };
  assets: { logo?: string; hero?: string }; // Convex signed URLs
  constraints?: {
    headline_max?: number;
    subheadline_max?: number;
    bullet_title_max?: number;
    bullet_desc_max?: number;
  };
}
```

### Job Status
```ts
{
  id: string;
  status: "queued" | "running" | "done" | "error";
  progress: number;
  resultId?: string;
  error?: string;
}
```

### Render Record
```ts
{
  id: string;
  pdfUrl: string;
  pngUrl?: string;
  createdAt: string;
}
```

---

## 🖼️ Template System

- Templates live in `/templates/`  
  - `base.css`: A4 print-safe CSS with tokens  
  - `product_a.html.jinja`: Hero, 3 Features, CTA (first template)  
  - `registry.json`: IDs → constraints (headline max 90, bullets = 3, hero 16:9, logo max 160×64)  

- Pipeline:  
  1. AI → Copy JSON & Layout JSON  
  2. FastAPI → Validate with Pydantic → Conform to registry  
  3. Jinja render → HTML string  
  4. Renderer → PDF/PNG  
  5. Upload to Convex → save `renders` row → signed URL  

---

## 🔄 Current Development Progress Before Crash

### Already completed:
- Frontend scaffolding (Next.js, Tailwind, shadcn/ui, wizard, dashboard)  
- Clerk authentication flow working  
- Convex project with tables: `users`, `projects`, `assets`, `jobs`, `renders`  
- FastAPI service with JWT verification + AI endpoints (`/api/ai/generate-copy`, `/api/ai/analyze-image`, `/api/ai/extract-colors`)  
- Gemini 2.5 Flash working and returning **validated copy**  
- Jobs orchestration in Convex (queued → running → done)  

### Not yet complete:
- File upload → Convex storage (UI ready, backend not connected)  
- Template integration (only starter HTML/Jinja, not wired in pipeline)  
- Renderer service (Playwright/Gotenberg not deployed)  
- Final PDF/PNG download flow (stubbed only)  
- Billing (Stripe) — postponed for Phase 4  

---

## ⚠️ Known Risks

- **Renderer deployment**: Fonts and memory need containerization (not serverless).  
- **Template quality**: Without previews, PDF must look polished first try.  
- **AI JSON drift**: Must enforce schemas + normalize before render.  
- **Cost safety**: Gemini calls behind usage limits + rate limiting.  

---

## ✅ MVP Acceptance Criteria

- User can sign in with Clerk.  
- User completes wizard.  
- AI generates Copy JSON + Layout JSON.  
- Template renders into PDF/PNG without errors.  
- Files stored in Convex storage.  
- User can download their brochure from dashboard.  

---

## 🎯 How You (Cursor) Fit In

You are NOT starting from scratch — v0 will deliver a clean frontend scaffold with stubbed APIs.  
Your responsibilities:
- Replace stub API calls with FastAPI proxy endpoints.  
- Wire file uploads to Convex storage (`generateUploadUrl`, `commitAsset`).  
- Replace mock jobs with Convex jobs table + real status.  
- Integrate FastAPI `/render` endpoint → Playwright → Convex storage.  
- Ensure schemas (Copy/Layout/TemplateContext) are strictly validated.  
- Harden error handling (bad AI JSON, renderer fail, asset too large).  

---

# 📌 Summary

Polario = Input → AI JSON → Template → PDF → Download.  
Infra = Clerk + Convex + FastAPI + Gemini + Renderer.  
Frontend = Next.js + Tailwind + shadcn/ui, scaffold delivered by v0.  
Cursor’s role = connect the dots, restore backend integrations, enforce schemas, ship MVP.  

**Once this doc is loaded, you’re ready to help us restore the product.**
