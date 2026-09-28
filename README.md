# AI Resume Analyzer & Job Matcher

A production-ready, full-stack Generative AI application designed to analyze resume PDFs against target job descriptions using **Retrieval-Augmented Generation (RAG)**, **Sentence Transformer dense vector embeddings**, **FAISS vector search**, **LangChain**, and **PostgreSQL**.

Built specifically to demonstrate production GenAI engineering skills required for a **Fresher Generative AI Engineer** role.

---

## 🌟 Key Features

- 📄 **PDF Text Extraction**: Parse and clean text from uploaded PDF resumes using `pypdf`.
- 🧠 **Dense Semantic Embeddings**: Generate 384-dimensional vector embeddings using Hugging Face `sentence-transformers/all-MiniLM-L6-v2`.
- ⚡ **FAISS Vector Search**: Chunk resume content with LangChain `RecursiveCharacterTextSplitter` and index chunks in FAISS for fast similarity retrieval.
- 🎯 **Hybrid Match Algorithm**: Combines 40% deterministic keyword taxonomy matching with 60% semantic embedding similarity.
- 🤖 **RAG + LLM Synthesis**: Pass top retrieved context chunks to LLM (with fallback RAG synthesis) to generate structured analysis:
  - Overall match percentage (0 - 100%)
  - Matching skills, missing skills, and recommended skills
  - Strengths & weaknesses analysis
  - Experience & project relevance evaluation
  - AI recruiter assessment summary
  - Tailored technical interview preparation questions
- 📊 **SaaS Results Dashboard**: Modern, dark-mode dashboard with SVG circular progress gauge, skill badges, and expandable interview prep accordions.
- 🗄️ **PostgreSQL History Database**: Persists past candidate match reports using SQLAlchemy ORM.
- 🐳 **Dockerized Deployment**: Fully configured with `docker-compose` for Postgres, FastAPI Backend, and React Frontend.

---

## 🏗️ Architecture & Pipeline Flow

```mermaid
graph TD
    A[Uploaded Resume PDF] -->|pypdf| B[Raw Text Extraction & Cleaning]
    B -->|LangChain Text Splitter| C[Text Chunks 400 chars]
    C -->|Sentence Transformers| D[384-d Vector Embeddings]
    D -->|Index Vectors| E[FAISS Vector Store]
    F[Job Description Text] -->|Query| E
    E -->|Retrieve Top-K Chunks| G[Retrieved Resume Context]
    F --> H[Semantic Cosine Sim + Keyword Matcher]
    H -->|Calculate Hybrid Score| I[Match Score 0-100%]
    G & F & I -->|RAG Prompt| J[LangChain / LLM Service]
    J -->|Structured JSON Output| K[Pydantic Validation]
    K -->|Store Analysis| L[PostgreSQL Database]
    K -->|JSON API Response| M[React SaaS Dashboard]
```

---

## 🧮 Matching Algorithm

The matching engine uses a dual-weighted hybrid scoring formula:

1. **Deterministic Keyword Match (40% Weight)**:
   Extracts categorized skills (Technical, AI/ML, Soft Skills) from job description and resume.
   $$\text{Keyword Score} = \left( \frac{\text{Matching Skills Count}}{\text{Total Job Skills Required}} \right) \times 100$$

2. **Semantic Embedding Similarity (60% Weight)**:
   Computes cosine similarity between dense vector representations of full resume text and target job description using `all-MiniLM-L6-v2`.
   $$\text{Semantic Score} = \text{CosineSimilarity}(\vec{E}_{\text{resume}}, \vec{E}_{\text{jd}}) \times 100$$

3. **Final Score Calculation**:
   $$\text{Final Score} = \text{round}(0.40 \times \text{Keyword Score} + 0.60 \times \text{Semantic Score})$$

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 (Glassmorphism & dark gradients)
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Backend
- **Framework**: Python 3.13 / 3.11 + FastAPI + Uvicorn
- **ORM & Database**: SQLAlchemy + PostgreSQL (with SQLite auto-fallback)
- **Validation**: Pydantic v2

### AI / GenAI & NLP
- **Text Splitter & RAG**: LangChain (`RecursiveCharacterTextSplitter`)
- **Embeddings**: Hugging Face Sentence Transformers (`all-MiniLM-L6-v2`)
- **Vector DB**: FAISS (`faiss-cpu`)
- **LLM Integration**: OpenAI / Groq / Gemini compatible API with structured JSON output enforcement & local RAG fallback engine
- **PDF Extraction**: PyPDF (`pypdf`)

---

## 📂 Project Structure

```
ai-resume-analyzer/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
│
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry & CORS
│   │   ├── config.py            # Pydantic environment configuration
│   │   ├── database.py          # SQLAlchemy engine & session setup
│   │   ├── models.py            # Database Analysis ORM schema
│   │   ├── schemas.py           # Pydantic request & response schemas
│   │   ├── routes/
│   │   │   ├── resume.py        # POST /api/resume/upload
│   │   │   ├── analysis.py      # POST /api/analysis/analyze
│   │   │   └── history.py       # GET & DELETE /api/history
│   │   ├── services/
│   │   │   ├── pdf_service.py        # PDF text extraction & validation
│   │   │   ├── embedding_service.py  # SentenceTransformers embedding model
│   │   │   ├── vector_service.py     # FAISS vector store & RAG retriever
│   │   │   ├── llm_service.py        # LLM JSON completion & fallback
│   │   │   └── resume_analyzer.py    # RAG + Hybrid score orchestrator
│   │   └── utils/
│   │       └── text_processing.py    # Skill extraction & text cleaning
│   ├── Dockerfile
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/          # Navbar, Footer, CircularProgress, SkillsCard, InterviewCard, LoadingState, Toast
    │   ├── pages/               # Dashboard, AnalyzeResume, AnalysisResults, History, About
    │   ├── services/            # Axios API client
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css            # Design tokens & glassmorphism utilities
    ├── Dockerfile
    ├── nginx.conf
    └── package.json
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- (Optional) PostgreSQL or Docker

### 1. Setup Backend

```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate
# On Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
```

Create `.env` file inside `backend/`:
```env
DATABASE_URL=postgresql+psycopg2://postgres:password@localhost:5432/resume_analyzer
LLM_API_KEY=your_llm_api_key_here
LLM_MODEL=gpt-4o-mini
FRONTEND_URL=http://localhost:5173
```
*(Note: If PostgreSQL is not running locally, the system automatically falls back to `sqlite:///./resume_analyzer.db` so the app runs without extra setup!)*

Start backend server:
```bash
uvicorn app.main:app --reload --port 8000
```
Backend Swagger API Docs will be available at `http://localhost:8000/docs`.

### 2. Setup Frontend

Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🐳 Running with Docker Compose

To start PostgreSQL, Backend, and Frontend containers simultaneously:

```bash
docker compose up --build
```
- Web Application: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/resume/upload` | Upload PDF file and return extracted text |
| `POST` | `/api/analysis/analyze` | Run RAG + FAISS + LLM job match analysis |
| `GET` | `/api/history` | Retrieve list of all past analyses |
| `GET` | `/api/history/{id}` | Retrieve complete historical report details |
| `DELETE` | `/api/history/{id}` | Delete a history entry by ID |
| `GET` | `/api/health` | Service health status check |

---

## 🎯 Demonstrating Generative AI Engineer Competencies

This project demonstrates core skills required for a **Fresher Generative AI Engineer**:

1. **RAG Architecture**: Document chunking, vector indexing, contextual retrieval, and prompt context injection.
2. **Dense Vector Search**: Sentence-Transformers dense embedding generation and FAISS inner-product similarity search.
3. **Hybrid AI System**: Combining deterministic rule-based algorithms with probabilistic LLM generation.
4. **Production FastAPI & Database Persistence**: Clean REST API design with Pydantic typing, SQLAlchemy ORM, and database fallbacks.
5. **Modern SaaS UI**: Glassmorphic dark UI built with React, Vite, and Tailwind CSS.

---

## 🐙 Git Commands to Push to GitHub

```bash
git init
git add .
git commit -m "feat: Initial commit of AI Resume Analyzer & Job Matcher RAG application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-resume-analyzer.git
git push -u origin main
```
