import React, { useState } from 'react';
import { X, UploadCloud, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import apiService from '../services/api.service';

const SAMPLE_AWS_SYLLABUS = `AWS Certified Cloud Practitioner (CLF-C02)
Domain 1: Cloud Concepts (24% of examination)
- Define the AWS Cloud and its value proposition
- Identify aspects of AWS Cloud economics (TCO, CapEx vs OpEx)
- Explain different cloud architecture design principles

Domain 2: Security and Compliance (30% of examination)
- Understand the AWS shared responsibility model
- Understand AWS Cloud security and compliance concepts
- Identify AWS access management capabilities (IAM)

Domain 3: Cloud Technology and Services (34% of examination)
- Define methods of deploying and operating in the AWS Cloud
- Identify the AWS global infrastructure (Regions, AZs)
- Identify the core AWS services (EC2, S3, RDS, Lambda)

Domain 4: Billing, Pricing, and Support (12% of examination)
- Compare AWS pricing models (On-Demand, Reserved Instances)
- Understand billing tools and cost allocation tags`;

export default function SyllabusImportModal() {
  const { isImportModalOpen, setIsImportModalOpen, setActiveSyllabus, setSyllabi, showToast } = useApp();
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isImportModalOpen) return null;

  const handlePreloadSample = () => {
    setTitle('AWS Certified Cloud Practitioner (CLF-C02)');
    setRawText(SAMPLE_AWS_SYLLABUS);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rawText || rawText.trim().length < 10) {
      setError('Please provide at least 10 characters of syllabus content.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await apiService.importSyllabus(rawText, title.trim() || undefined);
      
      if (res?.syllabus) {
        // Refresh syllabi list
        const updatedList = await apiService.getSyllabi();
        setSyllabi(updatedList);
        setActiveSyllabus(res.syllabus);
        showToast(`Successfully imported "${res.syllabus.title}"!`, 'success');
        setIsImportModalOpen(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to import syllabus with Gemini.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          onClick={() => setIsImportModalOpen(false)}
        />

        <div className="relative w-full max-w-xl transform rounded-2xl bg-slate-900 border border-slate-800 p-6 text-left shadow-2xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Universal Syllabus Importer</h3>
                <p className="text-xs text-slate-400">
                  Transform any exam curriculum into structured study modules with Gemini
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Curriculum / Certification Title (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., AWS Cloud Practitioner, CompTIA Security+, KCSE"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Raw Syllabus Text or Topics Outline
                </label>
                <button
                  type="button"
                  onClick={handlePreloadSample}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition"
                >
                  <Sparkles className="h-3 w-3" />
                  Load AWS Sample
                </button>
              </div>
              <textarea
                rows={7}
                placeholder="Paste domains, topic bullets, or exam outline text here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* AI Parsing Explanation */}
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              💡 <strong>How it works:</strong> Gemini analyzes the outline, detects weight ranges (totaling ~100%), extracts core topics, and creates a new syllabus track in your PostgreSQL database.
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Parsing with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Import & Generate Track</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
