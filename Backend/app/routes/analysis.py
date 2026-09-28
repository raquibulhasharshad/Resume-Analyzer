from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Analysis
from app.schemas import AnalyzeRequest, AnalysisResultResponse, ChatRequest, ChatResponse
from app.services.resume_analyzer import analyze_resume_and_match
from app.services.llm_service import answer_analysis_chat_question
from app.utils.auth import get_current_user, get_optional_current_user

router = APIRouter(prefix="/analysis", tags=["Analysis"])

@router.post("/analyze", response_model=AnalysisResultResponse)
def analyze_resume(
    request: AnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Protected Endpoint: Requires user login.
    Runs full RAG + FAISS + LLM analysis and persists record under current candidate's user ID.
    """
    if not request.resume_text or len(request.resume_text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Resume text is empty or too short for analysis.")

    if not request.job_description or len(request.job_description.strip()) < 10:
        raise HTTPException(status_code=400, detail="Job description is empty or too short for analysis.")

    try:
        result = analyze_resume_and_match(
            resume_text=request.resume_text,
            job_description=request.job_description,
            db=db,
            filename=request.filename or "Uploaded_Resume.pdf",
            job_title=request.job_title,
            user_id=current_user.id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis pipeline error: {str(e)}")

@router.post("/chat", response_model=ChatResponse)
def chat_with_analysis(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Interactive AI Resume Assistant Chat endpoint.
    Answers candidate questions regarding their resume evaluation, missing skills, and interview prep.
    """
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Chat message cannot be empty.")

    job_title = request.job_title or "Target Role"
    match_score = request.match_score or 0
    matching_skills = request.matching_skills or []
    missing_skills = request.missing_skills or []

    # If analysis_id is provided, pull exact record from DB
    if request.analysis_id:
        analysis_record = db.query(Analysis).filter(Analysis.id == request.analysis_id).first()
        if analysis_record:
            job_title = analysis_record.job_title
            match_score = int(analysis_record.match_score)
            matching_skills = analysis_record.matching_skills or []
            missing_skills = analysis_record.missing_skills or []

    history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history] if request.history else []

    reply = answer_analysis_chat_question(
        message=request.message,
        job_title=job_title,
        match_score=match_score,
        matching_skills=matching_skills,
        missing_skills=missing_skills,
        history=history_dicts
    )

    return ChatResponse(reply=reply)
