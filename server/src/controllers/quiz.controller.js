const db = require('../config/db');
const srsService = require('../services/srs.service');
const readinessService = require('../services/readiness.service');
const geminiService = require('../services/gemini.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const isValidGeneratedQuestion = (question) => (
  question &&
  typeof question.scenario === 'string' &&
  question.scenario.trim().length > 20 &&
  typeof question.question === 'string' &&
  question.question.trim().length > 10 &&
  Array.isArray(question.options) &&
  question.options.length === 4 &&
  question.options.filter((option) => option && option.is_correct === true).length === 1 &&
  question.options.every((option) =>
    option &&
    typeof option.id === 'string' &&
    typeof option.text === 'string' &&
    option.autopsy &&
    typeof option.autopsy.why_wrong === 'string' &&
    typeof option.autopsy.right_scenario === 'string' &&
    typeof option.autopsy.trap === 'string'
  )
);

/**
 * Fetch scenario quiz questions with Distractor Autopsies.
 * Filters dynamically by syllabusId and/or domainId.
 */
const getQuestions = asyncHandler(async (req, res) => {
  const { syllabusId, domainId, limit = 20 } = req.query;

  let query = `
    SELECT 
      qq.id,
      qq.domain_id,
      qq.topic_tag,
      qq.scenario,
      qq.question,
      qq.options,
      qq.context_translations,
      qq.difficulty,
      d.name AS domain_name,
      d.syllabus_id
    FROM quiz_questions qq
    JOIN domains d ON qq.domain_id = d.id
  `;

  const whereClauses = [];
  const params = [];

  if (syllabusId) {
    params.push(parseInt(syllabusId, 10));
    whereClauses.push(`d.syllabus_id = $${params.length}`);
  }

  if (domainId) {
    params.push(parseInt(domainId, 10));
    whereClauses.push(`qq.domain_id = $${params.length}`);
  }

  if (whereClauses.length > 0) {
    query += ` WHERE ` + whereClauses.join(' AND ');
  }

  params.push(parseInt(limit, 10) || 20);
  query += ` ORDER BY qq.id ASC LIMIT $${params.length};`;

  const { rows } = await db.query(query, params);

  // Normalize JSON options and context translations
  const parsedRows = rows.map((q) => ({
    ...q,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    context_translations:
      typeof q.context_translations === 'string'
        ? JSON.parse(q.context_translations)
        : q.context_translations,
  }));

  return sendSuccess(res, parsedRows);
});

/**
 * Submit an answer attempt.
 * Evaluates correctness, captures Distractor Autopsy, and if wrong:
 * AUTOMATICALLY creates or schedules a Weak-Spot Flashcard in Neon via SM-2!
 */
const submitAttempt = asyncHandler(async (req, res) => {
  const userId = req.body.userId || 'demo-learner';
  const { questionId, selectedOptionId } = req.body;

  // 1. Fetch question from database
  const qRes = await db.query('SELECT * FROM quiz_questions WHERE id = $1;', [questionId]);
  if (qRes.rows.length === 0) {
    return sendError(res, `Question ID ${questionId} not found.`, 404);
  }

  const question = qRes.rows[0];
  const options = Array.isArray(question.options)
    ? question.options
    : JSON.parse(question.options || '[]');

  const selectedOpt = options.find((opt) => opt.id === String(selectedOptionId).toUpperCase());
  if (!selectedOpt) {
    return sendError(res, `Option ${selectedOptionId} is not a valid choice for this question.`, 400);
  }

  const isCorrect = Boolean(selectedOpt.is_correct);
  const correctOpt = options.find((opt) => opt.is_correct) || null;

  // 2. Insert attempt into user_attempts
  await db.query(
    `INSERT INTO user_attempts (user_id, question_id, selected_option_id, is_correct)
     VALUES ($1, $2, $3, $4);`,
    [userId, questionId, selectedOptionId, isCorrect]
  );

  // 3. If answer was incorrect, automatically synthesize a Weak-Spot Flashcard
  let autoCreatedFlashcard = null;
  if (!isCorrect) {
    autoCreatedFlashcard = await srsService.createOrUpdateWeakSpotFlashcard(db, {
      userId,
      questionId,
    });
  }

  // 4. Calculate newly updated overall readiness score for this question's syllabus
  const domainRes = await db.query('SELECT syllabus_id FROM domains WHERE id = $1', [question.domain_id]);
  const syllabusId = domainRes.rows[0]?.syllabus_id || null;
  const updatedReadiness = await readinessService.calculateReadiness(db, userId, syllabusId);

  return sendSuccess(res, {
    isCorrect,
    selectedOption: selectedOpt,
    selectedAutopsy: selectedOpt.autopsy || null,
    correctOptionId: correctOpt?.id || null,
    correctOptionText: correctOpt?.text || null,
    contextTranslations:
      typeof question.context_translations === 'string'
        ? JSON.parse(question.context_translations)
        : question.context_translations,
    autoCreatedFlashcard,
    updatedReadiness,
  });
});

/**
 * Generate brand-new high-yield scenario questions on demand using Gemini,
 * and persist them directly into Neon.
 */
const generateMoreQuestions = asyncHandler(async (req, res) => {
  const { domainId, topicTag = 'Cloud Architecture', difficulty = 'medium', count = 2 } = req.body;

  if (!domainId) {
    return sendError(res, 'domainId is required to generate questions.', 400);
  }

  // Look up domain name and syllabus title
  const dRes = await db.query(
    `SELECT d.id, d.name, s.title as syllabus_title 
     FROM domains d 
     JOIN syllabi s ON d.syllabus_id = s.id 
     WHERE d.id = $1;`,
    [domainId]
  );
  if (dRes.rows.length === 0) {
    return sendError(res, `Domain ID ${domainId} not found.`, 404);
  }
  const domain = dRes.rows[0];

  const { result: generatedQuestions, promptTelemetry } = await geminiService.generateQuizQuestions({
    syllabusTitle: domain.syllabus_title || 'Exam Track',
    domainName: domain.name,
    topicTag: topicTag || domain.name,
    count: Math.min(parseInt(count, 10) || 2, 5),
    difficulty,
  });

  if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0 || !generatedQuestions.every(isValidGeneratedQuestion)) {
    return sendError(
      res,
      'The question generator returned an incomplete question. No question was saved; please try again.',
      502,
      { status: promptTelemetry?.status || 'unknown', model: promptTelemetry?.modelUsed || 'unknown' }
    );
  }

  const savedQuestions = [];

  for (const q of generatedQuestions) {
    const qInsert = await db.query(
      `INSERT INTO quiz_questions (
         domain_id, topic_tag, scenario, question, options, context_translations, difficulty
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *;`,
      [
        domain.id,
        q.topic_tag || topicTag,
        q.scenario,
        q.question,
        JSON.stringify(q.options),
        JSON.stringify(q.context_translations),
        q.difficulty || difficulty,
      ]
    );

    const saved = qInsert.rows[0];
    savedQuestions.push({
      ...saved,
      options: typeof saved.options === 'string' ? JSON.parse(saved.options) : saved.options,
      context_translations:
        typeof saved.context_translations === 'string'
          ? JSON.parse(saved.context_translations)
          : saved.context_translations,
      domain_name: domain.name,
    });
  }

  return sendSuccess(
    res,
    {
      domainName: domain.name,
      questions: savedQuestions,
    },
    promptTelemetry,
    201
  );
});

module.exports = {
  getQuestions,
  submitAttempt,
  generateMoreQuestions,
};
