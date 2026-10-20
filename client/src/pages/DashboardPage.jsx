import React, { useState } from 'react';
import {
  BrainCircuit,
  Flame,
  ArrowRight,
  Sparkles,
  Target,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  BookOpen,
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TABS, TONE_MODES } from '../constants/navigation';
import { formatPercent, getVerdictBadge } from '../utils/formatters';
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
  } = useApp();

  // Concept Explainer state
  const [conceptQuery, setConceptQuery] = useState('');
  const [explaining, setExplaining] = useState(false);
  const [explanationData, setExplanationData] = useState(null);

  const readiness = dashboardData?.readiness;
  const metrics = readiness?.metrics;
  const overallScore = readiness?.overallReadiness ?? 64;
  const verdictStyle = getVerdictBadge(overallScore);

  const handlePracticeDomain = (domainId) => {
    setSelectedQuizDomainId(domainId);
    setActiveTab(TABS.QUIZ);
  };

  const handleExplain = async (termToExplain) => {
    const term = (termToExplain || conceptQuery).trim();
    if (!term) return;

    try {
      setExplaining(true);
      const res = await apiService.explainConcept(term, 'AZ-900 Cloud Fundamentals', languageMode);
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
          <span>Synchronizing exam telemetry with Neon PostgreSQL...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Readiness Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${verdictStyle.color}`}>
                ● {readiness?.verdict || 'Sharpening Phase'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Official AZ-900 Pass Standard: 700/1000 (~70%)
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Exam Pass Probability: <span className="text-indigo-400">{overallScore}%</span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              {readiness?.advice ||
                'Solid performance foundation. Drill into distractor autopsies and clear due flashcards to elevate your retention into the 80%+ safety zone.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedQuizDomainId(null);
                  setActiveTab(TABS.QUIZ);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition hover:scale-[1.02]"
              >
                <BrainCircuit className="h-4 w-4" />
                <span>Launch Quiz Arena</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => setActiveTab(TABS.FLASHCARDS)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700/60 flex items-center gap-2 transition"
              >
                <Flame className="h-4 w-4 text-amber-400" />
                <span>Review Due Flashcards ({metrics?.dueFlashcards || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab(TABS.PLANNER)}
                className="px-4 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm font-medium border border-slate-800 transition"
              >
                View Study Roadmap
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
            <span className="text-xs text-slate-400 mt-2 font-medium">SM-2 Weighted</span>
          </div>
        </div>
      </section>

      {/* 3 Metrics Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Practice Accuracy</span>
            <div className="text-2xl font-bold text-white mt-0.5">
              {metrics?.overallAccuracy ?? 64}%
            </div>
            <span className="text-[11px] text-slate-400">
              {metrics?.correctAttempts ?? 7} of {metrics?.totalAttempts ?? 11} questions correct
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Questions Practiced</span>
            <div className="text-2xl font-bold text-white mt-0.5">
              {metrics?.totalAttempts ?? 11}
            </div>
            <span className="text-[11px] text-slate-400">Across 3 core domains</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Weak-Spot Flashcards</span>
            <div className="text-2xl font-bold text-white mt-0.5">
              {metrics?.dueFlashcards ?? 3} <span className="text-xs text-amber-400 font-normal">due today</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {metrics?.totalFlashcards ?? 3} active cards in SRS deck
            </span>
          </div>
        </div>
      </section>

      {/* Domain Mastery Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Syllabus Domain Mastery</h2>
            <p className="text-xs text-slate-400">
              Targeted breakdown aligned with official Microsoft AZ-900 exam weightings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {readiness?.domains?.map((d) => {
            const isWeak = d.masteryPercentage < 70;
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
                    {d.name}
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
                        {d.cardsDue} flashcards due
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handlePracticeDomain(d.id)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700/60 hover:border-transparent transition"
                >
                  <BrainCircuit className="h-3.5 w-3.5" />
                  <span>Practice This Domain</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick AI Concept Explainer (Study Buddy) Card */}
      <section className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Quick AI Concept Explainer (Study Buddy)
              </h2>
              <p className="text-xs text-slate-400">
                Stuck on an abstract concept? Get an instant breakdown in your active tone mode.
              </p>
            </div>
          </div>

          {/* Quick Tone Switcher on card */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
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
                placeholder="Ask about any cloud term (e.g. CapEx vs OpEx, Availability Zones, Azure Bastion)..."
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

          {/* Preset Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">Popular exam topics:</span>
            {PRESET_CONCEPTS.map((pill) => (
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
                <strong>Standout Analogy:</strong> {explanationData.keyAnalogy}
              </div>
            )}

            {explanationData.takeawayForExam && (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300">
                <strong>Exam Day Takeaway:</strong> {explanationData.takeawayForExam}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
