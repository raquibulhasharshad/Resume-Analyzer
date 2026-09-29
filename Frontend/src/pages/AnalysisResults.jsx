import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, CheckCircle2, AlertTriangle, FileText, Briefcase, Award, Layers, Printer, RefreshCw, AlertOctagon, Calendar } from 'lucide-react';
import CircularProgress from '../components/CircularProgress';
import SkillsCard from '../components/SkillsCard';
import InterviewCard from '../components/InterviewCard';
import ChatAssistant from '../components/ChatAssistant';
import { formatLocalDateTime } from '../utils/dateFormatter';

export default function AnalysisResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.analysisResult;

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mx-auto flex items-center justify-center">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">No Analysis Data Available</h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Please upload your resume PDF and paste a job description to run a fresh AI analysis.
        </p>
        <Link
          to="/analyze"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Go to Resume Analyzer</span>
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const isMismatch = data.domain_mismatch || data.summary?.toLowerCase().includes("domain mismatch");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* TOP NAVIGATION ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <button
          onClick={() => navigate('/analyze')}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Analyzer</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl glass-panel text-gray-300 hover:text-white text-xs font-semibold border border-gray-800 flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span>Print Report</span>
          </button>

          <Link
            to="/analyze"
            className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Analyze New Match</span>
          </Link>
        </div>
      </div>

      {/* PROMINENT AI DOMAIN MISMATCH WARNING BANNER */}
      {isMismatch && (
        <div className="glass-panel rounded-2xl p-6 border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-rose-950/40 shadow-xl space-y-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex-shrink-0">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-amber-200 flex items-center gap-2">
                AI Domain Mismatch Alert
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  Cross-Domain Evaluation
                </span>
              </h3>
              <p className="text-xs text-amber-300/90 font-medium">
                The candidate's background domain does not align with the target role category.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-950/80 border border-amber-500/20 text-xs sm:text-sm text-gray-300 leading-relaxed space-y-2">
            <p>
              {data.domain_mismatch_warning || `⚠️ The AI identified that this resume is built for a different professional category than the target position (${data.job_title}).`}
            </p>
            {data.candidate_domain && data.target_domain && (
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
                <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  Candidate Domain: {data.candidate_domain}
                </span>
                <span className="text-gray-400">➔</span>
                <span className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Target Role Domain: {data.target_domain}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOP OVERVIEW CARD */}
      <div className="glass-panel rounded-3xl p-8 border border-gray-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Circular Progress Gauge */}
          <div className="flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-800 pb-8 lg:pb-0 lg:pr-8">
            <CircularProgress score={data.match_score} size={220} />
          </div>

          {/* Details & Recruiter Summary */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-semibold">
                Target Role Evaluation
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {data.job_title || 'Generative AI Engineer'}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-mono">
                <span>Resume File: <span className="text-gray-200">{data.resume_filename}</span></span>
                {data.created_at && (
                  <span className="flex items-center gap-1 text-gray-400">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {formatLocalDateTime(data.created_at)}
                  </span>
                )}
              </div>
            </div>

            {/* AI Summary Highlight Box */}
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
              <div className="flex items-center space-x-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Recruiter Assessment</span>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed">
                {data.summary}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SKILLS CARDS (MATCHING, MISSING, RECOMMENDED) */}
      <SkillsCard
        matchingSkills={data.matching_skills}
        missingSkills={data.missing_skills}
        recommendedSkills={data.recommended_skills}
      />

      {/* AI INSIGHTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* STRENGTHS CARD */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-emerald-500/20 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Resume Strengths</h3>
          </div>

          <ul className="space-y-3">
            {data.strengths.map((strength, i) => (
              <li key={i} className="flex items-start space-x-3 text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* WEAKNESSES / IMPROVEMENTS CARD */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-rose-500/20 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Areas to Improve</h3>
          </div>

          <ul className="space-y-3">
            {data.weaknesses.map((weakness, i) => (
              <li key={i} className="flex items-start space-x-3 text-sm text-gray-300">
                <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0 mt-2" />
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* EXPERIENCE ANALYSIS CARD */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-gray-800 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Experience Evaluation</h3>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed">
            {data.experience_analysis}
          </p>
        </div>

        {/* PROJECT ANALYSIS CARD */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-gray-800 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Project Relevance Analysis</h3>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed">
            {data.project_analysis}
          </p>
        </div>
      </div>

      {/* INTERACTIVE AI CAREER ADVISOR CHAT ASSISTANT */}
      <ChatAssistant analysisData={data} />

      {/* INTERVIEW PREPARATION ACCORDION */}
      <InterviewCard questions={data.interview_questions} />
    </div>
  );
}
