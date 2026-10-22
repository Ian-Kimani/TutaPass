import React, { useEffect, useState } from 'react';
import { CheckCircle2, ChevronRight, Flame, X, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import apiService from '../services/api.service';

const SPRINT_LENGTH = 5;

export default function ReadinessSprintModal({ onClose }) {
  const { activeSyllabus, refreshDashboard, showToast } = useApp();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadSprint = async () => {
      try {
        const result = await apiService.getQuizQuestions(activeSyllabus?.id || null, null, SPRINT_LENGTH);
        if (mounted) setQuestions((result || []).slice(0, SPRINT_LENGTH));
      } catch (err) {
        if (mounted) setError(err.message || 'We could not load the sprint.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadSprint();
    return () => {
      mounted = false;
    };
  }, [activeSyllabus?.id]);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;
  const completed = currentIndex >= questions.length && questions.length > 0;
  const correctCount = Object.values(answers).filter((answer) => answer.isCorrect).length;
  const weakTopics = Object.values(answers)
    .filter((answer) => !answer.isCorrect)
    .map((answer) => answer.topic)
    .filter(Boolean);

  const handleAnswer = async (optionId) => {
    if (!currentQuestion || currentAnswer || submitting) return;
    try {
      setSubmitting(true);
      const result = await apiService.submitQuizAttempt({
        questionId: currentQuestion.id,
        selectedOptionId: optionId,
      });
      setAnswers((previous) => ({
        ...previous,
        [currentQuestion.id]: {
          isCorrect: result.isCorrect,
          selectedOptionId: optionId,
          correctOptionId: result.correctOptionId,
          autopsy: result.selectedAutopsy,
          topic: currentQuestion.topic_tag,
        },
      }));
      await refreshDashboard();
    } catch (err) {
      showToast(`Could not save your answer: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const nextQuestion = () => setCurrentIndex((index) => index + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-purple-700">Quick check</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">Readiness Sprint</h2>
            <p className="mt-1 text-sm text-slate-500">Five questions to show what to study next.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Close readiness sprint">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-7">
          {loading && <p className="py-12 text-center text-sm text-slate-500">Loading your questions...</p>}
          {!loading && error && <p className="py-12 text-center text-sm text-rose-600">{error}</p>}
          {!loading && !error && !currentQuestion && !completed && (
            <p className="py-12 text-center text-sm text-slate-500">There are no questions ready for this track yet.</p>
          )}
          {!loading && completed && (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Your quick result</p>
                <h3 className="mt-1 text-4xl font-black text-slate-900">{correctCount}/{questions.length}</h3>
                <p className="mt-2 text-sm text-slate-600">
                  {correctCount >= 4
                    ? 'Great foundation. Keep practising to make it consistent.'
                    : 'You found useful gaps. Review the suggested mistake cards next.'}
                </p>
              </div>
              {weakTopics.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left">
                  <p className="flex items-center gap-2 text-sm font-bold text-amber-900">
                    <Flame className="h-4 w-4" /> Review next
                  </p>
                  <p className="mt-1 text-sm text-amber-800">{[...new Set(weakTopics)].join(', ')}</p>
                  <p className="mt-2 text-xs text-amber-700">Each missed answer was added to Mistake Cards automatically.</p>
                </div>
              )}
              <button onClick={onClose} className="rounded-full bg-[#230832] px-5 py-3 text-sm font-bold text-white hover:bg-purple-900">
                Back to my progress
              </button>
            </div>
          )}
          {!loading && currentQuestion && !completed && (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span>{correctCount} correct so far</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-purple-700 transition-all" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
              </div>
              <div className="rounded-2xl bg-purple-50 p-4 text-sm leading-relaxed text-slate-700">
                <span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-purple-700">Scenario</span>
                {currentQuestion.scenario}
              </div>
              <h3 className="text-lg font-black leading-snug text-slate-900">{currentQuestion.question}</h3>
              <div className="space-y-2">
                {currentQuestion.options?.map((option) => {
                  const selected = currentAnswer?.selectedOptionId === option.id;
                  const correct = currentAnswer?.correctOptionId === option.id;
                  const wrong = selected && currentAnswer && !currentAnswer.isCorrect;
                  return (
                    <button
                      key={option.id}
                      disabled={Boolean(currentAnswer) || submitting}
                      onClick={() => handleAnswer(option.id)}
                      className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left text-sm transition ${
                        correct ? 'border-emerald-500 bg-emerald-50 text-emerald-900' :
                        wrong ? 'border-rose-500 bg-rose-50 text-rose-900' :
                        currentAnswer ? 'border-slate-200 bg-slate-50 text-slate-400' :
                        'border-slate-200 bg-white text-slate-800 hover:border-purple-400 hover:bg-purple-50'
                      }`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-black">{option.id}</span>
                      <span className="flex-1">{option.text}</span>
                      {correct && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />}
                      {wrong && <XCircle className="h-5 w-5 shrink-0 text-rose-600" />}
                    </button>
                  );
                })}
              </div>
              {currentAnswer && (
                <div className={`rounded-2xl p-4 text-sm ${currentAnswer.isCorrect ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
                  <p className="font-bold">{currentAnswer.isCorrect ? 'Correct. Nice reasoning.' : 'Not quite. This is now a Mistake Card.'}</p>
                  {currentAnswer.autopsy?.why_wrong && !currentAnswer.isCorrect && (
                    <p className="mt-1 leading-relaxed">{currentAnswer.autopsy.why_wrong}</p>
                  )}
                  <button onClick={nextQuestion} className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-bold shadow-sm">
                    {currentIndex === questions.length - 1 ? 'See my result' : 'Next question'} <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
