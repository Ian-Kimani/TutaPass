import React, { useState, useEffect } from 'react';
import {
  Flame,
  CheckCircle2,
  RotateCw,
  Sparkles,
  ArrowRight,
  Eye,
  Globe2,
  Clock,
  Layers,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TONE_MODES, TABS } from '../constants/navigation';
import apiService from '../services/api.service';

export default function FlashcardsPage() {
  const {
    refreshDashboard,
    languageMode,
    setLanguageMode,
    setActiveTab,
    showToast,
    activeSyllabus,
  } = useApp();

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [filterDueOnly, setFilterDueOnly] = useState(true);

  const loadFlashcards = async () => {
    try {
      setLoading(true);
      const res = await apiService.getFlashcards('demo-learner', activeSyllabus?.id || null);
      setCards(res?.flashcards || []);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      showToast(`Failed to load flashcards: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlashcards();
  }, [activeSyllabus?.id]);

  const displayedCards = filterDueOnly ? cards.filter((c) => c.isDue) : cards;
  const safeIndex = displayedCards.length > 0 ? Math.min(currentIndex, displayedCards.length - 1) : 0;
  const currentCard = displayedCards[safeIndex] || null;

  const handleRating = async (rating) => {
    if (!currentCard || submittingRating) return;

    try {
      setSubmittingRating(true);
      const res = await apiService.reviewFlashcard(currentCard.id, rating);

      const nextDays = res?.nextReviewInDays || 1;
      const isStillDue = res?.flashcard?.isDue;

      showToast(
        isStillDue
          ? 'Card marked for re-drill today (SM-2 reset)!'
          : `Great retention! Next review in ${nextDays} day(s).`,
        'success'
      );

      // Refresh dashboard readiness in background
      await refreshDashboard();

      // Update card in state
      setCards((prev) =>
        prev.map((c) => (c.id === currentCard.id ? res.flashcard : c))
      );

      setIsFlipped(false);
      if (safeIndex >= displayedCards.length - 1) {
        setCurrentIndex(0);
      }
    } catch (err) {
      showToast(`Error saving review: ${err.message}`, 'error');
    } finally {
      setSubmittingRating(false);
    }
  };

  const dueCount = cards.filter((c) => c.isDue).length;

  // Extract content safely with fallbacks
  const frontPrompt = currentCard?.front || currentCard?.front_prompt || '';
  const backExplanation = currentCard?.back || currentCard?.back_explanation || '';
  const domainTitle = currentCard?.domain_name || 'Exam Topic';
  const topicTag = currentCard?.topic_tag || 'Weak Spot Concept';
  const notes = currentCard?.cultural_analogy || currentCard?.context_notes || {};
  const analogy =
    notes[languageMode] ||
    notes.african_analogy ||
    notes.african_context ||
    notes.sheng ||
    notes.standard ||
    null;

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner (Elevated White Card with ABF Style) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider block mb-1">
            Spaced Repetition Memory Engine (SM-2)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Review Your Mistake Cards
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Every scenario question you miss in the Practice Quiz automatically creates a weak-spot
            flashcard here until you master it.
          </p>
        </div>

        {/* Filter Toggle Pills (ABF Pill Style) */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-full text-xs shrink-0 self-start md:self-auto">
          <button
            onClick={() => {
              setFilterDueOnly(true);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-4 py-2 rounded-full font-bold transition text-center ${
              filterDueOnly
                ? 'bg-[#230832] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Due Today ({dueCount})
          </button>
          <button
            onClick={() => {
              setFilterDueOnly(false);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-4 py-2 rounded-full font-bold transition text-center ${
              !filterDueOnly
                ? 'bg-[#230832] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Cards ({cards.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="flex flex-col items-center gap-3 text-slate-500 text-sm">
            <div className="h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <span>Loading SM-2 spaced repetition deck...</span>
          </div>
        </div>
      ) : displayedCards.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/80 text-center text-slate-500 shadow-sm space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900">All Caught Up!</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {filterDueOnly
              ? 'No mistake cards due today! Great work retaining your weak spots.'
              : 'No mistake cards created yet. Miss a question in the Practice Quiz to generate cards.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            {cards.length > 0 && filterDueOnly && (
              <button
                onClick={() => setFilterDueOnly(false)}
                className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
              >
                Browse All ({cards.length}) Cards
              </button>
            )}
            <button
              onClick={() => setActiveTab(TABS.QUIZ)}
              className="px-5 py-2.5 rounded-full bg-[#230832] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md hover:bg-purple-900 transition"
            >
              <span>Practice Quiz Arena</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Card Counter & Progress Stepper */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-2">
            <span className="px-3 py-1 rounded-full bg-slate-200/70 text-slate-800">
              CARD {safeIndex + 1} OF {displayedCards.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={safeIndex === 0}
                onClick={() => {
                  setCurrentIndex((i) => Math.max(0, i - 1));
                  setIsFlipped(false);
                }}
                className="p-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-700 transition"
                title="Previous card"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={safeIndex >= displayedCards.length - 1}
                onClick={() => {
                  setCurrentIndex((i) => Math.min(displayedCards.length - 1, i + 1));
                  setIsFlipped(false);
                }}
                className="p-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 text-slate-700 transition"
                title="Next card"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Flashcard Surface (Interactive Flip) */}
          <div
            onClick={() => setIsFlipped((prev) => !prev)}
            className={`min-h-[360px] p-6 sm:p-10 rounded-3xl border cursor-pointer transition-all duration-300 flex flex-col justify-between select-none shadow-sm hover:shadow-md ${
              isFlipped
                ? 'bg-gradient-to-br from-[#230832] via-[#2d0b3e] to-[#170522] text-white border-purple-500/30'
                : 'bg-white text-slate-900 border-slate-200/90'
            }`}
          >
            {/* Top Card Meta */}
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full truncate max-w-[240px] sm:max-w-xs ${
                  isFlipped
                    ? 'bg-purple-900/60 text-purple-200 border border-purple-500/30'
                    : 'bg-purple-100 text-purple-900'
                }`}
              >
                {domainTitle}
              </span>

              <span
                className={`text-xs font-semibold flex items-center gap-1.5 shrink-0 ${
                  isFlipped ? 'text-purple-300' : 'text-slate-400'
                }`}
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>{isFlipped ? 'Show Question' : 'Reveal Answer'}</span>
              </span>
            </div>

            {/* Card Content Area */}
            <div className="py-6 sm:py-8">
              {!isFlipped ? (
                /* FRONT: Concept / Question that was missed */
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-black tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                      {topicTag}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug whitespace-pre-line">
                    {frontPrompt || 'What fundamental architecture rule applies here?'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2">
                    Think through the core concept, then tap the card to check your answer and review the autopsy explanation.
                  </p>
                </div>
              ) : (
                /* BACK: Clarification and Distractor Autopsy */
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-black tracking-wider text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      Core Rule & Autopsy Resolution
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-white leading-relaxed whitespace-pre-line">
                    {backExplanation || 'Review the correct answer choices in the quiz breakdown.'}
                  </p>

                  {/* Cultural Mode Translation */}
                  {analogy && (
                    <div className="mt-4 p-4 rounded-2xl bg-white/10 border border-white/10 text-xs text-purple-200 leading-relaxed">
                      <strong className="text-white font-bold block mb-1">
                        African Everyday Analogy ({languageMode}):
                      </strong>
                      {analogy}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Card Footer */}
            <div
              className={`pt-4 border-t flex items-center justify-between text-[11px] font-medium ${
                isFlipped ? 'border-white/10 text-purple-300' : 'border-slate-100 text-slate-400'
              }`}
            >
              <span>Interval: {currentCard?.interval_days || 1} day(s)</span>
              <span>Ease: {currentCard?.ease_factor || '2.50'}</span>
              <span>Repetitions: {currentCard?.repetition_count || 0}</span>
            </div>
          </div>

          {/* SM-2 Review Rating Buttons (Visible when flipped) */}
          {isFlipped && (
            <div className="space-y-3 animate-in fade-in duration-300">
              <span className="text-xs font-bold text-slate-500 text-center block uppercase tracking-wider">
                How easily did you recall this concept?
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  disabled={submittingRating}
                  onClick={() => handleRating('again')}
                  className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 text-center font-bold text-xs transition shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="block text-sm">❌ Again</span>
                  <span className="text-[10px] text-rose-600 font-normal">Re-drill today</span>
                </button>

                <button
                  disabled={submittingRating}
                  onClick={() => handleRating('hard')}
                  className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-center font-bold text-xs transition shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="block text-sm">⚠️ Hard</span>
                  <span className="text-[10px] text-amber-700 font-normal">Review in 1 day</span>
                </button>

                <button
                  disabled={submittingRating}
                  onClick={() => handleRating('good')}
                  className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-center font-bold text-xs transition shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="block text-sm">👍 Good</span>
                  <span className="text-[10px] text-blue-700 font-normal">Review in 3 days</span>
                </button>

                <button
                  disabled={submittingRating}
                  onClick={() => handleRating('easy')}
                  className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-center font-bold text-xs transition shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="block text-sm">🎯 Easy</span>
                  <span className="text-[10px] text-emerald-700 font-normal">Review in 6+ days</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
