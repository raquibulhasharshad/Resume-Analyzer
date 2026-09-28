import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Trash2, Sparkles, ArrowRight, AlertCircle, FileCheck, CheckCircle2 } from 'lucide-react';
import { uploadResumeApi, analyzeResumeApi } from '../services/api';
import LoadingState from '../components/LoadingState';
import Toast from '../components/Toast';

export default function AnalyzeResume() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'error' });

  // Handle PDF file selection
  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setToast({ message: 'Invalid file format. Please select a PDF document (.pdf).', type: 'error' });
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setToast({ message: 'File size exceeds maximum 10MB limit.', type: 'error' });
      return;
    }

    setFile(selectedFile);
    setIsUploading(true);

    try {
      const uploadRes = await uploadResumeApi(selectedFile);
      setResumeText(uploadRes.text);
      setToast({ message: 'Resume uploaded and text extracted successfully!', type: 'success' });
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to process and extract text from PDF.';
      setToast({ message: errorMsg, type: 'error' });
      setFile(null);
      setResumeText('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setResumeText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Run full analysis
  const handleAnalyze = async () => {
    if (!resumeText) {
      setToast({ message: 'Please upload a valid PDF resume first.', type: 'error' });
      return;
    }

    if (!jobDescription || jobDescription.trim().length < 10) {
      setToast({ message: 'Please paste a complete job description (at least 10 characters).', type: 'error' });
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await analyzeResumeApi({
        resume_text: resumeText,
        job_description: jobDescription,
        filename: file?.name || 'Uploaded_Resume.pdf',
        job_title: jobTitle || undefined
      });

      // Navigate to results page with response state
      navigate('/results', { state: { analysisResult: result } });
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to complete analysis. Please try again.';
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {isAnalyzing && <LoadingState />}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'error' })}
        />
      )}

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          AI Resume Match & Gap Analysis
        </h1>
        <p className="text-sm sm:text-base text-gray-300">
          Upload your resume PDF and paste the target job description to run sentence embeddings & vector store retrieval.
        </p>
      </div>

      {/* TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: RESUME UPLOAD */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-gray-800 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">1. Upload Resume PDF</h3>
                <p className="text-xs text-gray-400">Supports PDF documents up to 10MB</p>
              </div>
            </div>
            {resumeText && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Text Extracted
              </span>
            )}
          </div>

          {!file ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-4 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
                  : 'border-gray-800 hover:border-indigo-500/50 hover:bg-gray-900/40'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                <Upload className="w-8 h-8" />
              </div>

              <div>
                <p className="text-base font-bold text-white">Drag and drop your resume PDF here</p>
                <p className="text-xs text-gray-400 mt-1">or click to browse from your device</p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-900 text-xs text-gray-400 border border-gray-800">
                <span>Maximum file size: 10MB</span>
                <span>&bull;</span>
                <span>PDF Format</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected File Card */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900/80 border border-gray-800">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400 flex-shrink-0">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-white text-sm truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; PDF Document
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRemoveFile}
                  className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0"
                  title="Remove File"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Extracted Text Preview */}
              {isUploading ? (
                <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 text-center space-y-2">
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-indigo-300">Extracting text from PDF...</p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">
                    Extracted Resume Content ({resumeText.length} characters)
                  </label>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={8}
                    className="w-full bg-gray-950/80 border border-gray-800 rounded-xl p-3.5 text-xs text-gray-300 font-mono focus:outline-none focus:border-indigo-500/50 resize-y"
                    placeholder="Extracted text will appear here..."
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: JOB DESCRIPTION */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-gray-800 space-y-6">
          <div className="flex items-center space-x-3 border-b border-gray-800/80 pb-4">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">2. Paste Job Description</h3>
              <p className="text-xs text-gray-400">Target role description and skill requirements</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Target Job Title (Optional)
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Generative AI Engineer / Senior ML Engineer"
                className="w-full bg-gray-950/80 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Job Description Details <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={10}
                placeholder="Paste the job description here (responsibilities, required technical skills, qualifications, experience)..."
                className="w-full bg-gray-950/80 border border-gray-800 rounded-xl p-4 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 resize-y leading-relaxed"
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={isUploading || isAnalyzing || !resumeText || !jobDescription.trim()}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-bold text-base shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-5 h-5 text-indigo-200" />
              <span>Analyze Resume Match</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
