const geminiService = require('../services/gemini.service');
const db = require('../config/db');
const srsService = require('../services/srs.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * On-demand AI Study Buddy concept explanation across
 * Standard English, African Everyday Analogy, or Sheng Mode.
 */
const explainConcept = asyncHandler(async (req, res) => {
  const { concept, topic = 'Azure Cloud Fundamentals', mode = 'african_context' } = req.body;

  if (!concept || typeof concept !== 'string' || concept.trim().length === 0) {
    return sendError(res, 'concept is required to generate an explanation.', 400);
  }

  const validModes = ['standard', 'african_context', 'sheng'];
  const activeMode = validModes.includes(String(mode).toLowerCase())
    ? String(mode).toLowerCase()
    : 'african_context';

  const { result, promptTelemetry } = await geminiService.explainConcept({
    concept: concept.trim(),
    topic: topic.trim(),
    mode: activeMode,
  });

  return sendSuccess(
    res,
    {
      explanation: result,
    },
    promptTelemetry
  );
});

const evaluateTeachBack = asyncHandler(async (req, res) => {
  const {
    syllabusTitle,
    question,
    scenario,
    selectedAnswer,
    correctAnswer,
    explanation,
    questionId,
    userId = 'demo-learner',
  } = req.body;

  if ([question, scenario, selectedAnswer, correctAnswer, explanation].some(
    (value) => typeof value !== 'string' || value.trim().length < 2
  )) {
    return sendError(res, 'Question, answers, and explanation are required.', 400);
  }

  const { result, promptTelemetry } = await geminiService.evaluateTeachBack({
    syllabusTitle: syllabusTitle || 'Exam Preparation',
    question: question.trim(),
    scenario: scenario.trim(),
    selectedAnswer: selectedAnswer.trim(),
    correctAnswer: correctAnswer.trim(),
    explanation: explanation.trim(),
  });

  let mistakeCard = null;
  if (result?.verdict !== 'understood' && questionId) {
    mistakeCard = await srsService.createOrUpdateWeakSpotFlashcard(db, {
      userId,
      questionId,
    });
  }

  return sendSuccess(res, { evaluation: result, mistakeCard }, promptTelemetry);
});

module.exports = {
  explainConcept,
  evaluateTeachBack,
};
