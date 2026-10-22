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
  const currentCard = displayedCards[currentIndex] || null;

  const handleRating = async (rating) => {
    if (!currentCard || submittingRating) return;

    try {
      setSubmittingRating(true);
      const res = await apiService.reviewFlashcard(currentCard.id, rating);

      showToast(
        `Card updated via SM-2! Next review in ${res?.nextReviewInDays || 1} day(s).`,
        'success'
      );

      // Refresh dashboard readiness in background
      await refreshDashboard();

      // Remove or advance card
      setCards((prev) =>
        prev.map((c) => (c.id === currentCard.id ? res.flashcard : c))
      );

      setIsFlipped(false);
      if (currentIndex >= displayedCards.length - 1) {
        setCurrentIndex(0);
      }
    } catch (err) {
      showToast(`Error saving review: ${err.message}`, 'error');
    } finally {
      setSubmittingRating(false);
    }
  };

  const dueCount = cards.filter((c) => c.isDue).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Review Your Mistake Cards</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Every question you miss in the Practice Quiz automatically shows up here until you master it.
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs w-full sm:w-auto">
          <button
            onClick={() => {
              setFilterDueOnly(true);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl font-semibold transition text-center ${
              filterDueOnly
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
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
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl font-semibold transition text-center ${
              !filterDueOnly
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Cards ({cards.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="flex flex-col items-center gap-3 text-slate-400 text-sm">
            <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading SM-2 spaced repetition deck...</span>
          </div>
        </div>
      ) : displayedCards.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 max-w-xl mx-auto shadow-xl">
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">All Due Flashcards Cleared!</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Your memory retention is optimal. If you make any mistakes during practice quizzes, TutaPass will automatically generate new weak-spot cards here.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setActiveTab(TABS.QUIZ)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
            >
              <span>Back to Quiz Arena</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            {cards.length > 0 && filterDueOnly && (
              <button
                onClick={() => setFilterDueOnly(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/60 transition"
              >
                Review All {cards.length} Cards
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Card Stepper Header */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                CARD {currentIndex + 1} OF {displayedCards.length}
              </span>
              <span className="text-slate-300 font-medium">
                {currentCard.topic_tag || 'Cloud Architecture'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => {
                  setCurrentIndex((i) => i - 1);
                  setIsFlipped(false);
                }}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={currentIndex === displayedCards.length - 1}
                onClick={() => {
                  setCurrentIndex((i) => i + 1);
                  setIsFlipped(false);
                }}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Flashcard Main Surface */}
          <div className="rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-4 sm:p-8 space-y-4 sm:space-y-6 transition-all">
            {/* Front Prompt */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Concept Challenge (Front)
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Domain: {currentCard.domain_name}
                </span>
              </div>
              <p className="text-base sm:text-lg font-semibold text-white leading-relaxed whitespace-pre-line">
                {currentCard.front_prompt}
              </p>
            </div>

            {/* Flip / Reveal Button */}
            {!isFlipped ? (
              <div className="pt-4 text-center">
                <button
                  onClick={() => setIsFlipped(true)}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 mx-auto transition hover:scale-[1.02]"
                >
                  <Eye className="h-4 w-4" />
                  <span>Reveal Answer & Cultural Analogy</span>
                </button>
              </div>
            ) : (
              /* Back Revealed Explanation */
              <div className="pt-4 border-t border-slate-800 space-y-5 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                    Core Technical Answer (Back)
                  </span>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                    {currentCard.back_explanation}
                  </div>
                </div>

                {/* Cultural Analogy Box */}
                {currentCard.context_notes && (
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-indigo-500/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                        <Globe2 className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Everyday Cultural Analogy</span>
                      </div>

                      {/* Language switcher pills */}
                      <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                        {TONE_MODES.map((mode) => (
                          <button
                            key={mode.id}
                            onClick={() => setLanguageMode(mode.id)}
                            className={`px-2 py-0.5 rounded font-semibold transition ${
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

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentCard.context_notes[languageMode] ||
                        currentCard.context_notes.african_analogy ||
                        currentCard.context_notes.standard}
                    </p>
                  </div>
                )}

                {/* Recall Rating Controls */}
                <div className="pt-2 space-y-2.5">
                  <span className="font-semibold text-slate-300 text-xs block text-center sm:text-left">
                    How well did you know this answer?
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      disabled={submittingRating}
                      onClick={() => handleRating('forgot')}
                      className="py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-xs flex flex-col items-center gap-0.5 transition"
                    >
                      <span>Forgot</span>
                      <span className="text-[10px] text-rose-400/80 font-normal">See tomorrow</span>
                    </button>

                    <button
                      disabled={submittingRating}
                      onClick={() => handleRating('hard')}
                      className="py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-xs flex flex-col items-center gap-0.5 transition"
                    >
                      <span>Hard</span>
                      <span className="text-[10px] text-amber-400/80 font-normal">In 2 days</span>
                    </button>

                    <button
                      disabled={submittingRating}
                      onClick={() => handleRating('good')}
                      className="py-2.5 px-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold text-xs flex flex-col items-center gap-0.5 transition"
                    >
                      <span>Good</span>
                      <span className="text-[10px] text-indigo-400/80 font-normal">In 4 days</span>
                    </button>

                    <button
                      disabled={submittingRating}
                      onClick={() => handleRating('easy')}
                      className="py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold text-xs flex flex-col items-center gap-0.5 transition"
                    >
                      <span>Easy</span>
                      <span className="text-[10px] text-emerald-400/80 font-normal">Mastered</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
