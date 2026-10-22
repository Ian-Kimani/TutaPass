import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  X,
  ChevronUp,
  ChevronDown,
  BrainCircuit,
  MessageSquare,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TONE_MODES } from '../constants/navigation';
import apiService from '../services/api.service';

const DEFAULT_PRESETS = [
  'CapEx vs OpEx',
  'Availability Zones vs Sets',
  'Azure Policy vs RBAC',
  'IaaS vs PaaS vs Serverless',
  'Defense in Depth',
];

export default function StudyBuddyFloatingBar() {
  const {
    languageMode,
    setLanguageMode,
    activeSyllabus,
    dashboardData,
    showToast,
    setPromptTelemetry,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [conceptQuery, setConceptQuery] = useState('');
  const [explaining, setExplaining] = useState(false);
  const [explanationData, setExplanationData] = useState(null);

  const activeModeObj = TONE_MODES.find((m) => m.id === languageMode) || TONE_MODES[0];

  const domains = dashboardData?.readiness?.domains || [];
  const isFlagship = activeSyllabus?.is_flagship || activeSyllabus?.code === 'AZ-900';
  const presets = isFlagship
    ? DEFAULT_PRESETS
    : domains.length > 0
    ? domains.map((d) => d.name.replace(/^Describe\s+/i, ''))
    : DEFAULT_PRESETS;

  const handleExplain = async (termToExplain) => {
    const term = (termToExplain || conceptQuery).trim();
    if (!term) return;

    try {
      setExplaining(true);
      const topicContext = activeSyllabus?.title || 'Exam Preparation';
      const res = await apiService.explainConcept(term, topicContext, languageMode);
      setExplanationData(res?.explanation || null);
      if (res?.promptTelemetry && setPromptTelemetry) {
        setPromptTelemetry(res.promptTelemetry);
      }
      showToast(`AI breakdown ready for "${term}"!`, 'info');
    } catch (err) {
      showToast(`Failed to explain concept: ${err.message}`, 'error');
    } finally {
      setExplaining(false);
    }
  };

  return (
    <>
      {/* Expanded Popover Dialog */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-40 w-[92vw] sm:w-[480px] max-h-[80vh] flex flex-col bg-[#1c0929] text-white rounded-3xl border border-purple-500/30 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-[#250d36] border-b border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AI Study Buddy</h3>
                <p className="text-[11px] text-purple-200/80">
                  Instant concept breakdown • {activeSyllabus?.code || 'Exam Prep'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/40 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
            {/* Tone Selector Pills */}
            <div className="flex items-center justify-between gap-2 bg-[#14061d] p-1 rounded-xl border border-purple-900/50">
              <span className="text-[10px] text-purple-300 uppercase tracking-wider font-semibold pl-2">
                Language Tone:
              </span>
              <div className="flex items-center gap-1">
                {TONE_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setLanguageMode(mode.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                      languageMode === mode.id
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-purple-300 hover:text-white'
                    }`}
                  >
                    {mode.shortLabel}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExplain();
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-3 text-purple-400" />
                <input
                  type="text"
                  value={conceptQuery}
                  onChange={(e) => setConceptQuery(e.target.value)}
                  placeholder="Ask any tricky concept or acronym..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#14061d] border border-purple-500/30 text-xs text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400 transition"
                />
              </div>
              <button
                type="submit"
                disabled={explaining || !conceptQuery.trim()}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-900/50"
              >
                {explaining ? (
                  <span className="h-3.5 w-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Explain</span>
                  </>
                )}
              </button>
            </form>

            {/* Preset chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-purple-300/80 font-medium uppercase tracking-wider">
                Popular topics:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {presets.slice(0, 5).map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setConceptQuery(chip);
                      handleExplain(chip);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[#250d36] hover:bg-purple-800/40 text-purple-200 border border-purple-500/20 transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Result display */}
            {explanationData && (
              <div className="p-4 rounded-2xl bg-[#14061d] border border-purple-500/30 space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-purple-900/50 pb-2">
                  <span className="font-bold text-purple-200 text-sm">
                    {explanationData.headline || explanationData.concept}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    {explanationData.mode}
                  </span>
                </div>

                <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                  {explanationData.explanation}
                </p>

                {explanationData.keyAnalogy && (
                  <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-200 text-[11px] leading-relaxed">
                    <strong className="text-purple-300 font-semibold">Everyday Analogy:</strong>{' '}
                    {explanationData.keyAnalogy}
                  </div>
                )}

                {explanationData.takeawayForExam && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[11px] leading-relaxed">
                    <strong className="text-emerald-400 font-semibold">Exam Takeaway:</strong>{' '}
                    {explanationData.takeawayForExam}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Persistent Floating Bar (ABF Floating Audio Player Style) */}
      <div className="fixed bottom-4 sm:bottom-5 right-3 sm:right-6 z-40 max-w-[calc(100vw-24px)]">
        <div
          onClick={() => setIsOpen((prev) => !prev)}
          className="cursor-pointer group bg-[#1c0929] hover:bg-[#250d36] text-white rounded-2xl p-2.5 sm:p-3.5 shadow-2xl border border-purple-500/30 flex items-center gap-3 sm:gap-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.99]"
        >
          {/* Glowing Icon */}
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-900/50 shrink-0">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform" />
          </div>

          {/* Text labels */}
          <div className="min-w-0 pr-1 sm:pr-2">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                AI Study Buddy: Ask any concept
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-purple-300/80 truncate">
              Explaining in: <strong className="text-purple-200 font-semibold">{activeModeObj.label}</strong>
            </p>
          </div>

          {/* Action Button (ABF White Circle Audio Play Button Style) */}
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white text-[#1c0929] flex items-center justify-center font-black shadow-md shrink-0 group-hover:scale-105 transition-transform">
            {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
          </div>
        </div>
      </div>
    </>
  );
}
