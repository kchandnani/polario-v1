"""
Enhanced AI Content Generation Service
Multi-stage copywriting intelligence with industry-specific optimization
"""

import google.generativeai as genai
import json
import asyncio
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from app.core.config import settings
from app.models.content import ContentRequest, ContentResponse, CopyData
from app.services.industry_intelligence import IndustryIntelligence

class AIService:
    """Enhanced AI service with copywriting intelligence"""
    
    def __init__(self):
        """Initialize AI service"""
        if not settings.GOOGLE_AI_API_KEY:
            raise ValueError("GOOGLE_AI_API_KEY is required")
            
        genai.configure(api_key=settings.GOOGLE_AI_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.industry_intel = IndustryIntelligence()
        
    async def generate_content(self, request: ContentRequest) -> ContentResponse:
        """
        Generate enhanced marketing copy using multi-stage AI processing
        
        Args:
            request: Content generation request with business info
            
        Returns:
            Enhanced marketing copy with professional copywriting
        """
        
        try:
            # Stage 1: Business Analysis & Strategy
            analysis = await self._analyze_business(request)
            
            # Stage 2: Content Generation with Copywriting Intelligence  
            copy_data = await self._generate_copy(request, analysis)
            
            # Stage 3: Validation & Conformance
            validated_copy = await self._validate_and_conform(copy_data)
            
            return ContentResponse(
                success=True,
                copy_data=validated_copy,
                analysis=analysis,
                message="Content generated successfully"
            )
            
        except Exception as e:
            # Fallback to safe defaults
            print(f"AI generation failed: {e}")
            fallback_copy = self._create_fallback_content(request)
            
            return ContentResponse(
                success=False,
                copy_data=fallback_copy,
                analysis=None,
                message=f"Used fallback content due to AI error: {str(e)}"
            )
    
    async def _analyze_business(self, request: ContentRequest) -> Dict[str, Any]:
        """
        Stage 1: Analyze business and create marketing strategy
        """
        
        # Get industry-specific intelligence
        industry_data = self.industry_intel.get_industry_data(request.business_info.type)
        
        analysis_prompt = f"""
        Analyze this business and create a comprehensive marketing strategy:

        BUSINESS INFORMATION:
        - Name: {request.business_info.name}
        - Industry: {request.business_info.type}
        - Description: {request.business_info.description}
        - Target Audience: {request.business_info.target_audience or "General"}
        - Key Benefits: {', '.join(request.business_info.key_benefits or [])}
        
        SELECTED FEATURES:
        {', '.join(request.selected_features)}
        
        INDUSTRY CONTEXT:
        - Common Pain Points: {', '.join(industry_data['pain_points'])}
        - Power Words: {', '.join(industry_data['power_words'])}
        - Effective CTAs: {', '.join(industry_data['cta_patterns'])}

        Provide a strategic analysis identifying:
        1. Primary target audience pain points
        2. Unique value proposition that differentiates from competitors
        3. Emotional drivers that motivate purchase decisions
        4. Competitive positioning angle
        5. Primary conversion goal and urgency factors
        6. Recommended messaging tone and style

        CRITICAL: Return ONLY a valid JSON object. No explanations, no markdown, no code blocks.
        
        Required JSON structure:
        {{
            "target_pain_points": ["pain1", "pain2", "pain3"],
            "unique_value_prop": "clear value proposition",
            "emotional_drivers": ["driver1", "driver2"],
            "positioning_angle": "competitive positioning",
            "conversion_goal": "primary goal",
            "urgency_factors": ["factor1", "factor2"],
            "messaging_tone": "professional/friendly/bold",
            "key_differentiators": ["diff1", "diff2", "diff3"]
        }}
        
        Example for software company:
        {{
            "target_pain_points": ["manual processes", "time waste", "human errors"],
            "unique_value_prop": "Automate your workflow in minutes, not months",
            "emotional_drivers": ["efficiency", "growth", "peace_of_mind"],
            "positioning_angle": "fastest implementation in the market",
            "conversion_goal": "trial_signup",
            "urgency_factors": ["competitive_advantage", "limited_time"],
            "messaging_tone": "professional",
            "key_differentiators": ["speed", "ease_of_use", "support"]
        }}
        """
        
        try:
            response = await self._call_gemini(analysis_prompt)
            # Clean the response to ensure valid JSON
            cleaned_response = self._clean_json_response(response)
            return json.loads(cleaned_response)
        except Exception as e:
            print(f"Business analysis failed: {e}")
            return self._create_fallback_analysis(request, industry_data)
    
    async def _generate_copy(self, request: ContentRequest, analysis: Dict[str, Any]) -> CopyData:
        """
        Stage 2: Generate compelling copy based on strategic analysis
        """
        
        copywriting_prompt = f"""
        Based on this strategic analysis, write compelling brochure copy that converts:

        STRATEGIC ANALYSIS:
        - Target Pain Points: {', '.join(analysis.get('target_pain_points', []))}
        - Value Proposition: {analysis.get('unique_value_prop', '')}
        - Emotional Drivers: {', '.join(analysis.get('emotional_drivers', []))}
        - Positioning: {analysis.get('positioning_angle', '')}
        - Tone: {analysis.get('messaging_tone', 'professional')}
        
        BUSINESS CONTEXT:
        - Business: {request.business_info.name}
        - Industry: {request.business_info.type}
        - Description: {request.business_info.description}
        - Features: {', '.join(request.selected_features)}

        COPYWRITING REQUIREMENTS:
        - Headline: Benefit-focused, emotionally resonant (≤90 characters)
        - Subheadline: Clarifies value prop, addresses main pain point (≤140 characters)  
        - 3 Feature Bullets: Transform features into customer benefits with specifics
        - CTA: Action-oriented with urgency/value proposition
        - Palette: Choose from professional options based on industry/tone

        COPYWRITING BEST PRACTICES:
        - Use power words that resonate with the target audience
        - Include specific metrics, timeframes, or outcomes where possible
        - Address objections preemptively
        - Create urgency without being pushy
        - Focus on customer outcomes, not just features
        - Use social proof elements when appropriate

        STRICT CHARACTER LIMITS:
        - Headline: ≤90 characters
        - Subheadline: ≤140 characters
        - Bullet titles: ≤28 characters each
        - Bullet descriptions: ≤120 characters each
        - CTA label: ≤25 characters
        - CTA sub: ≤50 characters (optional)
        
        PALETTE OPTIONS (choose one based on business type/tone):
        - "classic_graphite": Professional, corporate (steel/copper)
        - "polished_nickel": Modern, tech-focused (nickel/warm metal)
        - "slate_copper": Bold, confident brands (dark slate/copper)
        - "soft_tungsten": Luxury, premium (tungsten/brown)
        - "charcoal_bronze": High contrast, bold (charcoal/bronze)
        - "pewter_gold": Classic, traditional (pewter/gold)
        
        STYLE ANALYSIS:
        Analyze the business and suggest design preferences:
        - tone: "professional" (B2B/services), "minimal" (tech/modern), "bold" (consumer/lifestyle)
        - variant_bias: "steel" (corporate), "copper" (warm/personal), "nickel" (tech), "tungsten" (luxury), "charcoal" (bold), "pewter" (classic)
        - layout_bias: "hero-right" (services), "hero-left" (products), "hero-full" (lifestyle/visual)

        CRITICAL: Return ONLY a valid JSON object. No explanations, no markdown, no code blocks.
        
        Required JSON structure:
        {{
            "headline": "benefit-focused headline",
            "subheadline": "value prop clarification",
            "bullets": [
                {{
                    "title": "Feature Benefit 1",
                    "desc": "Specific customer outcome with metrics/timeframe"
                }},
                {{
                    "title": "Feature Benefit 2", 
                    "desc": "Specific customer outcome with metrics/timeframe"
                }},
                {{
                    "title": "Feature Benefit 3",
                    "desc": "Specific customer outcome with metrics/timeframe"
                }}
            ],
            "cta": {{
                "label": "Action-oriented CTA",
                "sub": "Urgency/value element"
            }},
            "palette": "classic_graphite"
        }}
        
        Example for accounting software:
        {{
            "headline": "Streamline Your Books, Grow Your Business",
            "subheadline": "Professional accounting software designed for small business owners who want growth",
            "bullets": [
                {{
                    "title": "Automated Bookkeeping",
                    "desc": "Import transactions and categorize expenses automatically - saving 10+ hours per week"
                }},
                {{
                    "title": "Tax-Ready Reports",
                    "desc": "Built-in compliance tools ensure your books are always audit-ready with one-click reporting"
                }},
                {{
                    "title": "Real-Time Insights",
                    "desc": "Live dashboard shows cash flow and profit margins so you can make informed decisions"
                }}
            ],
            "cta": {{
                "label": "Start Your Free Trial",
                "sub": "No credit card required"
            }},
            "style_hints": {{
                "tone": "professional",
                "variant_bias": "steel",
                "layout_bias": "hero-right"
            }}
        }}
        """
        
        try:
            response = await self._call_gemini(copywriting_prompt)
            # Clean the response to ensure valid JSON
            cleaned_response = self._clean_json_response(response)
            copy_json = json.loads(cleaned_response)
            
            from app.models.content import BulletPoint, CallToAction
            
            # Create bullet points
            bullets = [
                BulletPoint(title=bullet["title"], desc=bullet["desc"])
                for bullet in copy_json["bullets"]
            ]
            
            # Create CTA if present
            cta = None
            if copy_json.get("cta"):
                cta = CallToAction(
                    label=copy_json["cta"]["label"],
                    sub=copy_json["cta"].get("sub")
                )
            
            return CopyData(
                headline=copy_json["headline"],
                subheadline=copy_json.get("subheadline"),
                bullets=bullets,
                cta=cta
            )
            
        except Exception as e:
            print(f"Copy generation failed: {e}")
            return self._create_fallback_copy_data(request)
    
    async def _validate_and_conform(self, copy_data: CopyData) -> CopyData:
        """
        Stage 3: Validate and conform content to strict constraints
        """
        
        # Character limit enforcement
        if len(copy_data.headline) > 90:
            copy_data.headline = copy_data.headline[:87] + "..."
            
        if copy_data.subheadline and len(copy_data.subheadline) > 140:
            copy_data.subheadline = copy_data.subheadline[:137] + "..."
        
        # Ensure exactly 3 bullets
        if len(copy_data.bullets) > 3:
            copy_data.bullets = copy_data.bullets[:3]
        elif len(copy_data.bullets) < 3:
            # Pad with generic bullets if needed
            from app.models.content import BulletPoint
            while len(copy_data.bullets) < 3:
                copy_data.bullets.append(BulletPoint(
                    title="Additional Value",
                    desc="More benefits and features designed specifically for your needs"
                ))
        
        # Validate bullet constraints
        for bullet in copy_data.bullets:
            if len(bullet.title) > 28:
                bullet.title = bullet.title[:25] + "..."
            if len(bullet.desc) > 120:
                bullet.desc = bullet.desc[:117] + "..."
        
        # Validate CTA constraints
        if copy_data.cta:
            if len(copy_data.cta.label) > 25:
                copy_data.cta.label = copy_data.cta.label[:22] + "..."
            if copy_data.cta.sub and len(copy_data.cta.sub) > 50:
                copy_data.cta.sub = copy_data.cta.sub[:47] + "..."
        
        return copy_data
    
    def _clean_json_response(self, response: str) -> str:
        """Clean AI response to ensure valid JSON"""
        # Remove common AI response prefixes/suffixes
        response = response.strip()
        
        # Remove markdown code blocks if present
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
        
        # Find JSON object boundaries
        start = response.find('{')
        end = response.rfind('}') + 1
        
        if start != -1 and end > start:
            response = response[start:end]
        
        return response.strip()

    async def _call_gemini(self, prompt: str) -> str:
        """Call Gemini API with retry logic"""
        
        max_retries = 2
        for attempt in range(max_retries):
            try:
                response = self.model.generate_content(
                    prompt,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.7,
                        max_output_tokens=2048,
                    )
                )
                
                if response.text:
                    return response.text.strip()
                else:
                    raise Exception("Empty response from Gemini")
                    
            except Exception as e:
                if attempt == max_retries - 1:
                    raise e
                await asyncio.sleep(1)  # Wait before retry
    
    def _create_fallback_analysis(self, request: ContentRequest, industry_data: Dict) -> Dict[str, Any]:
        """Create fallback analysis if AI fails"""
        return {
            "target_pain_points": industry_data['pain_points'][:3],
            "unique_value_prop": f"Professional {request.business_info.type.lower()} solution",
            "emotional_drivers": ["efficiency", "growth", "peace_of_mind"],
            "positioning_angle": "reliable and professional",
            "conversion_goal": "trial_signup",
            "urgency_factors": ["limited_time", "competitive_advantage"],
            "messaging_tone": "professional",
            "key_differentiators": ["quality", "reliability", "support"]
        }
    
    def _create_fallback_content(self, request: ContentRequest) -> CopyData:
        """Create safe fallback content if AI completely fails"""
        from app.models.content import BulletPoint, CallToAction
        
        business_name = request.business_info.name
        business_type = request.business_info.type
        
        return CopyData(
            headline=f"Professional {business_type} Solutions",
            subheadline=f"Trusted by businesses like yours to deliver exceptional results",
            bullets=[
                BulletPoint(
                    title="Quality Service",
                    desc=f"Professional {business_type.lower()} solutions tailored to your specific needs"
                ),
                BulletPoint(
                    title="Proven Results", 
                    desc="Track record of success helping businesses achieve their goals"
                ),
                BulletPoint(
                    title="Expert Support",
                    desc="Dedicated team ready to help you succeed every step of the way"
                )
            ],
            cta=CallToAction(
                label="Get Started Today",
                sub="Contact us for a free consultation"
            )
        )
    
    def _create_fallback_copy_data(self, request: ContentRequest) -> CopyData:
        """Create fallback copy data for stage 2 failures"""
        return self._create_fallback_content(request)
