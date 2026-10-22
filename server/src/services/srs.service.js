/**
 * SuperMemo-2 (SM-2) Spaced Repetition Service
 * Powers automated retention by adjusting review intervals based on learner recall.
 */

const QUALITY_MAP = {
  // String ratings
  forgot: 1,
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
  // Numeric string & primitive inputs
  '1': 1,
  '2': 3,
  '3': 4,
  '4': 5,
  '5': 5,
  1: 1,
  2: 3,
  3: 4,
  4: 5,
  5: 5,
};

/**
 * Calculates new SM-2 parameters for a flashcard based on learner recall rating.
 * @param {Object} currentCard - Current card state { interval_days, repetition_count, ease_factor }
 * @param {string|number} rating - Learner feedback ('again'|'hard'|'good'|'easy'|1|2|3|4)
 * @returns {Object} Updated { interval_days, repetition_count, ease_factor, next_review_at }
 */
const calculateNextReview = (currentCard, rating) => {
  const normRating = typeof rating === 'string' ? rating.toLowerCase() : rating;
  const quality = QUALITY_MAP[normRating] || 3;

  let intervalDays = currentCard.interval_days || 1;
  let repCount = currentCard.repetition_count || 0;
  let easeFactor = parseFloat(currentCard.ease_factor) || 2.50;

  let nextReviewAt;

  if (quality < 3) {
    // Failure (Again): Reset repetition count, set to re-review immediately / today
    repCount = 0;
    intervalDays = 1;
    // Set to 5 minutes ago so it immediately stays in the "Due Today" list
    nextReviewAt = new Date(Date.now() - 5 * 60 * 1000);
  } else {
    // Successful recall
    if (repCount === 0) {
      intervalDays = quality === 5 ? 2 : 1;
    } else if (repCount === 1) {
      intervalDays = quality === 5 ? 4 : 3;
    } else {
      const multiplier = quality === 5 ? easeFactor * 1.3 : easeFactor;
      intervalDays = Math.max(intervalDays + 1, Math.round(intervalDays * multiplier));
    }
    repCount += 1;
    nextReviewAt = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);
  }

  // SM-2 Ease Factor calculation
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.30) {
    easeFactor = 1.30;
  }
  easeFactor = Number(easeFactor.toFixed(2));

  return {
    interval_days: intervalDays,
    repetition_count: repCount,
    ease_factor: easeFactor,
    next_review_at: nextReviewAt,
  };
};

/**
 * Automatically creates or resets a Weak-Spot Flashcard in Neon whenever a learner misses a quiz question.
 * @param {Object} db - Database pool / client
 * @param {Object} params - { userId, questionId }
 * @returns {Promise<Object>} Created or updated flashcard row
 */
const createOrUpdateWeakSpotFlashcard = async (db, { userId, questionId }) => {
  const qRes = await db.query(
    'SELECT * FROM quiz_questions WHERE id = $1',
    [questionId]
  );

  if (qRes.rows.length === 0) {
    throw new Error(`Question ID ${questionId} not found.`);
  }

  const question = qRes.rows[0];
  const options = Array.isArray(question.options)
    ? question.options
    : JSON.parse(question.options || '[]');

  const correctOption = options.find((opt) => opt.is_correct) || options[0];

  const frontPrompt = `${question.scenario}\n\n👉 Focus: ${question.question}`;
  const backExplanation = `✅ Correct: ${correctOption.text}\n\n💡 Why: ${
    correctOption.autopsy?.right_scenario || 'Master this fundamental exam concept.'
  }`;

  // Check if a flashcard for this topic_tag already exists for the user
  const existingCard = await db.query(
    `SELECT id FROM flashcards 
     WHERE user_id = $1 AND domain_id = $2 AND topic_tag = $3`,
    [userId, question.domain_id, question.topic_tag]
  );

  if (existingCard.rows.length > 0) {
    // Reset the existing card to due immediately
    const updateRes = await db.query(
      `UPDATE flashcards
       SET interval_days = 1,
           repetition_count = 0,
           next_review_at = CURRENT_TIMESTAMP,
           front_prompt = $1,
           back_explanation = $2,
           context_notes = $3
       WHERE id = $4
       RETURNING *;`,
      [frontPrompt, backExplanation, JSON.stringify(question.context_translations), existingCard.rows[0].id]
    );
    return updateRes.rows[0];
  }

  // Insert a fresh card
  const insertRes = await db.query(
    `INSERT INTO flashcards (
       user_id, domain_id, topic_tag, front_prompt, back_explanation, context_notes,
       interval_days, repetition_count, ease_factor, next_review_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, 1, 0, 2.50, CURRENT_TIMESTAMP)
     RETURNING *;`,
    [
      userId,
      question.domain_id,
      question.topic_tag,
      frontPrompt,
      backExplanation,
      JSON.stringify(question.context_translations),
    ]
  );

  return insertRes.rows[0];
};

module.exports = {
  calculateNextReview,
  createOrUpdateWeakSpotFlashcard,
};
