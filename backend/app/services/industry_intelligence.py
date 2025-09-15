"""
Industry Intelligence Database
Provides industry-specific copywriting intelligence and best practices
"""

from typing import Dict, List, Any

class IndustryIntelligence:
    """Industry-specific marketing intelligence and copywriting patterns"""
    
    def __init__(self):
        """Initialize industry intelligence database"""
        self.industry_data = {
            "software": {
                "pain_points": [
                    "time_consuming_manual_processes",
                    "complex_setup_and_maintenance", 
                    "expensive_enterprise_solutions",
                    "lack_of_integration_capabilities",
                    "poor_user_experience"
                ],
                "power_words": [
                    "streamline", "automate", "simplify", "optimize",
                    "integrate", "scale", "efficient", "intuitive"
                ],
                "social_proof": [
                    "trusted_by_thousands", "saves_hours_weekly",
                    "increases_productivity", "reduces_errors"
                ],
                "cta_patterns": [
                    "start_free_trial", "get_demo", "try_now",
                    "download_free", "schedule_demo"
                ],
                "messaging_tone": "professional",
                "value_drivers": ["time_savings", "cost_reduction", "ease_of_use"]
            },
            
            "restaurant": {
                "pain_points": [
                    "slow_service_during_peak_hours",
                    "food_quality_consistency",
                    "customer_retention_challenges",
                    "operational_efficiency",
                    "online_ordering_complexity"
                ],
                "power_words": [
                    "fresh", "authentic", "delicious", "convenient",
                    "fast", "quality", "family", "tradition"
                ],
                "social_proof": [
                    "customer_favorites", "family_owned",
                    "locally_sourced", "award_winning"
                ],
                "cta_patterns": [
                    "order_now", "reserve_table", "try_today",
                    "delivery_available", "catering_available"
                ],
                "messaging_tone": "friendly",
                "value_drivers": ["taste", "convenience", "experience"]
            },
            
            "healthcare": {
                "pain_points": [
                    "patient_wait_times",
                    "insurance_and_billing_complexity",
                    "appointment_scheduling_difficulties",
                    "quality_of_care_concerns",
                    "accessibility_issues"
                ],
                "power_words": [
                    "care", "health", "wellness", "expert",
                    "compassionate", "advanced", "personalized", "trusted"
                ],
                "social_proof": [
                    "board_certified", "years_of_experience",
                    "patient_satisfaction", "advanced_technology"
                ],
                "cta_patterns": [
                    "schedule_appointment", "call_today", "book_consultation",
                    "learn_more", "contact_us"
                ],
                "messaging_tone": "professional",
                "value_drivers": ["expertise", "care_quality", "convenience"]
            },
            
            "professional_services": {
                "pain_points": [
                    "lack_of_expertise_in_house",
                    "time_constraints_for_specialized_tasks",
                    "cost_of_hiring_full_time_specialists",
                    "keeping_up_with_industry_changes",
                    "measuring_roi_on_initiatives"
                ],
                "power_words": [
                    "expert", "proven", "results", "growth",
                    "strategic", "efficient", "tailored", "experienced"
                ],
                "social_proof": [
                    "years_of_experience", "client_success_stories",
                    "industry_expertise", "proven_methodology"
                ],
                "cta_patterns": [
                    "free_consultation", "get_proposal", "schedule_call",
                    "discuss_needs", "learn_how"
                ],
                "messaging_tone": "professional",
                "value_drivers": ["expertise", "results", "roi"]
            },
            
            "retail": {
                "pain_points": [
                    "finding_quality_products_at_good_prices",
                    "limited_selection_in_local_stores",
                    "inconvenient_shopping_hours",
                    "poor_customer_service_experience",
                    "complicated_return_policies"
                ],
                "power_words": [
                    "quality", "affordable", "selection", "convenient",
                    "stylish", "trending", "exclusive", "savings"
                ],
                "social_proof": [
                    "customer_reviews", "bestselling_items",
                    "satisfaction_guarantee", "trusted_brands"
                ],
                "cta_patterns": [
                    "shop_now", "browse_collection", "limited_time",
                    "free_shipping", "visit_store"
                ],
                "messaging_tone": "friendly",
                "value_drivers": ["value", "selection", "convenience"]
            },
            
            "education": {
                "pain_points": [
                    "keeping_up_with_rapidly_changing_skills",
                    "finding_time_for_professional_development",
                    "cost_of_quality_education_programs",
                    "lack_of_practical_hands_on_experience",
                    "difficulty_measuring_learning_outcomes"
                ],
                "power_words": [
                    "learn", "master", "advance", "certified",
                    "practical", "expert", "comprehensive", "flexible"
                ],
                "social_proof": [
                    "certified_instructors", "student_success_rate",
                    "industry_recognized", "career_advancement"
                ],
                "cta_patterns": [
                    "enroll_now", "start_learning", "free_trial",
                    "view_courses", "speak_with_advisor"
                ],
                "messaging_tone": "professional",
                "value_drivers": ["skill_development", "career_growth", "flexibility"]
            },
            
            "fitness": {
                "pain_points": [
                    "lack_of_motivation_to_exercise_regularly",
                    "not_seeing_results_from_current_routine",
                    "gym_intimidation_and_crowding",
                    "expensive_personal_training_costs",
                    "time_constraints_for_workouts"
                ],
                "power_words": [
                    "transform", "strong", "fit", "energy",
                    "results", "motivating", "supportive", "flexible"
                ],
                "social_proof": [
                    "member_transformations", "certified_trainers",
                    "proven_programs", "community_support"
                ],
                "cta_patterns": [
                    "start_trial", "join_today", "book_session",
                    "see_results", "get_started"
                ],
                "messaging_tone": "motivational",
                "value_drivers": ["results", "support", "convenience"]
            }
        }
        
        # Default fallback for unknown industries
        self.default_industry = {
            "pain_points": [
                "time_consuming_processes",
                "expensive_solutions",
                "poor_customer_service",
                "lack_of_reliability",
                "complex_implementation"
            ],
            "power_words": [
                "professional", "reliable", "efficient", "quality",
                "trusted", "expert", "proven", "results"
            ],
            "social_proof": [
                "satisfied_customers", "proven_track_record",
                "expert_team", "quality_guarantee"
            ],
            "cta_patterns": [
                "get_started", "learn_more", "contact_us",
                "free_consultation", "try_today"
            ],
            "messaging_tone": "professional",
            "value_drivers": ["quality", "reliability", "results"]
        }
    
    def get_industry_data(self, business_type: str) -> Dict[str, Any]:
        """
        Get industry-specific intelligence data
        
        Args:
            business_type: Type of business/industry
            
        Returns:
            Dictionary containing industry-specific intelligence
        """
        
        # Normalize business type
        business_type_normalized = business_type.lower().replace(" ", "_").replace("/", "_")
        
        # Try exact match first
        if business_type_normalized in self.industry_data:
            return self.industry_data[business_type_normalized]
        
        # Try partial matches for common variations
        for industry_key in self.industry_data.keys():
            if industry_key in business_type_normalized or business_type_normalized in industry_key:
                return self.industry_data[industry_key]
        
        # Check for common business type mappings
        type_mappings = {
            "technology": "software",
            "tech": "software", 
            "saas": "software",
            "app": "software",
            "consulting": "professional_services",
            "agency": "professional_services",
            "marketing": "professional_services",
            "legal": "professional_services",
            "accounting": "professional_services",
            "food": "restaurant",
            "dining": "restaurant",
            "cafe": "restaurant",
            "medical": "healthcare",
            "dental": "healthcare",
            "clinic": "healthcare",
            "hospital": "healthcare",
            "store": "retail",
            "shop": "retail",
            "ecommerce": "retail",
            "training": "education",
            "course": "education",
            "school": "education",
            "gym": "fitness",
            "wellness": "fitness",
            "health": "fitness"
        }
        
        for mapping_key, industry_key in type_mappings.items():
            if mapping_key in business_type_normalized:
                return self.industry_data[industry_key]
        
        # Return default if no match found
        return self.default_industry
    
    def get_tone_for_industry(self, business_type: str) -> str:
        """Get recommended messaging tone for industry"""
        industry_data = self.get_industry_data(business_type)
        return industry_data.get("messaging_tone", "professional")
    
    def get_power_words(self, business_type: str) -> List[str]:
        """Get power words for industry"""
        industry_data = self.get_industry_data(business_type)
        return industry_data.get("power_words", [])
    
    def get_cta_patterns(self, business_type: str) -> List[str]:
        """Get effective CTA patterns for industry"""
        industry_data = self.get_industry_data(business_type)
        return industry_data.get("cta_patterns", [])
