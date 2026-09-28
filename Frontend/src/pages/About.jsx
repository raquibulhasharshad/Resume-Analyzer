import React from 'react';
import { Cpu, Brain, Database, GitBranch, Terminal, Sparkles, Layers, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/20">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Technical Architecture Overview</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          System Design & RAG Architecture
        </h1>
        <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
          Detailed technical blueprint of how this full-stack application processes resumes using Python, NLP, HuggingFace Sentence Transformers, FAISS, LangChain, and PostgreSQL.
        </p>
      </div>

      {/* PIPELINE FLOWCHART STEPS */}
      <div className="glass-panel rounded-3xl p-8 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <span>End-to-End NLP & RAG Processing Pipeline</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {/* STEP 1 */}
          <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3 relative">
            <span className="absolute top-4 right-4 text-xs font-mono font-bold text-indigo-400">01</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">PDF & Cleaning</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Extracted using <code className="text-indigo-300 font-mono">pypdf</code>. Text normalized, stripping headers, footers, and non-standard control characters.
            </p>
          </div>

          {/* STEP 2 */}
          <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3 relative">
            <span className="absolute top-4 right-4 text-xs font-mono font-bold text-purple-400">02</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Chunking & Embeddings</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              LangChain <code className="text-purple-300 font-mono">RecursiveCharacterTextSplitter</code> splits text into 400-char chunks. <code className="text-purple-300 font-mono">all-MiniLM-L6-v2</code> generates dense vector embeddings.
            </p>
          </div>

          {/* STEP 3 */}
          <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3 relative">
            <span className="absolute top-4 right-4 text-xs font-mono font-bold text-cyan-400">03</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">FAISS Vector Index</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Embeddings indexed in FAISS memory vector store. High-speed similarity retrieval matches resume context chunks against target job description requirements.
            </p>
          </div>

          {/* STEP 4 */}
          <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3 relative">
            <span className="absolute top-4 right-4 text-xs font-mono font-bold text-emerald-400">04</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">LLM & SQL Storage</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Context passed to LLM to produce structured JSON report with interview prep. Stored in PostgreSQL with SQLAlchemy ORM.
            </p>
          </div>
        </div>
      </div>

      {/* MATCHING ALGORITHM EXPLANATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-gray-800 space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-indigo-400" />
            <span>Hybrid Match Scoring Formula</span>
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            The project uses a dual deterministic and semantic similarity hybrid algorithm:
          </p>
          <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 font-mono text-xs text-indigo-300 space-y-2">
            <p>keyword_score = (matching_skills / required_skills) * 100</p>
            <p>semantic_score = cosine_similarity(resume_emb, jd_emb) * 100</p>
            <p className="text-emerald-400 font-bold pt-1 border-t border-gray-800">
              final_match_score = (0.40 * keyword_score) + (0.60 * semantic_score)
            </p>
          </div>
          <p className="text-xs text-gray-400">
            This prevents false negatives from keyword variations while enforcing strict technical requirement compliance.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-gray-800 space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <span>Fresher GenAI Skills Demonstrated</span>
          </h3>
          <ul className="grid grid-cols-2 gap-2 text-xs">
            <li className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-900/60 text-gray-200 border border-gray-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Python 3.13
            </li>
            <li className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-900/60 text-gray-200 border border-gray-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> NLP & Text Processing
            </li>
            <li className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-900/60 text-gray-200 border border-gray-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sentence Transformers
            </li>
            <li className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-900/60 text-gray-200 border border-gray-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> FAISS Vector DB
            </li>
            <li className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-900/60 text-gray-200 border border-gray-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> LangChain RAG
            </li>
            <li className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-900/60 text-gray-200 border border-gray-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> PostgreSQL & SQLAlchemy
            </li>
            <li className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-900/60 text-gray-200 border border-gray-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> FastAPI & REST API
            </li>
            <li className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-900/60 text-gray-200 border border-gray-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> React & Vite SaaS
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
