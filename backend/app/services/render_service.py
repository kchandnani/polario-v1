"""
Brochure rendering service using Playwright
"""

import asyncio
import os
import tempfile
import time
from pathlib import Path
from typing import Dict, Any, Optional
from playwright.async_api import async_playwright, Browser, Page
from jinja2 import Environment, FileSystemLoader, Template
import aiofiles
import json

from app.models.content import RenderRequest, RenderResponse, LayoutData
from app.core.config import settings

class RenderService:
    """Service for rendering brochures to PDF and PNG"""
    
    def __init__(self):
        """Initialize render service"""
        self.browser: Optional[Browser] = None
        self.templates_dir = Path(__file__).parent.parent / "templates"
        
        # Initialize Jinja2 environment
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(self.templates_dir)),
            autoescape=True
        )
        
        # Load template registry
        self.template_registry = self._load_template_registry()
    
    async def generate_brochure(self, request: RenderRequest) -> RenderResponse:
        """
        Generate PDF and PNG brochure from content and assets
        
        Args:
            request: Render request with content and assets
            
        Returns:
            Response with PDF and PNG URLs
        """
        
        try:
            # Start browser if not already running
            if not self.browser:
                await self._start_browser()
            
            # Render HTML from template
            html_content = await self._render_template(request)
            
            # Generate PDF and PNG
            pdf_path, png_path = await self._generate_files(html_content)
            
            # Upload to Convex storage (placeholder for now)
            pdf_url = await self._upload_to_convex(pdf_path, "pdf")
            png_url = await self._upload_to_convex(png_path, "png")
            
            # Update job status in Convex
            await self._update_job_status(request.job_id, "completed", {
                "pdf_url": pdf_url,
                "png_url": png_url
            })
            
            # Clean up temp files
            os.unlink(pdf_path)
            os.unlink(png_path)
            
            return RenderResponse(
                success=True,
                pdf_url=pdf_url,
                png_url=png_url,
                message="Brochure generated successfully"
            )
            
        except Exception as e:
            # Update job with error
            await self._update_job_status(request.job_id, "error", {"error": str(e)})
            
            return RenderResponse(
                success=False,
                pdf_url=None,
                png_url=None,
                message=f"Generation failed: {str(e)}"
            )
    
    async def _start_browser(self):
        """Start Playwright browser"""
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(
            headless=True,
            args=[
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-web-security',
                '--font-render-hinting=none'
            ]
        )
    
    async def _render_template(self, request: RenderRequest) -> str:
        """
        Render HTML template with content and assets
        
        Args:
            request: Render request
            
        Returns:
            Rendered HTML content
        """
        
        # Get template
        template = self.jinja_env.get_template(f"{request.template}.html")
        
        # Prepare template context
        context = {
            "copy": request.copy_data.dict(),
            "assets": request.assets,
            "business_name": request.copy_data.headline,  # Fallback
            "template_name": request.template
        }
        
        # Render template
        html_content = template.render(**context)
        
        return html_content
    
    async def _generate_files(self, html_content: str) -> tuple[str, str]:
        """
        Generate PDF and PNG files from HTML content
        
        Args:
            html_content: Rendered HTML content
            
        Returns:
            Tuple of (pdf_path, png_path)
        """
        
        page = await self.browser.new_page()
        
        try:
            # Set page content
            await page.set_content(html_content, wait_until="networkidle")
            
            # Configure page for print
            await page.emulate_media(media="print")
            
            # Generate PDF
            pdf_path = tempfile.mktemp(suffix=".pdf")
            await page.pdf(
                path=pdf_path,
                format="A4",
                print_background=True,
                margin={
                    "top": "0.5in",
                    "right": "0.5in", 
                    "bottom": "0.5in",
                    "left": "0.5in"
                }
            )
            
            # Generate PNG thumbnail
            png_path = tempfile.mktemp(suffix=".png")
            await page.screenshot(
                path=png_path,
                full_page=True,
                type="png"
            )
            
            return pdf_path, png_path
            
        finally:
            await page.close()
    
    async def _upload_to_convex(self, file_path: str, file_type: str) -> str:
        """
        Upload file to Convex storage
        
        Args:
            file_path: Path to file to upload
            file_type: Type of file (pdf, png)
            
        Returns:
            Public URL for the uploaded file
        """
        
        # TODO: Implement actual Convex storage upload
        # For now, return a placeholder URL
        filename = os.path.basename(file_path)
        return f"https://mock-storage.convex.dev/{file_type}/{filename}"
    
    async def _update_job_status(self, job_id: str, status: str, data: Dict[str, Any]):
        """
        Update job status in Convex
        
        Args:
            job_id: Job ID to update
            status: New status (completed, error)
            data: Additional data to store
        """
        
        # TODO: Implement actual Convex job update
        # For now, just log the update
        print(f"Job {job_id} status updated to {status}: {data}")
    
    def _load_template_registry(self) -> Dict[str, Any]:
        """Load template registry configuration"""
        
        registry_path = self.templates_dir / "registry.json"
        
        if registry_path.exists():
            with open(registry_path, 'r') as f:
                return json.load(f)
        
        # Default registry if file doesn't exist
        return {
            "templates": {
                "product_a": {
                    "name": "Product A",
                    "description": "Hero + 3 Features + CTA",
                    "constraints": {
                        "headline_max": 90,
                        "subheadline_max": 140,
                        "bullet_title_max": 28,
                        "bullet_desc_max": 120,
                        "bullets_count": 3
                    }
                }
            },
            "default": "product_a"
        }
    
    async def close(self):
        """Close browser and cleanup resources"""
        if self.browser:
            await self.browser.close()
            self.browser = None
