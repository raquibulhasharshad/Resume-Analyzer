import React, { useState, useEffect } from 'react';
import { Cpu, FileText, Brain, Sparkles, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { id: 1, label: "Extracting resume...", subtext: "Parsing PDF structure & extracting raw text", icon: FileText },
  { id: 2, label: "Generating embeddings...", subtext: "Sentence Transformers computing 384-d vectors", icon: Brain },
  { id: 3, label: "Analyzing job requirements...", subtext: "FAISS vector store retrieving top matching chunks", icon: Cpu },
  { id: 4, label: "Generating AI insights...", subtext: "LangChain & LLM constructing candidate report", icon: Sparkles },
];

export default function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 1200);
    const timer2 = setTimeout(() => setCurrentStep(2), 2800);
    const timer3 = setTimeout(() => setCurrentStep(3), 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0f19]/90 backdrop-blur-md p-4">
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            AI Engine Processing RAG Pipeline
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Analyzing resume against job description using vector search & LLM synthesis.
          </p>
        </div>

        {/* Multi-step progress indicator */}
        <div className="space-y-4 relative z-10">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={step.id}
                className={`flex items-center space-x-4 p-3.5 rounded-xl border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-indigo-600/20 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                    : isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-gray-900/30 border-gray-800/60 opacity-50'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isCurrent
                      ? 'bg-indigo-500 text-white animate-spin'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isCurrent ? 'text-indigo-200' : isCompleted ? 'text-emerald-300' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{step.subtext}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global progress bar */}
        <div className="mt-8 bg-gray-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
