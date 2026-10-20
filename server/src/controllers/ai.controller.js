const geminiService = require('../services/gemini.service');
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

module.exports = {
  explainConcept,
};
