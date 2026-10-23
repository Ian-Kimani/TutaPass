import React, { useState } from 'react';
import {
  Home,
  Calendar,
  BrainCircuit,
  Flame,
  Terminal,
  RotateCcw,
  Plus,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TABS, TAB_ITEMS, TONE_MODES, COMPLIANCE_NOTICE } from '../constants/navigation';
import PromptXRayDrawer from '../components/PromptXRayDrawer';
import SyllabusImportModal from '../components/SyllabusImportModal';
import StudyBuddyFloatingBar from '../components/StudyBuddyFloatingBar';

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
    refreshDashboard,
    dashboardData,
    toastMessage,
  } = useApp();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const dueFlashcardsCount = dashboardData?.readiness?.metrics?.dueFlashcards || 0;
  const overallReadiness = dashboardData?.readiness?.overallReadiness ?? 64;

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Home':
        return <Home className="h-5 w-5" />;
      case 'Calendar':
        return <Calendar className="h-5 w-5" />;
      case 'BrainCircuit':
        return <BrainCircuit className="h-5 w-5" />;
      case 'Flame':
        return <Flame className="h-5 w-5" />;
      default:
        return <Layers className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6fa] text-slate-900 flex selection:bg-purple-900 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#1c0929] text-white border border-purple-500/40 shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <Sparkles className="h-4 w-4 text-purple-400 shrink-0" />
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Mobile Sidebar Overlay Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar (ABF Deep Plum / Aubergine Theme) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#13071e] text-white border-r border-[#26133a] flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Brand Logo + Active Exam Selector */}
        <div className="p-5 border-b border-[#26133a]">
          <div className="flex items-center justify-between mb-4">
            <div
              onClick={() => {
                setActiveTab(TABS.DASHBOARD);
                setMobileSidebarOpen(false);
              }}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-900/50 group-hover:scale-105 transition-transform">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white block leading-none">
                  TutaPass
                </span>
                <span className="text-[10px] text-purple-300 font-medium tracking-wider uppercase">
                  Africa AI Prep
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Active Exam Selector Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-purple-300/80 tracking-wider block">
              Choose your exam
            </label>
            <div className="relative">
              <select
                value={activeSyllabus?.id || ''}
                onChange={(e) => {
                  const found = syllabi.find((s) => s.id === parseInt(e.target.value, 10));
                  if (found) {
                    setActiveSyllabus(found);
                    refreshDashboard(found.id);
                  }
                }}
                className="w-full bg-[#200c31] border border-[#3b1d54] text-slate-100 text-xs rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-purple-500 font-medium cursor-pointer truncate appearance-none"
              >
                {syllabi.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#170724] text-white">
                    {s.code ? `${s.code}: ` : ''}{s.title.replace(' (Unofficial Prep)', '')}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 text-purple-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Middle: Navigation Items (ABF Sidebar style) */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {TAB_ITEMS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[#2a1b38] text-white shadow-inner border border-purple-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-[#1a0a29]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {getIcon(tab.iconName)}
                  <span>{tab.label}</span>
                </div>
                {tab.id === TABS.FLASHCARDS && dueFlashcardsCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {dueFlashcardsCount}
                  </span>
                )}
                {tab.id === TABS.DASHBOARD && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1c0c2a] text-purple-200 font-mono">
                    {overallReadiness}%
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom: Action Cards (Styled like ABF's TestFlight / Google Play buttons) */}
        <div className="p-4 border-t border-[#26133a] space-y-2.5 bg-[#0f0418]/80">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-1">
            Tools & Evaluation
          </div>

          {/* + Add Any Exam Button */}
          <button
            onClick={() => {
              setIsImportModalOpen(true);
              setMobileSidebarOpen(false);
            }}
            className="w-full bg-[#1b0a2b] hover:bg-[#28113e] border border-purple-500/20 text-white rounded-2xl p-3 flex items-center gap-3 transition shadow-sm group text-left"
          >
            <div className="h-9 w-9 rounded-xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:scale-105 transition-transform shrink-0">
              <Plus className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase font-bold text-purple-300/80 tracking-wider">
                Create a study track
              </div>
              <div className="text-xs font-bold text-white truncate">+ Add a subject or exam</div>
            </div>
          </button>

          {/* Prompt X-Ray Button */}
          <button
            onClick={() => {
              setIsXRayOpen(true);
              setMobileSidebarOpen(false);
            }}
            className="w-full bg-[#1b0a2b] hover:bg-[#28113e] border border-purple-500/20 text-white rounded-2xl p-3 flex items-center gap-3 transition shadow-sm group text-left"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white group-hover:scale-105 transition-transform shrink-0 shadow-md">
              <Terminal className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-purple-300/80 tracking-wider">
                  For judges only
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-purple-500/30 text-purple-200 rounded font-mono">
                  20%
                </span>
              </div>
              <div className="text-xs font-bold text-white truncate">AI Transparency Lab</div>
            </div>
          </button>

          <div className="text-[10px] text-slate-500 text-center pt-1 font-medium">
            Unofficial Exam Prep Companion
          </div>
        </div>
      </aside>

      {/* Main Content Area (Light Off-White Canvas) */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 min-h-screen">
        {/* Top Canvas Bar (ABF Sub-Navigation & Controls) */}
        <header className="sticky top-0 z-30 bg-[#f7f6fa]/95 backdrop-blur-md border-b border-slate-200/80 px-3.5 sm:px-8 py-2.5 sm:py-3">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-4">
            {/* Top Row on Mobile / Left Group on Desktop */}
            <div className="flex items-center justify-between gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 md:hidden shadow-sm shrink-0"
                  aria-label="Open sidebar menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block leading-none">
                    Current Track
                  </span>
                  <h2 className="text-xs sm:text-base font-extrabold text-slate-900 tracking-tight truncate max-w-[210px] sm:max-w-md mt-0.5">
                    {activeSyllabus?.title || 'Microsoft Azure Fundamentals'}
                  </h2>
                </div>
              </div>

              {/* Mobile-only Reset Demo button */}
              <button
                onClick={handleResetDemo}
                disabled={isResettingDemo}
                className="md:hidden p-2 rounded-full bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 shadow-sm transition disabled:opacity-50 shrink-0"
                title="Reset demo data to initial state"
              >
                <RotateCcw
                  className={`h-4 w-4 ${isResettingDemo ? 'animate-spin text-purple-600' : ''}`}
                />
              </button>
            </div>

            {/* Bottom Row on Mobile / Right Group on Desktop: Language Pill Switcher & Desktop Reset */}
            <div className="flex items-center justify-between md:justify-end gap-2.5 w-full md:w-auto">
              {/* Language Pill Switcher: Full width segmented control on mobile, compact on desktop */}
              <div className="flex items-center bg-slate-200/70 p-1 rounded-full text-xs w-full md:w-auto">
                {TONE_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setLanguageMode(mode.id)}
                    className={`flex-1 md:flex-initial px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition text-center whitespace-nowrap ${
                      languageMode === mode.id
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title={mode.description}
                  >
                    {mode.shortLabel}
                  </button>
                ))}
              </div>

              {/* Desktop-only Reset Demo Button */}
              <button
                onClick={handleResetDemo}
                disabled={isResettingDemo}
                className="hidden md:flex p-2 rounded-full bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 shadow-sm hover:shadow transition disabled:opacity-50 shrink-0"
                title="Reset demo data to initial state"
              >
                <RotateCcw
                  className={`h-4 w-4 ${isResettingDemo ? 'animate-spin text-purple-600' : ''}`}
                />
              </button>
            </div>
          </div>
        </header>

        {/* Main Canvas Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-8 py-4 sm:py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 bg-white/50 py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <p className="text-[11px] max-w-2xl text-slate-500 leading-relaxed">
              {COMPLIANCE_NOTICE}
            </p>
            <div className="shrink-0 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <span>Power Learn Project Vibe Coding</span>
              <span>•</span>
              <span className="text-purple-700 font-bold">Gemini 2.5 Flash Engine</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Floating Audio-Player Style "AI Study Buddy" Bar */}
      <StudyBuddyFloatingBar />

      {/* Modals & Slide-out Drawers */}
      <PromptXRayDrawer />
      <SyllabusImportModal />
    </div>
  );
}
