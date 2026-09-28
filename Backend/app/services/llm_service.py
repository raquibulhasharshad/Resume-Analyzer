import json
import logging
import re
from typing import Dict, Any, List
import requests
from app.config import settings

logger = logging.getLogger(__name__)

ANALYSIS_SYSTEM_PROMPT = """You are an expert recruitment manager and talent evaluation specialist.
Your task is to analyze a candidate's resume against a job description using the retrieved context from their resume.

CRITICAL REQUIREMENT: You MUST respond ONLY with valid JSON, formatted exactly according to this structure without any markdown formatting or surrounding text:
{
  "summary": "Concise 2-3 sentence recruiter assessment summarizing the candidate match suitability.",
  "strengths": ["Key strength 1", "Key strength 2", "Key strength 3"],
  "weaknesses": ["Area of improvement 1", "Area of improvement 2"],
  "matching_skills": ["Skill 1", "Skill 2"],
  "missing_skills": ["Missing Skill 1", "Missing Skill 2"],
  "recommended_skills": ["Recommended Skill 1", "Recommended Skill 2"],
  "experience_analysis": "Detailed 2-3 sentence evaluation of candidate's experience level against the job requirements.",
  "project_analysis": "Detailed 2-3 sentence evaluation of candidate's relevant projects or practical work.",
  "interview_questions": [
    "Targeted interview question 1 addressing role requirements or candidate skills",
    "Behavioral or scenario-based question 2",
    "Domain-specific question 3 relevant to the job title",
    "Problem-solving or strategy question 4",
    "Role competency question 5"
  ]
}
"""

def call_google_gemini_api(system_prompt: str, user_prompt: str, api_key: str, model_name: str = "gemini-1.5-flash") -> str:
    """Make direct HTTP request to Google Gemini API."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
    payload = {
        "system_instruction": {
            "parts": [{"text": system_prompt}]
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": user_prompt}]
            }
        ]
    }
    res = requests.post(url, json=payload, timeout=15)
    if res.status_code == 200:
        data = res.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
    raise ValueError(f"Gemini API returned status {res.status_code}: {res.text}")


def generate_llm_analysis(
    resume_text: str,
    job_description: str,
    rag_context: str,
    keyword_analysis: Dict[str, Any],
    match_score: int,
    job_title: str = "Target Job Role"
) -> Dict[str, Any]:
    """
    Generate structured AI analysis using configured LLM API (Google Gemini or OpenAI).
    Falls back gracefully to intelligent domain synthesizer if LLM API is not configured or fails.
    """
    api_key = getattr(settings, "GEMINI_API_KEY", "").strip() or settings.LLM_API_KEY.strip()
    
    if api_key and api_key != "your_key_here":
        prompt_content = f"""
TARGET JOB ROLE: {job_title}
CANDIDATE RETRIEVED RESUME CONTEXT (RAG):
{rag_context}

FULL RESUME TEXT:
{resume_text[:2000]}

JOB DESCRIPTION:
{job_description[:2000]}

KEYWORD & EMBEDDING METRICS:
Calculated Match Score: {match_score}%
Matching Skills Identified: {", ".join(keyword_analysis.get("matching_skills", []))}
Missing Skills Identified: {", ".join(keyword_analysis.get("missing_skills", []))}

Provide a thorough, highly realistic assessment in pure JSON format as instructed in system prompt.
"""
        # Direct Google Gemini API Support
        if api_key.startswith("AIza") or "gemini" in settings.LLM_MODEL.lower():
            try:
                logger.info("Calling Google Gemini API for candidate analysis...")
                raw_reply = call_google_gemini_api(ANALYSIS_SYSTEM_PROMPT, prompt_content, api_key, model_name="gemini-1.5-flash")
                cleaned = raw_reply.replace("```json", "").replace("```", "").strip()
                parsed = json.loads(cleaned)
                return validate_and_enrich_analysis(parsed, keyword_analysis, match_score, job_title, job_description)
            except Exception as e:
                logger.error(f"Google Gemini API call failed: {e}. Trying fallback...")

        # OpenAI-compatible API Support
        try:
            logger.info("Attempting LLM call via OpenAI-compatible API...")
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": settings.LLM_MODEL or "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
                    {"role": "user", "content": prompt_content}
                ],
                "temperature": 0.3,
                "response_format": {"type": "json_object"}
            }

            response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=15)
            
            if response.status_code == 200:
                res_json = response.json()
                content = res_json["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                logger.info("Successfully received response from LLM API")
                return validate_and_enrich_analysis(parsed, keyword_analysis, match_score, job_title, job_description)
        except Exception as e:
            logger.error(f"LLM API request failed: {str(e)}. Falling back to NLP synthesis engine.")

    # Local fallback engine if LLM API key is not present or failed
    logger.info("Using intelligent domain synthesis generator...")
    return synthesize_fallback_analysis(resume_text, job_description, rag_context, keyword_analysis, match_score, job_title)


def validate_and_enrich_analysis(data: Dict[str, Any], keyword_analysis: Dict[str, Any], match_score: int, job_title: str, job_description: str) -> Dict[str, Any]:
    """Ensure all required fields exist and contain realistic content."""
    matching_skills = data.get("matching_skills") or keyword_analysis.get("matching_skills", [])
    missing_skills = data.get("missing_skills") or keyword_analysis.get("missing_skills", [])
    recommended_skills = data.get("recommended_skills") or keyword_analysis.get("recommended_skills", [])
    
    return {
        "match_score": match_score,
        "matching_skills": list(matching_skills),
        "missing_skills": list(missing_skills),
        "recommended_skills": list(recommended_skills),
        "strengths": data.get("strengths") or [
            "Demonstrated experience in foundational domain competencies.",
            "Clear technical background and project portfolio structure.",
            "Adaptable skill set with transferable problem-solving capabilities."
        ],
        "weaknesses": data.get("weaknesses") or [
            f"Lacks direct experience in key required role skills: {', '.join(missing_skills[:3]) if missing_skills else 'specialized requirements'}.",
            "Could enhance resume with domain-specific metrics and measurable achievements."
        ],
        "experience_analysis": data.get("experience_analysis") or f"The candidate's experience yields a {match_score}% match score for the {job_title} position.",
        "project_analysis": data.get("project_analysis") or f"Projects highlight practical application of skills, though further alignment with {job_title} requirements is recommended.",
        "summary": data.get("summary") or f"Candidate presents a {match_score}% match profile for {job_title}.",
        "interview_questions": data.get("interview_questions") or generate_interview_questions(missing_skills, matching_skills, job_description, job_title)
    }


def synthesize_fallback_analysis(
    resume_text: str,
    job_description: str,
    rag_context: str,
    keyword_analysis: Dict[str, Any],
    match_score: int,
    job_title: str = "Target Job Role"
) -> Dict[str, Any]:
    """
    Intelligent domain synthesis generator for realistic candidate evaluations.
    """
    matching = keyword_analysis.get("matching_skills", [])
    missing = keyword_analysis.get("missing_skills", [])
    recommended = keyword_analysis.get("recommended_skills", [])
    
    context_preview = rag_context[:250].replace("\n", " ") if rag_context else resume_text[:250]
    
    if match_score >= 80:
        summary_text = f"The candidate demonstrates an outstanding profile with {match_score}% job compatibility for the {job_title} role. Highly aligned across key technical competencies ({', '.join(matching[:3]) if matching else 'core skills'}) and domain experience."
    elif match_score >= 60:
        summary_text = f"The candidate is a good match with a {match_score}% overall compatibility score for the {job_title} role. Shows strong foundational alignment in {', '.join(matching[:3]) if matching else 'core areas'}, though bridging gaps in {', '.join(missing[:2]) if missing else 'specialized skills'} will increase fit."
    elif match_score >= 40:
        summary_text = f"The candidate shows a moderate match score of {match_score}% for the {job_title} role. Possesses transferable technical exposure, but lacks direct experience in key role requirements such as {', '.join(missing[:3]) if missing else 'domain tools'}."
    else:
        summary_text = f"The candidate has a low match score of {match_score}% for the {job_title} position. There is a significant domain mismatch between the candidate's background and the target role requirements ({', '.join(missing[:3]) if missing else 'key requirements'})."

    strengths = []
    if matching:
        strengths.append(f"Matching core job skills: {', '.join(matching[:4])}.")
    else:
        strengths.append("Demonstrated foundational technical & problem-solving background.")
    strengths.append("Structured resume with clear project and work history formatting.")
    strengths.append(f"Retrieved resume context snippet: \"{context_preview[:100]}...\"")

    weaknesses = []
    if missing:
        weaknesses.append(f"Missing core job requirements: {', '.join(missing[:4])}.")
    else:
        weaknesses.append("Resume could include more quantifiable impact metrics.")
    weaknesses.append(f"Resume lacks explicit domain alignment with target {job_title} responsibilities.")

    experience_analysis = f"Based on retrieved resume segments, the candidate's experience profile yields a {match_score}% match for the {job_title} position. { 'Key skills like ' + ', '.join(matching[:3]) + ' are present.' if matching else 'Significant domain skill gaps were detected.' }"
    project_analysis = f"Projects demonstrate software & implementation experience. Enhancing descriptions with direct alignment to {', '.join(missing[:2]) if missing else job_title} will increase candidate competitiveness."

    interview_questions = generate_interview_questions(missing, matching, job_description, job_title)

    return {
        "match_score": match_score,
        "matching_skills": matching,
        "missing_skills": missing,
        "recommended_skills": recommended,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "experience_analysis": experience_analysis,
        "project_analysis": project_analysis,
        "summary": summary_text,
        "interview_questions": interview_questions
    }


def generate_interview_questions(
    missing_skills: List[str],
    matching_skills: List[str],
    job_description: str = "",
    job_title: str = ""
) -> List[str]:
    """
    Generate realistic, role-tailored interview questions.
    Distinguishes between Sales/Business roles vs Tech/AI roles.
    """
    text_combined = (job_title + " " + job_description).lower()
    is_sales_or_biz = any(k in text_combined for k in ["sales", "business development", "account executive", "account manager", "client", "revenue", "b2b", "lead generation"])
    
    questions = []

    if is_sales_or_biz:
        questions.append("How do you approach lead qualification, cold outreach, and building rapport with enterprise clients?")
    elif "ai" in text_combined or "rag" in text_combined or "llm" in text_combined or "transformer" in text_combined:
        questions.append("Explain how FAISS vector search works and why inner product / L2 distance is used for semantic retrieval in RAG applications.")
    else:
        questions.append(f"Walk me through your architectural design process for building production applications for the {job_title or 'target'} role.")

    if missing_skills:
        skill = missing_skills[0]
        if skill.lower() in ["leadership", "communication", "teamwork", "adaptability", "organization"]:
            questions.append(f"The job requires strong {skill}. Can you share a specific situation where you demonstrated effective {skill} to align stakeholders and deliver results?")
        else:
            questions.append(f"The role requires proficiency in {skill}. What prior experience do you have with {skill}, or how would you quickly get up to speed?")
    else:
        questions.append("How do you prioritize competing project deadlines and manage technical debt in high-tempo environments?")

    if is_sales_or_biz:
        questions.append("Describe a challenging negotiation where you encountered strong customer objections. How did you handle the situation and close the deal?")
    else:
        questions.append("What is the difference between sparse keyword matching (e.g., BM25) and dense vector embeddings? When should you implement a hybrid search strategy?")

    if matching_skills:
        skill_match = matching_skills[0]
        if skill_match.lower() in ["leadership", "communication", "teamwork"]:
            questions.append(f"Can you provide an example of how your {skill_match} contributed to overcoming a critical team challenge?")
        else:
            questions.append(f"Walk me through a complex project where you leveraged {skill_match} to solve a key technical or operational challenge?")
    else:
        questions.append("How do you approach learning and mastering new domain frameworks when transitioning into a new role?")

    if is_sales_or_biz:
        questions.append("What CRM platforms (e.g., Salesforce, HubSpot) and pipeline tracking metrics do you rely on to consistently achieve your revenue targets?")
    else:
        questions.append("How do you monitor, evaluate, and ensure reliability and performance when deploying applications to production?")

    return questions


def answer_analysis_chat_question(
    message: str,
    job_title: str,
    match_score: int,
    matching_skills: List[str],
    missing_skills: List[str],
    history: List[Dict[str, str]] = None
) -> str:
    """
    Gemini-Style Interactive Career Coach Chat Assistant.
    Provides structured Markdown responses, cover letters, STAR interview answers, and resume bullet rewriters.
    """
    api_key = getattr(settings, "GEMINI_API_KEY", "").strip() or settings.LLM_API_KEY.strip()
    
    if api_key and api_key != "your_key_here":
        system_prompt = f"""You are Gemini AI Career Coach, a world-class executive recruiter and Generative AI career mentor.
You are coaching a candidate who completed a resume match evaluation for the position of '{job_title}'.

EVALUATION CONTEXT:
- Match Score: {match_score}%
- Matching Skills Found: {', '.join(matching_skills) if matching_skills else 'None identified'}
- Missing Required Skills: {', '.join(missing_skills) if missing_skills else 'None missing'}

STYLE GUIDELINES (Gemini-Style):
1. Be highly supportive, professional, and actionable.
2. Structure your answers with clear Markdown formatting: bold titles, bullet points, numbered steps, and code/quote blocks where appropriate.
3. When asked for cover letters, resume rephrasing, or interview answers, provide ready-to-use, polished text.
"""
        # Direct Google Gemini API Support
        if api_key.startswith("AIza") or "gemini" in settings.LLM_MODEL.lower():
            try:
                logger.info("Calling Google Gemini API for Chatbot response...")
                user_full = f"{system_prompt}\n\nUser Question: {message}"
                return call_google_gemini_api(system_prompt, message, api_key, model_name="gemini-1.5-flash")
            except Exception as e:
                logger.error(f"Google Gemini Chat call failed: {e}")

        # OpenAI API Support
        try:
            logger.info("Calling OpenAI API for Interactive Resume Chat...")
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            messages = [{"role": "system", "content": system_prompt}]
            if history:
                for h in history[-8:]:
                    messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
            messages.append({"role": "user", "content": message})

            payload = {
                "model": settings.LLM_MODEL or "gpt-4o-mini",
                "messages": messages,
                "temperature": 0.6
            }

            res = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=14)
            if res.status_code == 200:
                reply = res.json()["choices"][0]["message"]["content"]
                return reply
        except Exception as e:
            logger.error(f"LLM Chat call failed: {e}")

    # Gemini-style local synthesis engine for Interactive Career Coach Chat
    msg_lower = message.lower()
    missing_str = ", ".join(missing_skills[:3]) if missing_skills else "advanced role requirements"
    matching_str = ", ".join(matching_skills[:3]) if matching_skills else "core foundational skills"
    top_missing = missing_skills[0] if missing_skills else "domain strategy"

    if any(k in msg_lower for k in ["cover letter", "cold email", "outreach", "draft letter"]):
        return f"""✉️ **Tailored Cover Letter for {job_title}**

Dear Hiring Team,

I am writing to express my strong enthusiasm for the **{job_title}** position. With a solid foundation in **{matching_str}**, I have consistently focused on building scalable solutions and delivering measurable business impact.

While reviewing the role requirements, I noted your emphasis on **{missing_str}**. I have already initiated active development to expand my proficiency in these tools and am eager to apply my analytical background to drive results for your team.

I would welcome the opportunity to discuss how my background in **{matching_str}** aligns with your goals for this role.

Sincerely,  
*Candidate*"""

    elif any(k in msg_lower for k in ["rephrase", "bullet", "rewrite", "points", "resume impact"]):
        return f"""✍️ **Gemini-Enhanced Resume Bullet Points for {job_title}**

1. **Impact-Driven Competency**:
> Spearheaded project initiatives leveraging **{matching_str}**, improving workflow efficiency by **28%** and reducing turnaround time across key deliverables.

2. **Technical & Domain Alignment**:
> Architected and deployed modular solutions incorporating **{top_missing}** and **{matching_str}**, ensuring **99.9%** system uptime and operational alignment with **{job_title}** standards.

3. **Cross-Functional Collaboration**:
> Partnered with cross-functional stakeholders to streamline pipeline performance, expanding skill coverage in **{missing_skills[1] if len(missing_skills) > 1 else 'scalable architecture'}**."""

    elif any(k in msg_lower for k in ["interview", "mock", "question", "star", "answer"]):
        return f"""🎯 **STAR Method Mock Answer for {job_title} Interview**

**Question**: How do you handle missing technical requirements like {top_missing} when starting a new project?

- **Situation (S)**: In my previous project, we needed to integrate **{top_missing}** into our workflow within a tight 3-week deadline despite limited prior team exposure.
- **Task (T)**: My objective was to master the fundamentals of **{top_missing}**, design a proof-of-concept, and maintain seamless integration with our **{matching_str}** stack.
- **Action (A)**: I dedicated time to intensive documentation review, built a hands-on sandbox prototype, and conducted peer code reviews to ensure best practices.
- **Result (R)**: Successfully delivered the implementation **2 days ahead of schedule**, achieving **100%** compliance with project requirements."""

    elif any(k in msg_lower for k in ["project", "portfolio", "build", "idea"]):
        return f"""🛠️ **Recommended Portfolio Project for {job_title}**

### **Project Blueprint: End-to-End {job_title} Pipeline**
- **Core Tech Stack**: Combine your existing strength in **{matching_str}** with missing role requirement **{top_missing}**.
- **Key Feature**: Build a production-ready application demonstrating automated workflow processing, real-time metrics tracking, and API integration.
- **GitHub Documentation**: Include a clean README with architectural diagrams, deployment steps, and benchmark metrics to impress recruiters."""

    else:
        return f"""🤖 **Gemini AI Career Coach Roadmap for {job_title}**

Currently, your candidate match score is **{match_score}%**. Here is your 3-step action plan to reach **90%+ Match Alignment**:

1. **Bridge Key Skill Gaps**: Add explicit projects or certifications covering **{missing_str}**.
2. **Optimize Resume Verbs**: Rephrase your experience bullets to highlight quantifiable impact using **{matching_str}**.
3. **Prepare Role Scenarios**: Practice STAR-method interview answers tailored for **{job_title}**.

What specific area would you like to work on next? (e.g., Cover Letter, Resume Bullets, or Interview Q&A)"""
