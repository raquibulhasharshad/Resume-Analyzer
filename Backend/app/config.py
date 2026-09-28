import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Resume Analyzer & Job Matcher"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = "postgresql://neondb_owner:npg_loOghu1JMq5I@ep-misty-mountain-b59sem5h-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require"
    
    # JWT Authentication
    JWT_SECRET_KEY: str = "ai_resume_analyzer_super_secret_jwt_key_2026_antigravity"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 Days
    
    # LLM Settings
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_PROVIDER: str = "auto"
    
    # Embedding & Vector DB
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
