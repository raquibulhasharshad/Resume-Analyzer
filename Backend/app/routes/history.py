from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Analysis, User
from app.schemas import HistoryItemResponse, AnalysisResultResponse
from app.utils.auth import get_current_user

router = APIRouter(prefix="/history", tags=["History"])

@router.get("", response_model=List[HistoryItemResponse])
def get_analysis_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Protected Endpoint: Retrieve history of analyses belonging strictly to current logged-in candidate."""
    history = db.query(Analysis).filter(Analysis.user_id == current_user.id).order_by(Analysis.created_at.desc()).all()
    return history

@router.get("/{analysis_id}", response_model=AnalysisResultResponse)
def get_analysis_by_id(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Protected Endpoint: Retrieve detailed historical analysis by ID for authenticated user."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail=f"Analysis with ID {analysis_id} not found or unauthorized.")
    return analysis

@router.delete("/{analysis_id}")
def delete_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Protected Endpoint: Delete a historical analysis record belonging to current candidate."""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail=f"Analysis with ID {analysis_id} not found or unauthorized.")
    
    db.delete(analysis)
    db.commit()
    return {"message": f"Analysis ID {analysis_id} deleted successfully."}
