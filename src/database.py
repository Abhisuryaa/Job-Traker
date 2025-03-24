import sqlite3
import os
from datetime import datetime
from src.config import DB_PATH

class Database:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        self._create_tables()
    
    def _create_tables(self):
        """Create necessary database tables if they don't exist."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Create user profiles table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT,
            location TEXT,
            skills TEXT,
            experience TEXT,
            education TEXT,
            resume_path TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        
        # Create jobs table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            location TEXT,
            description TEXT,
            url TEXT,
            status TEXT DEFAULT 'discovered',
            applied_date TEXT,
            response_date TEXT,
            match_score REAL,
            source TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            notes TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        
        # Create job_skills table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS job_skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id INTEGER NOT NULL,
            skill TEXT NOT NULL,
            required BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (job_id) REFERENCES jobs (id)
        )
        ''')
        
        # Create search_history table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS search_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            query TEXT NOT NULL,
            location TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            results_count INTEGER,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        ''')
        
        # Create reminders table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            job_id INTEGER,
            title TEXT NOT NULL,
            description TEXT,
            due_date TEXT,
            completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (job_id) REFERENCES jobs (id)
        )
        ''')
        
        conn.commit()
        conn.close()
    
    def add_user(self, username, email, password_hash):
        """Add a new user to the database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
                (username, email, password_hash)
            )
            user_id = cursor.lastrowid
            conn.commit()
            return user_id
        except sqlite3.IntegrityError:
            conn.rollback()
            return None
        finally:
            conn.close()
    
    def add_job(self, user_id, title, company, location, description, url, source, match_score=None):
        """Add a new job to the database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                """INSERT INTO jobs 
                   (user_id, title, company, location, description, url, source, match_score) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (user_id, title, company, location, description, url, source, match_score)
            )
            job_id = cursor.lastrowid
            conn.commit()
            return job_id
        except Exception as e:
            conn.rollback()
            print(f"Error adding job: {e}")
            return None
        finally:
            conn.close()
    
    def update_job_status(self, job_id, status, applied_date=None):
        """Update job application status."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            if applied_date and status == 'applied':
                cursor.execute(
                    "UPDATE jobs SET status = ?, applied_date = ? WHERE id = ?",
                    (status, applied_date, job_id)
                )
            else:
                cursor.execute(
                    "UPDATE jobs SET status = ? WHERE id = ?",
                    (status, job_id)
                )
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            print(f"Error updating job status: {e}")
            return False
        finally:
            conn.close()
    
    def get_jobs_by_user(self, user_id, status=None):
        """Get all jobs for a specific user, optionally filtered by status."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        try:
            if status:
                cursor.execute(
                    "SELECT * FROM jobs WHERE user_id = ? AND status = ? ORDER BY created_at DESC",
                    (user_id, status)
                )
            else:
                cursor.execute(
                    "SELECT * FROM jobs WHERE user_id = ? ORDER BY created_at DESC",
                    (user_id,)
                )
            return [dict(row) for row in cursor.fetchall()]
        finally:
            conn.close()
    
    def add_skill_to_job(self, job_id, skill, required=False):
        """Add a skill requirement to a job."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO job_skills (job_id, skill, required) VALUES (?, ?, ?)",
                (job_id, skill, required)
            )
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            print(f"Error adding skill to job: {e}")
            return False
        finally:
            conn.close()
    
    def add_reminder(self, user_id, title, description=None, due_date=None, job_id=None):
        """Add a reminder for a user, optionally associated with a job."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                """INSERT INTO reminders 
                   (user_id, job_id, title, description, due_date) 
                   VALUES (?, ?, ?, ?, ?)""",
                (user_id, job_id, title, description, due_date)
            )
            reminder_id = cursor.lastrowid
            conn.commit()
            return reminder_id
        except Exception as e:
            conn.rollback()
            print(f"Error adding reminder: {e}")
            return None
        finally:
            conn.close()
    
    def log_search(self, user_id, query, location=None, results_count=0):
        """Log a search query to the database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                """INSERT INTO search_history 
                   (user_id, query, location, results_count) 
                   VALUES (?, ?, ?, ?)""",
                (user_id, query, location, results_count)
            )
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            print(f"Error logging search: {e}")
            return False
        finally:
            conn.close()
    
    def update_profile(self, user_id, **profile_data):
        """Update or create user profile."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Check if profile exists
            cursor.execute("SELECT id FROM user_profiles WHERE user_id = ?", (user_id,))
            profile = cursor.fetchone()
            
            if profile:
                # Update existing profile
                set_clause = ", ".join([f"{key} = ?" for key in profile_data.keys()])
                query = f"UPDATE user_profiles SET {set_clause} WHERE user_id = ?"
                cursor.execute(query, list(profile_data.values()) + [user_id])
            else:
                # Create new profile
                keys = list(profile_data.keys()) + ["user_id"]
                placeholders = ["?"] * len(keys)
                query = f"INSERT INTO user_profiles ({', '.join(keys)}) VALUES ({', '.join(placeholders)})"
                cursor.execute(query, list(profile_data.values()) + [user_id])
            
            conn.commit()
            return True
        except Exception as e:
            conn.rollback()
            print(f"Error updating profile: {e}")
            return False
        finally:
            conn.close()
            
    def get_profile(self, user_id):
        """Get user profile data."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        try:
            cursor.execute("SELECT * FROM user_profiles WHERE user_id = ?", (user_id,))
            profile = cursor.fetchone()
            return dict(profile) if profile else None
        finally:
            conn.close()
            
    def get_user_by_username(self, username):
        """Get user by username."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        try:
            cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
            user = cursor.fetchone()
            return dict(user) if user else None
        finally:
            conn.close()
    
# Create a global database instance
db = Database() 