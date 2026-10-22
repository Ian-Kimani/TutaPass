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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/formatters';
import apiService from '../services/api.service';

export default function PlannerPage() {
  const { dashboardData, refreshDashboard, showToast, activeSyllabus } = useApp();
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
  const [dailyHours, setDailyHours] = useState(rawPlan?.daily_hours ? String(rawPlan.daily_hours) : '1.5');
  const [selectedWeakAreas, setSelectedWeakAreas] = useState([]);
  const [generating, setGenerating] = useState(false);

  // Parse schedule items
  const [scheduleItems, setScheduleItems] = useState([]);

  useEffect(() => {
    if (rawPlan?.schedule_data) {
      try {
        const parsed = typeof rawPlan.schedule_data === 'string'
          ? JSON.parse(rawPlan.schedule_data)
          : rawPlan.schedule_data;
        setScheduleItems(Array.isArray(parsed) ? parsed : parsed.schedule || []);
      } catch {
        setScheduleItems([]);
      }
    }
  }, [rawPlan]);

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
      showToast(`Personalized roadmap generated for ${activeSyllabus?.code || 'your exam'}!`, 'success');
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
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Your Daily Study Plan</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Tell us your exam date and daily free time—we'll build a simple checklist focused on your weak topics.
          </p>
        </div>

        {scheduleItems.length > 0 && (
          <div className="flex items-center justify-between sm:justify-start gap-4 bg-slate-950 p-3.5 sm:p-4 rounded-2xl border border-slate-800 w-full sm:w-auto">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Plan Progress</span>
              <span className="text-base sm:text-lg font-bold text-white">
                {completedCount} of {scheduleItems.length} Days Done
              </span>
            </div>
            <div className="w-14 h-14 sm:w-16 sm:h-16 relative flex items-center justify-center font-bold text-sm text-purple-400">
              {progressPercent}%
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Plan Configuration Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-white font-bold text-sm pb-3 border-b border-slate-800">
              <Calendar className="h-4 w-4 text-purple-400" />
              <span>Set Your Schedule</span>
            </div>

            <form onSubmit={handleGeneratePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Exam Date
                </label>
                <input
                  type="date"
                  value={targetExamDate}
                  onChange={(e) => setTargetExamDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Available Daily Study Time (Hours)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['0.5', '1.0', '1.5', '2.5'].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setDailyHours(hrs)}
                      className={`py-2 rounded-xl text-xs font-semibold transition border ${
                        dailyHours === hrs
                          ? 'bg-purple-600 text-white border-purple-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {hrs} hr{hrs !== '1.0' ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Prioritize Specific Weak Domains
                </label>
                <div className="space-y-2">
                  {domains.map((d) => {
                    const isSelected = selectedWeakAreas.includes(d.name);
                    return (
                      <div
                        key={d.id}
                        onClick={() => handleToggleWeakArea(d.name)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-purple-950/30 border-purple-500/50 text-purple-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="font-medium truncate mr-2">{d.name}</span>
                        <span className="font-mono text-[11px] shrink-0 font-bold">
                          {d.masteryPercentage}% mastery
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition hover:scale-[1.01]"
              >
                {generating ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Building Your Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Create My Study Plan</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Interactive Schedule Timeline */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Day-by-Day Study Checklist</h2>
            <span className="text-xs text-slate-400">Click a day item to toggle completion</span>
          </div>

          {scheduleItems.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-400">
              <Calendar className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <p className="font-semibold text-slate-300">No active plan generated yet.</p>
              <p className="text-xs text-slate-500 mt-1">
                Configure your target date and click "Generate Adaptive Plan" to begin.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduleItems.map((item, idx) => {
                const isDone = item.status === 'completed';
                return (
                  <div
                    key={idx}
                    onClick={() => toggleDayStatus(idx)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-4 ${
                      isDone
                        ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-sm'
                    }`}
                  >
                    <button className="mt-0.5 shrink-0 text-slate-400 hover:text-purple-400 transition">
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                            isDone
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          DAY {item.day || idx + 1}
                        </span>
                        {item.targetMinutes && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.targetMinutes} mins
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-sm font-semibold ${
                          isDone ? 'line-through text-slate-500' : 'text-slate-100'
                        }`}
                      >
                        {item.topic}
                      </h3>

                      {item.actionItem && (
                        <p className="text-xs text-slate-400 leading-relaxed pt-0.5">
                          👉 <span className="text-slate-300">{item.actionItem}</span>
                        </p>
                      )}
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
