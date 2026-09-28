from sqlalchemy import Column, Integer, String, Float, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    resume_filename = Column(String(255), nullable=False, default="resume.pdf")
    job_title = Column(String(255), nullable=False, default="Target Job")
    match_score = Column(Float, nullable=False, default=0.0)
    
    # Structured JSON data
    matching_skills = Column(JSON, nullable=False, default=list)
    missing_skills = Column(JSON, nullable=False, default=list)
    recommended_skills = Column(JSON, nullable=False, default=list)
    strengths = Column(JSON, nullable=False, default=list)
    weaknesses = Column(JSON, nullable=False, default=list)
    
    # Paragraph summaries
    experience_analysis = Column(Text, nullable=False, default="")
    project_analysis = Column(Text, nullable=False, default="")
    summary = Column(Text, nullable=False, default="")
    
    # List of interview preparation questions
    interview_questions = Column(JSON, nullable=False, default=list)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to user
    user = relationship("User", back_populates="analyses")
