import time
import random
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import logging
import threading
import queue

from src.config import HEADLESS_BROWSER, USER_AGENTS, JOB_SITES

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BrowserController:
    """
    Controls a Selenium browser for job searching and scraping.
    Shows the browser to the user for transparency.
    """
    def __init__(self, headless=HEADLESS_BROWSER):
        self.headless = headless
        self._setup_driver()
        self.job_queue = queue.Queue()
        self.results_queue = queue.Queue()
        self._processing_thread = None
        self._stop_event = threading.Event()
    
    def _setup_driver(self):
        """Set up the Selenium WebDriver."""
        options = Options()
        
        if self.headless:
            options.add_argument("--headless")
        
        # Set user agent
        options.add_argument(f"user-agent={random.choice(USER_AGENTS)}")
        
        # Add additional options for better performance
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--window-size=1920,1080")
        
        # Use webdriver manager to handle driver installation
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=options)
        
        logger.info("Browser driver initialized")
    
    def close(self):
        """Close the browser."""
        if hasattr(self, 'driver'):
            self.driver.quit()
            logger.info("Browser closed")
    
    def navigate_to(self, url, wait_time=3):
        """Navigate to a URL and wait for the page to load."""
        try:
            self.driver.get(url)
            # Add a random delay to look more human-like
            time.sleep(wait_time + random.uniform(0.5, 2.0))
            return True
        except Exception as e:
            logger.error(f"Error navigating to {url}: {e}")
            return False
    
    def search_jobs(self, site_key, query, location=None):
        """Search for jobs on a specific site."""
        site = JOB_SITES.get(site_key)
        if not site:
            logger.error(f"Site {site_key} not found in configuration")
            return []
        
        # Format URL with query and location
        url = site["url"].format(
            query=query.replace(" ", "+"),
            location=location.replace(" ", "+") if location else ""
        )
        
        logger.info(f"Searching for jobs on {site_key}: {url}")
        
        if not self.navigate_to(url):
            return []
        
        # Wait for job listings to load
        try:
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, site["job_listing_selector"]))
            )
        except TimeoutException:
            logger.warning(f"Timeout waiting for job listings on {site_key}")
            return []
        
        # Extract job listings
        jobs = []
        try:
            # Get the page HTML
            page_source = self.driver.page_source
            soup = BeautifulSoup(page_source, 'html.parser')
            
            # Find all job listings
            job_elements = soup.select(site["job_listing_selector"])
            
            for job_element in job_elements:
                job = self._extract_job_data(job_element, site, site_key)
                if job:
                    jobs.append(job)
                    
                    # Visual indication in the browser - highlight the job card
                    try:
                        job_card = self.driver.find_element(By.CSS_SELECTOR, f"{site['job_listing_selector']}:nth-child({len(jobs)})")
                        self.driver.execute_script("arguments[0].style.border='2px solid #FF5733'", job_card)
                        time.sleep(0.5)  # Brief pause for visual effect
                    except Exception:
                        pass
        
        except Exception as e:
            logger.error(f"Error extracting jobs from {site_key}: {e}")
        
        logger.info(f"Found {len(jobs)} jobs on {site_key}")
        return jobs
    
    def _extract_job_data(self, job_element, site_config, source):
        """Extract job data from a job listing element."""
        try:
            # Extract basic job information
            title_element = job_element.select_one(site_config["job_title_selector"])
            company_element = job_element.select_one(site_config["company_selector"])
            location_element = job_element.select_one(site_config["location_selector"])
            
            if not title_element:
                return None
            
            # Get job URL if available
            job_url = None
            if title_element.has_attr('href'):
                job_url = title_element['href']
            elif title_element.parent.has_attr('href'):
                job_url = title_element.parent['href']
            
            # Clean data
            title = title_element.text.strip()
            company = company_element.text.strip() if company_element else "Unknown Company"
            location = location_element.text.strip() if location_element else "Unknown Location"
            
            return {
                "title": title,
                "company": company,
                "location": location,
                "url": job_url,
                "source": source,
                "description": None  # Will be populated in get_job_details
            }
        except Exception as e:
            logger.error(f"Error extracting job data: {e}")
            return None
    
    def get_job_details(self, job):
        """Click on a job listing and extract the full details."""
        if not job.get("url"):
            logger.warning("Job URL is missing, cannot get details")
            return job
        
        # Navigate to job page
        full_url = job["url"] if job["url"].startswith("http") else f"https://{job['source']}.com{job['url']}"
        if not self.navigate_to(full_url):
            return job
        
        # Extract job description
        try:
            # Wait for job description to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Get the page HTML
            page_source = self.driver.page_source
            soup = BeautifulSoup(page_source, 'html.parser')
            
            # Try to find job description
            # This is a best effort approach since different sites have different structures
            description_element = None
            
            # Try common job description selectors
            description_selectors = [
                ".job-description",
                "#job-description",
                ".description",
                ".job-details",
                "section.description",
                "[data-automation='jobDescriptionText']"
            ]
            
            for selector in description_selectors:
                description_element = soup.select_one(selector)
                if description_element:
                    break
            
            # If no specific element found, try to get the main content
            if not description_element:
                description_element = soup.select_one("main") or soup.select_one("article")
            
            # If still no description found, use the body element
            if not description_element:
                description_element = soup.body
            
            # Extract text
            description = description_element.get_text(separator="\n", strip=True) if description_element else ""
            
            # Update job with description
            job["description"] = description
            
            # Highlight the description in the browser for visualization
            try:
                desc_elem = self.driver.find_element(By.CSS_SELECTOR, description_selectors[0])
                self.driver.execute_script("arguments[0].style.backgroundColor='#FFFFCC'", desc_elem)
            except Exception:
                pass
                
        except Exception as e:
            logger.error(f"Error getting job details: {e}")
        
        return job
    
    def start_processing_thread(self):
        """Start a background thread for processing jobs."""
        if self._processing_thread is not None and self._processing_thread.is_alive():
            return
        
        self._stop_event.clear()
        self._processing_thread = threading.Thread(target=self._process_job_queue)
        self._processing_thread.daemon = True
        self._processing_thread.start()
    
    def stop_processing_thread(self):
        """Stop the background processing thread."""
        if self._processing_thread is not None:
            self._stop_event.set()
            self._processing_thread.join(timeout=5.0)
            self._processing_thread = None
    
    def _process_job_queue(self):
        """Process jobs from the queue in background."""
        while not self._stop_event.is_set():
            try:
                # Try to get a job from the queue with timeout
                job, search_params = self.job_queue.get(timeout=1.0)
                
                # Process the job
                site_key, query, location = search_params
                detailed_job = self.get_job_details(job)
                
                # Put the result in the results queue
                self.results_queue.put(detailed_job)
                
                # Mark task as done
                self.job_queue.task_done()
                
            except queue.Empty:
                # Queue is empty, just continue waiting
                continue
            except Exception as e:
                logger.error(f"Error processing job: {e}")
    
    def enqueue_job(self, job, search_params):
        """Add a job to the processing queue."""
        self.job_queue.put((job, search_params))
    
    def get_processed_job(self, timeout=None):
        """Get a processed job from the results queue."""
        try:
            return self.results_queue.get(timeout=timeout)
        except queue.Empty:
            return None 