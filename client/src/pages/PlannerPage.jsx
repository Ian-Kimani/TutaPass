import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
  AlertCircle,
  TrendingUp,
  BookOpen,
  ArrowRight,
  Target,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/formatters';
import { TABS } from '../constants/navigation';
import apiService from '../services/api.service';

export default function PlannerPage() {
  const {
    dashboardData,
    refreshDashboard,
    showToast,
    activeSyllabus,
    setActiveTab,
    setSelectedQuizDomainId,
  } = useApp();
  const rawPlan = dashboardData?.studyPlan;
  const domains = dashboardData?.readiness?.domains || [];

  // Form State
  const defaultExamDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };

  const [targetExamDate, setTargetExamDate] = useState(
    rawPlan?.target_exam_date
      ? new Date(rawPlan.target_exam_date).toISOString().split('T')[0]
      : defaultExamDate()
  );
  const [dailyHours, setDailyHours] = useState(
    rawPlan?.daily_hours ? String(rawPlan.daily_hours) : '1.5'
  );
  const [selectedWeakAreas, setSelectedWeakAreas] = useState([]);
  const [generating, setGenerating] = useState(false);

  // Parse schedule items
  const [scheduleItems, setScheduleItems] = useState([]);

  useEffect(() => {
    if (rawPlan?.schedule_data) {
      try {
        const parsed =
          typeof rawPlan.schedule_data === 'string'
            ? JSON.parse(rawPlan.schedule_data)
            : rawPlan.schedule_data;
        setScheduleItems(Array.isArray(parsed) ? parsed : parsed.schedule || []);
      } catch {
        setScheduleItems([]);
      }
    } else if (domains.length > 0) {
      // Provide default roadmap derived from topics
      setScheduleItems([
        {
          day: 1,
          topic: domains[0]?.name?.replace(/^Describe\s+/i, '') || 'Foundation Concepts',
          action: 'Master core concepts and definitions. Complete 5 practice questions.',
          duration: '1.5 hrs',
          status: 'pending',
        },
        {
          day: 2,
          topic: domains[1]?.name?.replace(/^Describe\s+/i, '') || 'Core Architectures',
          action: 'Review architecture patterns and resolve 3 mistake cards.',
          duration: '1.0 hr',
          status: 'pending',
        },
        {
          day: 3,
          topic: domains[2]?.name?.replace(/^Describe\s+/i, '') || 'Governance & Operations',
          action: 'Understand key rules, pricing models, and security baselines.',
          duration: '1.5 hrs',
          status: 'pending',
        },
        {
          day: 4,
          topic: 'Targeted Weak Spot Review',
          action: 'Clear remaining mistake flashcards and attempt a mixed-domain quiz sprint.',
          duration: '1.0 hr',
          status: 'pending',
        },
      ]);
    }
  }, [rawPlan, domains]);

  const toggleDayStatus = (index) => {
    setScheduleItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const current = item.status === 'completed';
        return {
          ...item,
          status: current ? 'pending' : 'completed',
        };
      })
    );
  };

  const handleToggleWeakArea = (domainName) => {
    setSelectedWeakAreas((prev) =>
      prev.includes(domainName) ? prev.filter((d) => d !== domainName) : [...prev, domainName]
    );
  };

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    try {
      setGenerating(true);
      await apiService.saveStudyPlan({
        syllabusId: activeSyllabus?.id || null,
        targetExamDate,
        dailyHours: parseFloat(dailyHours),
        weakAreas: selectedWeakAreas,
      });
      await refreshDashboard();
      showToast(
        `Personalized roadmap generated for ${activeSyllabus?.code || 'your exam'}!`,
        'success'
      );
    } catch (err) {
      showToast(`Plan generation failed: ${err.message}`, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const completedCount = scheduleItems.filter((s) => s.status === 'completed').length;
  const progressPercent =
    scheduleItems.length > 0 ? Math.round((completedCount / scheduleItems.length) * 100) : 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner (ABF Elevated White Card) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider block mb-1">
            Adaptive Learning Roadmap
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Your Daily Study Agenda
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Custom-tailored study milestones generated for {activeSyllabus?.title || 'your syllabus'}.
            Mark each day complete as you practice.
          </p>
        </div>

        {scheduleItems.length > 0 && (
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 shrink-0">
            <div>
              <span className="text-[11px] text-slate-500 block font-semibold">Overall Plan Progress</span>
              <span className="text-base sm:text-lg font-black text-slate-900">
                {completedCount} of {scheduleItems.length} Days Done
              </span>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#230832] text-white flex items-center justify-center font-black text-xs shadow-md">
              {progressPercent}%
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Plan Configuration Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-sm pb-3 border-b border-slate-100">
              <Calendar className="h-4 w-4 text-purple-700" />
              <span>Configure Your Timeline</span>
            </div>

            <form onSubmit={handleGeneratePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Exam Date
                </label>
                <input
                  type="date"
                  value={targetExamDate}
                  onChange={(e) => setTargetExamDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-purple-600 transition font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Available Study Hours Per Day
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['0.5', '1.0', '1.5', '2.5'].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setDailyHours(hrs)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                        dailyHours === hrs
                          ? 'bg-[#230832] text-white shadow-sm'
                          : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {hrs} {hrs === '1.0' ? 'hr' : 'hrs'}
                    </button>
                  ))}
                </div>
              </div>

              {domains.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Your Weakest Topics
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {domains.map((d) => {
                      const cleanName = d.name.replace(/^Describe\s+/i, '');
                      const isSelected = selectedWeakAreas.includes(cleanName);
                      return (
                        <div
                          key={d.id}
                          onClick={() => handleToggleWeakArea(cleanName)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-purple-50 border-purple-500 text-purple-900 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span className="truncate pr-2">{cleanName}</span>
                          <span className="font-mono text-[11px] text-slate-400 shrink-0">
                            {d.masteryPercentage}% mastery
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={generating}
                className="w-full py-3 px-4 rounded-xl bg-[#230832] hover:bg-[#341148] disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-purple-900/30"
              >
                {generating ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Synthesizing Adaptive Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-purple-300" />
                    <span>Generate Personalized Plan</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Day-by-Day Roadmap along the ABF Vertical Timeline */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Study Roadmap</h3>
            <span className="text-xs text-slate-500 font-medium">Click circle to complete</span>
          </div>

          {scheduleItems.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-slate-200/80 text-center text-slate-400 text-sm shadow-sm">
              No plan generated yet. Select your target exam date on the left to build your schedule!
            </div>
          ) : (
            /* ABF Vertical Timeline with Left Black/Plum Dots */
            <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-2 sm:before:left-2.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-300">
              {scheduleItems.map((item, idx) => {
                const isCompleted = item.status === 'completed';

                return (
                  <div key={idx} className="relative group">
                    {/* Timeline dot */}
                    <div
                      onClick={() => toggleDayStatus(idx)}
                      className={`absolute -left-6 sm:-left-8 top-6 h-3.5 w-3.5 rounded-full border-2 cursor-pointer transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 border-white ring-4 ring-emerald-100'
                          : 'bg-[#230832] border-white ring-4 ring-purple-100'
                      }`}
                      title="Toggle completed"
                    />

                    {/* Horizontal Card (ABF White Session Card) */}
                    <div
                      className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isCompleted
                          ? 'bg-slate-50/70 border-slate-200 opacity-70'
                          : 'bg-white border-slate-200/80 shadow-sm hover:shadow'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="text-center sm:text-left shrink-0">
                          <span className="text-sm sm:text-base font-black text-slate-900 block">
                            DAY {item.day || idx + 1}
                          </span>
                          <span className="text-[11px] font-semibold text-purple-700">
                            {item.duration || '1.5 hrs'}
                          </span>
                        </div>

                        <div className="border-l border-slate-200 pl-4">
                          <h4
                            className={`text-sm sm:text-base font-bold ${
                              isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {item.topic}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {item.action || item.activity}
                          </p>
                        </div>
                      </div>

                      {/* Right Action: Circle toggle button (ABF Play / Check button) */}
                      <button
                        onClick={() => toggleDayStatus(idx)}
                        className={`h-10 w-10 rounded-full flex items-center justify-center font-black transition-transform hover:scale-105 shrink-0 self-end sm:self-auto shadow-sm ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-[#230832] text-white hover:bg-purple-900'
                        }`}
                        title={isCompleted ? 'Mark as incomplete' : 'Mark as done'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <span className="text-xs font-extrabold">✓</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
