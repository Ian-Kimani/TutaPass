import React from 'react';
import {
  BrainCircuit,
  Flame,
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TABS } from '../constants/navigation';

export default function DashboardPage() {
  const {
    dashboardData,
    loadingDashboard,
    setActiveTab,
    setSelectedQuizDomainId,
    activeSyllabus,
    handleResetDemo,
    isResettingDemo,
  } = useApp();

  const readiness = dashboardData?.readiness;
  const metrics = readiness?.metrics;
  const overallScore = readiness?.overallReadiness ?? 64;
  const domains = readiness?.domains || [];

  const handlePracticeDomain = (domainId) => {
    setSelectedQuizDomainId(domainId);
    setActiveTab(TABS.QUIZ);
  };

  // Parse study plan schedule or provide smart fallback agenda
  const rawPlan = dashboardData?.studyPlan;
  let scheduleItems = [];
  if (rawPlan?.schedule_data) {
    try {
      const parsed =
        typeof rawPlan.schedule_data === 'string'
          ? JSON.parse(rawPlan.schedule_data)
          : rawPlan.schedule_data;
      scheduleItems = Array.isArray(parsed) ? parsed : parsed.schedule || [];
    } catch {
      scheduleItems = [];
    }
  }

  // If no generated plan yet, derive 3 agenda days from the current syllabus domains
  if (scheduleItems.length === 0 && domains.length > 0) {
    scheduleItems = [
      {
        day: 1,
        topic: domains[0]?.name?.replace(/^Describe\s+/i, '') || 'Core Exam Fundamentals',
        action: 'Review key architecture definitions and attempt 5 practice scenario questions.',
        duration: '1.5 hrs',
        status: 'pending',
      },
      {
        day: 2,
        topic: domains[1]?.name?.replace(/^Describe\s+/i, '') || 'Architecture & Operations',
        action: 'Drill into service management, fault tolerance, and resolve active mistake cards.',
        duration: '1.0 hr',
        status: 'pending',
      },
      {
        day: 3,
        topic: domains[2]?.name?.replace(/^Describe\s+/i, '') || 'Security, Pricing & Governance',
        action: 'Lock in pricing structures, governance policies, and take a 10-question sprint.',
        duration: '1.5 hrs',
        status: 'pending',
      },
    ];
  }

  // Graphic poster banners for domain cards
  const POSTER_STYLES = [
    {
      // Style 1: Emerald/Teal poster banner (Stable Serves style)
      wrapperBg: 'bg-gradient-to-br from-teal-700 via-emerald-800 to-slate-900',
      badgeBg: 'bg-[#f8e71c] text-black font-extrabold',
      textColor: 'text-white',
      accentColor: 'text-emerald-300',
      progressFill: 'bg-emerald-500',
    },
    {
      // Style 2: Warm Cream/Purple poster banner (SLINGSHOT style)
      wrapperBg: 'bg-gradient-to-br from-[#f6eff9] via-[#ecd5f7] to-[#451457]',
      badgeBg: 'bg-[#230832] text-white font-bold',
      textColor: 'text-[#230832]',
      accentColor: 'text-purple-700',
      progressFill: 'bg-purple-600',
    },
    {
      // Style 3: Bold Gold/Black poster banner (ACS Mix style)
      wrapperBg: 'bg-gradient-to-br from-slate-950 via-[#2a1a0c] to-amber-600',
      badgeBg: 'bg-[#f59e0b] text-slate-950 font-black',
      textColor: 'text-white',
      accentColor: 'text-amber-300',
      progressFill: 'bg-amber-500',
    },
  ];

  if (loadingDashboard) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3 text-slate-500 text-sm">
          <div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading your study progress...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16">
      {/* 1. TOP HERO CONTAINER (The ABF Plum Stage with 3 White Poster Cards) */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#4a1259] via-[#2d0b38] to-[#180521] p-4 sm:p-8 text-white shadow-xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        {/* Top Header Row of the Plum Container */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-purple-500/20">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1b0824] border border-purple-500/30 text-xs font-bold text-white shadow-sm">
              <Target className="h-3.5 w-3.5 text-purple-400" />
              <span>
                Readiness estimate: <strong className="text-purple-300">{overallScore}%</strong>{' '}
                <span className="text-[11px] text-purple-200/70 font-normal">(Goal: 80%+)</span>
              </span>
            </div>

            {/* Inline Stat Pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-purple-200/90 flex-wrap">
              <span className="px-2.5 sm:px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 font-semibold">
                {metrics?.overallAccuracy ?? 64}% Accuracy
              </span>
              <span className="px-2.5 sm:px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 font-semibold">
                {metrics?.totalAttempts ?? 11} Answers
              </span>
              <span className="px-2.5 sm:px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30 font-semibold flex items-center gap-1">
                <Flame className="h-3 w-3 text-amber-400" />
                {metrics?.dueFlashcards ?? 3} Due
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={handleResetDemo}
            disabled={isResettingDemo}
            className="hidden sm:flex px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-purple-200 hover:text-white transition items-center gap-1.5 shrink-0 self-start md:self-auto"
            title="Reset demo data to initial state"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isResettingDemo ? 'animate-spin' : ''}`} />
            <span>Reset demo</span>
          </button>
          </div>
        </div>

        {/* Section Title inside Plum Box (ABF "Experiences" Title Style) */}
        <div className="relative z-10 pt-6 pb-2">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Your progress by topic
          </h2>
          <p className="text-xs text-purple-200/80 mt-0.5">
            Core domains for {activeSyllabus?.title || 'your syllabus'} • Click any poster to drill
            scenario questions
          </p>
        </div>

        {/* The 3 White Poster Cards Inside the Plum Container */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
          {domains && domains.length > 0 ? (
            domains.map((d, index) => {
              const cleanTitle = d.name.replace(/^Describe\s+/i, '');
              const style = POSTER_STYLES[index % POSTER_STYLES.length];

              return (
                <div
                  key={d.id}
                  onClick={() => handlePracticeDomain(d.id)}
                  className="bg-white text-slate-900 rounded-2xl p-3 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between group"
                >
                  {/* Top Graphic Poster Banner (ABF Festival Poster Style) */}
                  <div
                    className={`${style.wrapperBg} ${style.textColor} rounded-xl p-4 relative overflow-hidden h-36 flex flex-col justify-between shadow-inner`}
                  >
                    {/* Background SVG graphics */}
                    <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none">
                      <svg width="120" height="120" viewBox="0 0 100 100" fill="currentColor">
                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="6" fill="none" />
                        <path d="M10 50 Q 50 10 90 50" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path d="M10 50 Q 50 90 90 50" stroke="currentColor" strokeWidth="4" fill="none" />
                      </svg>
                    </div>

                    {/* Top Row: Pill Badge (Like ABF's "For you" yellow badge) */}
                    <div className="flex items-center justify-between relative z-10">
                      <span
                        className={`${style.badgeBg} text-[11px] px-2.5 py-0.5 rounded-full shadow-sm tracking-wide`}
                      >
                        Weight: {d.weightRange || `${d.weightPercentage || 30}%`}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider opacity-80">
                        Domain {index + 1}
                      </span>
                    </div>

                    {/* Bottom Row inside Poster: Large Bold Percentage */}
                    <div className="relative z-10">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
                          {d.masteryPercentage}%
                        </span>
                        <span className="text-xs uppercase font-bold tracking-wider opacity-80">
                          Progress
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Half of Card: Info & Progress */}
                  <div className="p-2 pt-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {d.correctAttempts}/{d.totalAttempts} correct • Click to practice
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-900 transition mt-0.5 line-clamp-1">
                        {cleanTitle}
                      </h3>
                      {activeSyllabus?.source_url && (
                        <a
                          href={activeSyllabus.source_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="mt-1 inline-block text-[11px] font-semibold text-purple-700 underline underline-offset-2"
                        >
                          Open official source
                        </a>
                      )}
                    </div>

                    {/* Thin Progress Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${style.progressFill} transition-all duration-700`}
                          style={{ width: `${d.masteryPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-8 text-center text-purple-200 text-sm">
              No domains found for this syllabus. Click "+ Add Exam" to import an outline.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">Why this score?</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
              Your {overallScore}% readiness estimate uses {metrics?.totalAttempts ?? 0} practice answers,
              your accuracy, and the official domain weightings. It is a helpful guide, not a promise of a pass.
            </p>
          </div>
          {activeSyllabus?.source_url && (
            <a
              href={activeSyllabus.source_url}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-xs font-bold text-indigo-700 underline underline-offset-2"
            >
              Open official source
            </a>
          )}
        </div>
      </section>

      {/* 2. BOTTOM SECTION: YOUR STUDY AGENDA TIMELINE (Just like "Your ABF Agenda"!) */}
      <section className="space-y-5">
        {/* Agenda Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Your study plan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily milestone plan focused on your weak exam areas
            </p>
          </div>

          <button
            onClick={() => setActiveTab(TABS.PLANNER)}
            className="px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200/90 shadow-sm transition flex items-center gap-1.5"
          >
            <span>View full plan</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Timeline with vertical line and left dots (ABF Agenda Style) */}
        <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-2 sm:before:left-2.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-300">
          {scheduleItems.slice(0, 3).map((item, idx) => {
            const isToday = idx === 0;

            return (
              <div key={idx} className="relative group">
                {/* Timeline dot */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-6 h-3.5 w-3.5 rounded-full border-2 ${
                    isToday
                      ? 'bg-[#230832] border-white ring-4 ring-purple-200'
                      : 'bg-slate-400 border-white'
                  }`}
                />

                {isToday ? (
                  /* Row 1: Today's Focus - Solid Deep Plum Bar (ABF Black/Plum Card) */
                  <div className="bg-[#230832] text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="text-center sm:text-left shrink-0">
                        <span className="text-sm sm:text-base font-black text-white block">
                          DAY {item.day || 1}
                        </span>
                        <span className="text-[11px] text-purple-300 font-medium">
                          {item.duration || '1.5 hrs'}
                        </span>
                      </div>

                      <div className="border-l border-purple-500/30 pl-4">
                        <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider block">
                          Today's focus
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
                          {item.topic}
                        </h4>
                        <p className="text-xs text-purple-200/80 mt-1 line-clamp-1 sm:line-clamp-none">
                          {item.action || item.activity}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const matchedDomain = domains.find(
                          (d) =>
                            d.name.toLowerCase().includes(item.topic.toLowerCase()) ||
                            item.topic.toLowerCase().includes(d.name.toLowerCase())
                        );
                        if (matchedDomain) {
                          setSelectedQuizDomainId(matchedDomain.id);
                        }
                        setActiveTab(TABS.QUIZ);
                      }}
                      className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white text-[#230832] hover:bg-purple-100 flex items-center justify-center font-black shadow-lg transition-transform hover:scale-105 shrink-0 self-end sm:self-auto"
                      title="Start Today's Quiz"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  /* Rows 2 & 3: Clean White Elevated Cards (ABF White Agenda Cards) */
                  <div className="bg-white text-slate-900 rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="text-center sm:text-left shrink-0">
                        <span className="text-sm sm:text-base font-black text-slate-800 block">
                          DAY {item.day || idx + 1}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {item.duration || '1.0 hr'}
                        </span>
                      </div>

                      <div className="border-l border-slate-200 pl-4">
                        <h4 className="text-sm font-bold text-slate-900">{item.topic}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{item.action || item.activity}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab(TABS.PLANNER)}
                      className="h-9 w-9 rounded-full border border-slate-200 hover:border-slate-400 text-slate-600 hover:text-slate-900 flex items-center justify-center transition shrink-0 self-end sm:self-auto"
                      title="View Plan"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
