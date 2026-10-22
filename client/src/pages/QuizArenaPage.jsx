import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Flame,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Globe2,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TONE_MODES } from '../constants/navigation';
import apiService from '../services/api.service';

export default function QuizArenaPage() {
  const {
    dashboardData,
    refreshDashboard,
    selectedQuizDomainId,
    setSelectedQuizDomainId,
    languageMode,
    setLanguageMode,
    showToast,
    activeSyllabus,
  } = useApp();

  const domains = dashboardData?.readiness?.domains || [];

  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Attempt evaluation state for each question
  const [attemptState, setAttemptState] = useState({}); // { [qId]: { selectedOptionId, isCorrect, autopsy, correctOptionId, autoCreatedFlashcard } }
  const [submittingAttempt, setSubmittingAttempt] = useState(false);

  // Active option tab for Distractor Autopsy viewer (e.g. 'A', 'B', 'C', 'D')
  const [activeAutopsyOptionId, setActiveAutopsyOptionId] = useState(null);

  // Generate more questions state
  const [generating, setGenerating] = useState(false);

  // Load questions based on selected syllabus and domain
  const loadQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const sylId = activeSyllabus?.id || null;
      const data = await apiService.getQuizQuestions(sylId, selectedQuizDomainId, 25);
      setQuestions(data || []);
      setCurrentIndex(0);
      setActiveAutopsyOptionId(null);
    } catch (err) {
      showToast(`Failed to load quiz questions: ${err.message}`, 'error');
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [activeSyllabus?.id, selectedQuizDomainId]);

  const currentQ = questions[currentIndex] || null;
  const currentAttempt = currentQ ? attemptState[currentQ.id] : null;

  // Handle option selection
  const handleSelectOption = async (optionId) => {
    if (!currentQ || currentAttempt || submittingAttempt) return;

    try {
      setSubmittingAttempt(true);
      const res = await apiService.submitQuizAttempt({
        questionId: currentQ.id,
        selectedOptionId: optionId,
      });

      setAttemptState((prev) => ({
        ...prev,
        [currentQ.id]: {
          selectedOptionId: optionId,
          isCorrect: res.isCorrect,
          selectedAutopsy: res.selectedAutopsy,
          correctOptionId: res.correctOptionId,
          autoCreatedFlashcard: res.autoCreatedFlashcard,
        },
      }));

      setActiveAutopsyOptionId(optionId);

      // Refresh dashboard readiness in background
      await refreshDashboard();

      if (!res.isCorrect) {
        showToast('Missed concept automatically saved to Weak-Spot Flashcards!', 'info');
      } else {
        showToast('Spot on! Excellent cloud architecture reasoning.', 'success');
      }
    } catch (err) {
      showToast(`Error recording attempt: ${err.message}`, 'error');
    } finally {
      setSubmittingAttempt(false);
    }
  };

  // Generate more AI questions
  const handleGenerateMore = async () => {
    const targetDomain = domains.find((d) => d.id === selectedQuizDomainId) || domains[0];
    const targetDomainId = targetDomain?.id;
    if (!targetDomainId) {
      showToast('No topics available to generate questions for.', 'warning');
      return;
    }
    try {
      setGenerating(true);
      const res = await apiService.generateMoreQuestions({
        domainId: targetDomainId,
        topicTag: targetDomain.name,
        difficulty: 'medium',
        count: 2,
      });

      if (res?.questions) {
        setQuestions((prev) => [...prev, ...res.questions]);
        showToast(`Gemini synthesized ${res.questions.length} new questions for ${targetDomain.name}!`, 'success');
      }
    } catch (err) {
      showToast(`Generation failed: ${err.message}`, 'error');
    } finally {
      setGenerating(false);
    }
  };

  // Active option autopsy details
  const displayedAutopsyOption =
    currentQ?.options?.find(
      (opt) => opt.id === (activeAutopsyOptionId || currentAttempt?.selectedOptionId || 'A')
    ) || currentQ?.options?.[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar: Domain Filters & Generate More Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Domain Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
          <button
            onClick={() => setSelectedQuizDomainId(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border shrink-0 ${
              selectedQuizDomainId === null
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            All {activeSyllabus?.code || 'Exam'} Topics ({questions.length})
          </button>
          {domains.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedQuizDomainId(d.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border shrink-0 ${
                selectedQuizDomainId === d.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {d.name.replace('Describe ', '')}
            </button>
          ))}
        </div>

        {/* Generate More Button */}
        <button
          onClick={handleGenerateMore}
          disabled={generating}
          className="w-full sm:w-auto justify-center px-3.5 py-2 sm:py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition shrink-0 disabled:opacity-50"
        >
          {generating ? (
            <>
              <span className="h-3.5 w-3.5 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
              <span>Generating with Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>+ Generate 2 Scenario Questions</span>
            </>
          )}
        </button>
      </div>

      {loadingQuestions ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="flex flex-col items-center gap-3 text-slate-400 text-sm">
            <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading scenario questions with Distractor Autopsies...</span>
          </div>
        </div>
      ) : !currentQ ? (
        <div className="p-8 sm:p-12 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-400">
          <BrainCircuit className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-300">No questions available for this domain.</p>
          <button
            onClick={handleGenerateMore}
            className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Questions Now</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Question Card */}
          <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 sm:space-y-6">
            {/* Meta Header & Stepper */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 sm:pb-4 border-b border-slate-800">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold font-mono">
                  Q {currentIndex + 1} OF {questions.length}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium truncate max-w-[150px] sm:max-w-none">
                  {currentQ.topic_tag || 'Core Concepts'}
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  {currentQ.domain_name}
                </span>
              </div>

              {/* Navigation Steppers */}
              <div className="flex items-center gap-2">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => {
                    setCurrentIndex((i) => i - 1);
                    setActiveAutopsyOptionId(null);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
                  title="Previous Question"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={currentIndex === questions.length - 1}
                  onClick={() => {
                    setCurrentIndex((i) => i + 1);
                    setActiveAutopsyOptionId(null);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
                  title="Next Question"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Scenario Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800/90 text-slate-200 text-sm leading-relaxed shadow-inner">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                Scenario Context:
              </span>
              {currentQ.scenario}
            </div>

            {/* Question Text */}
            <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
              👉 {currentQ.question}
            </h2>

            {/* Options List */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {currentQ.options?.map((opt) => {
                const isSelected = currentAttempt?.selectedOptionId === opt.id;
                const isCorrect = opt.is_correct;
                const hasAnswered = Boolean(currentAttempt);

                let optionStyles = 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-200';
                if (hasAnswered) {
                  if (isCorrect) {
                    optionStyles = 'bg-emerald-950/40 border-emerald-500/80 text-emerald-100 shadow-sm';
                  } else if (isSelected && !isCorrect) {
                    optionStyles = 'bg-rose-950/40 border-rose-500/80 text-rose-100 shadow-sm';
                  } else {
                    optionStyles = 'bg-slate-950/40 border-slate-800/40 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    disabled={hasAnswered || submittingAttempt}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${optionStyles}`}
                  >
                    <span
                      className={`h-7 w-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        hasAnswered && isCorrect
                          ? 'bg-emerald-500 text-white'
                          : hasAnswered && isSelected && !isCorrect
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {opt.id}
                    </span>
                    <div className="flex-1 text-xs sm:text-sm leading-relaxed">
                      <span>{opt.text}</span>
                    </div>

                    {hasAnswered && isCorrect && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    {hasAnswered && isSelected && !isCorrect && (
                      <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Answer Feedback & Distractor Autopsy Panel */}
          {currentAttempt && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Weak-spot Flashcard Notification Banner */}
              {!currentAttempt.isCorrect && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs sm:text-sm text-amber-200">
                  <div className="flex items-center gap-2.5">
                    <Flame className="h-5 w-5 text-amber-400 shrink-0" />
                    <span>
                      <strong>Saved to your Mistake Cards</strong> so you can review it later!
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (currentIndex < questions.length - 1) {
                        setCurrentIndex((i) => i + 1);
                        setActiveAutopsyOptionId(null);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold shrink-0 transition"
                  >
                    Next Question →
                  </button>
                </div>
              )}

              {/* The Distractor Autopsy Dissection Box */}
              <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900 border border-purple-500/30 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold shrink-0">
                      💡
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Why Each Option Is Right or Wrong</h3>
                      <p className="text-xs text-slate-400">
                        Clear explanations for why wrong choices fail and when they would actually apply
                      </p>
                    </div>
                  </div>

                  {/* Option Selector Tabs */}
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs self-start sm:self-auto overflow-x-auto max-w-full">
                    <span className="text-[10px] text-slate-500 px-1.5 font-mono">Inspect:</span>
                    {currentQ.options?.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setActiveAutopsyOptionId(opt.id)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
                          displayedAutopsyOption?.id === opt.id
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {opt.id}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Autopsy Details for selected option */}
                {displayedAutopsyOption?.autopsy && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3 text-xs sm:text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-800/60 pb-2">
                      <span className="font-semibold text-slate-200">
                        Option {displayedAutopsyOption.id}: "{displayedAutopsyOption.text}"
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded self-start sm:self-auto ${
                          displayedAutopsyOption.is_correct
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {displayedAutopsyOption.is_correct ? 'Correct Choice' : 'Distractor'}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <span className="font-bold text-slate-300 block mb-0.5">
                          Why this is {displayedAutopsyOption.is_correct ? 'right:' : 'wrong:'}
                        </span>
                        <p className="text-slate-400 leading-relaxed pl-3 border-l-2 border-slate-700">
                          {displayedAutopsyOption.autopsy.why_wrong}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-purple-300 block mb-0.5">
                          When WOULD this option be the right answer?
                        </span>
                        <p className="text-purple-200/90 leading-relaxed pl-3 border-l-2 border-purple-500/60">
                          {displayedAutopsyOption.autopsy.right_scenario}
                        </p>
                      </div>

                      {displayedAutopsyOption.autopsy.trap && displayedAutopsyOption.autopsy.trap !== 'N/A' && (
                        <div>
                          <span className="font-bold text-amber-300 block mb-0.5">
                            Common exam trap to watch out for:
                          </span>
                          <p className="text-amber-200/90 leading-relaxed pl-3 border-l-2 border-amber-500/60">
                            {displayedAutopsyOption.autopsy.trap}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cultural Context Switcher Box */}
                {currentQ.context_translations && (
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                        <Globe2 className="h-4 w-4 text-indigo-400" />
                        <span>Cultural Context Breakdown</span>
                      </div>

                      {/* 1-Click Language Switcher right on the box */}
                      <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px]">
                        {TONE_MODES.map((mode) => (
                          <button
                            key={mode.id}
                            onClick={() => setLanguageMode(mode.id)}
                            className={`px-2 py-0.5 rounded-lg font-semibold transition ${
                              languageMode === mode.id
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {mode.shortLabel}
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {currentQ.context_translations[languageMode] ||
                        currentQ.context_translations.african_context ||
                        currentQ.context_translations.standard}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
