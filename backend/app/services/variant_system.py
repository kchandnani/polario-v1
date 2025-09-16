"""
Polario Brochure Variant System
Deterministic design variations with seeded randomness
"""

import hashlib
from typing import Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class PalettePack:
    """Color palette for brochure variants"""
    name: str
    primary: str      # Steel/main color
    accent: str       # Copper/accent color  
    light: str        # Light panel color
    description: str

@dataclass
class VariantSet:
    """Complete variant configuration"""
    name: str
    hero_layout: str           # hero-right, hero-left, hero-full
    header_emphasis: str       # underline, accent-bar, none
    feature_card_style: str    # outline, soft, divided
    feature_icon_treatment: str # number-badges, check-icons, no-icons
    cta_band: str             # filled-steel, copper-outline, light-panel
    logo_positioning: str      # header-left, header-right, hero-overlay
    card_corners: str         # rounded-md, rounded-lg
    separators: str           # none, subtle, dotted
    typographic_scale: str    # type-normal, type-compact, type-comfort
    micro_texture: str        # paper-none, paper-subtle, paper-grid
    palette_pack: str         # References palette by name

class VariantSystem:
    """Manages brochure design variations with deterministic seeding"""
    
    # Define palette packs (metallic, print-safe)
    PALETTE_PACKS = {
        "classic_graphite": PalettePack(
            name="Classic Graphite",
            primary="#6C757D",   # Steel
            accent="#8D7A67",    # Copper
            light="#F3F4F6",     # Light gray
            description="Professional steel with warm copper accents"
        ),
        "polished_nickel": PalettePack(
            name="Polished Nickel", 
            primary="#7A8087",   # Nickel
            accent="#A18C7A",    # Warm metal
            light="#F5F6F8",     # Cool light
            description="Modern nickel with sophisticated warmth"
        ),
        "slate_copper": PalettePack(
            name="Slate & Copper",
            primary="#5B636B",   # Dark slate
            accent="#8C715E",    # Rich copper
            light="#EEF1F4",     # Clean light
            description="Bold slate with rich copper highlights"
        ),
        "soft_tungsten": PalettePack(
            name="Soft Tungsten",
            primary="#6E6E72",   # Tungsten
            accent="#9B8676",    # Warm brown
            light="#F2F3F5",     # Soft light
            description="Subtle tungsten with earthy accents"
        ),
        "charcoal_bronze": PalettePack(
            name="Charcoal Bronze",
            primary="#4A5568",   # Dark charcoal
            accent="#A0785C",    # Bronze
            light="#F7FAFC",     # Clean white
            description="Deep charcoal with bronze sophistication"
        ),
        "pewter_gold": PalettePack(
            name="Pewter Gold", 
            primary="#718096",   # Pewter
            accent="#B7956D",    # Muted gold
            light="#F9FAFB",     # Pure light
            description="Classic pewter with elegant gold touches"
        )
    }
    
    # Define pre-approved variant sets
    VARIANT_SETS = [
        VariantSet(
            name="Minimal Steel",
            hero_layout="hero-right",
            header_emphasis="underline", 
            feature_card_style="outline",
            feature_icon_treatment="number-badges",
            cta_band="copper-outline",
            logo_positioning="header-left",
            card_corners="rounded-md",
            separators="none",
            typographic_scale="type-normal",
            micro_texture="paper-none",
            palette_pack="classic_graphite"
        ),
        VariantSet(
            name="Agency Copper",
            hero_layout="hero-left",
            header_emphasis="accent-bar",
            feature_card_style="soft", 
            feature_icon_treatment="check-icons",
            cta_band="filled-steel",
            logo_positioning="header-right",
            card_corners="rounded-lg",
            separators="subtle",
            typographic_scale="type-comfort",
            micro_texture="paper-subtle",
            palette_pack="slate_copper"
        ),
        VariantSet(
            name="Editorial Nickel",
            hero_layout="hero-full",
            header_emphasis="none",
            feature_card_style="divided",
            feature_icon_treatment="no-icons", 
            cta_band="light-panel",
            logo_positioning="hero-overlay",
            card_corners="rounded-md",
            separators="dotted",
            typographic_scale="type-compact",
            micro_texture="paper-grid",
            palette_pack="polished_nickel"
        ),
        VariantSet(
            name="Executive Tungsten",
            hero_layout="hero-right",
            header_emphasis="accent-bar",
            feature_card_style="soft",
            feature_icon_treatment="number-badges",
            cta_band="filled-steel", 
            logo_positioning="header-left",
            card_corners="rounded-lg",
            separators="subtle",
            typographic_scale="type-normal",
            micro_texture="paper-subtle",
            palette_pack="soft_tungsten"
        ),
        VariantSet(
            name="Bold Charcoal",
            hero_layout="hero-left",
            header_emphasis="underline",
            feature_card_style="outline",
            feature_icon_treatment="check-icons",
            cta_band="copper-outline",
            logo_positioning="header-right", 
            card_corners="rounded-md",
            separators="none",
            typographic_scale="type-comfort",
            micro_texture="paper-none",
            palette_pack="charcoal_bronze"
        ),
        VariantSet(
            name="Classic Pewter",
            hero_layout="hero-full",
            header_emphasis="accent-bar",
            feature_card_style="divided",
            feature_icon_treatment="no-icons",
            cta_band="light-panel",
            logo_positioning="hero-overlay",
            card_corners="rounded-lg", 
            separators="dotted",
            typographic_scale="type-compact",
            micro_texture="paper-grid",
            palette_pack="pewter_gold"
        )
    ]
    
    @classmethod
    def generate_seed(cls, project_id: str, user_id: str = "", created_at: str = "") -> int:
        """Generate deterministic seed from project data"""
        seed_string = f"{project_id}_{user_id}_{created_at}"
        hash_bytes = hashlib.sha256(seed_string.encode()).digest()
        return int.from_bytes(hash_bytes[:4], byteorder='big')
    
    @classmethod
    def select_variant(cls, seed: int, style_hints: Optional[Dict[str, str]] = None) -> VariantSet:
        """Select variant set based on seed and optional style hints"""
        
        if style_hints:
            # Try to match style hints to preferred variants
            variant_bias = style_hints.get("variantBias", "")
            layout_bias = style_hints.get("layoutBias", "")
            
            # Filter variants based on hints
            preferred_variants = []
            for variant in cls.VARIANT_SETS:
                matches = 0
                if variant_bias and variant_bias in variant.palette_pack:
                    matches += 2
                if layout_bias and layout_bias == variant.hero_layout:
                    matches += 2
                if matches > 0:
                    preferred_variants.append((variant, matches))
            
            if preferred_variants:
                # Sort by match score and pick from top matches
                preferred_variants.sort(key=lambda x: x[1], reverse=True)
                best_matches = [v for v, score in preferred_variants if score == preferred_variants[0][1]]
                variant_index = seed % len(best_matches)
                return best_matches[variant_index]
        
        # Default: deterministic selection based on seed
        variant_index = seed % len(cls.VARIANT_SETS)
        return cls.VARIANT_SETS[variant_index]
    
    @classmethod
    def get_palette(cls, palette_name: str) -> PalettePack:
        """Get palette pack by name"""
        return cls.PALETTE_PACKS.get(palette_name, cls.PALETTE_PACKS["classic_graphite"])
    
    @classmethod
    def generate_variant_config(cls, project_id: str, user_id: str = "", 
                              created_at: str = "", style_hints: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """Generate complete variant configuration for a project"""
        
        # Generate deterministic seed
        seed = cls.generate_seed(project_id, user_id, created_at)
        
        # Select variant set
        variant = cls.select_variant(seed, style_hints)
        
        # Get palette
        palette = cls.get_palette(variant.palette_pack)
        
        return {
            "variant_name": variant.name,
            "seed": seed,
            "hero_layout": variant.hero_layout,
            "header_emphasis": variant.header_emphasis,
            "feature_card_style": variant.feature_card_style,
            "feature_icon_treatment": variant.feature_icon_treatment,
            "cta_band": variant.cta_band,
            "logo_positioning": variant.logo_positioning,
            "card_corners": variant.card_corners,
            "separators": variant.separators,
            "typographic_scale": variant.typographic_scale,
            "micro_texture": variant.micro_texture,
            "palette": {
                "name": palette.name,
                "primary": palette.primary,
                "accent": palette.accent,
                "light": palette.light,
                "description": palette.description
            }
        }
    
    @classmethod
    def regenerate_variant(cls, project_id: str, user_id: str = "", 
                          created_at: str = "", increment: int = 1) -> Dict[str, Any]:
        """Regenerate variant with incremented seed (for 'Regenerate look' button)"""
        base_seed = cls.generate_seed(project_id, user_id, created_at)
        new_seed = base_seed + increment
        
        # Select new variant
        variant_index = new_seed % len(cls.VARIANT_SETS)
        variant = cls.VARIANT_SETS[variant_index]
        palette = cls.get_palette(variant.palette_pack)
        
        return {
            "variant_name": variant.name,
            "seed": new_seed,
            "increment": increment,
            "hero_layout": variant.hero_layout,
            "header_emphasis": variant.header_emphasis,
            "feature_card_style": variant.feature_card_style,
            "feature_icon_treatment": variant.feature_icon_treatment,
            "cta_band": variant.cta_band,
            "logo_positioning": variant.logo_positioning,
            "card_corners": variant.card_corners,
            "separators": variant.separators,
            "typographic_scale": variant.typographic_scale,
            "micro_texture": variant.micro_texture,
            "palette": {
                "name": palette.name,
                "primary": palette.primary,
                "accent": palette.accent,
                "light": palette.light,
                "description": palette.description
            }
        }
