const db = require('../config/db');
const srsService = require('../services/srs.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Fetch all flashcards for the active user, ordered by due date.
 */
const getFlashcards = asyncHandler(async (req, res) => {
  const userId = req.query.userId || 'demo-learner';

  const query = `
    SELECT 
      f.id,
      f.user_id,
      f.domain_id,
      f.topic_tag,
      f.front_prompt,
      f.back_explanation,
      f.context_notes,
      f.interval_days,
      f.repetition_count,
      f.ease_factor,
      f.next_review_at,
      d.name AS domain_name
    FROM flashcards f
    JOIN domains d ON f.domain_id = d.id
    WHERE f.user_id = $1
    ORDER BY f.next_review_at ASC, f.id ASC;
  `;

  const { rows } = await db.query(query, [userId]);

  const now = new Date();
  let dueCount = 0;

  const cards = rows.map((card) => {
    const isDue = new Date(card.next_review_at) <= now;
    if (isDue) dueCount += 1;

    return {
      ...card,
      context_notes:
        typeof card.context_notes === 'string'
          ? JSON.parse(card.context_notes)
          : card.context_notes,
      isDue,
    };
  });

  return sendSuccess(res, {
    flashcards: cards,
    total: cards.length,
    dueCount,
  });
});

/**
 * Record a flashcard review rating ('forgot', 'hard', 'good', 'easy')
 * and update its SM-2 spaced repetition interval.
 */
const reviewFlashcard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  const cardRes = await db.query('SELECT * FROM flashcards WHERE id = $1;', [id]);
  if (cardRes.rows.length === 0) {
    return sendError(res, `Flashcard ID ${id} not found.`, 404);
  }

  const currentCard = cardRes.rows[0];

  // Calculate new interval and ease factor via SM-2
  const nextParams = srsService.calculateNextReview(currentCard, rating);

  const updateRes = await db.query(
    `UPDATE flashcards
     SET interval_days = $1,
         repetition_count = $2,
         ease_factor = $3,
         next_review_at = $4
     WHERE id = $5
     RETURNING *;`,
    [
      nextParams.interval_days,
      nextParams.repetition_count,
      nextParams.ease_factor,
      nextParams.next_review_at,
      id,
    ]
  );

  const updated = updateRes.rows[0];

  return sendSuccess(res, {
    flashcard: {
      ...updated,
      context_notes:
        typeof updated.context_notes === 'string'
          ? JSON.parse(updated.context_notes)
          : updated.context_notes,
      isDue: new Date(updated.next_review_at) <= new Date(),
    },
    ratingApplied: rating,
    nextReviewInDays: nextParams.interval_days,
  });
});

module.exports = {
  getFlashcards,
  reviewFlashcard,
};
