import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, Copy, Check, Trash2, ChevronUp, ChevronDown, Compass, FileEdit, HelpCircle, Mail, Wrench } from 'lucide-react';
import { chatWithAnalysisApi } from '../services/api';

// Helper parser to render inline markdown: **bold**, *italic*, `code`
function parseInline(text) {
  if (!text) return '';
  const cleanText = text.replace(/\*\*\*/g, '**');
  const regex = /(\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let keyIdx = 0;

  while ((match = regex.exec(cleanText)) !== null) {
    if (match.index > lastIndex) {
      parts.push(cleanText.substring(lastIndex, match.index));
    }

    const fullMatch = match[0];
    if (fullMatch.startsWith('**') && fullMatch.endsWith('**')) {
      parts.push(
        <strong key={keyIdx++} className="font-semibold text-white bg-indigo-500/15 px-1.5 py-0.5 rounded border border-indigo-500/25">
          {match[2]}
        </strong>
      );
    } else if (fullMatch.startsWith('*') && fullMatch.endsWith('*')) {
      parts.push(
        <em key={keyIdx++} className="italic text-indigo-200">
          {match[3]}
        </em>
      );
    } else if (fullMatch.startsWith('`') && fullMatch.endsWith('`')) {
      parts.push(
        <code key={keyIdx++} className="bg-gray-800 text-purple-300 px-1.5 py-0.5 rounded text-xs font-mono border border-gray-700">
          {match[4]}
        </code>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < cleanText.length) {
    parts.push(cleanText.substring(lastIndex));
  }

  return parts.length > 0 ? parts : cleanText;
}

// Component to render structured Markdown responses cleanly without raw asterisks
function FormattedText({ content }) {
  if (!content) return null;

  if (content.includes('```')) {
    const codeParts = content.split(/```/);
    return (
      <div className="space-y-3">
        {codeParts.map((part, index) => {
          if (index % 2 === 1) {
            const lines = part.split('\n');
            const codeContent = lines.slice(lines[0].trim().length > 0 ? 1 : 0).join('\n');
            return (
              <pre key={index} className="bg-gray-950 p-3 rounded-xl border border-gray-800 text-xs font-mono overflow-x-auto text-emerald-400 my-2">
                <code>{codeContent.trim() || part.trim()}</code>
              </pre>
            );
          }
          return <FormattedText key={index} content={part} />;
        })}
      </div>
    );
  }

  const blocks = content.split(/\n\n+/);

  return (
    <div className="space-y-3 text-xs sm:text-sm leading-relaxed">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Blockquotes
        if (trimmed.startsWith('>')) {
          const quoteText = trimmed.replace(/^>\s*/gm, '');
          return (
            <blockquote key={bIdx} className="border-l-4 border-indigo-500 bg-indigo-950/40 px-4 py-2.5 my-2 rounded-r-xl italic text-indigo-100 text-xs sm:text-sm shadow-inner">
              {parseInline(quoteText)}
            </blockquote>
          );
        }

        // Headings (# or ## or ###)
        if (/^#+\s+/.test(trimmed)) {
          const headingText = trimmed.replace(/^#+\s+/, '');
          return (
            <h4 key={bIdx} className="font-bold text-white text-sm sm:text-base tracking-wide mt-3 mb-1.5 flex items-center gap-2 border-b border-indigo-500/20 pb-1">
              {parseInline(headingText)}
            </h4>
          );
        }

        // Lists
        const lines = trimmed.split('\n');
        const hasListItems = lines.some(l => /^\s*([*\-•]|\d+\.)\s+/.test(l.trim()));

        if (hasListItems) {
          return (
            <div key={bIdx} className="space-y-2 my-1.5">
              {lines.map((line, lIdx) => {
                const trimmedLine = line.trim();
                const isBullet = /^\s*([*\-•]|\d+\.)\s+/.test(trimmedLine);
                if (!isBullet) {
                  return <p key={lIdx} className="text-gray-200">{parseInline(line)}</p>;
                }
                const itemText = trimmedLine.replace(/^([*\-•]|\d+\.)\s+/, '');
                return (
                  <div key={lIdx} className="flex items-start gap-2.5 text-gray-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                    <div className="flex-1">{parseInline(itemText)}</div>
                  </div>
                );
              })}
            </div>
          );
        }

        // Standard Paragraph
        return (
          <p key={bIdx} className="text-gray-200">
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {lIdx > 0 && <br />}
                {parseInline(line)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export default function ChatAssistant({ analysisData }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Welcome! I'm your **Gemini AI Career Coach & Match Mentor** ✨\n\nI've analyzed your resume report for **${analysisData?.job_title || 'this position'}** (Match Score: **${analysisData?.match_score || 0}%**).\n\nHow would you like me to assist you today? You can ask me to **draft a cover letter**, **rewrite resume bullet points**, **simulate interview answers**, or **build a learning roadmap**!`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { role: 'user', content: textToSend };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await chatWithAnalysisApi({
        analysis_id: analysisData?.id,
        message: textToSend,
        history: newMessages.slice(-8),
        job_title: analysisData?.job_title,
        match_score: analysisData?.match_score,
        matching_skills: analysisData?.matching_skills,
        missing_skills: analysisData?.missing_skills
      });

      setMessages([...newMessages, { role: 'assistant', content: res.reply }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: "⚠️ Sorry, I encountered a temporary connection issue. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(index);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Chat history reset. How else can I guide your job application for **${analysisData?.job_title || 'this role'}**?`
      }
    ]);
  };

  const suggestionCategories = [
    { label: "Career Roadmap", icon: Compass, prompt: "Give me a 3-step career roadmap to reach 90%+ match score" },
    { label: "Rewrite Resume Bullets", icon: FileEdit, prompt: "Suggest 3 high-impact STAR resume bullet points for my experience" },
    { label: "STAR Interview Answer", icon: HelpCircle, prompt: "Provide a mock STAR interview answer addressing my missing skills" },
    { label: "Draft Cover Letter", icon: Mail, prompt: "Write a polished 3-paragraph cover letter tailored to this role" },
    { label: "Portfolio Project Blueprint", icon: Wrench, prompt: "Recommend a hands-on portfolio project to showcase missing skills" },
  ];

  return (
    <div className="glass-panel rounded-3xl border border-indigo-500/30 overflow-hidden shadow-2xl my-8">
      {/* GEMINI HEADER BAR */}
      <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-gray-900 px-6 py-4 flex items-center justify-between border-b border-indigo-500/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/30 animate-pulse">
            <div className="w-full h-full bg-gray-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              Gemini AI Career Coach
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                Interactive Job Mentor
              </span>
            </h3>
            <p className="text-xs text-gray-400">Ask questions, generate cover letters, rephrase bullets & practice interview answers</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl text-gray-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-xs flex items-center gap-1"
            title="Reset Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
          >
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* CHAT BODY */}
      {isOpen && (
        <div className="p-6 space-y-4">
          {/* MESSAGES CONTAINER */}
          <div className="h-[380px] overflow-y-auto space-y-4 pr-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-3 ${
                  msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-md ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white border border-indigo-400/30'
                  }`}
                >
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="relative group max-w-[85%]">
                  <div
                    className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                        : 'bg-gray-900/90 border border-gray-800 text-gray-200 rounded-tl-none shadow-lg'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    ) : (
                      <FormattedText content={msg.content} />
                    )}
                  </div>

                  {/* Copy Response Button for Assistant Messages */}
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(msg.content, idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all text-xs flex items-center gap-1 shadow"
                      title="Copy Response"
                    >
                      {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
                </div>
                <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-3.5 text-xs text-gray-300 flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  <span>Gemini Coach drafting response...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* CATEGORIZED GEMINI SUGGESTION CHIPS */}
          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-800/80">
            {suggestionCategories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSend(cat.prompt)}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-indigo-600/20 text-gray-300 hover:text-indigo-300 border border-gray-800 hover:border-indigo-500/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Icon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* CHAT INPUT FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2 pt-1"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Gemini AI Coach for career guidance, cover letter drafts, or interview advice..."
              disabled={loading}
              className="flex-1 bg-gray-950/90 border border-gray-800 rounded-xl px-4 py-3.5 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500/60 shadow-inner"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/25 disabled:opacity-50 hover:scale-[1.02] transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask Coach</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
