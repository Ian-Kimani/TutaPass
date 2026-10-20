import React, { useState } from 'react';
import {
  BrainCircuit,
  Flame,
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TABS, TONE_MODES } from '../constants/navigation';
import { getVerdictBadge } from '../utils/formatters';
import apiService from '../services/api.service';

const PRESET_CONCEPTS = [
  'CapEx vs OpEx',
  'Availability Zones vs Sets',
  'Azure Policy vs RBAC',
  'IaaS vs PaaS vs Serverless',
  'Azure Resource Locks',
];

export default function DashboardPage() {
  const {
    dashboardData,
    loadingDashboard,
    setActiveTab,
    setSelectedQuizDomainId,
    languageMode,
    setLanguageMode,
    showToast,
    activeSyllabus,
  } = useApp();

  // Concept Explainer state
  const [conceptQuery, setConceptQuery] = useState('');
  const [explaining, setExplaining] = useState(false);
  const [explanationData, setExplanationData] = useState(null);

  const readiness = dashboardData?.readiness;
  const metrics = readiness?.metrics;
  const overallScore = readiness?.overallReadiness ?? 64;
  const verdictStyle = getVerdictBadge(overallScore);

  const isFlagship = activeSyllabus?.is_flagship || activeSyllabus?.code === 'AZ-900';
  const dynamicPresetPills = isFlagship
    ? PRESET_CONCEPTS
    : (readiness?.domains?.map((d) => d.name.replace(/^Describe\s+/i, '')) || ['Core Concepts', 'Applied Methods', 'Key Rules']);

  const handlePracticeDomain = (domainId) => {
    setSelectedQuizDomainId(domainId);
    setActiveTab(TABS.QUIZ);
  };

  const handleExplain = async (termToExplain) => {
    const term = (termToExplain || conceptQuery).trim();
    if (!term) return;

    try {
      setExplaining(true);
      const topicContext = activeSyllabus?.title || 'AZ-900 Cloud Fundamentals';
      const res = await apiService.explainConcept(term, topicContext, languageMode);
      setExplanationData(res?.explanation || null);
      showToast(`AI Concept explanation generated for "${term}"!`, 'info');
    } catch (err) {
      showToast(`Failed to explain concept: ${err.message}`, 'error');
    } finally {
      setExplaining(false);
    }
  };

  if (loadingDashboard) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3 text-slate-400 text-sm">
          <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading your study progress...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Readiness Banner with Inline Stat Pills */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${verdictStyle.color}`}>
                ● {readiness?.verdict || 'Sharpening Phase'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {activeSyllabus?.code || 'Exam'} Target Pass Standard: ~70%
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Exam Readiness: <span className="text-indigo-400">{overallScore}%</span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              You're making solid progress! Practice your weakest topics below and review your {metrics?.dueFlashcards ?? 3} mistake cards to reach the 80% safe zone.
            </p>

            {/* Compact Inline Stat Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300 font-medium flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-indigo-400" />
                <span><strong>{metrics?.overallAccuracy ?? 64}%</strong> Accuracy</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300 font-medium flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-purple-400" />
                <span><strong>{metrics?.totalAttempts ?? 11}</strong> Practiced</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-slate-300 font-medium flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <span><strong>{metrics?.dueFlashcards ?? 3}</strong> Mistake Cards Due</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedQuizDomainId(null);
                  setActiveTab(TABS.QUIZ);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition hover:scale-[1.02]"
              >
                <BrainCircuit className="h-4 w-4" />
                <span>Practice Quiz</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => setActiveTab(TABS.FLASHCARDS)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700/60 flex items-center gap-2 transition"
              >
                <Flame className="h-4 w-4 text-amber-400" />
                <span>Review Mistake Cards ({metrics?.dueFlashcards || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab(TABS.PLANNER)}
                className="px-4 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm font-medium border border-slate-800 transition"
              >
                Study Plan
              </button>
            </div>
          </div>

          {/* Readiness Circular Visual */}
          <div className="shrink-0 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-inner">
            <div className="relative flex items-center justify-center w-32 h-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={overallScore >= 80 ? 'text-emerald-500' : overallScore >= 60 ? 'text-indigo-500' : 'text-amber-500'}
                  strokeDasharray={`${overallScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-black text-white">{overallScore}%</span>
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Readiness
                </span>
              </div>
            </div>
            <span className="text-xs text-indigo-400 mt-2 font-medium">Goal: 80%+</span>
          </div>
        </div>
      </section>

      {/* Domain Mastery Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">Topic Mastery</h2>
          <p className="text-xs text-slate-400">
            Core topics for {activeSyllabus?.title || 'your exam'} and your current accuracy
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {readiness?.domains && readiness.domains.length > 0 ? (
            readiness.domains.map((d) => {
              const cleanTitle = d.name.replace(/^Describe\s+/i, '');
              return (
                <div
                  key={d.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition space-y-4 shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        Exam Weight: {d.weightRange}
                      </span>
                      <span
                        className={`font-mono font-bold text-sm ${
                          d.masteryPercentage >= 80
                            ? 'text-emerald-400'
                            : d.masteryPercentage >= 60
                            ? 'text-indigo-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {d.masteryPercentage}%
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-100 leading-snug line-clamp-2">
                      {cleanTitle}
                    </h3>

                    <div className="w-full bg-slate-800 h-2.5 rounded-full mt-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          d.masteryPercentage >= 80
                            ? 'bg-emerald-500'
                            : d.masteryPercentage >= 60
                            ? 'bg-indigo-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${d.masteryPercentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5">
                      <span>
                        {d.correctAttempts}/{d.totalAttempts} correct
                      </span>
                      {d.cardsDue > 0 && (
                        <span className="text-amber-400 font-medium">
                          {d.cardsDue} mistake cards due
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handlePracticeDomain(d.id)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-indigo-600/20 text-slate-200 hover:text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700/60 hover:border-indigo-500/50 transition"
                  >
                    <span>Practice Topic</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-8 text-center text-slate-400 text-sm">
              No topics found for this exam. Click "+ Add Exam" to import syllabus topics.
            </div>
          )}
        </div>
      </section>

      {/* Ask the AI Study Buddy Card */}
      <section className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ask the AI Study Buddy</h2>
              <p className="text-xs text-slate-400">
                Confused by a cloud term? Type it below or click a topic to get a simple breakdown in English, African everyday life, or Sheng.
              </p>
            </div>
          </div>

          {/* Quick Tone Switcher on card */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
            {TONE_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setLanguageMode(mode.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  languageMode === mode.id
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode.shortLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Input & Preset Pills */}
        <div className="space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExplain();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                value={conceptQuery}
                onChange={(e) => setConceptQuery(e.target.value)}
                placeholder={
                  isFlagship
                    ? 'Ask about any cloud term (e.g. CapEx vs OpEx, Availability Zones, Azure Bastion)...'
                    : `Ask about any topic in ${activeSyllabus?.title || 'this exam'}...`
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={explaining || !conceptQuery.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              {explaining ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Explaining...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Explain</span>
                </>
              )}
            </button>
          </form>

          {/* Dynamic Preset Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">Popular exam topics:</span>
            {dynamicPresetPills.map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() => {
                  setConceptQuery(pill);
                  handleExplain(pill);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs border border-slate-700/50"
              >
                {pill}
              </button>
            ))}
          </div>
        </div>

        {/* Explanation Results Panel */}
        {explanationData && (
          <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-sm font-bold text-indigo-300">
                {explanationData.headline || explanationData.concept}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                Mode: {explanationData.mode}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {explanationData.explanation}
            </p>

            {explanationData.keyAnalogy && (
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200">
                <strong>Everyday Analogy:</strong> {explanationData.keyAnalogy}
              </div>
            )}

            {explanationData.takeawayForExam && (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300">
                <strong>Key Exam Tip:</strong> {explanationData.takeawayForExam}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
