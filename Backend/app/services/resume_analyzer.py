import logging
from typing import Optional
from sqlalchemy.orm import Session
from app.utils.text_processing import calculate_keyword_match, extract_job_title, detect_domain
from app.services.embedding_service import compute_cosine_similarity
from app.services.vector_service import ResumeVectorStore
from app.services.llm_service import generate_llm_analysis
from app.models import Analysis

logger = logging.getLogger(__name__)

def analyze_resume_and_match(
    resume_text: str,
    job_description: str,
    db: Session,
    filename: str = "Uploaded_Resume.pdf",
    job_title: str = None,
    user_id: Optional[int] = None
) -> Analysis:
    """
    Complete RAG + Hybrid Matching Analysis Pipeline:
    1. Extract Job Title & Domain Classifications
    2. Deterministic keyword skill extraction & matching (40% weight)
    3. Sentence Transformers Semantic Embedding Similarity (60% weight)
    4. FAISS Chunk Indexing & RAG Retrieval
    5. Domain Mismatch Detection
    6. Structured AI analysis via LLM / RAG Synthesizer
    7. Store analysis into Database via SQLAlchemy
    """
    if not job_title or job_title == "Job Role":
        job_title = extract_job_title(job_description)

    # Domain Classification
    candidate_domain = detect_domain(resume_text)
    target_domain = detect_domain(job_description)
    
    domain_mismatch = (candidate_domain != target_domain) and ("General" not in candidate_domain and "General" not in target_domain)
    domain_mismatch_warning = None
    if domain_mismatch:
        domain_mismatch_warning = f"⚠️ AI DOMAIN MISMATCH DETECTED: Your resume is tailored for '{candidate_domain}', whereas the target position requires expertise in '{target_domain}'."

    logger.info(f"Analysis for file '{filename}' vs job '{job_title}'. Candidate Domain: {candidate_domain}, Target Domain: {target_domain} (Mismatch: {domain_mismatch})")

    # Step 1: Keyword Matching (40% weight)
    keyword_metrics = calculate_keyword_match(resume_text, job_description)
    keyword_score = keyword_metrics["keyword_score"]

    # Step 2: Semantic Similarity Embedding (60% weight)
    semantic_sim = compute_cosine_similarity(resume_text, job_description)
    semantic_score = int(semantic_sim * 100)

    # Step 3: Hybrid Final Score Calculation
    hybrid_score = int(0.4 * keyword_score + 0.6 * semantic_score)
    final_score = max(0, min(100, hybrid_score))

    logger.info(f"Scores computed -> Keyword: {keyword_score}%, Semantic: {semantic_score}%, Final Hybrid: {final_score}%")

    # Step 4: FAISS Vector Indexing & RAG Context Retrieval
    vector_store = ResumeVectorStore(chunk_size=400, chunk_overlap=50)
    vector_store.create_index_from_text(resume_text)
    rag_context = vector_store.get_context_for_rag(job_description, k=4)

    # Step 5: Structured AI / LLM Analysis
    analysis_data = generate_llm_analysis(
        resume_text=resume_text,
        job_description=job_description,
        rag_context=rag_context,
        keyword_analysis=keyword_metrics,
        match_score=final_score,
        job_title=job_title
    )

    # If domain mismatch, enrich summary
    summary_final = analysis_data.get("summary", "")
    if domain_mismatch and "domain mismatch" not in summary_final.lower():
        summary_final = f"⚠️ DOMAIN MISMATCH DETECTED ({candidate_domain} vs {target_domain}). {summary_final}"

    # Step 6: Save to Database
    db_analysis = Analysis(
        user_id=user_id,
        resume_filename=filename,
        job_title=job_title,
        match_score=final_score,
        matching_skills=analysis_data.get("matching_skills", []),
        missing_skills=analysis_data.get("missing_skills", []),
        recommended_skills=analysis_data.get("recommended_skills", []),
        strengths=analysis_data.get("strengths", []),
        weaknesses=analysis_data.get("weaknesses", []),
        experience_analysis=analysis_data.get("experience_analysis", ""),
        project_analysis=analysis_data.get("project_analysis", ""),
        summary=summary_final,
        interview_questions=analysis_data.get("interview_questions", [])
    )

    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)

    # Dynamic metadata attachment for response schema
    setattr(db_analysis, "domain_mismatch", domain_mismatch)
    setattr(db_analysis, "candidate_domain", candidate_domain)
    setattr(db_analysis, "target_domain", target_domain)
    setattr(db_analysis, "domain_mismatch_warning", domain_mismatch_warning)

    logger.info(f"Analysis saved successfully with DB ID: {db_analysis.id} for User ID: {user_id}")
    return db_analysis
