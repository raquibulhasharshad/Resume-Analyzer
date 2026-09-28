import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Brain, Cpu, FileSearch, ShieldCheck, Zap, History } from 'lucide-react';
import { getHistoryApi } from '../services/api';

export default function Dashboard() {
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecent() {
      try {
        const data = await getHistoryApi();
        setRecentAnalyses(data.slice(0, 3));
      } catch (err) {
        console.error("Failed to load recent history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecent();
  }, []);

  return (
    <div className="space-y-16 pb-12">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 overflow-hidden">
        {/* Glow ambient lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10 px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Generative AI RAG & FAISS Vector Search</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Turn your resume into an <br className="hidden sm:inline" />
            <span className="text-gradient-indigo">AI-powered career advantage.</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Analyze your resume against any job description and discover exactly what skills you need to improve with instant embedding match scores.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/analyze"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-bold text-base shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <FileSearch className="w-5 h-5" />
              <span>Analyze Resume</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/about"
              className="w-full sm:w-auto px-6 py-4 rounded-xl glass-panel text-gray-300 hover:text-white font-semibold text-base border border-gray-800 hover:border-gray-700 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Cpu className="w-5 h-5 text-indigo-400" />
              <span>Explore RAG Architecture</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURE CARDS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white">Engineered for Generative AI Precision</h2>
          <p className="text-sm text-gray-400 mt-1">Full-stack production pipeline integrating HuggingFace, LangChain, FAISS, and SQL</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-gray-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Sentence Embeddings</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Uses <code className="text-indigo-300 font-mono">all-MiniLM-L6-v2</code> to compute 384-dimensional dense semantic vector representations.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-gray-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">FAISS Vector Store</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Chunked resume indexing with inner-product similarity search for exact context retrieval.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-gray-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Hybrid Scoring</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Weighted algorithm combining 40% deterministic keyword match with 60% semantic similarity.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-gray-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Interview Prep</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              LLM synthesizes technical interview questions targeting missing candidate skill gaps.
            </p>
          </div>
        </div>
      </section>

      {/* RECENT ANALYSES WIDGET */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Recent Match Analyses</h3>
                <p className="text-xs text-gray-400">Previous job match evaluations stored in database</p>
              </div>
            </div>

            <Link
              to="/history"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="h-14 bg-gray-900/50 rounded-xl shimmer-loader" />
              <div className="h-14 bg-gray-900/50 rounded-xl shimmer-loader" />
            </div>
          ) : recentAnalyses.length > 0 ? (
            <div className="space-y-3">
              {recentAnalyses.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-gray-900/50 border border-gray-800/80 hover:border-gray-700 transition-colors gap-4"
                >
                  <div>
                    <h4 className="font-semibold text-white text-sm">{item.job_title}</h4>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{item.resume_filename}</p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.match_score >= 80
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : item.match_score >= 60
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {item.match_score}% Match
                    </span>
                    <Link
                      to={`/history`}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold transition-colors"
                    >
                      View Report
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-gray-800 rounded-xl">
              <p className="text-sm text-gray-400">No previous analyses found.</p>
              <Link
                to="/analyze"
                className="inline-flex items-center space-x-2 mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                <FileSearch className="w-4 h-4" />
                <span>Start First Analysis</span>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
