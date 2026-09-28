from fastapi import APIRouter, File, UploadFile, HTTPException
from app.schemas import UploadResumeResponse
from app.services.pdf_service import extract_text_from_pdf

router = APIRouter(prefix="/resume", tags=["Resume"])

@router.post("/upload", response_model=UploadResumeResponse)
async def upload_resume(file: UploadFile = File(...)):
    """
    Endpoint to upload a PDF resume and extract plain text.
    Accepts multipart/form-data PDF file.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file provided in request.")

    text = await extract_text_from_pdf(file)
    
    return UploadResumeResponse(
        filename=file.filename,
        text=text,
        message="Resume uploaded and text extracted successfully."
    )
