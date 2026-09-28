import React from 'react';
import { CheckCircle2, XCircle, ArrowRightCircle, Sparkles } from 'lucide-react';

export default function SkillsCard({ matchingSkills = [], missingSkills = [], recommendedSkills = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
      {/* Matching Skills Card */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/20 bg-emerald-950/10 shadow-lg shadow-emerald-500/5">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Matching Skills</h3>
            <p className="text-xs text-emerald-400/80 font-medium">
              {matchingSkills.length} skills found in resume
            </p>
          </div>
        </div>

        {matchingSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {matchingSkills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
              >
                <span className="text-emerald-400 font-bold">✓</span> {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No direct matching technical keywords detected.</p>
        )}
      </div>

      {/* Missing Skills Card */}
      <div className="glass-panel rounded-2xl p-6 border border-rose-500/20 bg-rose-950/10 shadow-lg shadow-rose-500/5">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Missing Skills</h3>
            <p className="text-xs text-rose-400/80 font-medium">
              {missingSkills.length} required skills missing
            </p>
          </div>
        </div>

        {missingSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-300"
              >
                <span className="text-rose-400 font-bold">✗</span> {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Outstanding! All key job skills are present.
          </p>
        )}
      </div>

      {/* Recommended Skills Card */}
      <div className="glass-panel rounded-2xl p-6 border border-indigo-500/20 bg-indigo-950/10 shadow-lg shadow-indigo-500/5">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Recommended Skills</h3>
            <p className="text-xs text-indigo-400/80 font-medium">
              High-value skills to boost candidate score
            </p>
          </div>
        </div>

        {recommendedSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {recommendedSkills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300"
              >
                <ArrowRightCircle className="w-3.5 h-3.5 text-indigo-400" /> {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No additional recommended skills.</p>
        )}
      </div>
    </div>
  );
}
