import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, MessageSquare } from 'lucide-react';

export default function InterviewCard({ questions = [] }) {
  const [openIndex, setOpenIndex] = useState(0);

  if (!questions || questions.length === 0) {
    return null;
  }

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-indigo-500/20 my-8 shadow-xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            AI-Targeted Interview Preparation
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
              {questions.length} Questions
            </span>
          </h2>
          <p className="text-xs text-gray-400">
            Tailored technical & architectural interview questions based on missing skills and role context.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((q, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-indigo-950/20 border-indigo-500/40 shadow-md'
                  : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
              }`}
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 focus:outline-none"
              >
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/30 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-gray-200 text-sm sm:text-base leading-snug">
                    {typeof q === 'string' ? q : q.question}
                  </span>
                </div>
                <div className="flex-shrink-0 text-gray-400">
                  {isOpen ? <ChevronUp className="w-5 h-5 text-indigo-400" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-indigo-500/10 text-sm text-gray-300 leading-relaxed bg-indigo-950/10">
                  <div className="flex items-start space-x-2.5 p-3.5 rounded-lg bg-gray-900/80 border border-gray-800 text-xs sm:text-sm">
                    <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-indigo-300 block mb-1">Preparation Guidance & Tip:</span>
                      <p className="text-gray-300">
                        When answering this question, structure your response using the <strong>STAR method</strong> (Situation, Task, Action, Result). Explicitly connect concepts from vector retrieval, system design, or domain trade-offs.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
