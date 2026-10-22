const db = require('../config/db');
const srsService = require('../services/srs.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Fetch all flashcards for the active user, ordered by due date.
 */
const getFlashcards = asyncHandler(async (req, res) => {
  const userId = req.query.userId || 'demo-learner';
  let syllabusId = null;
  if (req.query.syllabusId && req.query.syllabusId !== 'undefined' && req.query.syllabusId !== 'null') {
    const parsed = parseInt(req.query.syllabusId, 10);
    if (!isNaN(parsed)) syllabusId = parsed;
  }

  let query = `
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
  `;
  const params = [userId];
  if (syllabusId) {
    params.push(syllabusId);
    query += ` AND d.syllabus_id = $${params.length}`;
  }
  query += ` ORDER BY f.next_review_at ASC, f.id ASC;`;

  const { rows } = await db.query(query, params);

  const now = new Date();
  let dueCount = 0;

  const cards = rows.map((card) => {
    const isDue = new Date(card.next_review_at) <= now;
    if (isDue) dueCount += 1;

    let contextNotes = {};
    if (typeof card.context_notes === 'string') {
      try {
        contextNotes = JSON.parse(card.context_notes);
      } catch {
        contextNotes = {};
      }
    } else if (card.context_notes) {
      contextNotes = card.context_notes;
    }

    return {
      ...card,
      front: card.front_prompt,
      front_prompt: card.front_prompt,
      back: card.back_explanation,
      back_explanation: card.back_explanation,
      context_notes: contextNotes,
      cultural_analogy: contextNotes,
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
 * Record a flashcard review rating ('again', 'hard', 'good', 'easy', or 1-4)
 * and update its SM-2 spaced repetition interval.
 */
const reviewFlashcard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  const cardRes = await db.query(
    `SELECT f.*, d.name AS domain_name 
     FROM flashcards f
     JOIN domains d ON f.domain_id = d.id
     WHERE f.id = $1;`,
    [id]
  );

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

  let contextNotes = {};
  if (typeof updated.context_notes === 'string') {
    try {
      contextNotes = JSON.parse(updated.context_notes);
    } catch {
      contextNotes = {};
    }
  } else if (updated.context_notes) {
    contextNotes = updated.context_notes;
  }

  const isDue = new Date(updated.next_review_at) <= new Date();

  return sendSuccess(res, {
    flashcard: {
      ...updated,
      domain_name: currentCard.domain_name,
      front: updated.front_prompt,
      front_prompt: updated.front_prompt,
      back: updated.back_explanation,
      back_explanation: updated.back_explanation,
      context_notes: contextNotes,
      cultural_analogy: contextNotes,
      isDue,
    },
    ratingApplied: rating,
    nextReviewInDays: nextParams.interval_days,
  });
});

module.exports = {
  getFlashcards,
  reviewFlashcard,
};
