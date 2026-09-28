import io
import logging
from fastapi import HTTPException, UploadFile
from pypdf import PdfReader
from app.utils.text_processing import clean_text, is_valid_resume

logger = logging.getLogger(__name__)

async def extract_text_from_pdf(file: UploadFile) -> str:
    """
    Extract text content from an uploaded PDF file.
    Validates file extension, size, readable text, and resume structural validity.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF document (.pdf).")

    try:
        contents = await file.read()
        
        # Check size (Max 10 MB)
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds maximum limit of 10MB.")

        pdf_stream = io.BytesIO(contents)
        reader = PdfReader(pdf_stream)
        
        if reader.is_encrypted:
            try:
                reader.decrypt("")
            except Exception:
                raise HTTPException(status_code=400, detail="The PDF file is password protected and cannot be read.")

        extracted_text = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                extracted_text.append(page_text)
                
        full_text = "\n".join(extracted_text)
        cleaned_text = clean_text(full_text)
        
        if not cleaned_text or len(cleaned_text) < 30:
            raise HTTPException(
                status_code=400,
                detail="Could not extract readable text from the uploaded PDF. Ensure it is not a scanned image or empty PDF."
            )

        # Validate whether document is a legitimate resume/CV
        valid, msg = is_valid_resume(cleaned_text)
        if not valid:
            raise HTTPException(status_code=400, detail=msg)

        logger.info(f"Successfully extracted & validated {len(cleaned_text)} characters from resume {file.filename}")
        return cleaned_text

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reading PDF {file.filename}: {str(e)}")
        raise HTTPException(
            status_code=422,
            detail=f"Failed to process PDF file: {str(e)}"
        )
