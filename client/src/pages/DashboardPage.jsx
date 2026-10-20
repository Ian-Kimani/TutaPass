import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, CheckCircle2, Flame, ArrowRight } from 'lucide-react';
import { TABS } from '../constants/navigation';

export default function DashboardPage() {
  const { dashboardData, loadingDashboard, setActiveTab } = useApp();
  const readiness = dashboardData?.readiness;

  if (loadingDashboard) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3 text-slate-400 text-sm">
          <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading live exam readiness telemetry...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Tab 1 • Dashboard & Readiness
          </span>
          <h1 className="text-2xl font-bold text-white mt-2">
            Exam Readiness: {readiness?.overallReadiness ?? 64}% ({readiness?.verdict || 'Sharpening Phase'})
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            {readiness?.advice || 'Sharpen weak areas with distractor autopsies and spaced flashcards.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab(TABS.QUIZ)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
          >
            <span>Start Practice Quiz</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {readiness?.domains?.map((d) => (
          <div key={d.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>{d.weightRange} weight</span>
              <span className="font-mono text-indigo-400 font-bold">{d.masteryPercentage}%</span>
            </div>
            <h3 className="font-semibold text-sm text-slate-100">{d.name}</h3>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${d.masteryPercentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
