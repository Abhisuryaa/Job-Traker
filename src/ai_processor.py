import os
import re
import time
import logging
import google.generativeai as genai
from bs4 import BeautifulSoup

from src.config import GEMINI_API_KEY, OPENAI_API_KEY

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configure Gemini AI
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class AIProcessor:
    """Processes job descriptions using AI to extract skills and provide insights."""
    
    def __init__(self, api_key=None, model="gemini-pro"):
        """Initialize the AI processor with appropriate API keys."""
        self.model_name = model
        self.api_key = api_key or GEMINI_API_KEY
        self._setup_model()
    
    def _setup_model(self):
        """Set up the AI model based on configuration."""
        if self.model_name.startswith("gemini"):
            if not self.api_key:
                logger.warning("No Gemini API key provided. AI processing will be limited.")
                self.model = None
                return
                
            try:
                # Configure the Gemini model
                genai.configure(api_key=self.api_key)
                
                # Set up the model
                generation_config = {
                    "temperature": 0.2,
                    "top_p": 0.8,
                    "top_k": 40,
                    "max_output_tokens": 2048,
                }
                
                safety_settings = [
                    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                ]
                
                self.model = genai.GenerativeModel(
                    model_name=self.model_name,
                    generation_config=generation_config,
                    safety_settings=safety_settings
                )
                
                logger.info(f"Successfully initialized {self.model_name} model")
            except Exception as e:
                logger.error(f"Error initializing Gemini model: {e}")
                self.model = None
        else:
            logger.error(f"Unsupported model: {self.model_name}")
            self.model = None
    
    def extract_skills_from_job(self, job_description):
        """Extract required and preferred skills from a job description."""
        if not self.model:
            logger.warning("AI model not available for skill extraction")
            return {"required": [], "preferred": [], "error": "AI model not available"}
        
        try:
            prompt = f"""
            Extract skills from this job description, categorizing them as either "required" or "preferred".
            For each skill, assign a relevance score from 1-10.
            
            Job Description:
            {job_description}
            
            Format your response as JSON with the following structure:
            {{
                "required": [
                    {{"skill": "skill name", "relevance": 8}},
                    ...
                ],
                "preferred": [
                    {{"skill": "skill name", "relevance": 6}},
                    ...
                ]
            }}
            
            Do not include any explanations, only provide the JSON response.
            """
            
            response = self.model.generate_content(prompt)
            response_text = response.text
            
            # Extract JSON from response
            json_match = re.search(r'```json(.*?)```', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1).strip()
            else:
                json_str = response_text.strip()
            
            # Clean up the response if needed
            json_str = json_str.replace('```', '').strip()
            
            # Convert string to dict using eval (safe in this context since we control the prompt)
            # In production, use json.loads with proper error handling
            import json
            skills_data = json.loads(json_str)
            
            return skills_data
        except Exception as e:
            logger.error(f"Error extracting skills: {e}")
            return {"required": [], "preferred": [], "error": str(e)}
    
    def calculate_job_match(self, job_description, user_skills):
        """Calculate how well a user's skills match a job description."""
        if not self.model:
            logger.warning("AI model not available for job matching")
            return {"match_percentage": 0, "missing_skills": [], "matching_skills": [], "error": "AI model not available"}
        
        try:
            # Convert skills list to string
            skills_str = ", ".join(user_skills)
            
            prompt = f"""
            Compare the job description with the candidate's skills and calculate a match percentage.
            Identify skills that match and skills that are missing.
            
            Job Description:
            {job_description}
            
            Candidate Skills:
            {skills_str}
            
            Format your response as JSON with the following structure:
            {{
                "match_percentage": 75,
                "matching_skills": [
                    {{"skill": "Python", "importance": "high"}},
                    ...
                ],
                "missing_skills": [
                    {{"skill": "AWS", "importance": "medium"}},
                    ...
                ],
                "job_summary": "Brief 1-2 sentence summary of the position"
            }}
            
            Do not include any explanations, only provide the JSON response.
            """
            
            response = self.model.generate_content(prompt)
            response_text = response.text
            
            # Extract JSON from response
            json_match = re.search(r'```json(.*?)```', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1).strip()
            else:
                json_str = response_text.strip()
            
            # Clean up the response if needed
            json_str = json_str.replace('```', '').strip()
            
            # Convert string to dict
            import json
            match_data = json.loads(json_str)
            
            return match_data
        except Exception as e:
            logger.error(f"Error calculating job match: {e}")
            return {"match_percentage": 0, "missing_skills": [], "matching_skills": [], "error": str(e)}
    
    def generate_application_tips(self, job_description, user_profile):
        """Generate tips for applying to a specific job based on user profile."""
        if not self.model:
            logger.warning("AI model not available for generating tips")
            return {"resume_tips": [], "cover_letter_tips": [], "error": "AI model not available"}
        
        try:
            # Format user profile data
            profile_text = f"""
            Name: {user_profile.get('name', 'Not specified')}
            Skills: {user_profile.get('skills', 'Not specified')}
            Experience: {user_profile.get('experience', 'Not specified')}
            Education: {user_profile.get('education', 'Not specified')}
            """
            
            prompt = f"""
            Provide application tips for this job based on the candidate's profile.
            Include suggestions for resume customization and cover letter points.
            
            Job Description:
            {job_description}
            
            Candidate Profile:
            {profile_text}
            
            Format your response as JSON with the following structure:
            {{
                "resume_tips": [
                    "Specific tip for resume customization",
                    ...
                ],
                "cover_letter_tips": [
                    "Specific point to address in cover letter",
                    ...
                ],
                "interview_preparation": [
                    "Specific area to prepare for interview questions",
                    ...
                ]
            }}
            
            Do not include any explanations, only provide the JSON response.
            """
            
            response = self.model.generate_content(prompt)
            response_text = response.text
            
            # Extract JSON from response
            json_match = re.search(r'```json(.*?)```', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1).strip()
            else:
                json_str = response_text.strip()
            
            # Clean up the response if needed
            json_str = json_str.replace('```', '').strip()
            
            # Convert string to dict
            import json
            tips_data = json.loads(json_str)
            
            return tips_data
        except Exception as e:
            logger.error(f"Error generating application tips: {e}")
            return {"resume_tips": [], "cover_letter_tips": [], "error": str(e)}
    
    def analyze_job_market(self, job_listings, location=None):
        """Analyze multiple job listings to identify trends and insights."""
        if not self.model or len(job_listings) == 0:
            logger.warning("AI model not available or no job listings provided")
            return {"trends": [], "in_demand_skills": [], "error": "AI model not available or no job listings"}
        
        try:
            # Create a summary of job titles
            job_titles = [job.get('title', 'Unknown') for job in job_listings]
            job_companies = [job.get('company', 'Unknown') for job in job_listings]
            titles_text = "\n".join(job_titles[:20])  # Limit to 20 jobs to stay within token limits
            
            prompt = f"""
            Analyze these job titles and companies to identify trends in the job market.
            Identify in-demand skills, common job requirements, and salary ranges if possible.
            
            Job Titles:
            {titles_text}
            
            Companies:
            {", ".join(job_companies[:20])}
            
            Location: {location if location else "Not specified"}
            
            Format your response as JSON with the following structure:
            {{
                "market_summary": "Brief 2-3 sentence overview of the job market",
                "trends": [
                    "Specific trend in the job market",
                    ...
                ],
                "in_demand_skills": [
                    {{"skill": "Skill name", "demand": "high/medium/low"}},
                    ...
                ],
                "salary_insights": "Brief 1-2 sentence insight about salary ranges if available"
            }}
            
            Do not include any explanations, only provide the JSON response.
            """
            
            response = self.model.generate_content(prompt)
            response_text = response.text
            
            # Extract JSON from response
            json_match = re.search(r'```json(.*?)```', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1).strip()
            else:
                json_str = response_text.strip()
            
            # Clean up the response if needed
            json_str = json_str.replace('```', '').strip()
            
            # Convert string to dict
            import json
            analysis_data = json.loads(json_str)
            
            return analysis_data
        except Exception as e:
            logger.error(f"Error analyzing job market: {e}")
            return {"trends": [], "in_demand_skills": [], "error": str(e)} 