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
  ArrowRight,
  MessageSquareText,
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
  const [attemptState, setAttemptState] = useState({});
  const [submittingAttempt, setSubmittingAttempt] = useState(false);

  // Active option tab for Distractor Autopsy viewer (e.g. 'A', 'B', 'C', 'D')
  const [activeAutopsyOptionId, setActiveAutopsyOptionId] = useState(null);

  // Generate more questions state
  const [generating, setGenerating] = useState(false);
  const [teachBackText, setTeachBackText] = useState('');
  const [teachBackResult, setTeachBackResult] = useState(null);
  const [evaluatingTeachBack, setEvaluatingTeachBack] = useState(false);

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
        showToast('Missed concept automatically saved to Mistake Cards!', 'info');
      } else {
        showToast('Spot on! Excellent concept reasoning.', 'success');
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
        showToast(
          `Gemini synthesized ${res.questions.length} new questions for ${targetDomain.name}!`,
          'success'
        );
      }
    } catch (err) {
      showToast(`Generation failed: ${err.message}`, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleTeachBack = async (event) => {
    event.preventDefault();
    if (!currentQ || !currentAttempt || teachBackText.trim().length < 10 || evaluatingTeachBack) return;

    const selectedOption = currentQ.options?.find((option) => option.id === currentAttempt.selectedOptionId);
    const correctOption = currentQ.options?.find((option) => option.is_correct);
    try {
      setEvaluatingTeachBack(true);
      const result = await apiService.evaluateTeachBack({
        syllabusTitle: activeSyllabus?.title,
        question: currentQ.question,
        scenario: currentQ.scenario,
        selectedAnswer: selectedOption?.text || '',
        correctAnswer: correctOption?.text || '',
        explanation: teachBackText.trim(),
        questionId: currentQ.id,
      });
      setTeachBackResult({
        ...(result?.evaluation || {}),
        mistakeCardCreated: Boolean(result?.mistakeCard),
      });
    } catch (err) {
      showToast(`Teach-Back could not check that explanation: ${err.message}`, 'error');
    } finally {
      setEvaluatingTeachBack(false);
    }
  };

  // Active option autopsy details
  const displayedAutopsyOption =
    currentQ?.options?.find(
      (opt) => opt.id === (activeAutopsyOptionId || currentAttempt?.selectedOptionId || 'A')
    ) || currentQ?.options?.[0];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Bar: Domain Filter Pills & Synthesis Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Domain Filter Pills (ABF White Pills) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setSelectedQuizDomainId(null)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition border shrink-0 ${
              selectedQuizDomainId === null
                ? 'bg-[#230832] text-white border-[#230832] shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            All {activeSyllabus?.code || 'Exam'} Topics ({questions.length})
          </button>
          {domains.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedQuizDomainId(d.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition border shrink-0 ${
                selectedQuizDomainId === d.id
                  ? 'bg-[#230832] text-white border-[#230832] shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {d.name.replace('Describe ', '')}
            </button>
          ))}
        </div>

        {/* Generate More Questions Button */}
        <button
          onClick={handleGenerateMore}
          disabled={generating}
          className="w-full sm:w-auto justify-center px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-purple-800 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition shadow-sm shrink-0 disabled:opacity-50"
        >
          {generating ? (
            <>
              <span className="h-3.5 w-3.5 border-2 border-purple-700 border-t-transparent rounded-full animate-spin" />
              <span>Synthesizing Questions...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              <span>+ Generate 2 Scenario Questions</span>
            </>
          )}
        </button>
      </div>

      {loadingQuestions ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="flex flex-col items-center gap-3 text-slate-500 text-sm">
            <div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <span>Loading scenario questions with Distractor Autopsies...</span>
          </div>
        </div>
      ) : !currentQ ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/80 text-center text-slate-500 shadow-sm">
          <BrainCircuit className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <p className="font-bold text-slate-800 text-base">No questions available for this domain.</p>
          <button
            onClick={handleGenerateMore}
            className="mt-3 px-5 py-2.5 rounded-full bg-[#230832] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Questions Now</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Question Card (Elevated White Card with Crisp ABF Finish) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6">
            {/* Meta Header & Stepper */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-900 font-black text-xs tracking-wider">
                  QUESTION {currentIndex + 1} OF {questions.length}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                  {currentQ.topic_tag || 'Core Concepts'}
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
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
                    setTeachBackText('');
                    setTeachBackResult(null);
                  }}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 transition"
                  title="Previous Question"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={currentIndex === questions.length - 1}
                  onClick={() => {
                    setCurrentIndex((i) => i + 1);
                    setActiveAutopsyOptionId(null);
                    setTeachBackText('');
                    setTeachBackResult(null);
                  }}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 transition"
                  title="Next Question"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Scenario Callout Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/50 border border-purple-100 text-slate-800 text-sm leading-relaxed">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block mb-1">
                Scenario Background
              </span>
              {currentQ.scenario}
            </div>

            {/* Question Text */}
            <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              👉 {currentQ.question}
            </h2>

            {/* Multiple Choice Options List */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {currentQ.options?.map((opt) => {
                const isSelected = currentAttempt?.selectedOptionId === opt.id;
                const isCorrect = opt.is_correct;
                const hasAnswered = Boolean(currentAttempt);

                let optionStyles = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';
                if (hasAnswered) {
                  if (isCorrect) {
                    optionStyles = 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm font-semibold';
                  } else if (isSelected && !isCorrect) {
                    optionStyles = 'bg-rose-50 border-rose-500 text-rose-900 shadow-sm font-semibold';
                  } else {
                    optionStyles = 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    disabled={hasAnswered || submittingAttempt}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all ${optionStyles}`}
                  >
                    <span
                      className={`h-7 w-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 mt-0.5 ${
                        hasAnswered && isCorrect
                          ? 'bg-emerald-600 text-white'
                          : hasAnswered && isSelected && !isCorrect
                          ? 'bg-rose-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
                      }`}
                    >
                      {opt.id}
                    </span>
                    <div className="flex-1 text-xs sm:text-sm leading-relaxed">
                      <span>{opt.text}</span>
                    </div>

                    {hasAnswered && isCorrect && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    {hasAnswered && isSelected && !isCorrect && (
                      <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
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
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-amber-900 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                      <Flame className="h-5 w-5" />
                    </div>
                    <span>
                      <strong>Saved to your Mistake Cards deck!</strong> Spaced repetition will reinforce
                      this topic until you achieve 100% mastery.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (currentIndex < questions.length - 1) {
                        setCurrentIndex((i) => i + 1);
                        setActiveAutopsyOptionId(null);
                      }
                    }}
                    className="px-4 py-2 rounded-full bg-[#230832] hover:bg-[#341148] text-white text-xs font-bold shrink-0 transition shadow-sm self-end sm:self-auto"
                  >
                    Next Question →
                  </button>
                </div>
              )}

              {/* The Distractor Autopsy Dissection Box (Elevated White Card with Plum Header) */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-[#230832] text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                      💡
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        Why Each Option Is Right or Wrong
                      </h3>
                      <p className="text-xs text-slate-500">
                        Distractor Autopsy: dissecting why incorrect answers fail and when they would apply
                      </p>
                    </div>
                  </div>

                  {/* Option Selector Tabs */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full text-xs self-start sm:self-auto overflow-x-auto max-w-full">
                    <span className="text-[10px] text-slate-500 px-2 font-bold uppercase">Inspect:</span>
                    {currentQ.options?.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setActiveAutopsyOptionId(opt.id)}
                        className={`px-3 py-1 rounded-full font-bold text-xs transition ${
                          displayedAutopsyOption?.id === opt.id
                            ? 'bg-[#230832] text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {opt.id}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Autopsy Details for selected option */}
                {displayedAutopsyOption?.autopsy && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 text-xs sm:text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <span className="font-bold text-slate-900">
                        Option {displayedAutopsyOption.id}: "{displayedAutopsyOption.text}"
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full self-start sm:self-auto ${
                          displayedAutopsyOption.is_correct
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {displayedAutopsyOption.is_correct ? 'Correct Choice' : 'Distractor (Wrong Choice)'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="font-black text-slate-800 block mb-1">
                          Why this option is {displayedAutopsyOption.is_correct ? 'CORRECT:' : 'INCORRECT:'}
                        </span>
                        <p className="text-slate-600 leading-relaxed pl-3 border-l-2 border-slate-400">
                          {displayedAutopsyOption.autopsy.why_wrong}
                        </p>
                      </div>

                      <div>
                        <span className="font-black text-purple-900 block mb-1">
                          When WOULD this option be the right answer?
                        </span>
                        <p className="text-purple-800 leading-relaxed pl-3 border-l-2 border-purple-600">
                          {displayedAutopsyOption.autopsy.right_scenario}
                        </p>
                      </div>

                      {displayedAutopsyOption.autopsy.trap &&
                        displayedAutopsyOption.autopsy.trap !== 'N/A' && (
                          <div>
                            <span className="font-black text-amber-900 block mb-1">
                              Common exam trap to avoid:
                            </span>
                            <p className="text-amber-800 leading-relaxed pl-3 border-l-2 border-amber-500">
                              {displayedAutopsyOption.autopsy.trap}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-700 text-white">
                      <MessageSquareText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-indigo-950">Teach-Back: prove you understand</h3>
                      <p className="mt-1 text-xs leading-relaxed text-indigo-800">
                        Explain why your answer is right or wrong in your own words. TutaPass checks your reasoning, not just your guess.
                      </p>
                    </div>
                  </div>
                  <form onSubmit={handleTeachBack} className="mt-4 space-y-2">
                    <textarea
                      value={teachBackText}
                      onChange={(event) => setTeachBackText(event.target.value)}
                      rows={3}
                      minLength={10}
                      placeholder="I chose this because..."
                      className="w-full rounded-xl border border-indigo-200 bg-white p-3 text-xs text-slate-800 outline-none transition focus:border-indigo-500"
                    />
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-[11px] text-indigo-700">At least 10 characters</span>
                      <button
                        type="submit"
                        disabled={evaluatingTeachBack || teachBackText.trim().length < 10}
                        className="rounded-full bg-indigo-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {evaluatingTeachBack ? 'Checking your reasoning...' : 'Check my explanation'}
                      </button>
                    </div>
                  </form>
                  {teachBackResult && (
                    <div className={`mt-4 rounded-xl border p-3 text-xs ${
                      teachBackResult.verdict === 'understood'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                        : teachBackResult.verdict === 'lucky_guess'
                        ? 'border-amber-200 bg-amber-50 text-amber-900'
                        : 'border-rose-200 bg-rose-50 text-rose-900'
                    }`}>
                      <p className="font-black">{teachBackResult.headline}</p>
                      <p className="mt-1 leading-relaxed">{teachBackResult.feedback}</p>
                      {teachBackResult.misconception && (
                        <p className="mt-2 leading-relaxed"><strong>Watch for:</strong> {teachBackResult.misconception}</p>
                      )}
                      {teachBackResult.repairAction && (
                        <p className="mt-2 leading-relaxed"><strong>Next step:</strong> {teachBackResult.repairAction}</p>
                      )}
                      {teachBackResult.mistakeCardCreated && (
                        <p className="mt-2 font-bold">This concept was added to your Mistake Cards for review.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Cultural Context Breakdown */}
                {currentQ.context_translations && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/80 pb-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                        <Globe2 className="h-4 w-4 text-purple-700" />
                        <span>Cultural Analogy Breakdown ({languageMode})</span>
                      </div>

                      <div className="flex items-center bg-white p-1 rounded-full border border-purple-200 text-[11px]">
                        {TONE_MODES.map((mode) => (
                          <button
                            key={mode.id}
                            onClick={() => setLanguageMode(mode.id)}
                            className={`px-2.5 py-0.5 rounded-full font-bold transition ${
                              languageMode === mode.id
                                ? 'bg-[#230832] text-white'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {mode.shortLabel}
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-purple-950 leading-relaxed font-medium">
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
