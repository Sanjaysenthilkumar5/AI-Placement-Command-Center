import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Placement Command Center"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-jwt-key-for-ai-placement-command-center-2026-prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database (Default to robust local SQLite with WAL mode, PostgreSQL compatible via URL)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./placement_command_center.db")
    
    # AI Provider Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    AI_MODEL_NAME: str = os.getenv("AI_MODEL_NAME", "gemini-2.0-flash")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Storage
    UPLOAD_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
