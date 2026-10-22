import React, { useState } from 'react';
import { X, UploadCloud, Sparkles, Link2 } from 'lucide-react';
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
  const { isImportModalOpen, setIsImportModalOpen, setActiveSyllabus, setSyllabi, refreshDashboard, showToast } = useApp();
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
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
      const res = await apiService.importSyllabus(rawText, title.trim() || undefined, sourceUrl.trim());
      
      if (res?.syllabus) {
        // Refresh syllabi list
        const updatedList = await apiService.getSyllabi();
        setSyllabi(updatedList);
        setActiveSyllabus(res.syllabus);
        if (refreshDashboard) {
          refreshDashboard(res.syllabus.id);
        }
        showToast(`Created "${res.syllabus.title}" with starter questions!`, 'success');
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

        <div className="relative w-full max-w-xl transform rounded-3xl bg-[#150722] border border-[#34144e] p-4 sm:p-6 text-left shadow-2xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#2e1246]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">Create a study track</h3>
                <p className="text-xs text-purple-200/70">
                  Add your subjects once, then practise them in one simple place
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="p-1.5 rounded-lg hover:bg-[#250d36] text-purple-300 hover:text-white transition shrink-0"
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
              <label className="block text-xs font-semibold text-purple-200 uppercase tracking-wider mb-1">
                What are you studying?
              </label>
              <input
                type="text"
                placeholder="e.g., KCSE Mathematics, AWS Cloud Practitioner"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#10031a] border border-[#2e1246] text-slate-100 text-sm focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <label className="block text-xs font-semibold text-purple-200 uppercase tracking-wider">
                  Your topics or outline
                </label>
                {/* 1-Click Samples */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-purple-400 font-medium">1-Click:</span>
                  <button
                    type="button"
                    onClick={handlePreloadAws}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-[#250d36] hover:bg-[#341148] text-purple-200 border border-purple-500/30 font-medium transition"
                  >
                    AWS Sample
                  </button>
                  <button
                    type="button"
                    onClick={handlePreloadKcse}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-[#250d36] hover:bg-[#341148] text-purple-200 border border-purple-500/30 font-medium transition"
                  >
                    KCSE Math
                  </button>
                  <button
                    type="button"
                    onClick={handlePreloadSecurityPlus}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-[#250d36] hover:bg-[#341148] text-purple-200 border border-purple-500/30 font-medium transition"
                  >
                    CompTIA Sec+
                  </button>
                </div>
              </div>
              <textarea
                rows={6}
                placeholder="Paste the topics you need to learn, one per line..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#10031a] border border-[#2e1246] text-slate-100 text-xs font-mono focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-purple-200">
                <Link2 className="h-3.5 w-3.5" /> Official source link (optional)
              </label>
              <input
                type="url"
                placeholder="Add the page learners should use to verify this topic"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="w-full rounded-xl border border-[#2e1246] bg-[#10031a] px-3.5 py-2.5 text-sm text-slate-100 transition focus:border-purple-500 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-purple-200/60">Leave this empty if your track has no single official guide.</p>
            </div>

            {/* AI Parsing Explanation */}
            <div className="p-3 rounded-xl bg-[#1d0a2d] border border-purple-500/20 text-[11px] text-purple-200/80 leading-relaxed">
              💡 <strong>What happens next:</strong> We organise your topics, create starter questions, and make a simple study plan. You can edit your plan later.
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-purple-300 hover:text-white hover:bg-[#250d36] transition text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/50 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Parsing & Generating Questions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Create study track</span>
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
