import React from 'react';
import { Cpu, Database, Brain, GitBranch, Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800/80 bg-[#070a12] py-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-sm text-gray-400 font-medium">
              AI Resume Analyzer & Job Matcher &copy; {new Date().getFullYear()}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Production Generative AI Stack: LangChain &bull; Sentence Transformers &bull; FAISS &bull; FastAPI &bull; PostgreSQL
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-gray-900 border border-gray-800 text-indigo-400">
              <Brain className="w-3.5 h-3.5" /> Transformers
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-gray-900 border border-gray-800 text-purple-400">
              <Cpu className="w-3.5 h-3.5" /> LangChain RAG
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-gray-900 border border-gray-800 text-cyan-400">
              <Database className="w-3.5 h-3.5" /> FAISS Vector DB
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-gray-900 border border-gray-800 text-emerald-400">
              <Terminal className="w-3.5 h-3.5" /> FastAPI + SQL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
