import React, { useState } from 'react';
import { X, UploadCloud, Sparkles } from 'lucide-react';
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

const SAMPLE_KCSE_SYLLABUS = `KCSE Mathematics Alternative A
Domain 1: Calculus and Differentiation (30% of syllabus)
- First principles of differentiation and gradient of a curve
- Derivatives of polynomials and equations of tangents and normals
- Turning points, maxima, minima, and curve sketching

Domain 2: Matrices and Transformations (35% of syllabus)
- 2x2 matrix operations, determinants, and singular matrices
- Inverse matrices and solving simultaneous linear equations
- Matrix transformations including reflection, rotation, shear, and enlargement

Domain 3: Probability and Statistics (35% of syllabus)
- Mutually exclusive, independent events and tree diagrams
- Mean, variance, and standard deviation for grouped frequency distributions
- Normal distribution principles and probability calculations`;

const SAMPLE_SECURITY_PLUS_SYLLABUS = `CompTIA Security+ (SY0-701)
Domain 1: General Security Concepts (12% of examination)
- Compare and contrast security controls and defense-in-depth principles
- Explain fundamental cryptographic concepts (hashing, symmetric/asymmetric encryption)

Domain 2: Threats, Vulnerabilities, and Mitigations (22% of examination)
- Analyze common threat actor types, motivation, and vectors (phishing, social engineering)
- Differentiate between malware types, ransomware, and rootkits

Domain 3: Security Architecture and Operations (36% of examination)
- Compare and contrast security implications of architecture models (cloud, hybrid, zero trust)
- Apply network security appliances (firewalls, IDS/IPS, proxies)

Domain 4: Security Program Management and Oversight (30% of examination)
- Explain risk management processes, business impact analysis, and compliance policies
- Implement incident response procedures, digital forensics, and reporting`;

export default function SyllabusImportModal() {
  const { isImportModalOpen, setIsImportModalOpen, setActiveSyllabus, setSyllabi, showToast } = useApp();
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isImportModalOpen) return null;

  const handlePreloadAws = () => {
    setTitle('AWS Certified Cloud Practitioner (CLF-C02)');
    setRawText(SAMPLE_AWS_SYLLABUS);
    setError(null);
  };

  const handlePreloadKcse = () => {
    setTitle('KCSE Mathematics Alternative A');
    setRawText(SAMPLE_KCSE_SYLLABUS);
    setError(null);
  };

  const handlePreloadSecurityPlus = () => {
    setTitle('CompTIA Security+ (SY0-701)');
    setRawText(SAMPLE_SECURITY_PLUS_SYLLABUS);
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
        showToast(`Successfully imported "${res.syllabus.title}" with starter questions!`, 'success');
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
                placeholder="e.g., AWS Cloud Practitioner, CompTIA Security+, KCSE Math"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Raw Syllabus Text or Topics Outline
                </label>
                {/* 1-Click Samples */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-medium">1-Click:</span>
                  <button
                    type="button"
                    onClick={handlePreloadAws}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 font-medium transition"
                  >
                    AWS Sample
                  </button>
                  <button
                    type="button"
                    onClick={handlePreloadKcse}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 font-medium transition"
                  >
                    KCSE Math
                  </button>
                  <button
                    type="button"
                    onClick={handlePreloadSecurityPlus}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-medium transition"
                  >
                    CompTIA Sec+
                  </button>
                </div>
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
              💡 <strong>Automatic Quiz Generation:</strong> Gemini analyzes the outline, detects weight percentages, creates your syllabus track, and automatically synthesizes starter scenario questions with Distractor Autopsies!
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
                    <span>Parsing & Generating Questions...</span>
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
