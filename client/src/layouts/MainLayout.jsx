import React from 'react';
import {
  BarChart3,
  Calendar,
  BrainCircuit,
  Flame,
  Terminal,
  RotateCcw,
  Plus,
  ShieldCheck,
  Globe2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TABS, TAB_ITEMS, TONE_MODES, COMPLIANCE_NOTICE } from '../constants/navigation';
import PromptXRayDrawer from '../components/PromptXRayDrawer';
import SyllabusImportModal from '../components/SyllabusImportModal';

export default function MainLayout({ children }) {
  const {
    activeTab,
    setActiveTab,
    languageMode,
    setLanguageMode,
    setIsXRayOpen,
    setIsImportModalOpen,
    isResettingDemo,
    handleResetDemo,
    syllabi,
    activeSyllabus,
    setActiveSyllabus,
    dashboardData,
    toastMessage,
  } = useApp();

  const dueFlashcardsCount = dashboardData?.readiness?.metrics?.dueFlashcards || 0;
  const overallReadiness = dashboardData?.readiness?.overallReadiness ?? 64;

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'BarChart3':
        return <BarChart3 className="h-4 w-4" />;
      case 'Calendar':
        return <Calendar className="h-4 w-4" />;
      case 'BrainCircuit':
        return <BrainCircuit className="h-4 w-4" />;
      case 'Flame':
        return <Flame className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 border border-indigo-500/40 shadow-2xl text-xs font-medium text-slate-100 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Unofficial Compliance Pill */}
            <div className="flex items-center gap-3">
              <div
                onClick={() => setActiveTab(TABS.DASHBOARD)}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-black tracking-tight text-white">TutaPass</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      AI
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block -mt-1">
                    Adaptive Cloud Prep
                  </span>
                </div>
              </div>

              {/* Compliance Pill */}
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Unofficial AZ-900 Prep</span>
              </div>
            </div>

            {/* Middle: Active Syllabus Selector & Import Modal */}
            <div className="hidden lg:flex items-center gap-2">
              <select
                value={activeSyllabus?.id || ''}
                onChange={(e) => {
                  const found = syllabi.find((s) => s.id === parseInt(e.target.value, 10));
                  if (found) setActiveSyllabus(found);
                }}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 transition"
              >
                {syllabi.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.is_flagship ? `⭐ ${s.title}` : `📘 ${s.title}`}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="p-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 border border-slate-700/60 transition"
                title="Import Any Exam Syllabus"
              >
                <Plus className="h-3.5 w-3.5 text-indigo-400" />
                <span>Import</span>
              </button>
            </div>

            {/* Right: Language Switcher, Reset Demo, and Judge's Prompt X-Ray Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Tone / Language Mode Switcher */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {TONE_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setLanguageMode(mode.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      languageMode === mode.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={mode.description}
                  >
                    {mode.shortLabel}
                  </button>
                ))}
              </div>

              {/* Reset Demo Button */}
              <button
                onClick={handleResetDemo}
                disabled={isResettingDemo}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition text-xs flex items-center gap-1.5 disabled:opacity-50"
                title="Reset Demo Learner to baseline state (~64% score)"
              >
                <RotateCcw className={`h-3.5 w-3.5 text-amber-400 ${isResettingDemo ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Reset</span>
              </button>

              {/* Judge's Prompt X-Ray Drawer Trigger */}
              <button
                onClick={() => setIsXRayOpen(true)}
                className="relative px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/25 flex items-center gap-2 border border-purple-400/30 transition hover:scale-[1.02] active:scale-[0.98]"
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Prompt X-Ray</span>
                <span className="px-1.5 py-0.2 text-[10px] bg-white/20 rounded font-mono">20%</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2.5 border-t border-slate-800/80 scrollbar-none">
            {TAB_ITEMS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {getIcon(tab.iconName)}
                  <span>{tab.label}</span>
                  {tab.id === TABS.FLASHCARDS && dueFlashcardsCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {dueFlashcardsCount} due
                    </span>
                  )}
                  {tab.id === TABS.DASHBOARD && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {overallReadiness}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Compliance & Attributions Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <p className="text-slate-400 text-[11px] max-w-2xl leading-relaxed">
              {COMPLIANCE_NOTICE}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3 text-[11px] text-slate-400">
            <span>Power Learn Project #1MillionDevs</span>
            <span>•</span>
            <span className="text-indigo-400">Gemini 3.8 Flash Engine</span>
          </div>
        </div>
      </footer>

      {/* Modals & Slide-out Drawers */}
      <PromptXRayDrawer />
      <SyllabusImportModal />
    </div>
  );
}
