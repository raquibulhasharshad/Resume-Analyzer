from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- AUTH SCHEMAS ---
class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, description="Candidate full name")
    email: str = Field(..., description="Valid email address")
    password: str = Field(..., min_length=6, description="Account password")

class UserLogin(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")

class UpdateProfileRequest(BaseModel):
    full_name: str = Field(..., min_length=2, description="Candidate full name")

class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., description="Current account password")
    new_password: str = Field(..., min_length=6, description="New account password")

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- RESUME & ANALYSIS SCHEMAS ---
class UploadResumeResponse(BaseModel):
    filename: str
    text: str
    message: str

class AnalyzeRequest(BaseModel):
    resume_text: str = Field(..., min_length=10, description="Extracted resume text")
    job_description: str = Field(..., min_length=10, description="Job description text")
    filename: Optional[str] = "Uploaded_Resume.pdf"
    job_title: Optional[str] = "Job Role"

class AnalysisResultResponse(BaseModel):
    id: Optional[int] = None
    user_id: Optional[int] = None
    resume_filename: Optional[str] = "Resume.pdf"
    job_title: Optional[str] = "Job Target"
    match_score: int
    matching_skills: List[str]
    missing_skills: List[str]
    recommended_skills: List[str]
    strengths: List[str]
    weaknesses: List[str]
    experience_analysis: str
    project_analysis: str
    summary: str
    interview_questions: List[str]
    
    # Domain Mismatch Detection
    domain_mismatch: bool = False
    candidate_domain: Optional[str] = "General"
    target_domain: Optional[str] = "General"
    domain_mismatch_warning: Optional[str] = None

    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class HistoryItemResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    resume_filename: str
    job_title: str
    match_score: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- AI CHAT SCHEMAS ---
class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    analysis_id: Optional[int] = None
    message: str = Field(..., min_length=1, description="User question for AI career advisor")
    history: Optional[List[ChatMessage]] = []
    job_title: Optional[str] = "Job Role"
    match_score: Optional[int] = 0
    matching_skills: Optional[List[str]] = []
    missing_skills: Optional[List[str]] = []

class ChatResponse(BaseModel):
    reply: str
