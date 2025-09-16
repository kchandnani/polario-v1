"""
Brochure rendering service using HTMLCSStoImage for serverless PDF generation
"""

import asyncio
import os
import tempfile
import time
import aiohttp
import base64
from pathlib import Path
from typing import Dict, Any, Optional
from jinja2 import Environment, FileSystemLoader, Template
import aiofiles
import json

from app.models.content import RenderRequest, RenderResponse, LayoutData
from app.core.config import settings

class RenderService:
    """Service for rendering brochures to PDF and PNG using HTMLCSStoImage"""
    
    def __init__(self):
        """Initialize render service"""
        self.templates_dir = Path(__file__).parent.parent / "templates"
        
        # Initialize Jinja2 environment
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(self.templates_dir)),
            autoescape=True
        )
        
        # HTMLCSStoImage API configuration
        self.api_base = "https://hcti.io/v1"
        
        # Get API credentials from environment variables
        self.api_user = os.getenv("HTMLCSSTOIMAGE_USER_ID")
        self.api_key = os.getenv("HTMLCSSTOIMAGE_API_KEY")
        
        if not self.api_user or not self.api_key:
            raise ValueError("HTMLCSSTOIMAGE_USER_ID and HTMLCSSTOIMAGE_API_KEY environment variables are required")
        
    async def generate_brochure(self, request: RenderRequest) -> RenderResponse:
        """
        Generate PDF and PNG brochure from content and assets
        
        Args:
            request: RenderRequest containing copy data, layout, and assets
            
        Returns:
            RenderResponse with URLs to generated files
        """
        
        try:
            print(f"🔍 DEBUG: Starting generate_brochure")
            start_time = time.time()
            
            # Step 1: Load and render HTML template
            print(f"🔍 DEBUG: Step 1 - Rendering HTML template")
            html_content = await self._render_html_template(request)
            print(f"🔍 DEBUG: HTML template rendered, length: {len(html_content)}")
            
            # Step 2: Generate PDF using HTMLCSStoImage
            print(f"🔍 DEBUG: Step 2 - Starting PDF generation")
            pdf_url = await self._generate_pdf(html_content)
            print(f"🔍 DEBUG: PDF generation completed, URL: {pdf_url}")
            
            # Step 3: Generate PNG thumbnail (optional)
            print(f"🔍 DEBUG: Step 3 - Starting PNG generation")
            png_url = await self._generate_png(html_content)
            print(f"🔍 DEBUG: PNG generation completed, URL: {png_url}")
            
            generation_time = time.time() - start_time
            
            response = RenderResponse(
                success=True,
                pdf_url=pdf_url,
                png_url=png_url,
                render_time=generation_time,
                message=f"Brochure generated successfully in {generation_time:.2f}s"
            )
            
            print(f"🔍 DEBUG: Final response: success={response.success}, pdf_url={response.pdf_url}, png_url={response.png_url}")
            return response
            
        except Exception as e:
            print(f"🔍 DEBUG: Exception in generate_brochure: {str(e)}")
            response = RenderResponse(
                success=False,
                pdf_url=None,
                png_url=None,
                render_time=0,
                message=f"Brochure generation failed: {str(e)}"
            )
            print(f"🔍 DEBUG: Error response: {response}")
            return response
    
    async def _render_html_template(self, request: RenderRequest) -> str:
        """Render HTML template with provided data"""
        
        try:
            # Get template from request
            template_name = request.template + ".html"
            template = self.jinja_env.get_template(template_name)
            
            # Prepare template context
            context = {
                "copy": request.copy_data.dict(),
                "assets": request.assets or {},
                "template": request.template,
                "palette": {"primary": "#2563eb"}  # Default palette
            }
            
            # Render HTML
            html_content = template.render(**context)
            
            return html_content
            
        except Exception as e:
            raise Exception(f"Template rendering failed: {str(e)}")
    
    async def _generate_pdf(self, html_content: str) -> str:
        """Generate PDF using HTMLCSStoImage API"""
        
        try:
            print(f"🔍 DEBUG: Starting PDF generation with HTML length: {len(html_content)}")
            print(f"🔍 DEBUG: API credentials - User: {self.api_user}, Key: {'*' * len(self.api_key) if self.api_key else 'None'}")
            
            async with aiohttp.ClientSession() as session:
                # Prepare API request
                auth = aiohttp.BasicAuth(self.api_user, self.api_key)
                data = {
                    "html": html_content,
                    "format": "pdf",
                    "width": 595,  # A4 width in points
                    "height": 842, # A4 height in points
                    "device_scale": 2,
                    "print_background": True
                }
                
                print(f"🔍 DEBUG: Making request to {self.api_base}/image")
                
                # Make API request
                async with session.post(
                    f"{self.api_base}/image",
                    auth=auth,
                    json=data
                ) as response:
                    
                    print(f"🔍 DEBUG: HTMLCSStoImage response status: {response.status}")
                    
                    if response.status == 200:
                        result = await response.json()
                        pdf_url = result.get("url", "")
                        print(f"🔍 DEBUG: PDF generated successfully: {pdf_url}")
                        return pdf_url
                    else:
                        error_text = await response.text()
                        print(f"🔍 DEBUG: HTMLCSStoImage error: {response.status} - {error_text}")
                        raise Exception(f"PDF generation failed: {response.status} - {error_text}")
                        
        except Exception as e:
            print(f"🔍 DEBUG: PDF generation exception: {str(e)}")
            raise Exception(f"PDF generation error: {str(e)}")
    
    async def _generate_png(self, html_content: str) -> Optional[str]:
        """Generate PNG thumbnail using HTMLCSStoImage API"""
        
        try:
            async with aiohttp.ClientSession() as session:
                # Prepare API request
                auth = aiohttp.BasicAuth(self.api_user, self.api_key)
                data = {
                    "html": html_content,
                    "format": "png",
                    "width": 595,
                    "height": 842,
                    "device_scale": 1,
                    "print_background": True
                }
                
                # Make API request
                async with session.post(
                    f"{self.api_base}/image",
                    auth=auth,
                    json=data
                ) as response:
                    
                    if response.status == 200:
                        result = await response.json()
                        return result.get("url", "")
                    else:
                        # PNG generation is optional, don't fail the whole process
                        print(f"PNG generation failed: {response.status}")
                        return None
                        
        except Exception as e:
            print(f"PNG generation error: {str(e)}")
            return None
    
    async def get_available_templates(self) -> Dict[str, Any]:
        """Get list of available templates"""
        
        try:
            registry_path = self.templates_dir / "registry.json"
            
            if registry_path.exists():
                async with aiofiles.open(registry_path, 'r') as f:
                    content = await f.read()
                    registry = json.loads(content)
                    return registry
            else:
                return {
                    "templates": {
                        "product_a": {
                            "name": "Product A",
                            "description": "Hero + 3 Features + CTA layout"
                        }
                    },
                    "default": "product_a"
                }
                
        except Exception as e:
            raise Exception(f"Failed to load templates: {str(e)}")