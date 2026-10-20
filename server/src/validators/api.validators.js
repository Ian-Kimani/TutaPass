/**
 * Lightweight, zero-dependency request body validators.
 */

const validatePlanInput = (body) => {
  const { targetExamDate, dailyHours } = body || {};

  if (!targetExamDate) {
    return { valid: false, error: 'targetExamDate is required (YYYY-MM-DD).' };
  }

  const examDate = new Date(targetExamDate);
  if (isNaN(examDate.getTime())) {
    return { valid: false, error: 'targetExamDate must be a valid date format.' };
  }

  if (dailyHours === undefined || dailyHours === null) {
    return { valid: false, error: 'dailyHours is required.' };
  }

  const hours = parseFloat(dailyHours);
  if (isNaN(hours) || hours <= 0 || hours > 24) {
    return { valid: false, error: 'dailyHours must be a number between 0.5 and 24.' };
  }

  return { valid: true };
};

const validateQuizAttempt = (body) => {
  const { questionId, selectedOptionId } = body || {};

  if (!questionId) {
    return { valid: false, error: 'questionId is required.' };
  }

  if (!selectedOptionId || typeof selectedOptionId !== 'string') {
    return { valid: false, error: 'selectedOptionId is required (e.g., "A", "B", "C", "D").' };
  }

  return { valid: true };
};

const validateFlashcardReview = (body) => {
  const { rating } = body || {};
  const validRatings = ['forgot', 'hard', 'good', 'easy'];

  if (!rating || !validRatings.includes(String(rating).toLowerCase())) {
    return {
      valid: false,
      error: `rating is required and must be one of: ${validRatings.join(', ')}.`,
    };
  }

  return { valid: true };
};

const validateSyllabusImport = (body) => {
  const { rawText, title } = body || {};

  if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 10) {
    return {
      valid: false,
      error: 'rawText is required and must contain at least 10 characters of syllabus content.',
    };
  }

  if (title && typeof title !== 'string') {
    return { valid: false, error: 'title must be a string if provided.' };
  }

  return { valid: true };
};

module.exports = {
  validatePlanInput,
  validateQuizAttempt,
  validateFlashcardReview,
  validateSyllabusImport,
};
