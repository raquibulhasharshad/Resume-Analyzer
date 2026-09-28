import re
from typing import Dict, List, Set, Tuple, Optional

# Tech skill taxonomy
TECH_SKILLS = [
    "python", "java", "c++", "c#", "javascript", "typescript", "react", "next.js", "vue", "angular",
    "node.js", "express", "fastapi", "django", "flask", "spring boot", "sql", "postgresql", "mysql",
    "mongodb", "redis", "docker", "kubernetes", "aws", "azure", "gcp", "git", "github", "gitlab",
    "html", "css", "tailwind", "tailwind css", "bootstrap", "rest api", "graphql", "linux", "bash",
    "pandas", "numpy", "scikit-learn", "pytorch", "tensorflow", "opencv", "scipy", "pytest"
]

AI_ML_SKILLS = [
    "nlp", "natural language processing", "transformers", "embeddings", "rag", "retrieval augmented generation",
    "langchain", "faiss", "vector store", "vector databases", "vector search", "hugging face", "huggingface",
    "generative ai", "genai", "llm", "large language models", "prompt engineering", "fine-tuning",
    "bert", "gpt", "deep learning", "machine learning", "computer vision", "reinforcement learning",
    "neural networks", "sentence transformers", "ollama", "chromadb", "pinecone", "qdrant"
]

BUSINESS_SALES_SKILLS = [
    "sales", "b2b", "b2c", "lead generation", "negotiation", "crm", "salesforce", "hubspot",
    "account management", "cold calling", "business development", "client relations", "closing",
    "prospecting", "pipeline management", "contract negotiation", "sales strategy", "key account",
    "market research", "revenue growth", "customer success"
]

SOFT_SKILLS = [
    "communication", "leadership", "problem solving", "teamwork", "time management", "adaptability",
    "critical thinking", "agile", "collaboration", "organization", "analytical skills", "creativity",
    "project management", "scrum"
]

ALL_KNOWN_SKILLS = TECH_SKILLS + AI_ML_SKILLS + BUSINESS_SALES_SKILLS + SOFT_SKILLS

def clean_text(text: str) -> str:
    """Clean and normalize extracted text from PDF or raw input."""
    if not text:
        return ""
    # Remove control characters
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', text)
    # Replace multiple newlines/spaces with single space
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def is_valid_resume(text: str) -> Tuple[bool, str]:
    """
    Validate whether an extracted PDF text snippet represents a legitimate resume/CV.
    Filters out bills, invoices, textbooks, source code dumps, and non-resume files.
    """
    if not text or len(text.strip()) < 80:
        return False, "The uploaded PDF is empty or contains insufficient text content."

    text_lower = text.lower()

    # Blacklist non-resume document markers (invoices, receipts, tax forms, bank statements)
    non_resume_blacklist = [
        "tax invoice", "invoice #", "bill to:", "total amount due", "receipt #",
        "purchase order", "bank statement", "account statement", "payment reference"
    ]
    if any(marker in text_lower for marker in non_resume_blacklist):
        return False, "⚠️ Invalid Document: The uploaded PDF appears to be an invoice or financial statement, not a resume."

    # Check for typical resume section headings
    resume_sections = [
        "experience", "education", "skills", "projects", "summary", "work history",
        "employment", "qualifications", "certifications", "profile", "contact", "background"
    ]
    section_matches = sum(1 for section in resume_sections if re.search(r'\b' + re.escape(section) + r'\b', text_lower))

    # Check contact & profile indicators
    has_email = bool(re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text))
    has_phone = bool(re.search(r'\+?\d[\d\s-]{8,}', text))
    has_links = "linkedin.com" in text_lower or "github.com" in text_lower or "portfolio" in text_lower

    # Check for skills matches
    skills_found = extract_skills(text)["all_skills"]

    if section_matches >= 2 or has_email or (has_phone and len(skills_found) >= 1) or (has_links and section_matches >= 1) or len(skills_found) >= 3:
        return True, "Valid Resume"

    return False, "⚠️ Invalid Document: The uploaded file does not appear to be a professional resume or CV. Please upload a valid resume containing your work experience, skills, and education."

def detect_domain(text: str) -> str:
    """Detect the core professional domain of a text snippet."""
    text_lower = text.lower()
    
    ai_score = sum(1 for k in AI_ML_SKILLS if re.search(r'\b' + re.escape(k) + r'\b', text_lower))
    tech_score = sum(1 for k in TECH_SKILLS if re.search(r'\b' + re.escape(k) + r'\b', text_lower))
    sales_score = sum(1 for k in BUSINESS_SALES_SKILLS if re.search(r'\b' + re.escape(k) + r'\b', text_lower))
    
    if sales_score > tech_score and sales_score > ai_score:
        return "Sales & Business Management"
    elif ai_score >= 2 or (ai_score > 0 and ai_score >= tech_score):
        return "Generative AI & Data Science"
    elif tech_score > 0:
        return "Software Engineering & Development"
    elif any(k in text_lower for k in ["marketing", "seo", "social media", "content"]):
        return "Marketing & Communications"
    elif any(k in text_lower for k in ["finance", "accounting", "auditing", "tax", "payroll"]):
        return "Finance & Accounting"
    
    return "General / Non-Technical Domain"

def extract_skills(text: str) -> Dict[str, List[str]]:
    """Extract categorized skills from raw text using pattern matching."""
    text_lower = text.lower()
    
    found_tech = []
    for skill in TECH_SKILLS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found_tech.append(skill.title() if len(skill) > 3 else skill.upper())
            
    found_ai = []
    for skill in AI_ML_SKILLS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found_ai.append(skill.title() if len(skill) > 3 else skill.upper())
            
    found_biz = []
    for skill in BUSINESS_SALES_SKILLS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found_biz.append(skill.title())

    found_soft = []
    for skill in SOFT_SKILLS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found_soft.append(skill.title())
            
    return {
        "technical_skills": list(set(found_tech)),
        "ai_ml_skills": list(set(found_ai)),
        "business_sales_skills": list(set(found_biz)),
        "soft_skills": list(set(found_soft)),
        "all_skills": list(set(found_tech + found_ai + found_biz + found_soft))
    }

def extract_experience_years(text: str) -> Optional[str]:
    """Extract required or candidate experience years from text."""
    patterns = [
        r'(\d+)\+?\s*(?:-\s*\d+)?\s*(?:years?|yrs?)\b',
        r'(?:experience of|with)\s*(\d+)\+?\s*(?:years?|yrs?)\b'
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return f"{match.group(1)}+ years"
    return "Not explicitly specified"

def extract_job_title(jd_text: str) -> str:
    """Smart extraction of job title from job description text."""
    role_pattern = r'\b(sales manager|sales executive|business development manager|account executive|account manager|sales representative|java developer|python developer|generative ai engineer|genai engineer|ai engineer|machine learning engineer|nlp engineer|data scientist|full stack developer|backend engineer|software engineer|frontend developer|devops engineer|product manager|hr manager)\b'
    match = re.search(role_pattern, jd_text, re.IGNORECASE)
    if match:
        return match.group(1).title()

    title_label_match = re.search(r'(?:job title|role|position)\s*:\s*([^\n\r]{3,50})', jd_text, re.IGNORECASE)
    if title_label_match:
        return title_label_match.group(1).strip().title()

    blacklist_headings = (
        "benefits", "requirements", "qualifications", "responsibilities", "about us",
        "overview", "summary", "description", "job description", "who we are",
        "what you will do", "company overview", "perks", "location", "salary", "compensation"
    )

    lines = [line.strip() for line in jd_text.split('\n') if line.strip()]
    for line in lines[:5]:
        line_clean = line.lower().strip()
        if len(line) < 60 and not line_clean.startswith(blacklist_headings) and line_clean not in blacklist_headings:
            return line.title()

    return "Target Job Role"

def calculate_keyword_match(resume_text: str, jd_text: str) -> Dict:
    """Calculate deterministic skill match score and identify matching/missing skills."""
    resume_skills_dict = extract_skills(resume_text)
    jd_skills_dict = extract_skills(jd_text)
    
    resume_skills_set = set([s.lower() for s in resume_skills_dict["all_skills"]])
    jd_skills_set = set([s.lower() for s in jd_skills_dict["all_skills"]])
    
    if not jd_skills_set:
        words_in_jd = set(re.findall(r'\b[a-z]{3,}\b', jd_text.lower()))
        words_in_resume = set(re.findall(r'\b[a-z]{3,}\b', resume_text.lower()))
        common = words_in_jd.intersection(words_in_resume)
        score = min(100, int((len(common) / max(1, len(words_in_jd))) * 100 * 0.8))
        return {
            "keyword_score": score,
            "matching_skills": [],
            "missing_skills": ["Role Requirements"],
            "recommended_skills": ["Domain Alignment"]
        }
        
    matching_set = resume_skills_set.intersection(jd_skills_set)
    missing_set = jd_skills_set - resume_skills_set
    
    matching_skills = [s.title() if len(s) > 3 else s.upper() for s in matching_set]
    missing_skills = [s.title() if len(s) > 3 else s.upper() for s in missing_set]
    
    recommended_skills = missing_skills[:4] if missing_skills else ["Advanced Strategy", "Domain Expertise"]
    keyword_score = min(100, int((len(matching_set) / max(1, len(jd_skills_set))) * 100))
    
    return {
        "keyword_score": keyword_score,
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "recommended_skills": recommended_skills
    }
