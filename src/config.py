import os
import dotenv
from pathlib import Path

# Load environment variables from .env file
dotenv.load_dotenv()

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Configuration
DEBUG = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")
HEADLESS_BROWSER = os.getenv("HEADLESS_BROWSER", "True").lower() in ("true", "1", "t")

# Database
DB_PATH = os.getenv("DB_PATH", "./data/jobtracker.db")
BASE_DIR = Path(__file__).resolve().parent.parent

# Create data directory if it doesn't exist
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

# Job Search Sites
JOB_SITES = {
    "linkedin": {
        "url": "https://www.linkedin.com/jobs/search/?keywords={query}&location={location}",
        "job_listing_selector": ".job-search-card",
        "job_title_selector": ".base-search-card__title",
        "company_selector": ".base-search-card__subtitle",
        "location_selector": ".job-search-card__location",
    },
    "indeed": {
        "url": "https://www.indeed.com/jobs?q={query}&l={location}",
        "job_listing_selector": ".job_seen_beacon",
        "job_title_selector": ".jobTitle",
        "company_selector": ".companyName",
        "location_selector": ".companyLocation",
    },
    "glassdoor": {
        "url": "https://www.glassdoor.com/Job/jobs.htm?sc.keyword={query}&locT=C&locId=1147401",
        "job_listing_selector": ".react-job-listing",
        "job_title_selector": ".job-title",
        "company_selector": ".employer-name",
        "location_selector": ".location",
    }
}

# User-agent strings for web requests
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0"
] 